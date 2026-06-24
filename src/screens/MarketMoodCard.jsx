import { useState } from "react";
import { getPhase, computeMood, getVerdict, getGreetingLine } from "./MarketMoodData";
import MarketMood from "./MarketMood";

// BreakoutPro - MarketMoodCard.jsx
// Home hero card. 30-second market mood summary. Tap to open full screen.
// Rules: no backtick, no triple-equals, ASCII only.

var CARD="#101318",CARD2="#0B0E13",BD="#1B2330";
var UP="#15803D",DOWN="#EF4444",GOLD="#F59E0B",BLUE="#3B82F6",CYAN="#60A5FA";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

export default function MarketMoodCard(props){
  var setTab=props.setTab||function(){};
  var [open,setOpen]=useState(false);
  var phase=getPhase();
  var mood=computeMood();
  var greet=getGreetingLine();

  return (
    <div style={{padding:"14px 14px 0"}}>
      <div onClick={function(){setOpen(true);}} style={{background:"linear-gradient(135deg,"+mood.color+"14,rgba(11,14,19,0.4))",border:"1px solid "+mood.color+"33",borderRadius:16,padding:15,cursor:"pointer"}}>

        {/* TOP ROW */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:11}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <span style={{fontSize:14}} dangerouslySetInnerHTML={{__html:"&#127749;"}}/>
            <span style={{fontSize:13,fontWeight:800,color:T1}}>Today's Game Plan</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5,background:CARD2,borderRadius:20,padding:"3px 10px"}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:phase.dot,display:"inline-block"}}></span>
            <span style={{fontSize:9,color:T2,fontWeight:600}}>{phase.label}</span>
          </div>
        </div>

        {/* MOOD ROW */}
        <div style={{display:"flex",alignItems:"center",gap:13,marginBottom:11}}>
          <div style={{textAlign:"center",flexShrink:0}}>
            <div style={{width:54,height:54,borderRadius:"50%",border:"4px solid "+mood.color,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
              <span style={{fontSize:15,fontWeight:900,color:mood.color}}>{mood.score}</span>
            </div>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:18,fontWeight:900,color:mood.color}}>{mood.label}</div>
            <div style={{fontSize:10,color:T2,marginTop:2}}>{mood.gapText}</div>
          </div>
        </div>

        {/* GREETING LINE */}
        <div style={{background:CARD2,borderRadius:10,padding:"9px 11px",marginBottom:11}}>
          <div style={{fontSize:10.5,color:T1,fontWeight:600}} dangerouslySetInnerHTML={{__html:greet}}/>
        </div>

        {/* CTA */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:9.5,color:T3}}>Overnight cues, levels and stocks to watch</span>
          <span style={{fontSize:11,color:CYAN,fontWeight:700}}>View Full &#8594;</span>
        </div>

      </div>

      {open?<MarketMood onClose={function(){setOpen(false);}} setTab={setTab}/>:null}
    </div>
  );
}
