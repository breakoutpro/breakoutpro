// BreakoutPro - timeAgo.js
// Single shared "Updated X ago" formatter, so every screen that shows a data
// freshness timestamp uses the exact same wording and thresholds.
// Rules: no backtick, no triple-equals, ASCII.

// secOld: age of the data in whole seconds.
export function updatedAgoLabel(secOld){
  if(secOld==null || secOld<0) return "Updated just now";
  if(secOld<10) return "Updated just now";
  if(secOld<60) return "Updated "+secOld+" sec ago";
  var m=Math.floor(secOld/60);
  if(m<60) return "Updated "+m+" min ago";
  var h=Math.floor(m/60);
  return "Updated "+h+" hr ago";
}

// Convenience: pass a Date (or timestamp ms) the data was last fetched, and
// this computes the age itself.
export function updatedAgoFromTimestamp(tsMs){
  if(!tsMs) return "Updated just now";
  var secOld=Math.floor((Date.now()-tsMs)/1000);
  return updatedAgoLabel(secOld);
}
