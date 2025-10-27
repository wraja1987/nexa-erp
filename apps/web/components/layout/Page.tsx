import Shell from "./Shell";
export default function Page({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Shell title={title}>
      <div className="grid grid-cols-12 gap-6 mt-6">{children}</div>
    </Shell>
  );
}
