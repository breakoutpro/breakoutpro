import { useTheme } from "../theme/ThemeProvider";

var DB="#050816",CB="#0B1224",BD="#1B2A4D",G="#00C853",G2="#00E676",R="#EF4444",BLUE="#3B82F6",T1="#FFFFFF",T2="#8FA2C9";

function genCandles(base, count) {
  var arr=[], price=base;
  for(var i=0;i<count;i++){
    var chg=(Math.random()-0.48)*base*0.006;
    var open2=price;
    var close2=parseFloat((open2+chg).toFixed(2));
    var hi=parseFloat((Math.max(open2,close2)+Math.random()*base*0.003).toFixed(2));
    var lo=parseFloat((Math.min(open2,close2)-Math.random()*base*0.003).toFixed(2));
    arr.push({open:open2,close:close2,high:hi,low:lo,vol:Math.floor(100000+Math.random()*500000)});
    price=close2;
  }
  return arr;
}

function findZones(candles) {
  var highs=candles.map(function(c){return c.high;});
  var lows=candles.map(function(c){return c.low;});
  var closes=candles.map(function(c){return c.close;});
  var maxH=Math.max.apply(null,highs);
  var minL=Math.min.apply(null,lows);
  var last=closes[closes.length-1];
  var range=maxH-minL;
  return {
    res1:parseFloat((last+range*0.03).toFixed(2)),
    res2:parseFloat((last+range*0.065).toFixed(2)),
    sup1:parseFloat((last-range*0.025).toFixed(2)),
    sup2:parseFloat((last-range*0.055).toFixed(2)),
    high52w:parseFloat((maxH*1.02).toFixed(2)),
    low52w:parseFloat((minL*0.98).toFixed(2)),
  };
}

function CandleChart(props) {
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - this SVG chart function is invoked via JSX
  // (<CandleChart .../>) so it is a real component and can call the hook.
  var BD = theme.c.border, T2 = theme.c.text2, R = theme.c.down, G2 = theme.c.up;

  var candles=props.candles||[];
  var zones=props.zones||{};
  var fullscreen=props.fullscreen||false;
  var onCandleTap=props.onCandleTap||function(){};
  var zoom=props.zoom||1;
  var W=340,H=fullscreen?280:200;
  var count=Math.min(Math.floor(50/zoom),candles.length);
  var visible=candles.slice(-count);
  if(visible.length<2) return null;
  var prices=visible.reduce(function(a,c){return a.concat([c.high,c.low]);},[] );
  var minP=Math.min.apply(null,prices),maxP=Math.max.apply(null,prices);
  var pad=(maxP-minP)*0.08;
  minP-=pad;maxP+=pad;
  var range=maxP-minP||1;
  var cw=W/count;
  function yP(p){return H-((p-minP)/range)*H;}
  function xC(i){return i*cw+cw/2;}

  var zonesToDraw=[];
  if(zones.res1&&zones.res1>=minP&&zones.res1<=maxP) zonesToDraw.push({y:yP(zones.res1),color:R,label:"R1"});
  if(zones.res2&&zones.res2>=minP&&zones.res2<=maxP) zonesToDraw.push({y:yP(zones.res2),color:R,label:"R2",dash:true});
  if(zones.sup1&&zones.sup1>=minP&&zones.sup1<=maxP) zonesToDraw.push({y:yP(zones.sup1),color:G2,label:"S1"});
  if(zones.sup2&&zones.sup2>=minP&&zones.sup2<=maxP) zonesToDraw.push({y:yP(zones.sup2),color:G2,label:"S2",dash:true});

  return (
    <svg width={W} height={H} style={{display:"block",width:"100%"}}>
      {[0,0.25,0.5,0.75,1].map(function(t){
        var y=t*H,price=maxP-t*range;
        return <g key={t}><line x1={0} y1={y} x2={W} y2={y} stroke={BD} strokeWidth="0.5"/><text x={4} y={y-2} fill={T2} fontSize={8}>{price.toLocaleString("en-IN",{maximumFractionDigits:0})}</text></g>;
      })}
      {zones.res1&&zones.res1>=minP&&zones.res1<=maxP?<rect x={0} y={yP(zones.res1)-8} width={W} height={16} fill="rgba(220,38,38,0.06)"/>:null}
      {zones.sup1&&zones.sup1>=minP&&zones.sup1<=maxP?<rect x={0} y={yP(zones.sup1)-8} width={W} height={16} fill="rgba(0,143,57,0.06)"/>:null}
      {zonesToDraw.map(function(z,i){
        return <g key={i}><line x1={0} y1={z.y} x2={W} y2={z.y} stroke={z.color} strokeWidth="1" strokeDasharray={z.dash?"5,3":"none"}/><text x={W-24} y={z.y-3} fill={z.color} fontSize={8} fontWeight="700">{z.label}</text></g>;
      })}
      {visible.map(function(c,i){
        var bull=c.close>=c.open,col=bull?G2:R;
        var x=i*cw;
        var bTop=yP(Math.max(c.open,c.close));
        var bBot=yP(Math.min(c.open,c.close));
        var bH=Math.max(1.5,bBot-bTop);
        var isLast=i==visible.length-1;
        return (
          <g key={i} onClick={function(){onCandleTap(c,i);}} style={{cursor:"pointer"}}>
            <line x1={xC(i)} y1={yP(c.high)} x2={xC(i)} y2={yP(c.low)} stroke={col} strokeWidth={isLast?2:1}/>
            <rect x={x+cw*0.1} y={bTop} width={cw*0.8} height={bH} fill={col} rx="1" opacity={isLast?1:0.85}/>
            {isLast?<rect x={x} y={0} width={cw} height={H} fill="rgba(255,255,255,0.03)"/>:null}
          </g>
        );
      })}
    </svg>
  );
}

function detectPattern(candles) {
  if(candles.length<3) return null;
  var n=candles.length;
  var c=candles[n-1],p=candles[n-2],pp=candles[n-3];
  var cB=Math.abs(c.close-c.open),cR=c.high-c.low||0.01;
  var cUW=c.high-Math.max(c.open,c.close);
  var cLW=Math.min(c.open,c.close)-c.low;
  var cBull=c.close>c.open,pBull=p.close>p.open;
  var pB=Math.abs(p.close-p.open)||0.01;

  if(cR>0&&cB<cR*0.15) return {name:"Doji",signal:"Indecision",type:"neutral",desc:"Open and Close nearly equal. Market undecided. Wait for confirmation candle."};
  if(cLW>=cB*1.8&&cUW<=cB*0.5) return {name:"Hammer",signal:"Bullish Reversal",type:"bullish",desc:"Long lower shadow shows buyers rejected lower prices strongly."};
  if(cUW>=cB*1.8&&cLW<=cB*0.5&&pBull) return {name:"Shooting Star",signal:"Bearish Reversal",type:"bearish",desc:"Long upper shadow shows sellers rejected higher prices strongly."};
  if(!pBull&&cBull&&c.close>p.open&&cB>pB) return {name:"Bullish Engulfing",signal:"Strong Bullish",type:"bullish",desc:"Green candle engulfs red candle. Bulls took control."};
  if(pBull&&!cBull&&c.close<p.open&&cB>pB) return {name:"Bearish Engulfing",signal:"Strong Bearish",type:"bearish",desc:"Red candle engulfs green candle. Bears took control."};
  if(cB>cR*0.75&&cUW<cB*0.1&&cLW<cB*0.1&&cBull) return {name:"Bullish Marubozu",signal:"Strong Bullish",type:"bullish",desc:"Full body green candle. Very strong buying momentum."};
  if(cB>cR*0.75&&cUW<cB*0.1&&cLW<cB*0.1&&!cBull) return {name:"Bearish Marubozu",signal:"Strong Bearish",type:"bearish",desc:"Full body red candle. Very strong selling momentum."};
  var pBull2=pp.close>pp.open;
  if(!pBull2&&Math.abs(pp.close-pp.open)<(pp.high-pp.low)*0.3&&cBull&&c.close>(p.open+p.close)/2) return {name:"Morning Star",signal:"Bullish Reversal",type:"bullish",desc:"3-candle bullish reversal: Red, Small Doji, Big Green."};
  if(pBull2&&Math.abs(pp.close-pp.open)<(pp.high-pp.low)*0.3&&!cBull&&c.close<(p.open+p.close)/2) return {name:"Evening Star",signal:"Bearish Reversal",type:"bearish",desc:"3-candle bearish reversal: Green, Small Doji, Big Red."};
  if(cBull&&cB>cR*0.5&&c.low<p.low&&c.close>p.close) return {name:"Bullish Momentum",signal:"Bullish",type:"bullish",desc:"Price making higher lows and higher closes. Uptrend continuation."};
  if(!cBull&&cB>cR*0.5&&c.high>p.high&&c.close<p.close) return {name:"Bearish Momentum",signal:"Bearish",type:"bearish",desc:"Price making lower highs and lower closes. Downtrend continuation."};
  return {name:"Normal Candle",signal:"Neutral",type:"neutral",desc:"No significant candlestick pattern. Market in normal movement. Watch key levels."};
}

function calcRSI(candles) {
  if(candles.length<15) return 50;
  var gains=0,losses=0;
  for(var i=candles.length-14;i<candles.length;i++){
    var diff=candles[i].close-candles[i-1].close;
    if(diff>0) gains+=diff; else losses+=Math.abs(diff);
  }
  if(losses==0) return 100;
  return parseFloat((100-100/(1+gains/losses)).toFixed(1));
}

function calcEMA(candles, period) {
  if(candles.length<period) return candles[candles.length-1].close;
  var k=2/(period+1);
  var ema=candles[0].close;
  for(var i=1;i<candles.length;i++){
    ema=candles[i].close*k+ema*(1-k);
  }
  return parseFloat(ema.toFixed(2));
}

export { genCandles, findZones, detectPattern, calcRSI, calcEMA, CandleChart };
