export var TOOLS = [
  {id:"none",  label:"Cursor",    icon:"&#9654;", col:"#60A5FA"},
  {id:"hline", label:"H-Line",    icon:"&#8212;", col:"#22C55E"},
  {id:"trend", label:"Trend",     icon:"&#8599;", col:"#F59E0B"},
  {id:"fib",   label:"Fibonacci", icon:"&#966;",  col:"#A78BFA"},
  {id:"erase", label:"Erase All", icon:"&#10060;",col:"#EF4444"},
];

export function drawOnCanvas(canvas, drawings, pendingPoint, activeTool, fmtN) {
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var W = canvas.width;

  drawings.forEach(function(d) {
    ctx.save();
    ctx.setLineDash([]);
    if (d.type == "hline") {
      ctx.strokeStyle = "#22C55E";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(0, d.y);
      ctx.lineTo(W, d.y);
      ctx.stroke();
      ctx.fillStyle = "#22C55E";
      ctx.font = "9px Inter,Arial";
      ctx.fillText(d.label || "", W - 60, d.y - 4);
    } else if (d.type == "trend") {
      ctx.strokeStyle = "#F59E0B";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(d.x1, d.y1);
      ctx.lineTo(d.x2, d.y2);
      ctx.stroke();
      ctx.fillStyle = "#F59E0B";
      ctx.beginPath();
      ctx.arc(d.x1, d.y1, 3, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(d.x2, d.y2, 3, 0, Math.PI*2);
      ctx.fill();
    } else if (d.type == "fib") {
      var top = Math.min(d.y1, d.y2);
      var bot = Math.max(d.y1, d.y2);
      var range = bot - top;
      var fibColors = {"0":"#EF4444","0.236":"#F97316","0.382":"#F59E0B","0.5":"#22C55E","0.618":"#60A5FA","0.786":"#A78BFA","1":"#EF4444"};
      [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1].forEach(function(level) {
        var y = top + range * level;
        ctx.strokeStyle = fibColors[String(level)] || "#60A5FA";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(d.x1, y);
        ctx.lineTo(d.x2 || W, y);
        ctx.stroke();
        ctx.fillStyle = fibColors[String(level)] || "#60A5FA";
        ctx.font = "8px Inter,Arial";
        ctx.fillText(Math.round(level*100)+"%", (d.x2||W) - 28, y - 2);
      });
    }
    ctx.restore();
  });

  if (pendingPoint && activeTool == "trend") {
    ctx.save();
    ctx.strokeStyle = "rgba(245,158,11,0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(pendingPoint.x, pendingPoint.y, 5, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();
  }
}
