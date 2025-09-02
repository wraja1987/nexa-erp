export default function IndustriesPage() {
  const sectors = ['Retail','Manufacturing','SaaS','Logistics','Construction','Professional Services']
  return (
    <div>
      <h1>Industries</h1>
      <ul>
        {sectors.map(s => <li key={s}>{s}</li>)}
      </ul>
    </div>
  )
}
