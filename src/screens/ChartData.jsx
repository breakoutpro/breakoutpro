// BreakoutPro - ChartData.jsx
// Generates intraday OHLC candle data + EMA + RSI for the custom chart.
// Deterministic per symbol so the chart looks stable. Rules: no backtick, no triple-equals, ASCII.

// Simple seeded pseudo random so each symbol gives a stable series.
function seeded(seed){
  var s=seed%2147483647;
  if(s<=0) s=s+2147483646;
  return function(){
    s=(s*16807)%2147483647;
    return (s-1)/2147483646;
  };
}

function seedFromSym(sym){
  var h=0,i;
  for(i=0;i<sym.length;i++){ h=(h*31+sym.charCodeAt(i))%2147483647; }
  return h||12345;
}

// Bars per timeframe for one trading session view.
function barCount(frame){
  if(frame=="5") return 75;
  if(frame=="15") return 50;
  if(frame=="60") return 40;
  return 60;
}

// Step seconds per timeframe.
function stepSec(frame){
  if(frame=="5") return 300;
  if(frame=="15") return 900;
  if(frame=="60") return 3600;
  return 86400;
}

// Build OHLC candles. base = current price (number).
export function buildCandles(sym, frame, base, up){
  var rnd=seeded(seedFromSym(sym)+ (frame=="5"?5:frame=="15"?15:60));
  var n=barCount(frame);
  var step=stepSec(frame);
  var now=Math.floor(Date.now()/1000);
  now=now-(now%step);
  var start=now-(n*step);
  if(!base||isNaN(base)) base=100;
  // Start a little away so the trend lands near base at the end.
  var drift=up?-1:1;
  var price=base*(1+drift*0.012);
  var candles=[];
  var i;
  for(i=0;i<n;i++){
    var t=start+(i*step);
    var vol=(rnd()-0.48)*(base*0.006);
    var trend=(base-price)*0.04;
    var open=price;
    var close=open+vol+trend;
    var hi=Math.max(open,close)+rnd()*(base*0.003);
    var lo=Math.min(open,close)-rnd()*(base*0.003);
    candles.push({
      time:t,
      open:Number(open.toFixed(2)),
      high:Number(hi.toFixed(2)),
      low:Number(lo.toFixed(2)),
      close:Number(close.toFixed(2)),
      volume:Math.round(100000+rnd()*900000)
    });
    price=close;
  }
  // Nudge last close to the live price.
  candles[n-1].close=Number(base.toFixed(2));
  if(candles[n-1].high<base) candles[n-1].high=Number(base.toFixed(2));
  if(candles[n-1].low>base) candles[n-1].low=Number(base.toFixed(2));
  return candles;
}

// EMA line from candle closes.
export function buildEMA(candles, period){
  var k=2/(period+1);
  var ema=[];
  var prev=null;
  var i;
  for(i=0;i<candles.length;i++){
    var c=candles[i].close;
    if(prev==null){ prev=c; }
    else { prev=c*k+prev*(1-k); }
    ema.push({time:candles[i].time,value:Number(prev.toFixed(2))});
  }
  return ema;
}

// RSI values from candle closes.
export function buildRSI(candles, period){
  var rsi=[];
  var gains=0,losses=0;
  var i;
  for(i=1;i<candles.length;i++){
    var ch=candles[i].close-candles[i-1].close;
    var g=ch>0?ch:0;
    var l=ch<0?-ch:0;
    if(i<=period){
      gains=gains+g; losses=losses+l;
      if(i==period){
        var ag=gains/period, al=losses/period;
        var rs=al==0?100:ag/al;
        rsi.push({time:candles[i].time,value:Number((100-100/(1+rs)).toFixed(1))});
      }
    } else {
      gains=(gains*(period-1)+g)/period;
      losses=(losses*(period-1)+l)/period;
      var rs2=losses==0?100:gains/losses;
      rsi.push({time:candles[i].time,value:Number((100-100/(1+rs2)).toFixed(1))});
    }
  }
  return rsi;
}

