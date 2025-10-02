export default function ErrorPage({ statusCode }: { statusCode?: number }) {
  const code = statusCode ?? 500;
  return (
    <div style={{ padding: 24, textAlign: 'center', fontFamily: 'system-ui' }}>
      <h1 style={{ marginTop: 0 }}>{code}</h1>
      <p style={{ opacity: 0.8 }}>An unexpected error has occurred.</p>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};










