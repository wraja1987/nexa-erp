import type { GetServerSideProps } from "next";
import fs from "fs";
import path from "path";

type ModuleData = { title?: string; actions?: { label: string }[] };

export default function ModulePage(props: { id: string; data: ModuleData | null }) {
  const { id, data } = props;
  const title = data?.title || id.replace(/[\.-]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  const actions = data?.actions || [];
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h1 style={{ margin: 0 }}>{title}</h1>
      {actions.length > 0 ? (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {actions.map((a, i) => <li key={i}>{a.label}</li>)}
        </ul>
      ) : (
        <div style={{ opacity: 0.7 }}>No actions defined</div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = ctx.params?.id as string;
  const dirA = path.join(process.cwd() || '', 'apps', 'web', 'public', 'modules');
  const dirB = path.join(process.cwd() || '', 'public', 'modules');
  const dir = fs.existsSync(dirA) ? dirA : dirB;
  const file = path.join(dir, `${id}.json`);
  try {
    const raw = fs.readFileSync(file, 'utf-8');
    const data = JSON.parse(raw);
    return { props: { id, data } };
  } catch {
    return { props: { id, data: null } };
  }
};
