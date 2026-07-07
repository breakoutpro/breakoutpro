import { useResponsive } from "../hooks/useResponsive";

// BreakoutPro - ResponsiveShell.jsx
// Device-adaptive shell wrapper. Mobile/tablet: plain column + bottom nav.
// Desktop/TV: left nav + center + optional right rail, scaled, capped.
// Rules: no backtick, no triple-equals, ASCII only.

export default function ResponsiveShell(props){
  // props: left (node), center (node), right (node), bottomNav (node)
  var r = useResponsive();
  var s = r.shell;

  // Mobile / tablet: single column, bottom nav.
  if(s.mode=="mobile" || s.mode=="tablet"){
    return (
      <div style={{width:"100%",maxWidth:s.centerMax,margin:"0 auto",minHeight:"100vh",background:"#000000",position:"relative"}}>
        {props.center}
        {s.bottomNav ? props.bottomNav : null}
      </div>
    );
  }

  // Desktop / TV: 3-column shell.
  return (
    <div style={{display:"flex",justifyContent:"center",gap:s.pad,padding:s.pad,background:"#000000",minHeight:"100vh"}}>
      <div style={{display:"flex",gap:s.pad,width:"100%",maxWidth:s.shellMax}}>
        {s.leftNav ? <div style={{width:280,flexShrink:0}}>{props.left}</div> : null}
        <div style={{flex:1,minWidth:0,maxWidth:s.rightRail?"none":s.centerMax,margin:s.rightRail?"0":"0 auto"}}>
          <div style={{zoom:s.zoom}}>
            {props.center}
          </div>
        </div>
        {s.rightRail ? <div style={{width:340,flexShrink:0}}>{props.right}</div> : null}
      </div>
    </div>
  );
}
