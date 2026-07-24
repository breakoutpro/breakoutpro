// BreakoutPro - MiniChart.jsx
// Single shared small sparkline-line renderer, used across Home/Markets/
// Global/Commodity screens for index and stock preview charts.
// Accepts the data array as either `data` or `d` (both prop names were used
// across the screens this consolidates, so both are supported to avoid
// touching every call site).
// Rules: no backtick, no triple-equals, ASCII.

export default function MiniChart(props){
  var points = props.data || props.d || [];
  var color = props.color || props.col || "#3B82F6";
  var w = props.w || 60;
  var h = props.h || 28;
  if(points.length < 2) return null;
  var min = Math.min.apply(null, points);
  var max = Math.max.apply(null, points);
  var range = max - min || 1;
  var pts = points.map(function(v,i){
    return (i/(points.length-1))*w + "," + (h-((v-min)/range)*(h-4)+2);
  }).join(" ");
  return (
    <svg width={w} height={h} style={{display:"block"}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
