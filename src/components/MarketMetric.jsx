import { useTheme } from "../theme/ThemeProvider";
import ProvenanceBadge from "./ProvenanceBadge";
import { PROVENANCE_META } from "../utils/provenance";

// BreakoutPro - MarketMetric.jsx
// CORE ARCHITECTURAL RULE: every market intelligence metric displayed
// anywhere in the app must render through this component (or hand-roll the
// exact same provenance + badge pairing) - never a bare value with no
// declared provenance. This is the enforcement mechanism, not a suggestion:
//
// - 'provenance' is REQUIRED. There is no default. Passing an invalid or
//   missing value throws immediately in development (via ProvenanceBadge),
//   so a module that forgets to declare provenance fails loudly during
//   build/dev rather than silently shipping an unlabeled number.
// - 'value' is REQUIRED too - this component exists specifically to pair a
//   displayed number/state with its provenance, not to be a generic layout
//   box. If you have no value to show, you don't need this component.
//
// Usage:
//   <MarketMetric label="NIFTY 50" value="24,541.15" provenance="live"/>
//   <MarketMetric label="Options Intelligence" value="Not Available" provenance="unavailable"/>
//
// Rules: no backtick, no triple-equals, ASCII only.

export default function MarketMetric(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var T1 = theme.c.text1, T2 = theme.c.text2;

  if(props.value===undefined || props.value===null){
    throw new Error(
      "MarketMetric: 'value' prop is required (label: " + JSON.stringify(props.label||"unlabeled") + "). " +
      "This component exists to pair a displayed metric with its provenance - if there is no value " +
      "to show yet, use provenance='unavailable' with an explicit placeholder value like 'Not Available', " +
      "rather than omitting value entirely."
    );
  }
  // provenance validity itself is enforced inside ProvenanceBadge - this
  // component does not duplicate that check, it just guarantees the badge
  // is always rendered alongside the value, never optionally.

  return (
    <div style={{display:"flex",flexDirection:"column",gap:3}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
        {props.label ? <span style={{fontSize:10,color:T2,fontWeight:600}}>{props.label}</span> : <span/>}
        <ProvenanceBadge type={props.provenance}/>
      </div>
      <div style={{fontSize:props.size||14,fontWeight:800,color:props.color||T1,fontFamily:props.mono?"monospace":"inherit"}}>{props.value}</div>
    </div>
  );
}
