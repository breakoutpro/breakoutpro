// BreakoutPro - PatternChartData.jsx
// Candle sequences for each pattern animation (forms realistically + breakout).
// Returns {candles, lines, markers} for the chart engine.
// Rules: no backtick, no triple-equals, ASCII only.

// helper: make a candle
function c(o,h,l,cl,vol,breakout){ return {o:o,h:h,l:l,c:cl,vol:vol,breakout:!!breakout}; }

export function getChartSpec(id, failed){
  var s=SPECS[id];
  if(!s) s=SPECS["bull-engulf"];
  if(failed && s.failed) return s.failed;
  return s.success;
}

var SPECS = {
  "bull-engulf":{
    success:{
      candles:[
        c(60,62,55,56,30), c(56,58,50,52,34), c(52,54,47,49,40),
        c(49,50,45,48,38), c(48,52,47,51,42), c(48,60,47,59,80,true),
        c(59,64,58,63,60), c(63,68,62,67,55)
      ],
      lines:[{type:"res",y1:52,color:"#EF4444",label:"Resistance",showAt:0.4,dash:"5 4"}],
      markers:[{type:"entry",price:59,label:"ENTRY"},{type:"sl",price:46,label:"SL"},{type:"target",price:68,label:"TGT"}]
    },
    failed:{
      candles:[
        c(60,62,55,56,30), c(56,58,50,52,34), c(52,54,47,49,40),
        c(49,50,45,48,38), c(48,52,47,51,42), c(48,56,47,55,55,true),
        c(55,56,48,49,48), c(49,50,44,45,52)
      ],
      lines:[{type:"res",y1:52,color:"#EF4444",label:"Resistance",showAt:0.4,dash:"5 4"}],
      markers:[{type:"entry",price:55,label:"ENTRY"},{type:"sl",price:46,label:"SL"}]
    }
  },
  "bear-engulf":{
    success:{
      candles:[
        c(45,52,44,50,30), c(50,56,49,54,34), c(54,60,53,58,38),
        c(58,61,57,60,36), c(60,62,58,59,40), c(60,61,48,49,82,true),
        c(49,50,44,45,60), c(45,46,40,41,55)
      ],
      lines:[{type:"sup",y1:58,color:"#22C55E",label:"Support",showAt:0.4,dash:"5 4"}],
      markers:[{type:"entry",price:49,label:"ENTRY"},{type:"sl",price:62,label:"SL"},{type:"target",price:40,label:"TGT"}]
    },
    failed:{
      candles:[
        c(45,52,44,50,30), c(50,56,49,54,34), c(54,60,53,58,38),
        c(58,61,57,60,36), c(60,62,58,59,40), c(60,61,52,53,55,true),
        c(53,59,52,58,50), c(58,63,57,62,54)
      ],
      lines:[{type:"sup",y1:58,color:"#22C55E",label:"Support",showAt:0.4}],
      markers:[{type:"entry",price:53,label:"ENTRY"},{type:"sl",price:62,label:"SL"}]
    }
  },
  "double-bot":{
    success:{
      candles:[
        c(62,64,58,59,30), c(59,60,52,53,36), c(53,54,46,47,42),
        c(47,49,45,48,40), c(48,52,47,51,38), c(51,53,48,49,34),
        c(49,50,45,47,44), c(47,52,46,51,42), c(51,58,50,57,78,true),
        c(57,63,56,62,60)
      ],
      lines:[{type:"sup",y1:46,color:"#22C55E",label:"Support",showAt:0.5},{type:"res",y1:53,color:"#EF4444",label:"Neckline",showAt:0.6,dash:"5 4"}],
      markers:[{type:"entry",price:54,label:"ENTRY"},{type:"sl",price:45,label:"SL"},{type:"target",price:63,label:"TGT"}]
    }
  },
  "double-top":{
    success:{
      candles:[
        c(44,50,43,49,30), c(49,56,48,55,36), c(55,62,54,60,42),
        c(60,61,57,58,38), c(58,60,55,59,36), c(59,62,58,60,40),
        c(60,61,55,56,44), c(56,57,50,52,46), c(52,53,45,46,76,true),
        c(46,47,41,42,58)
      ],
      lines:[{type:"res",y1:61,color:"#EF4444",label:"Resistance",showAt:0.5},{type:"sup",y1:55,color:"#22C55E",label:"Neckline",showAt:0.6,dash:"5 4"}],
      markers:[{type:"entry",price:54,label:"ENTRY"},{type:"sl",price:62,label:"SL"},{type:"target",price:44,label:"TGT"}]
    }
  },
  "asc-tri":{
    success:{
      candles:[
        c(48,58,47,49,40), c(49,59,48,52,38), c(52,58,50,51,36),
        c(51,59,50,54,34), c(54,58,53,55,36), c(55,59,54,57,38),
        c(57,59,56,58,40), c(58,66,57,65,80,true), c(65,70,64,69,60)
      ],
      lines:[{type:"res",y1:59,color:"#EF4444",label:"Resistance",showAt:0.4},{type:"trend",y1:47,y2:57,x1:0,x2:0.8,color:"#22C55E",label:"Rising support",showAt:0.5,dash:"4 3"}],
      markers:[{type:"entry",price:60,label:"ENTRY"},{type:"sl",price:54,label:"SL"},{type:"target",price:70,label:"TGT"}]
    }
  },
  "desc-tri":{
    success:{
      candles:[
        c(60,61,50,52,40), c(52,60,51,56,38), c(56,58,50,51,36),
        c(51,57,50,54,34), c(54,56,50,52,36), c(52,55,50,51,38),
        c(51,53,50,50,40), c(50,51,44,45,78,true), c(45,46,40,41,58)
      ],
      lines:[{type:"sup",y1:50,color:"#22C55E",label:"Support",showAt:0.4},{type:"trend",y1:61,y2:51,x1:0,x2:0.8,color:"#EF4444",label:"Falling resistance",showAt:0.5,dash:"4 3"}],
      markers:[{type:"entry",price:50,label:"ENTRY"},{type:"sl",price:55,label:"SL"},{type:"target",price:40,label:"TGT"}]
    }
  },
  "cup-handle":{
    success:{
      candles:[
        c(62,64,60,61,34), c(61,62,55,56,38), c(56,57,50,51,40),
        c(51,52,47,49,38), c(49,52,48,51,34), c(51,55,50,54,32),
        c(54,59,53,58,34), c(58,62,57,61,36), c(61,62,58,59,30),
        c(59,60,57,58,32), c(58,66,57,65,80,true)
      ],
      lines:[{type:"res",y1:62,color:"#EF4444",label:"Rim",showAt:0.6,dash:"5 4"}],
      markers:[{type:"entry",price:63,label:"ENTRY"},{type:"sl",price:57,label:"SL"},{type:"target",price:70,label:"TGT"}]
    }
  },
  "hns":{
    success:{
      candles:[
        c(46,52,45,51,34), c(51,57,50,55,38), c(55,56,51,52,36),
        c(52,62,51,61,42), c(61,62,55,56,40), c(56,58,54,57,36),
        c(57,58,52,53,38), c(53,54,47,48,74,true), c(48,49,43,44,58)
      ],
      lines:[{type:"sup",y1:53,color:"#22C55E",label:"Neckline",showAt:0.6,dash:"5 4"}],
      markers:[{type:"entry",price:52,label:"ENTRY"},{type:"sl",price:58,label:"SL"},{type:"target",price:44,label:"TGT"}]
    }
  },
  "flag":{
    success:{
      candles:[
        c(46,48,45,47,36), c(47,58,46,57,70), c(57,60,56,59,50),
        c(59,60,56,57,34), c(57,58,55,56,30), c(56,57,54,55,28),
        c(55,62,54,61,78,true), c(61,66,60,65,58)
      ],
      lines:[{type:"trend",y1:60,y2:56,x1:0.25,x2:0.75,color:"#EF4444",label:"Flag",showAt:0.5,dash:"4 3"}],
      markers:[{type:"entry",price:60,label:"ENTRY"},{type:"sl",price:54,label:"SL"},{type:"target",price:68,label:"TGT"}]
    }
  },
  "pennant":{
    success:{
      candles:[
        c(46,48,45,47,36), c(47,58,46,57,70), c(57,59,55,56,48),
        c(56,58,55,57,34), c(57,58,56,57,30), c(56,57,56,56,28),
        c(56,63,55,62,76,true), c(62,67,61,66,56)
      ],
      lines:[{type:"trend",y1:60,y2:57,x1:0.25,x2:0.7,color:"#EF4444",label:"Pennant",showAt:0.5,dash:"4 3"}],
      markers:[{type:"entry",price:60,label:"ENTRY"},{type:"sl",price:55,label:"SL"},{type:"target",price:68,label:"TGT"}]
    }
  }
};

// Patterns that have full animated charts. Others fall back to mini SVG.
export var ANIMATED_IDS = ["bull-engulf","bear-engulf","double-bot","double-top","asc-tri","desc-tri","cup-handle","hns","flag","pennant"];
          
