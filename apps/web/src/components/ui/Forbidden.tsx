export default function Forbidden() {
  return (
    <div className="bg-white border border-nexa-border rounded-2xl p-8 shadow-card" role="alert" aria-live="polite">
      <h2 className="text-xl font-semibold mb-2">Not authorised</h2>
      <p className="text-nexa-subtext">You do not have permission to view this page. If you believe this is an error, contact an administrator.</p>
    </div>
  );
}


