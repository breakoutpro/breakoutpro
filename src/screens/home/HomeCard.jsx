import { useTheme } from "../../theme/ThemeProvider";

// BreakoutPro - HomeCard.jsx
// ONE card shell for every Home card on every layout, so radius, padding,
// border, heading size and action style cannot drift between cards.
//   title    heading text (restrained 13px)
//   badge    optional node next to the heading (data provenance)
//   action   optional text of the blue action link in the heading row
//   onAction click of that link; the whole card also opens it when onOpen is set
//   dense    mobile spacing
// Neutral surface, subtle border, no gradient, no blur. Blue is the only accent.
// Rules: no backtick, no triple-equals, ASCII only.
export default function HomeCard(props){
  var theme = useTheme();
  var c = theme.c;
  var dense = !!props.dense;
  var light = c.scheme=="light";
  var shell = {
    background:c.card, border:"1px solid "+c.border, borderRadius:12,
    padding: dense ? "10px 12px" : "12px 14px",
    boxSizing:"border-box", minWidth:0, width:"100%",
    boxShadow: light ? "0 1px 2px rgba(15,23,42,0.05)" : "none",
    cursor: props.onOpen ? "pointer" : "default",
    display:"flex", flexDirection:"column"
  };
  if(props.style) shell = Object.assign(shell, props.style);
  return (
    <div data-testid={props.testId || undefined} onClick={props.onOpen || undefined} style={shell}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:dense ? 6 : 8,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0,flex:"1 1 auto"}}>
          <span style={{fontSize:13,fontWeight:800,color:c.text1,lineHeight:1.25,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{props.title}</span>
          {props.badge || null}
        </div>
        {props.action ? (
          <button type="button" onClick={function(e){ e.stopPropagation(); if(props.onAction) props.onAction(); }}
            style={{background:"none",border:"none",padding:"6px 0 6px 8px",margin:"-6px 0",minHeight:32,cursor:"pointer",fontSize:12,fontWeight:700,color:c.blue,flexShrink:0,whiteSpace:"nowrap"}}>{props.action + " \u203a"}</button>
        ) : null}
      </div>
      <div style={{minWidth:0,flex:"1 1 auto",display:"flex",flexDirection:"column"}}>{props.children}</div>
    </div>
  );
}
