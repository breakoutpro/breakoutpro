// BreakoutPro - Skeleton.jsx
// Instant skeleton placeholders for <2s first paint. Adapts via props.
// Rules: no backtick, no triple-equals, ASCII only.

import { useTheme } from "../theme/ThemeProvider";

export function SkeletonCard(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var c1 = theme.c.border, c2 = theme.c.border2;
  var SHIMMER = { background:"linear-gradient(90deg,"+c1+" 25%,"+c2+" 50%,"+c1+" 75%)", backgroundSize:"200% 100%", animation:"bp-shimmer 1.3s infinite" };
  var h = props.height || 90;
  return (
    <div style={{borderRadius:14,height:h,marginBottom:12}}>
      <div style={Object.assign({ width:"100%", height:"100%", borderRadius:14 }, SHIMMER)}></div>
      <style>{"@keyframes bp-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}"}</style>
    </div>
  );
}

export function SkeletonList(props){
  var n = props.count || 4;
  var rows = [];
  for(var i=0;i<n;i++){ rows.push(i); }
  return (
    <div>
      {rows.map(function(i){ return <SkeletonCard key={i} height={props.height||70}/>; })}
    </div>
  );
}

export default SkeletonCard;
