import { useTheme } from "../theme/ThemeProvider";
import { PROVENANCE_META } from "../utils/provenance";

// BreakoutPro - ProvenanceBadge.jsx
// Renders one of the 4 data-provenance states (Live API / Calculated /
// Educational Demo / Not Available) with a single, consistent visual
// treatment app-wide. Every module that shows a number should render one
// of these next to it - never a bespoke label per screen.
// Rules: no backtick, no triple-equals, ASCII only.

export default function ProvenanceBadge(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var meta = PROVENANCE_META[props.type];
  if(!meta){
    // Enforcement: a missing or misspelled provenance type is a development-
    // time bug, not a silent default. Every market metric MUST declare an
    // explicit, valid provenance - this throw makes that impossible to skip
    // or ship by accident.
    throw new Error(
      "ProvenanceBadge: missing or invalid 'type' prop (" + JSON.stringify(props.type) + "). " +
      "Every market intelligence module must declare an explicit provenance: " +
      "'live', 'calculated', 'demo', or 'unavailable'. Silent fallback is not allowed."
    );
  }
  var color = theme.c[meta.colorKey] || theme.c.text3;
  var size = props.size || "sm"; // "sm" (inline, compact) or "md" (standalone)
  var fontSize = size=="md" ? 11 : 9;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:fontSize,fontWeight:800,color:color,background:color+"1F",border:"1px solid "+color+"4D",padding:size=="md"?"3px 8px":"2px 6px",borderRadius:5,letterSpacing:0.4,whiteSpace:"nowrap"}}>
      {meta.dot ? <span style={{width:5,height:5,borderRadius:"50%",background:color,flexShrink:0}}/> : null}
      {meta.label}
    </span>
  );
}
