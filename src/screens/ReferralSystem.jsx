import { useState } from "react";

import { useTheme } from "../theme/ThemeProvider";
var DB="#0A0E1A",CB="#0F1629",BD="#1E2D4A";
var BLUE="#3B82F6",BLUE2="#60A5FA";
var UP="#22C55E",DOWN="#EF4444";
var T1="#FFFFFF",T2="#8899BB",T3="#475569";

var REWARD_TIERS=[
  {invites:1, reward:"7 days Premium free",  icon:"&#127873;"},
  {invites:3, reward:"1 month Premium free", icon:"&#127942;"},
  {invites:5, reward:"3 months Premium free",icon:"&#128142;"},
  {invites:10,reward:"1 year Premium free",  icon:"&#128081;"},
];

function loadReferralData(user){
  try{
    var saved=JSON.parse(localStorage.getItem("bp_referral")||"null");
    if(saved)return saved;
  }catch(e){}
  var phone=(user&&user.phone)||"8790124010";
  var code="BP"+phone.slice(-4)+Math.random().toString(36).slice(2,4).toUpperCase();
  var data={code:code,invites:[],totalEarned:0};
  try{localStorage.setItem("bp_referral",JSON.stringify(data));}catch(e){}
  return data;
}

function saveReferralData(data){
  try{localStorage.setItem("bp_referral",JSON.stringify(data));}catch(e){}
}

export default function ReferralSystem(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BD=theme.c.border; BLUE2=theme.c.blue; CB=theme.c.card; DB=theme.c.bg; T2=theme.c.text2; T3=theme.c.text3;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BLUE = theme.c.blue; T1=theme.c.text1; UP=theme.c.up;

  var onBack=props.onBack||function(){};
  var user=props.user||{phone:"8790124010"};
  var [data,setData]=useState(function(){return loadReferralData(user);});
  var [copied,setCopied]=useState(false);

  var refLink="https://breakoutpro.in/?ref="+data.code;
  var nextTier=REWARD_TIERS.find(function(t){return t.invites>data.invites.length;});
  var currentTierIdx=REWARD_TIERS.filter(function(t){return t.invites<=data.invites.length;}).length;

  function copyCode(){
    if(navigator.clipboard){
      navigator.clipboard.writeText(refLink);
      setCopied(true);
      setTimeout(function(){setCopied(false);},2000);
    }
  }

  function simulateInvite(){
    var names=["Ravi K.","Priya S.","Anil R.","Sunita M.","Vijay P.","Kavya N."];
    var name=names[Math.floor(Math.random()*names.length)];
    var newInvite={name:name,date:new Date().toLocaleDateString("en-IN"),status:"joined"};
    var newData=Object.assign({},data,{invites:data.invites.concat([newInvite])});
    setData(newData);
    saveReferralData(newData);
  }

  function shareWhatsApp(){
    var text="Hey! I'm using BreakoutPro for stock market learning and analysis. Join using my code "+data.code+" and get bonus features: "+refLink;
    window.open("https://api.whatsapp.com/send?text="+encodeURIComponent(text));
  }

  function shareTelegram(){
    var text="Join BreakoutPro with my referral code "+data.code+"!";
    window.open("https://t.me/share/url?url="+encodeURIComponent(refLink)+"&text="+encodeURIComponent(text));
  }

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      <div style={{background:CB,padding:"16px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:14,cursor:"pointer"}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:900,color:T1}}>Refer &amp; Earn</div>
          <div style={{fontSize:12,color:T2}}>Invite friends, unlock Premium rewards</div>
        </div>
      </div>

      <div style={{padding:"16px"}}>

        {/* Hero Card */}
        <div style={{background:theme.c.card,border:"1px solid rgba(37,99,235,0.3)",borderRadius:16,padding:"16px",marginBottom:16,textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:8}}>&#127942;</div>
          <div style={{fontSize:16,fontWeight:900,color:T1,marginBottom:4}}>{data.invites.length} Friend{data.invites.length!=1?"s":""} Invited</div>
          <div style={{fontSize:12,color:T2}}>{nextTier?(nextTier.invites-data.invites.length)+" more to unlock "+nextTier.reward:"All rewards unlocked!"}</div>
        </div>

        {/* Referral Code */}
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"16px",marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:T3,marginBottom:8}}>YOUR REFERRAL CODE</div>
          <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(37,99,235,0.08)",border:"1px dashed "+BLUE,borderRadius:12,padding:"12px 16px",marginBottom:12}}>
            <span style={{fontSize:18,fontWeight:900,color:BLUE,fontFamily:"monospace",letterSpacing:2,flex:1}}>{data.code}</span>
            <button onClick={copyCode} style={{background:copied?"rgba(34,197,94,0.2)":"rgba(37,99,235,0.2)",border:"1px solid "+(copied?UP:BLUE),borderRadius:8,padding:"8px 12px",color:copied?UP:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>
              {copied?"Copied!":"Copy Link"}
            </button>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={shareWhatsApp} style={{flex:1,background:"rgba(34,197,94,0.15)",border:"1px solid "+UP,borderRadius:10,padding:"12px",color:UP,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <span>&#128241;</span> WhatsApp
            </button>
            <button onClick={shareTelegram} style={{flex:1,background:"rgba(59,130,246,0.15)",border:"1px solid "+BLUE,borderRadius:10,padding:"12px",color:BLUE2,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <span>&#9993;&#65039;</span> Telegram
            </button>
          </div>
        </div>

        {/* Reward Tiers */}
        <div style={{fontSize:12,fontWeight:700,color:T1,marginBottom:12}}>Reward Tiers</div>
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,overflow:"hidden",marginBottom:16}}>
          {REWARD_TIERS.map(function(tier,i){
            var unlocked=data.invites.length>=tier.invites;
            var progress=Math.min(100,(data.invites.length/tier.invites)*100);
            return (
              <div key={tier.invites} style={{padding:"12px 16px",borderBottom:i<REWARD_TIERS.length-1?"1px solid rgba(30,42,77,0.5)":"none",opacity:unlocked?1:0.7}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:unlocked?0:8}}>
                  <div style={{width:36,height:36,borderRadius:10,background:unlocked?"rgba(34,197,94,0.15)":"rgba(255,255,255,0.05)",border:"1px solid "+(unlocked?UP:BD),display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}} dangerouslySetInnerHTML={{__html:tier.icon}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:unlocked?UP:T1}}>{tier.reward}</div>
                    <div style={{fontSize:12,color:T3}}>{tier.invites} invite{tier.invites>1?"s":""} required</div>
                  </div>
                  {unlocked&&<span style={{fontSize:14,color:UP}}>&#10003;</span>}
                </div>
                {!unlocked&&(
                  <div style={{height:4,background:"rgba(255,255,255,0.05)",borderRadius:2,marginTop:8}}>
                    <div style={{height:4,background:BLUE,borderRadius:2,width:progress+"%",opacity:0.7}}></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Invited Friends List */}
        {data.invites.length>0&&(
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:T1,marginBottom:12}}>Your Invites</div>
            <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,overflow:"hidden"}}>
              {data.invites.map(function(inv,i){
                return (
                  <div key={i} style={{padding:"12px 16px",borderBottom:i<data.invites.length-1?"1px solid rgba(30,42,77,0.5)":"none",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:28,height:28,borderRadius:8,background:""+BLUE+"",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff"}}>{inv.name.charAt(0)}</div>
                      <span style={{fontSize:12,fontWeight:600,color:T1}}>{inv.name}</span>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:12,color:UP,fontWeight:700}}>&#10003; Joined</div>
                      <div style={{fontSize:12,color:T3}}>{inv.date}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dev test button - simulates an invite for demo */}
        <button onClick={simulateInvite} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px dashed "+BD,borderRadius:10,padding:"8px",color:T3,fontSize:12,cursor:"pointer",fontFamily:"inherit",marginBottom:12}}>
          [Demo] Simulate a friend joining
        </button>

        <div style={{background:"rgba(59,130,246,0.06)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:10,padding:"8px 12px"}}>
          <div style={{fontSize:12,color:BLUE2}}>Rewards are educational platform benefits only. BreakoutPro is not a SEBI-registered advisory; rewards do not involve cash payouts.</div>
        </div>
      </div>
    </div>
  );
}
