import { useState } from "react";

var DB="#0A0E1A",CB="#0F1629",BD="#1E2D4A";
var BLUE="#3B82F6",BLUE2="#60A5FA",PURPLE="#8B5CF6";
var GOLD="#F59E0B",UP="#22C55E",DOWN="#EF4444";
var T1="#FFFFFF",T2="#8899BB",T3="#475569";

function loadProfile(){
  try{return JSON.parse(localStorage.getItem("bp_profile")||"{}");}catch(e){return{};}
}
function saveProfile(p){
  try{localStorage.setItem("bp_profile",JSON.stringify(p));}catch(e){}
}

export default function Profile(props){
  var onBack=props.onBack||function(){};
  var user=props.user||{name:"Trader",phone:"8790124010"};
  var isPrem=props.isPrem||false;

  var [profile,setProfile]=useState(function(){
    var saved=loadProfile();
    return Object.assign({
      name:user.name||"Trader",
      email:"",
      phone:user.phone||"",
      experience:"Beginner",
      tradingStyle:"Swing",
      riskAppetite:"Moderate",
      kycStatus:"pending",
    },saved);
  });
  var [editMode,setEditMode]=useState(false);
  var [saved,setSaved]=useState(false);

  function update(k,v){
    setProfile(function(p){return Object.assign({},p,{[k]:v});});
    setSaved(false);
  }

  function handleSave(){
    saveProfile(profile);
    setSaved(true);
    setEditMode(false);
    setTimeout(function(){setSaved(false);},2500);
  }

  var kycCol=profile.kycStatus=="verified"?UP:profile.kycStatus=="pending"?GOLD:DOWN;
  var kycLabel=profile.kycStatus=="verified"?"Verified":profile.kycStatus=="pending"?"Pending":"Not Started";

  function Field(p){
    var label=p.label,field=p.field,placeholder=p.placeholder,type=p.type||"text";
    return (
      <div style={{marginBottom:12}}>
        <div style={{fontSize:9,color:T3,marginBottom:5}}>{label}</div>
        {editMode?(
          <input type={type} value={profile[field]} onChange={function(e){update(field,e.target.value);}} placeholder={placeholder} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid "+BD,borderRadius:10,padding:"10px 12px",color:T1,fontSize:12,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
        ):(
          <div style={{fontSize:12,fontWeight:600,color:profile[field]?T1:T3}}>{profile[field]||"Not set"}</div>
        )}
      </div>
    );
  }

  function SelectField(p){
    var label=p.label,field=p.field,options=p.options;
    return (
      <div style={{marginBottom:12}}>
        <div style={{fontSize:9,color:T3,marginBottom:5}}>{label}</div>
        {editMode?(
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {options.map(function(o){
              var act=profile[field]==o;
              return <button key={o} onClick={function(){update(field,o);}} style={{background:act?"rgba(59,130,246,0.2)":"rgba(255,255,255,0.04)",border:"1px solid "+(act?BLUE:BD),borderRadius:8,padding:"6px 12px",color:act?BLUE2:T2,fontSize:10,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{o}</button>;
            })}
          </div>
        ):(
          <div style={{fontSize:12,fontWeight:600,color:T1}}>{profile[field]}</div>
        )}
      </div>
    );
  }

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      <div style={{background:CB,padding:"14px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:14,cursor:"pointer"}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:900,color:T1}}>Profile</div>
          <div style={{fontSize:10,color:T2}}>Account details and preferences</div>
        </div>
        <button onClick={function(){if(editMode){handleSave();}else{setEditMode(true);}}} style={{background:editMode?"rgba(34,197,94,0.15)":"rgba(59,130,246,0.15)",border:"1px solid "+(editMode?UP:BLUE),borderRadius:10,padding:"6px 14px",color:editMode?UP:BLUE2,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
          {editMode?"Save":"Edit"}
        </button>
      </div>

      <div style={{padding:"14px"}}>

        {saved&&(
          <div style={{background:"rgba(34,197,94,0.1)",border:"1px solid "+UP,borderRadius:10,padding:"8px 12px",marginBottom:12,textAlign:"center"}}>
            <span style={{fontSize:10,color:UP,fontWeight:700}}>&#10003; Profile saved successfully</span>
          </div>
        )}

        {/* Avatar + Name */}
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
          <div style={{width:64,height:64,borderRadius:18,background:"linear-gradient(135deg,"+BLUE+","+PURPLE+")",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:900,color:"#fff",flexShrink:0}}>
            {(profile.name||"T").charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{fontSize:17,fontWeight:900,color:T1}}>{profile.name||"Trader"}</div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
              {isPrem&&(
                <div style={{background:"rgba(245,158,11,0.15)",border:"1px solid "+GOLD,borderRadius:6,padding:"2px 8px"}}>
                  <span style={{fontSize:8,fontWeight:700,color:GOLD}}>&#11088; PREMIUM</span>
                </div>
              )}
              <div style={{background:kycCol+"15",border:"1px solid "+kycCol+"55",borderRadius:6,padding:"2px 8px"}}>
                <span style={{fontSize:8,fontWeight:700,color:kycCol}}>KYC: {kycLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* KYC Status Card */}
        {profile.kycStatus!="verified"&&(
          <div style={{background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.25)",borderRadius:14,padding:"12px 14px",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <span style={{fontSize:14}}>&#128222;</span>
              <span style={{fontSize:11,fontWeight:700,color:BLUE2}}>Complete Verification</span>
            </div>
            <div style={{fontSize:10,color:T2,lineHeight:1.5,marginBottom:10}}>Verify your phone number and email to unlock all features. No PAN or government ID required.</div>
            <button onClick={function(){update("kycStatus","verified");}} style={{background:BLUE,border:"none",borderRadius:10,padding:"8px 16px",color:"#fff",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Verify Now</button>
          </div>
        )}

        {/* Personal Info */}
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"14px",marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:12}}>Account Information</div>
          <Field label="Full Name" field="name" placeholder="Your name"/>
          <Field label="Gmail / Email" field="email" placeholder="you@gmail.com" type="email"/>
          <Field label="Phone Number" field="phone" placeholder="+91 XXXXX XXXXX"/>
        </div>

        {/* Trading Preferences */}
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"14px",marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:12}}>Trading Preferences</div>
          <SelectField label="Experience Level" field="experience" options={["Beginner","Intermediate","Advanced"]}/>
          <SelectField label="Trading Style" field="tradingStyle" options={["Intraday","Swing","Long Term"]}/>
          <SelectField label="Risk Appetite" field="riskAppetite" options={["Conservative","Moderate","Aggressive"]}/>
        </div>

        {editMode&&(
          <button onClick={handleSave} style={{width:"100%",background:"linear-gradient(135deg,"+BLUE+","+PURPLE+")",border:"none",borderRadius:14,padding:"14px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginBottom:12}}>Save Profile</button>
        )}

        <div style={{background:"rgba(59,130,246,0.06)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:10,padding:"8px 12px"}}>
          <div style={{fontSize:8,color:BLUE2}}>We only collect your name, phone and email for account verification. No PAN card or government ID required. Your data is never shared with third parties.</div>
        </div>
      </div>
    </div>
  );
}
