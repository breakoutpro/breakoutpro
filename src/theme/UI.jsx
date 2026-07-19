import { useTheme } from "./ThemeProvider";
import { space, radius, font, shadow } from "./tokens";

// BreakoutPro - UI.jsx
// Reusable themed primitives built on the design system.
// Card, Section, Pill, StatTile, Divider. Rules: no backtick, no triple-equals, ASCII.

export function Card(props){
  var t=useTheme().c;
  var st=Object.assign({background:t.card,border:"1px solid "+t.border,borderRadius:radius.lg,padding:space.md,boxSizing:"border-box"},props.style||{});
  return <div onClick={props.onClick} style={st}>{props.children}</div>;
}

export function GlassCard(props){
  var t=useTheme().c;
  var st=Object.assign({background:t.blueSoft,border:"1px solid rgba(79,140,255,0.22)",borderRadius:radius.lg,padding:space.md,boxSizing:"border-box"},props.style||{});
  return <div onClick={props.onClick} style={st}>{props.children}</div>;
}

export function Section(props){
  var t=useTheme().c;
  return (
    <div style={Object.assign({marginBottom:space.lg},props.style||{})}>
      {props.title?<div style={{fontSize:font.size.base,fontWeight:font.weight.bold,color:t.text2,letterSpacing:0.4,marginBottom:space.sm}}>{props.title}</div>:null}
      {props.children}
    </div>
  );
}

export function Pill(props){
  var t=useTheme().c;
  var tone=props.tone;
  var col=tone=="up"?t.up:tone=="down"?t.down:tone=="warn"?t.warn:t.blue;
  return <span style={Object.assign({display:"inline-flex",alignItems:"center",gap:4,fontSize:font.size.sm,fontWeight:font.weight.semibold,color:col,background:"rgba(255,255,255,0.04)",border:"1px solid "+t.border2,padding:"4px 8px",borderRadius:radius.sm},props.style||{})}>{props.children}</span>;
}

export function StatTile(props){
  var t=useTheme().c;
  var col=props.tone=="up"?t.up:props.tone=="down"?t.down:props.tone=="warn"?t.warn:props.tone=="blue"?t.blue:t.text1;
  return (
    <div style={{background:t.card,border:"1px solid "+t.border,borderRadius:radius.md,padding:"11px 6px",textAlign:"center"}}>
      <div style={{fontSize:props.small?font.size.md:font.size.x2,fontWeight:font.weight.black,color:col}}>{props.value}</div>
      <div style={{fontSize:font.size.xs,color:t.text2,marginTop:3}}>{props.label}</div>
      {props.sub?<div style={{fontSize:7,color:t.text3}}>{props.sub}</div>:null}
    </div>
  );
}

export function Divider(){
  var t=useTheme().c;
  return <div style={{height:1,background:t.border2,margin:"10px 0"}}></div>;
}

export function Disclaimer(props){
  var t=useTheme().c;
  return (
    <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:radius.md,padding:11,marginTop:6}}>
      <div style={{fontSize:font.size.sm,color:t.warn,lineHeight:1.5}}>{props.text||"Educational Market Observation Only. Not Investment Advice."}</div>
    </div>
  );
}

