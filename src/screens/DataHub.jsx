import { useState } from "react";
import { CATEGORIES } from "./DataHubData";

import { useTheme } from "../theme/ThemeProvider";
var BG="#050505",CARD="#101318",BD="rgba(255,255,255,0.07)";
var BLUE="#3B82F6";
var UP="#22C55E",DOWN="#EF4444";
var T1="#FFFFFF",T2="#9CA3AF",T3="#5B6472";

export default function DataHub(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  DOWN=theme.c.down; T2=theme.c.text2;
  BLUE=theme.c.blue; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BG = theme.c.bg, CARD = theme.c.card, T3 = theme.c.text3; T1=theme.c.text1; UP=theme.c.up;

  var setTab=props.setTab||function(){};
  var onBack=props.onBack||function(){setTab("home");};
  var [openCats,setOpenCats]=useState({market:true});
  var [query,setQuery]=useState("");

  function toggleCat(id){
    setOpenCats(function(p){return Object.assign({},p,{[id]:!p[id]});});
  }

  var q=query.trim().toLowerCase();
  var filtered=CATEGORIES.map(function(cat){
    if(!q)return cat;
    var items=cat.items.filter(function(it){return it.label.toLowerCase().indexOf(q)!=-1;});
    return Object.assign({},cat,{items:items});
  }).filter(function(cat){return !q || cat.items.length>0;});

  var totalItems=CATEGORIES.reduce(function(s,c){return s+c.items.length;},0);

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      <div style={{background:CARD,padding:"16px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:14,cursor:"pointer"}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:900,color:T1}}>Data Hub</div>
          <div style={{fontSize:12,color:T2}}>{totalItems}+ data points across {CATEGORIES.length} categories</div>
        </div>
      </div>

      <div style={{padding:"12px 16px"}}>
        <input value={query} onChange={function(e){setQuery(e.target.value);}} placeholder="Search data points..." style={{width:"100%",background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"12px 16px",color:T1,fontSize:12,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:16}}/>

        {filtered.length==0&&(
          <div style={{textAlign:"center",padding:"40px 0",color:T3,fontSize:12}}>No data points match "{query}"</div>
        )}

        {filtered.map(function(cat){
          var isOpen=q?true:!!openCats[cat.id];
          return (
            <div key={cat.id} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,marginBottom:12,overflow:"hidden"}}>
              <div onClick={function(){toggleCat(cat.id);}} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",cursor:"pointer"}}>
                <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:cat.icon}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:700,color:T1}}>{cat.title}</div>
                  <div style={{fontSize:12,color:T3,marginTop:4}}>{cat.items.length} items</div>
                </div>
                <span style={{fontSize:12,color:T3,transform:isOpen?"rotate(180deg)":"none",transition:"transform 0.2s"}}>&#9660;</span>
              </div>
              {isOpen&&(
                <div style={{padding:"0 12px 12px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {cat.items.map(function(it,i){
                    var color=it.up===true?UP:it.up===false?DOWN:BLUE;
                    return (
                      <div key={i} onClick={function(){if(it.link)setTab(it.link);}} style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"12px 12px",cursor:it.link?"pointer":"default"}}>
                        <div style={{fontSize:12,color:T3,marginBottom:4,lineHeight:1.2}}>{it.label}</div>
                        <div style={{fontSize:12,fontWeight:800,color:T1,marginBottom:4}}>{it.value}</div>
                        <div style={{fontSize:12,fontWeight:600,color:color}}>{it.sub}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div style={{background:"rgba(59,130,246,0.06)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:10,padding:"8px 12px",marginTop:8}}>
          <div style={{fontSize:12,color:BLUE}}>Data shown is for educational and informational purposes. Not investment advice. Some values are illustrative pending live API integration.</div>
        </div>
      </div>
    </div>
  );
}
