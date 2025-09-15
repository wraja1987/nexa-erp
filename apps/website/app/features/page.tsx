import modulesData from "@/data/modules.json" assert { type: "json" };

type ModuleItem = { slug: string; name: string; desc: string };
type Category = { category: string; items: ModuleItem[] };

function ModuleCard({ item }: { item: ModuleItem }) {
  return (
    <div className="card p-5 h-full flex flex-col justify-between">
      <div>
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-slate-600 text-sm mt-1">{item.desc}</p>
      </div>
      <div className="pt-3">
        <a href={`/docs#${item.slug}`} className="btn-secondary text-sm">Read the docs</a>
      </div>
    </div>
  )
}

export default function FeaturesPage() {
  const categories = (modulesData as unknown as Category[]);
  return (
    <div className="space-y-8">
      <section className="mt-8">
        <div className="hero-band">
          <h1 className="text-3xl md:text-4xl font-semibold">Features</h1>
          <p className="mt-2 opacity-90">Explore every Nexa capability. Each module includes a short description and a link to the docs.</p>
          <div className="mt-4">
            <a href="/contact#demo" className="btn-primary">Book a demo</a>
          </div>
        </div>
      </section>

      {categories.map(cat => (
        <section key={cat.category} className="space-y-4">
          <h2 className="text-xl font-semibold">{cat.category}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {cat.items.map(item => (
              <ModuleCard key={item.slug} item={item} />
            ))}
          </div>
        </section>
      ))}

      {/* Integrations row (brand-safe generic icons) */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Integrations</h2>
        <p className="text-slate-600">Stripe, HMRC MTD, TrueLayer, Shopify, Amazon, eBay, Microsoft 365, Google Workspace, Twilio.</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 opacity-90">
          {/* Simple brand badges */}
          <div className="col-span-1"><span className="inline-block">Stripe</span></div>
          <div className="col-span-1"><span className="inline-block">HMRC</span></div>
          <div className="col-span-1"><span className="inline-block">TrueLayer</span></div>
          <div className="col-span-1"><span className="inline-block">Shopify</span></div>
          <div className="col-span-1"><span className="inline-block">Amazon</span></div>
        </div>
      </section>
    </div>
  )
}
