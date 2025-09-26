export async function getServerSideProps(){ return { props: {} }; }
export default function ERPIndex(){
  return (
    <div style={{padding:24,fontFamily:"ui-sans-serif,system-ui"}}>
      <h1>ERP</h1>
      <p>This area is temporarily in placeholder mode.</p>
      <a href="/dashboard">← Back to Dashboard</a>
    </div>
  );
}
