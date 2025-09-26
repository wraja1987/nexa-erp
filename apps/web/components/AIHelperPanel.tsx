import * as React from "react";
function PanelInner(){
  return (
    <aside style={{padding:12,border:"1px solid #ddd",borderRadius:8}}>
      <strong>AI Helper</strong>
      <div>This is a temporary placeholder panel.</div>
    </aside>
  );
}
export default function AIHelperPanel(){ return <PanelInner/> }
export { PanelInner as AIHelperPanel };
