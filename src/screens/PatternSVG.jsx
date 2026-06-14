import React from "react";

var G2c = "#00E676";
var Rc = "#EF4444";
var GOLDc = "#F59E0B";
var T2c = "#8899BB";
var BLUEc = "#3B82F6";

export default function PatternSVG(props) {
  var name = props.name;
  var w = 280, h = 120;

  if (name=="flag") return (
    <svg width={w} height={h}>
      <line x1="60" y1="100" x2="130" y2="20" stroke={G2c} strokeWidth="2.5"/>
      <line x1="130" y1="20" x2="160" y2="28" stroke={Rc} strokeWidth="1.5"/>
      <line x1="160" y1="28" x2="190" y2="36" stroke={Rc} strokeWidth="1.5"/>
      <line x1="130" y1="35" x2="160" y2="43" stroke={Rc} strokeWidth="1.5"/>
      <line x1="160" y1="43" x2="190" y2="51" stroke={Rc} strokeWidth="1.5"/>
      <line x1="250" y1="52" x2="260" y2="15" stroke={G2c} strokeWidth="2" strokeDasharray="4,3"/>
      <text x="80" y="115" fill={T2c} fontSize="9">Pole</text>
      <text x="155" y="115" fill={Rc} fontSize="9">Flag</text>
      <text x="238" y="115" fill={G2c} fontSize="9">BO</text>
    </svg>
  );
  if (name=="pennant") return (
    <svg width={w} height={h}>
      <line x1="50" y1="100" x2="120" y2="15" stroke={G2c} strokeWidth="2.5"/>
      <polygon points="120,15 120,45 200,30" fill="none" stroke={GOLDc} strokeWidth="1.5"/>
      <line x1="200" y1="30" x2="220" y2="10" stroke={G2c} strokeWidth="2" strokeDasharray="4,3"/>
      <text x="70" y="115" fill={T2c} fontSize="9">Pole + Pennant</text>
    </svg>
  );
  if (name=="hs") return (
    <svg width={w} height={h}>
      <polyline points="20,90 60,50 90,75 130,15 170,75 210,50 250,90" fill="none" stroke={Rc} strokeWidth="2"/>
      <line x1="20" y1="90" x2="260" y2="90" stroke={GOLDc} strokeWidth="1.5" strokeDasharray="5,3"/>
      <text x="50" y="108" fill={T2c} fontSize="8">L Sho</text>
      <text x="118" y="12" fill={Rc} fontSize="9">Head</text>
      <text x="198" y="108" fill={T2c} fontSize="8">R Sho</text>
    </svg>
  );
  if (name=="ihs") return (
    <svg width={w} height={h}>
      <polyline points="20,20 60,60 90,35 130,95 170,35 210,60 250,20" fill="none" stroke={G2c} strokeWidth="2"/>
      <line x1="20" y1="20" x2="260" y2="20" stroke={GOLDc} strokeWidth="1.5" strokeDasharray="5,3"/>
      <text x="50" y="115" fill={T2c} fontSize="8">L Sho</text>
      <text x="118" y="115" fill={G2c} fontSize="9">Head</text>
      <text x="198" y="115" fill={T2c} fontSize="8">R Sho</text>
    </svg>
  );
  if (name=="dtop") return (
    <svg width={w} height={h}>
      <polyline points="20,90 80,20 140,90 200,20 260,90" fill="none" stroke={Rc} strokeWidth="2"/>
      <line x1="20" y1="90" x2="270" y2="90" stroke={GOLDc} strokeWidth="1.5" strokeDasharray="5,3"/>
      <text x="60" y="15" fill={Rc} fontSize="8">Top 1</text>
      <text x="185" y="15" fill={Rc} fontSize="8">Top 2</text>
      <text x="85" y="108" fill={GOLDc} fontSize="8">Neckline - Sell!</text>
    </svg>
  );
  if (name=="dbot") return (
    <svg width={w} height={h}>
      <polyline points="20,20 80,90 140,20 200,90 260,20" fill="none" stroke={G2c} strokeWidth="2"/>
      <line x1="20" y1="20" x2="270" y2="20" stroke={GOLDc} strokeWidth="1.5" strokeDasharray="5,3"/>
      <text x="60" y="108" fill={G2c} fontSize="8">Bot 1</text>
      <text x="185" y="108" fill={G2c} fontSize="8">Bot 2</text>
      <text x="85" y="15" fill={GOLDc} fontSize="8">Neckline - Buy!</text>
    </svg>
  );
  if (name=="hammer") return (
    <svg width={w} height={h}>
      <line x1="140" y1="30" x2="140" y2="90" stroke={G2c} strokeWidth="1.5"/>
      <rect x="120" y="30" width="40" height="20" fill={G2c} rx="2"/>
      <text x="175" y="45" fill={G2c} fontSize="9">Small body</text>
      <text x="175" y="88" fill={T2c} fontSize="9">Long lower wick</text>
    </svg>
  );
  if (name=="shoot") return (
    <svg width={w} height={h}>
      <line x1="140" y1="20" x2="140" y2="80" stroke={Rc} strokeWidth="1.5"/>
      <rect x="120" y="65" width="40" height="18" fill={Rc} rx="2"/>
      <text x="175" y="35" fill={T2c} fontSize="9">Long upper wick</text>
      <text x="175" y="78" fill={Rc} fontSize="9">Small body</text>
    </svg>
  );
  if (name=="bull_eng") return (
    <svg width={w} height={h}>
      <rect x="80" y="40" width="50" height="45" fill={Rc} rx="2"/>
      <rect x="145" y="25" width="60" height="70" fill={G2c} rx="2"/>
      <text x="82" y="100" fill={Rc} fontSize="9">Day1</text>
      <text x="148" y="108" fill={G2c} fontSize="9">Day2 Engulfs</text>
    </svg>
  );
  if (name=="bear_eng") return (
    <svg width={w} height={h}>
      <rect x="80" y="25" width="50" height="70" fill={G2c} rx="2"/>
      <rect x="145" y="18" width="60" height="80" fill={Rc} rx="2"/>
      <text x="82" y="108" fill={G2c} fontSize="9">Day1</text>
      <text x="148" y="108" fill={Rc} fontSize="9">Day2 Engulfs</text>
    </svg>
  );
  if (name=="morning") return (
    <svg width={w} height={h}>
      <rect x="40" y="20" width="55" height="65" fill={Rc} rx="2"/>
      <rect x="118" y="62" width="28" height="22" fill={GOLDc} rx="2"/>
      <rect x="170" y="18" width="55" height="68" fill={G2c} rx="2"/>
      <text x="42" y="108" fill={Rc} fontSize="8">Big Red</text>
      <text x="107" y="108" fill={GOLDc} fontSize="8">Doji</text>
      <text x="170" y="108" fill={G2c} fontSize="8">Big Green</text>
    </svg>
  );
  if (name=="evening") return (
    <svg width={w} height={h}>
      <rect x="40" y="18" width="55" height="68" fill={G2c} rx="2"/>
      <rect x="118" y="28" width="28" height="22" fill={GOLDc} rx="2"/>
      <rect x="170" y="22" width="55" height="65" fill={Rc} rx="2"/>
      <text x="42" y="108" fill={G2c} fontSize="8">Big Green</text>
      <text x="107" y="108" fill={GOLDc} fontSize="8">Doji</text>
      <text x="170" y="108" fill={Rc} fontSize="8">Big Red</text>
    </svg>
  );
  if (name=="doji") return (
    <svg width={w} height={h}>
      <line x1="140" y1="20" x2="140" y2="90" stroke={GOLDc} strokeWidth="1.5"/>
      <line x1="110" y1="55" x2="170" y2="55" stroke={GOLDc} strokeWidth="3"/>
      <text x="80" y="112" fill={T2c} fontSize="9">Open = Close = Indecision</text>
    </svg>
  );
  if (name=="cup") return (
    <svg width={w} height={h}>
      <path d="M 20,20 Q 140,100 260,20" fill="none" stroke={G2c} strokeWidth="2"/>
      <polyline points="220,20 235,38 258,22" fill="none" stroke={GOLDc} strokeWidth="2"/>
      <line x1="20" y1="20" x2="270" y2="20" stroke={GOLDc} strokeWidth="1" strokeDasharray="4,3"/>
      <text x="100" y="112" fill={T2c} fontSize="9">Cup Handle - Buy Breakout</text>
    </svg>
  );
  if (name=="rw") return (
    <svg width={w} height={h}>
      <line x1="20" y1="90" x2="220" y2="15" stroke={Rc} strokeWidth="1.5"/>
      <line x1="20" y1="110" x2="220" y2="40" stroke={Rc} strokeWidth="1.5"/>
      <polyline points="20,100 80,65 140,50 200,28" fill="none" stroke={T2c} strokeWidth="1.5"/>
      <line x1="220" y1="28" x2="250" y2="60" stroke={Rc} strokeWidth="2" strokeDasharray="4,3"/>
      <text x="60" y="115" fill={Rc} fontSize="9">Rising Wedge - Bearish!</text>
    </svg>
  );
  if (name=="fw") return (
    <svg width={w} height={h}>
      <line x1="20" y1="15" x2="220" y2="80" stroke={G2c} strokeWidth="1.5"/>
      <line x1="20" y1="5" x2="220" y2="55" stroke={G2c} strokeWidth="1.5"/>
      <polyline points="20,10 80,35 140,50 200,67" fill="none" stroke={T2c} strokeWidth="1.5"/>
      <line x1="220" y1="67" x2="250" y2="40" stroke={G2c} strokeWidth="2" strokeDasharray="4,3"/>
      <text x="60" y="112" fill={G2c} fontSize="9">Falling Wedge - Bullish!</text>
    </svg>
  );
  if (name=="asc_tri") return (
    <svg width={w} height={h}>
      <line x1="20" y1="100" x2="260" y2="100" stroke={G2c} strokeWidth="1.5" strokeDasharray="4,3"/>
      <line x1="20" y1="100" x2="220" y2="20" stroke={T2c} strokeWidth="1.5"/>
      <polyline points="20,100 60,65 100,100 140,78 180,100 220,82" fill="none" stroke={GOLDc} strokeWidth="1.5"/>
      <text x="60" y="115" fill={G2c} fontSize="9">Flat Resistance - Buy Breakout</text>
    </svg>
  );
  if (name=="desc_tri") return (
    <svg width={w} height={h}>
      <line x1="20" y1="20" x2="260" y2="20" stroke={Rc} strokeWidth="1.5" strokeDasharray="4,3"/>
      <line x1="20" y1="20" x2="220" y2="90" stroke={T2c} strokeWidth="1.5"/>
      <polyline points="20,20 60,48 100,20 140,38 180,20 220,30" fill="none" stroke={GOLDc} strokeWidth="1.5"/>
      <text x="60" y="112" fill={Rc} fontSize="9">Flat Support - Sell Breakdown</text>
    </svg>
  );
  if (name=="sym_tri") return (
    <svg width={w} height={h}>
      <line x1="20" y1="10" x2="240" y2="55" stroke={Rc} strokeWidth="1.5"/>
      <line x1="20" y1="100" x2="240" y2="55" stroke={G2c} strokeWidth="1.5"/>
      <polyline points="20,55 60,35 100,70 140,45 180,58 220,55" fill="none" stroke={T2c} strokeWidth="1.5"/>
      <line x1="240" y1="55" x2="268" y2="30" stroke={G2c} strokeWidth="2" strokeDasharray="4,3"/>
      <text x="70" y="112" fill={T2c} fontSize="9">Squeeze - Explosion Coming</text>
    </svg>
  );
  if (name=="rect") return (
    <svg width={w} height={h}>
      <line x1="20" y1="25" x2="220" y2="25" stroke={Rc} strokeWidth="1.5" strokeDasharray="5,3"/>
      <line x1="20" y1="80" x2="220" y2="80" stroke={G2c} strokeWidth="1.5" strokeDasharray="5,3"/>
      <polyline points="20,55 60,25 100,80 140,25 180,80 220,55" fill="none" stroke={T2c} strokeWidth="1.5"/>
      <line x1="225" y1="25" x2="260" y2="8" stroke={G2c} strokeWidth="2" strokeDasharray="4,3"/>
      <text x="30" y="14" fill={Rc} fontSize="8">Resistance</text>
      <text x="30" y="98" fill={G2c} fontSize="8">Support</text>
    </svg>
  );
  return (
    <svg width={w} height={h}>
      <rect x="10" y="10" width={w-20} height={h-20} fill="none" stroke="#1E2D4A" rx="8"/>
      <text x={w/2-30} y={h/2} fill="#8899BB" fontSize="11">{name}</text>
    </svg>
  );
}
