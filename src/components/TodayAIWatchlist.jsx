import { useState } from "react";

var CARD="#0D1B2A",BD="#203A5A";
var BLUE="#3B82F6",BLUE2="#60A5FA";
var PURPLE="#8B5CF6",PURPLE2="#A78BFA";
var GOLD="#F5B942";
var UP="#22C55E",DOWN="#EF4444",T1="#FFFFFF",T2="#C9D4E5",T3="#8A9BB5";

var PICKS=[
  {sym:"RELIANCE",conf:88,sentiment:"Bullish",breakout:"High",risk:"Medium",sect:"Energy",reason:"Strong volume expansion and resistance test."},
  {sym:"ICICIBANK",conf:84,sentiment:"Bullish",breakout:"High",risk:"Low",sect:"Banking",reason:"Sustained relative strength versus sector peers."},
  {sym:"TCS",conf:76,sentiment:"Neutral",breakout:"Medium",risk:"Low",sect:"IT",reason:"Consolidation pattern near key moving average."},
  {sym:"TATAMOTORS",conf:71,sentiment:"Bullish",breakout:"Medium",risk:"Medium",sect:"Auto",reason:"Momentum improving after base formation."},
  {sym:"SUNPHARMA",conf:65,sentiment:"Bearish",breakout:"Low",risk:"High",sect:"Pharma",reason:"Weak volume on recent advance, watch closely."},
];

function getLastUpdated(){
  var d=new Date();
  return d.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
}

export default function TodayAIWatchlist(props){
  var setTab = props.setTab || function(){};
  var [expanded,setExpanded]=useState(null);

  var sentColor = function(s){return s=="Bullish"?UP:s=="Bearish"?DOWN:GOLD;};
  var riskColor = function(r){return r=="Low"?UP:r=="Medium"?GOLD:DOWN;};

  return (
    <div style={{marginBottom:14}}>
      <div style={{background:"linear-gradient(135deg,"+CARD+",#0A1525)",border:"1px solid "+BD,borderRadius:18,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.25)"}}>

        <div style={{padding:"14px 16px",borderBottom:"1px solid "+BD,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,"+BLUE+","+PURPLE+")",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontSize:9,fontWeight:900,color:"#fff"}}>AI</span>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:T1}}>Today AI Watchlist</div>
              <div style={{fontSize:8,color:T3}}>Market awareness and education only</div>
            </div>
          </div>
        </div>

        <div style={{padding:"12px 16px"}}>
          {PICKS.map(function(p,i){
            var isOpen = expanded==i;
            return (
              <div key={p.sym} onClick={function(){setExpanded(isOpen?null:i);}} style={{background:"rgba(255,255,255,0.03)",border:"1px solid "+BD,borderRadius:12,padding:"10px 12px",marginBottom:8,cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:11,fontWeight:700,color:T1}}>{p.sym}</span>
                    <span style={{fontSize:7,fontWeight:700,color:sentColor(p.sentiment),background:sentColor(p.sentiment)+"15",borderRadius:6,padding:"2px 7px"}}>{p.sentiment}</span>
                  </div>
                  <span style={{fontSize:10,fontWeight:800,color:PURPLE2}}>{p.conf}%</span>
                </div>

                {isOpen?(
                  <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid "+BD}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                      <div>
                        <div style={{fontSize:7,color:T3,marginBottom:2}}>Breakout Probability</div>
                        <div style={{fontSize:10,fontWeight:700,color:T1}}>{p.breakout}</div>
                      </div>
                      <div>
                        <div style={{fontSize:7,color:T3,marginBottom:2}}>Risk Level</div>
                        <div style={{fontSize:10,fontWeight:700,color:riskColor(p.risk)}}>{p.risk}</div>
                      </div>
                      <div>
                        <div style={{fontSize:7,color:T3,marginBottom:2}}>Sector</div>
                        <div style={{fontSize:10,fontWeight:700,color:BLUE2}}>{p.sect}</div>
                      </div>
                      <div>
                        <div style={{fontSize:7,color:T3,marginBottom:2}}>AI Confidence</div>
                        <div style={{fontSize:10,fontWeight:700,color:PURPLE2}}>{p.conf}%</div>
                      </div>
                    </div>
                    <div style={{fontSize:9,color:T2,lineHeight:1.6}}><span style={{color:T3}}>Reason: </span>{p.reason}</div>
                  </div>
                ):null}
              </div>
            );
          })}

          <button onClick={function(){setTab("watchlist");}} style={{width:"100%",marginTop:6,background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:10,padding:"10px",color:BLUE,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>View Full Watchlist</button>

          <div style={{display:"flex",justifyContent:"space-between",marginTop:10,paddingTop:10,borderTop:"1px solid "+BD}}>
            <span style={{fontSize:8,color:T3}}>Last Updated: {getLastUpdated()}</span>
            <span style={{fontSize:8,color:T3}}>Total AI Picks Today: {PICKS.length}</span>
          </div>
        </div>
      </div>

      <div style={{background:"rgba(139,92,246,0.06)",border:"1px solid rgba(139,92,246,0.15)",borderRadius:10,padding:10,marginTop:8}}>
        <div style={{fontSize:8,color:PURPLE2,lineHeight:1.7}}>AI-generated market analysis is provided for educational and informational purposes only. It is not investment advice or a recommendation to buy or sell any security. Please conduct your own research and consult a qualified financial advisor before making investment decisions.</div>
      </div>
    </div>
  );
}
