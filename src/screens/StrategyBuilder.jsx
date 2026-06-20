import { useState } from "react";

var DB="#0A0E1A",CB="#0F1629",BD="#1E2D4A";
var BLUE="#3B82F6",BLUE2="#60A5FA",PURPLE="#8B5CF6";
var GOLD="#F59E0B",UP="#22C55E",DOWN="#EF4444";
var T1="#FFFFFF",T2="#8899BB",T3="#475569";

var INDICATORS=[
  {id:"rsi",      label:"RSI",          ops:["<","<=",">",">="], val:"number", defVal:30, range:"0-100"},
  {id:"price",    label:"Price",        ops:["<","<=",">",">="], val:"number", defVal:0,  range:"price"},
  {id:"volume",   label:"Volume",       ops:[">",">="],          val:"number", defVal:1.5,range:"x avg"},
  {id:"ema9_21",  label:"EMA9 vs EMA21",ops:["crosses above","crosses below"], val:"none"},
  {id:"macd",     label:"MACD vs Signal",ops:["crosses above","crosses below"],val:"none"},
  {id:"vwap",     label:"Price vs VWAP",ops:["above","below"],   val:"none"},
  {id:"supertrend",label:"Supertrend",  ops:["turns green","turns red"], val:"none"},
];

var ACTIONS=[
  {id:"buy", label:"BUY", col:UP},
  {id:"sell",label:"SELL",col:DOWN},
];

function emptyRule(){
  return{id:Date.now()+Math.random(),indicator:"rsi",op:"<",value:30,connector:"AND"};
}

export default function StrategyBuilder(props){
  var onBack=props.onBack||function(){};
  var [strategyName,setStrategyName]=useState("My Strategy 1");
  var [buyRules,setBuyRules]=useState([emptyRule()]);
  var [sellRules,setSellRules]=useState([{id:Date.now()+1,indicator:"rsi",op:">",value:70,connector:"AND"}]);
  var [saved,setSaved]=useState([]);
  var [showBuilder,setShowBuilder]=useState(true);
  var [testResult,setTestResult]=useState(null);

  function addRule(setRules){
    setRules(function(prev){return prev.concat([emptyRule()]);});
  }
  function removeRule(setRules,id){
    setRules(function(prev){return prev.filter(function(r){return r.id!=id;});});
  }
  function updateRule(setRules,id,field,val){
    setRules(function(prev){return prev.map(function(r){return r.id==id?Object.assign({},r,{[field]:val}):r;});});
  }

  function saveStrategy(){
    var strat={
      id:Date.now(),
      name:strategyName,
      buyRules:buyRules,
      sellRules:sellRules,
      created:new Date().toLocaleDateString("en-IN"),
    };
    setSaved(function(prev){return [strat].concat(prev);});
    setShowBuilder(false);
  }

  function testStrategy(){
    var seed=strategyName.length*7+buyRules.length*13;
    function r(){seed=(seed*9301+49297)%233280;return seed/233280;}
    var trades=Math.floor(15+r()*25);
    var winRate=parseFloat((35+r()*40).toFixed(1));
    var wins=Math.round(trades*winRate/100);
    var totalReturn=parseFloat(((winRate-50)*0.8+r()*10-5).toFixed(2));
    setTestResult({trades:trades,winRate:winRate,wins:wins,losses:trades-wins,totalReturn:totalReturn});
  }

  function RuleRow(props2){
    var rule=props2.rule,setRules=props2.setRules,showConnector=props2.showConnector,canRemove=props2.canRemove;
    var ind=INDICATORS.find(function(i){return i.id==rule.indicator;})||INDICATORS[0];
    return (
      <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid "+BD,borderRadius:10,padding:"10px",marginBottom:8}}>
        {showConnector&&(
          <div style={{display:"flex",gap:4,marginBottom:8}}>
            {["AND","OR"].map(function(c){
              return <button key={c} onClick={function(){updateRule(setRules,rule.id,"connector",c);}} style={{background:rule.connector==c?"rgba(59,130,246,0.2)":"rgba(255,255,255,0.04)",border:"1px solid "+(rule.connector==c?BLUE:BD),borderRadius:6,padding:"2px 8px",color:rule.connector==c?BLUE2:T3,fontSize:8,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{c}</button>;
            })}
          </div>
        )}
        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          <select value={rule.indicator} onChange={function(e){
            var newInd=INDICATORS.find(function(i){return i.id==e.target.value;});
            updateRule(setRules,rule.id,"indicator",e.target.value);
            updateRule(setRules,rule.id,"op",newInd.ops[0]);
          }} style={{background:CB,border:"1px solid "+BD,borderRadius:6,padding:"6px 8px",color:T1,fontSize:10,fontFamily:"inherit",flex:1,minWidth:90}}>
            {INDICATORS.map(function(i){return <option key={i.id} value={i.id}>{i.label}</option>;})}
          </select>
          <select value={rule.op} onChange={function(e){updateRule(setRules,rule.id,"op",e.target.value);}} style={{background:CB,border:"1px solid "+BD,borderRadius:6,padding:"6px 8px",color:T1,fontSize:10,fontFamily:"inherit",flex:1,minWidth:80}}>
            {ind.ops.map(function(o){return <option key={o} value={o}>{o}</option>;})}
          </select>
          {ind.val=="number"&&(
            <input type="number" value={rule.value} onChange={function(e){updateRule(setRules,rule.id,"value",e.target.value);}} style={{background:CB,border:"1px solid "+BD,borderRadius:6,padding:"6px 8px",color:T1,fontSize:10,fontFamily:"inherit",width:60}}/>
          )}
          {canRemove&&(
            <button onClick={function(){removeRule(setRules,rule.id);}} style={{background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:6,width:24,height:24,color:DOWN,fontSize:11,cursor:"pointer",flexShrink:0}}>&#10005;</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      <div style={{background:CB,padding:"14px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:14,cursor:"pointer"}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:900,color:T1}}>Strategy Builder</div>
          <div style={{fontSize:10,color:T2}}>Create custom buy/sell rules  No coding needed</div>
        </div>
      </div>

      <div style={{padding:"12px 14px"}}>

        {/* Toggle: Build New vs My Strategies */}
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          <button onClick={function(){setShowBuilder(true);}} style={{flex:1,background:showBuilder?"rgba(59,130,246,0.15)":"rgba(255,255,255,0.04)",border:"1px solid "+(showBuilder?BLUE:BD),borderRadius:10,padding:"10px",color:showBuilder?BLUE2:T2,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>+ Build New</button>
          <button onClick={function(){setShowBuilder(false);}} style={{flex:1,background:!showBuilder?"rgba(139,92,246,0.15)":"rgba(255,255,255,0.04)",border:"1px solid "+(!showBuilder?PURPLE:BD),borderRadius:10,padding:"10px",color:!showBuilder?"#A78BFA":T2,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>My Strategies ({saved.length})</button>
        </div>

        {showBuilder?(
          <div>
            {/* Strategy Name */}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,fontWeight:700,color:T3,letterSpacing:0.8,marginBottom:6}}>STRATEGY NAME</div>
              <input value={strategyName} onChange={function(e){setStrategyName(e.target.value);}} style={{width:"100%",background:CB,border:"1px solid "+BD,borderRadius:10,padding:"10px 12px",color:T1,fontSize:12,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
            </div>

            {/* Buy Rules */}
            <div style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:11,fontWeight:700,color:UP}}>&#9650; BUY WHEN</span>
                <button onClick={function(){addRule(setBuyRules);}} style={{background:"rgba(34,197,94,0.15)",border:"1px solid "+UP,borderRadius:8,padding:"4px 10px",color:UP,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>+ Add Condition</button>
              </div>
              {buyRules.map(function(rule,i){
                return <RuleRow key={rule.id} rule={rule} setRules={setBuyRules} showConnector={i>0} canRemove={buyRules.length>1}/>;
              })}
            </div>

            {/* Sell Rules */}
            <div style={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:11,fontWeight:700,color:DOWN}}>&#9660; SELL WHEN</span>
                <button onClick={function(){addRule(setSellRules);}} style={{background:"rgba(239,68,68,0.15)",border:"1px solid "+DOWN,borderRadius:8,padding:"4px 10px",color:DOWN,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>+ Add Condition</button>
              </div>
              {sellRules.map(function(rule,i){
                return <RuleRow key={rule.id} rule={rule} setRules={setSellRules} showConnector={i>0} canRemove={sellRules.length>1}/>;
              })}
            </div>

            {/* Test Result */}
            {testResult&&(
              <div style={{background:"linear-gradient(135deg,rgba(59,130,246,0.1),rgba(124,58,237,0.08))",border:"1px solid rgba(59,130,246,0.25)",borderRadius:14,padding:"14px",marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:700,color:BLUE2,marginBottom:10}}>Quick Test Result (sample data)</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                  <div><div style={{fontSize:8,color:T3}}>Trades</div><div style={{fontSize:14,fontWeight:800,color:T1}}>{testResult.trades}</div></div>
                  <div><div style={{fontSize:8,color:T3}}>Win Rate</div><div style={{fontSize:14,fontWeight:800,color:testResult.winRate>=50?UP:DOWN}}>{testResult.winRate}%</div></div>
                  <div><div style={{fontSize:8,color:T3}}>Return</div><div style={{fontSize:14,fontWeight:800,color:testResult.totalReturn>=0?UP:DOWN}}>{testResult.totalReturn>=0?"+":""}{testResult.totalReturn}%</div></div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{display:"flex",gap:8}}>
              <button onClick={testStrategy} style={{flex:1,background:"rgba(245,158,11,0.15)",border:"1px solid "+GOLD,borderRadius:12,padding:"12px",color:GOLD,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>&#9889; Quick Test</button>
              <button onClick={saveStrategy} style={{flex:1,background:"linear-gradient(135deg,"+BLUE+","+PURPLE+")",border:"none",borderRadius:12,padding:"12px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>&#128190; Save Strategy</button>
            </div>
          </div>
        ):(
          <div>
            {saved.length==0?(
              <div style={{textAlign:"center",padding:"40px 20px",color:T3}}>
                <div style={{fontSize:32,marginBottom:10}}>&#128203;</div>
                <div style={{fontSize:12}}>No saved strategies yet</div>
                <div style={{fontSize:10,marginTop:4}}>Build one in the "+ Build New" tab</div>
              </div>
            ):(
              saved.map(function(s){
                return (
                  <div key={s.id} style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:"14px",marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <span style={{fontSize:13,fontWeight:700,color:T1}}>{s.name}</span>
                      <span style={{fontSize:8,color:T3}}>{s.created}</span>
                    </div>
                    <div style={{fontSize:9,color:UP,marginBottom:3}}>BUY: {s.buyRules.length} condition{s.buyRules.length>1?"s":""}</div>
                    <div style={{fontSize:9,color:DOWN}}>SELL: {s.sellRules.length} condition{s.sellRules.length>1?"s":""}</div>
                  </div>
                );
              })
            )}
          </div>
        )}

        <div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:10,padding:"8px 12px",marginTop:8}}>
          <div style={{fontSize:8,color:GOLD}}>Educational tool. Strategies are not validated for live trading. Always backtest thoroughly. Not investment advice.</div>
        </div>
      </div>
    </div>
  );
}
