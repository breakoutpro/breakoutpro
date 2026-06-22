import { useState } from "react";

var BG="#050505",CARD="#101318",BD="rgba(255,255,255,0.07)";
var BLUE="#3B82F6",CYAN="#60A5FA",UP="#22C55E",DOWN="#EF4444",GOLD="#F59E0B";
var T1="#FFFFFF",T2="#9CA3AF",T3="#5B6472";

var IPOS=[
  {name:"Ola Electric",sym:"OLAELEC",price:"Rs 72–76",open:"Jun 23",close:"Jun 25",listing:"Jul 1",lot:195,minInvest:14820,gmp:"+Rs 12 (15.8%)",cat:"EV / Auto",rating:4,sub:"29.3x",status:"open",desc:"India's leading EV 2-wheeler brand. Strong brand, but losses continue.",grey:UP},
  {name:"Bajaj Housing",sym:"BAJAJHFL",price:"Rs 66–70",open:"Jun 25",close:"Jun 27",listing:"Jul 3",lot:214,minInvest:14980,gmp:"+Rs 18 (25.7%)",cat:"Finance / NBFC",rating:5,sub:"63.5x",status:"upcoming",desc:"Bajaj Finance subsidiary. Excellent parentage, strong fundamentals.",grey:UP},
  {name:"Premier Energies",sym:"PREMIERENG",price:"Rs 427–450",open:"Jun 28",close:"Jul 2",listing:"Jul 8",lot:33,minInvest:14850,gmp:"+Rs 35 (7.8%)",cat:"Solar / Energy",rating:3,sub:"--",status:"upcoming",desc:"Solar cell and module manufacturer. Govt tailwinds but competitive sector.",grey:UP},
  {name:"Vibhor Steel",sym:"VIBHORSTEL",price:"Rs 141–151",open:"Jul 3",close:"Jul 5",listing:"Jul 10",lot:99,minInvest:14949,gmp:"-Rs 5 (-3.3%)",cat:"Metal / Infra",rating:2,sub:"--",status:"upcoming",desc:"Steel pipe manufacturer. Cyclical sector, limited moat.",grey:DOWN},
  {name:"Smartworks Coworking",sym:"SMARTWRK",price:"Rs 387–408",open:"Jul 8",close:"Jul 10",listing:"Jul 16",lot:36,minInvest:14688,gmp:"Not Listed",cat:"Real Estate",rating:3,sub:"--",status:"upcoming",desc:"Premium coworking operator. Loss-making but expanding rapidly.",grey:T3},
];

var FILTERS=["All","Open","Upcoming","GMP Positive"];

export default function IPOScreen(props){
  var onBack=props.onBack||function(){};
  var setTab=props.setTab||function(){};
  var [filter,setFilter]=useState("All");
  var [sel,setSel]=useState(null);

  var filtered=IPOS.filter(function(ipo){
    if(filter=="Open")return ipo.status=="open";
    if(filter=="Upcoming")return ipo.status=="upcoming";
    if(filter=="GMP Positive")return ipo.grey==UP;
    return true;
  });

  function StarRating(p){
    return (
      <div style={{display:"flex",gap:2}}>
        {[1,2,3,4,5].map(function(i){return <span key={i} style={{fontSize:10,color:i<=p.n?GOLD:T3}}>&#9733;</span>;})}</div>
    );
  }

  if(sel) return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80,color:T1}}>
      <div style={{background:CARD,padding:"14px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <button onClick={function(){setSel(null);}} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:14,cursor:"pointer"}}>&#8592;</button>
        <div>
          <div style={{fontSize:16,fontWeight:800,color:T1}}>{sel.name}</div>
          <div style={{fontSize:9,color:T3}}>{sel.cat} &bull; {sel.sym}</div>
        </div>
      </div>
      <div style={{padding:"14px"}}>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:18,padding:"16px",marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
            <div>
              <div style={{fontSize:11,color:T3,marginBottom:3}}>Price Band</div>
              <div style={{fontSize:18,fontWeight:900,color:T1}}>{sel.price}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,color:T3,marginBottom:3}}>GMP</div>
              <div style={{fontSize:14,fontWeight:800,color:sel.grey}}>{sel.gmp}</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[["Open Date",sel.open],["Close Date",sel.close],["Listing",sel.listing],["Lot Size",sel.lot+" shares"],["Min Investment",sel.minInvest.toLocaleString("en-IN")],["Subscription",sel.sub]].map(function(r){
              return(
                <div key={r[0]} style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"9px"}}>
                  <div style={{fontSize:8,color:T3,marginBottom:3}}>{r[0]}</div>
                  <div style={{fontSize:11,fontWeight:700,color:T1}}>{r[1]}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{background:"rgba(59,130,246,0.06)",border:"1px solid "+BD,borderRadius:14,padding:"14px",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <span style={{fontSize:13}}>&#129504;</span>
            <span style={{fontSize:11,fontWeight:700,color:CYAN}}>AI Analysis</span>
            <span style={{marginLeft:"auto"}}><StarRating n={sel.rating}/></span>
          </div>
          <div style={{fontSize:11,color:T1,lineHeight:1.6}}>{sel.desc}</div>
        </div>
        <div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:10,padding:"8px 12px"}}>
          <div style={{fontSize:8,color:GOLD}}>This is educational information only. Not investment advice. Apply at your own risk. Check SEBI DRHP before investing.</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80,color:T1}}>
      <div style={{background:CARD,padding:"14px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:14,cursor:"pointer"}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:900,color:T1}}>&#128640; Upcoming IPOs</div>
          <div style={{fontSize:10,color:T3}}>GMP, AI rating, lot size &bull; Educational only</div>
        </div>
      </div>
      <div style={{padding:"12px 14px"}}>
        <div style={{display:"flex",gap:7,marginBottom:14,overflowX:"auto"}}>
          {FILTERS.map(function(f){
            var act=filter==f;
            return <button key={f} onClick={function(){setFilter(f);}} style={{background:act?"rgba(59,130,246,0.15)":CARD,border:"1px solid "+(act?CYAN:BD),borderRadius:20,padding:"6px 14px",color:act?CYAN:T3,fontSize:10,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit",flexShrink:0,whiteSpace:"nowrap"}}>{f}</button>;
          })}
        </div>
        {filtered.map(function(ipo){
          return (
            <div key={ipo.sym} onClick={function(){setSel(ipo);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"14px",marginBottom:10,cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div>
                  <div style={{fontSize:13,fontWeight:800,color:T1}}>{ipo.name}</div>
                  <div style={{fontSize:9,color:T3,marginTop:2}}>{ipo.cat} &bull; {ipo.sym}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:9,color:ipo.status=="open"?UP:CYAN,fontWeight:700,background:ipo.status=="open"?"rgba(34,197,94,0.12)":"rgba(96,165,250,0.1)",borderRadius:6,padding:"2px 8px"}}>{ipo.status=="open"?"OPEN NOW":"Upcoming"}</div>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:10,color:T3}}>Price Band</div>
                  <div style={{fontSize:12,fontWeight:700,color:T1}}>{ipo.price}</div>
                </div>
                <div>
                  <div style={{fontSize:10,color:T3}}>GMP</div>
                  <div style={{fontSize:12,fontWeight:700,color:ipo.grey}}>{ipo.gmp}</div>
                </div>
                <div>
                  <div style={{fontSize:10,color:T3}}>AI Rating</div>
                  <StarRating n={ipo.rating}/>
                </div>
                <div>
                  <div style={{fontSize:10,color:T3}}>Listing</div>
                  <div style={{fontSize:11,fontWeight:600,color:T1}}>{ipo.listing}</div>
                </div>
              </div>
            </div>
          );
        })}
        <div style={{background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.15)",borderRadius:10,padding:"8px 12px",marginTop:8}}>
          <div style={{fontSize:8,color:GOLD}}>IPO data is for educational purposes. GMP is grey market premium (unofficial). Always read SEBI DRHP. Not SEBI-registered advisory.</div>
        </div>
      </div>
    </div>
  );
}
