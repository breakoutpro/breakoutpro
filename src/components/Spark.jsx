import React from "react";
import { G } from "../utils/helpers";

export default function Spark({ data, color, w = 60, h = 28 }) {
  var d = data || [];
  if (!d.length) return null;
  var min = Math.min.apply(null, d);
  var max = Math.max.apply(null, d);
  var range = max - min || 1;
  var pts = d.map(function(v, i) {
    return (i / (d.length - 1)) * w + "," + (h - ((v - min) / range) * h);
  }).join(" ");
  return React.createElement("svg", { width: w, height: h, style: { display: "block" } },
    React.createElement("polyline", { points: pts, fill: "none", stroke: color || G, strokeWidth: "1.5", strokeLinecap: "round" })
  );
}
