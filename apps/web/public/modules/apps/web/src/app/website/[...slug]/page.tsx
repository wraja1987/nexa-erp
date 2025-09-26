interface Props { params: { slug?: string[] } }
export default function WebsiteCatchAll({ params }: Props){
  const slug = Array.isArray(params.slug) ? params.slug.join('/') : '';
  const src = `/website/${slug}`;
  return (
    <div style={{height:'100%',minHeight:'100vh'}}>
      <iframe src={src} title={`Nexa Website: ${slug||'home'}`} style={{border:0,width:'100%',minHeight:'100vh'}} />
    </div>
  );
}
