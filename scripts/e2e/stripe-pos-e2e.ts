/* Nexa ERP — Stripe POS/Payments E2E */
import fs from "fs";
import path from "path";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2024-06-20" });
const CURRENCY = (process.env.NEXA_CURRENCY || "gbp").toLowerCase();
const REPORTS_DIR = path.resolve("reports");
const nowTag = new Date().toISOString().replace(/[:-]/g, "").replace(/\..+/, "");
const reportPath = path.join(REPORTS_DIR, `pos-e2e-${nowTag}.md`);

function isLiveKey(key?: string) { return !!key && key.startsWith("sk_live_"); }
function isTestKey(key?: string) { return !!key && key.startsWith("sk_test_"); }

async function writeReport(lines: string[]) {
  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(reportPath, lines.join("\n"), "utf8");
  console.log(`\n✅ E2E report saved: ${reportPath}\n`);
}

(async () => {
  const lines: string[] = [];
  lines.push(`# Nexa ERP — Stripe POS/Payments E2E Report`);
  lines.push(`- Timestamp: ${new Date().toISOString()}`);
  lines.push(`- Currency: ${CURRENCY}`);
  lines.push("");

  const key = process.env.STRIPE_SECRET_KEY || "";
  if (!key) throw new Error("STRIPE_SECRET_KEY missing");
  const live = isLiveKey(key);
  const test = isTestKey(key);

  if (live) {
    lines.push("## Mode: LIVE (Payment Link £1 test)");
    const product = await stripe.products.create({ name: "Nexa Live £1 Test" });
    const price = await stripe.prices.create({ unit_amount: 100, currency: CURRENCY, product: product.id });
    lines.push(`- Product: ${product.id}`);
    lines.push(`- Price: ${price.id}`);

    const startedAtSec = Math.floor(Date.now() / 1000) - 3600; // look back 1h to capture recent payment
    const pl = await stripe.paymentLinks.create({ line_items: [{ price: price.id, quantity: 1 }] });
    lines.push(`- Payment Link: ${pl.url}`);
    console.log("\n➡️  LIVE TEST: Open this URL and pay £1 with your card:");
    console.log(pl.url, "\n");
    try {
      if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
      fs.writeFileSync(path.join(REPORTS_DIR, "latest-payment-link.txt"), pl.url + "\n", "utf8");
    } catch {}

    const deadline = Date.now() + 1000 * 60 * 10;
    let paymentIntent: Stripe.PaymentIntent | null = null;
    while (Date.now() < deadline) {
      const list = await stripe.paymentIntents.list({ limit: 10, created: { gte: startedAtSec } } as any);
      let candidate: Stripe.PaymentIntent | null = null;
      for (const pi of list.data) {
        if (pi.amount === 100 && pi.currency === CURRENCY && pi.status === "succeeded") {
          const withCharges = await stripe.paymentIntents.retrieve(pi.id, { expand: ["charges"] });
          const ch: any = (withCharges as any).charges?.data?.[0] || null;
          const alreadyRefunded = !!ch?.refunded || (typeof ch?.amount_refunded === "number" && ch.amount_refunded >= 100);
          if (!alreadyRefunded) { candidate = withCharges; break; }
        }
      }
      if (candidate) { paymentIntent = candidate; break; }
      await new Promise(r => setTimeout(r, 4000));
    }
    if (!paymentIntent) throw new Error("Timed out waiting for live £1 payment.");

    lines.push(`- PaymentIntent (live) succeeded: ${paymentIntent.id}`);

    let chargeId = (paymentIntent as any).charges?.data?.[0]?.id || null;
    if (!chargeId) {
      const charges = await stripe.charges.list({ payment_intent: paymentIntent.id, limit: 1 });
      chargeId = charges.data[0]?.id || null;
    }
    if (!chargeId) throw new Error("No charge found on PaymentIntent.");
    let refund: Stripe.Response<Stripe.Refund> | Stripe.Refund;
    try {
      refund = await stripe.refunds.create({ charge: chargeId, amount: 100 });
      lines.push(`- Refund created: ${refund.id} (status: ${refund.status})`);
    } catch (e: any) {
      if (e && e.code === "charge_already_refunded") {
        lines.push(`- Refund skipped: charge already refunded`);
        refund = { id: "skipped", object: "refund" } as any;
      } else {
        throw e;
      }
    }

    const charge = await stripe.charges.retrieve(chargeId);
    const btId = (typeof charge.balance_transaction === "string") ? charge.balance_transaction : (charge.balance_transaction as any)?.id;
    const bt = btId ? await stripe.balanceTransactions.retrieve(btId) : null;
    if (bt) lines.push(`- Balance Txn (payment): ${bt.id} | net: ${bt.net} | fee: ${bt.fee}`);

    const refundBtId = (refund as any)?.balance_transaction ? ((typeof (refund as any).balance_transaction === "string") ? (refund as any).balance_transaction : ((refund as any).balance_transaction as any)?.id) : null;
    if (refundBtId) {
      const rbt = await stripe.balanceTransactions.retrieve(refundBtId);
      lines.push(`- Balance Txn (refund): ${rbt.id} | net: ${rbt.net} | fee: ${rbt.fee}`);
    }

    lines.push("\n### Outcome");
    lines.push("- Live £1 payment completed, then refunded.");
    await writeReport(lines);
    process.exit(0);
  }

  if (test) {
    lines.push("## Mode: TEST (Terminal simulated end-to-end)");
    const pi = await stripe.paymentIntents.create({
      amount: 100,
      currency: CURRENCY,
      capture_method: "automatic",
      payment_method_types: ["card_present"],
    });
    lines.push(`- PaymentIntent (test): ${pi.id}`);

    const confirmed = await stripe.testHelpers.paymentIntents.present(pi.id);
    lines.push(`- Presented on simulated reader: ${confirmed.status}`);

    const deadline = Date.now() + 1000 * 60 * 2;
    let done = await stripe.paymentIntents.retrieve(pi.id, { expand: ["charges"] });
    while (Date.now() < deadline && done.status !== "succeeded") {
      await new Promise(r => setTimeout(r, 2000));
      done = await stripe.paymentIntents.retrieve(pi.id, { expand: ["charges"] });
    }
    if (done.status !== "succeeded") throw new Error(`PI did not succeed: ${done.status}`);
    lines.push(`- PaymentIntent succeeded: ${done.id}`);

    let chargeId = (done as any).charges?.data?.[0]?.id || null;
    if (!chargeId) {
      const charges = await stripe.charges.list({ payment_intent: done.id, limit: 1 });
      chargeId = charges.data[0]?.id || null;
    }
    if (!chargeId) throw new Error("No charge found on PaymentIntent.");
    const refund = await stripe.refunds.create({ charge: chargeId, amount: 100 });
    lines.push(`- Refund: ${refund.id} (status: ${refund.status})`);

    const doneCharge = await stripe.charges.retrieve(chargeId);
    const btId2 = (typeof doneCharge.balance_transaction === "string") ? doneCharge.balance_transaction : (doneCharge.balance_transaction as any)?.id;
    const bt2 = btId2 ? await stripe.balanceTransactions.retrieve(btId2) : null;
    if (bt2) lines.push(`- Balance Txn (payment): ${bt2.id} | net: ${bt2.net} | fee: ${bt2.fee}`);

    const refundBtId2 = (typeof refund.balance_transaction === "string") ? refund.balance_transaction : (refund.balance_transaction as any)?.id;
    if (refundBtId2) {
      const rbt2 = await stripe.balanceTransactions.retrieve(refundBtId2);
      lines.push(`- Balance Txn (refund): ${rbt2.id} | net: ${rbt2.net} | fee: ${rbt2.fee}`);
    }

    lines.push("\n### Outcome");
    lines.push("- Test-mode Terminal flow completed, then refunded.");
    await writeReport(lines);
    process.exit(0);
  }

  throw new Error("Your STRIPE_SECRET_KEY is neither sk_live_* nor sk_test_*.");
})().catch(async (err) => { console.error(err); process.exit(1); });
