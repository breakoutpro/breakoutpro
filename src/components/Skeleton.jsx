// BreakoutPro - Skeleton.jsx
// Instant skeleton placeholders for <2s first paint. Adapts via props.
// Rules: no backtick, no triple-equals, ASCII only.

import { useTheme } from "../theme/ThemeProvider";

export function SkeletonCard(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var SHIMMER = { background: theme.c.border2 };
  var h = props.height || 90;
  return (
    <div style={{borderRadius:14,height:h,marginBottom:12}}>
      <div style={Object.assign({ width:"100%", height:"100%", borderRadius:14 }, SHIMMER)}></div>
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
