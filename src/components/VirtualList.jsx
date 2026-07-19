import { useState, useRef } from "react";

// BreakoutPro - VirtualList.jsx
// Simple windowed list: renders only visible rows + overscan. For >50 items.
// Rules: no backtick, no triple-equals, ASCII only.

export default function VirtualList(props){
  // props: items (array), rowHeight (px), height (px viewport), renderRow(item,index)
  var items = props.items || [];
  var rowH = props.rowHeight || 64;
  var viewH = props.height || 400;
  var overscan = 5;
  var [scrollTop, setScrollTop] = useState(0);
  var ref = useRef(null);

  var total = items.length * rowH;
  var start = Math.max(0, Math.floor(scrollTop / rowH) - overscan);
  var visibleCount = Math.ceil(viewH / rowH) + overscan * 2;
  var end = Math.min(items.length, start + visibleCount);

  var rows = [];
  for(var i=start;i<end;i++){
    rows.push(
      <div key={i} style={{position:"absolute",top:i*rowH,left:0,right:0,height:rowH}}>
        {props.renderRow ? props.renderRow(items[i], i) : null}
      </div>
    );
  }

  function onScroll(e){ setScrollTop(e.target.scrollTop); }

  return (
    <div ref={ref} onScroll={onScroll} style={{position:"relative",overflowY:"auto",height:viewH}}>
      <div style={{position:"relative",height:total}}>
        {rows}
      </div>
    </div>
  );
}
