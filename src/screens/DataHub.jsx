import { useState } from "react";
import { CATEGORIES } from "./DataHubData";

import { useTheme } from "../theme/ThemeProvider";
var BG="#050505",CARD="#101318",BD="rgba(255,255,255,0.07)";
var BLUE="#3B82F6",CYAN="#60A5FA";
var UP="#22C55E",DOWN="#EF4444",GOLD="#F59E0B";
var T1="#FFFFFF",T2="#9CA3AF",T3="#5B6472";

export default function DataHub(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BG = theme.c.bg, CARD = theme.c.card, T3 = theme.c.text3;

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

      <div style={{background:CARD,padding:"14px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:14,cursor:"pointer"}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:900,color:T1}}>Data Hub</div>
          <div style={{fontSize:10,color:T2}}>{totalItems}+ data points across {CATEGORIES.length} categories</div>
        </div>
      </div>

      <div style={{padding:"12px 14px"}}>
        <input value={query} onChange={function(e){setQuery(e.target.value);}} placeholder="Search data points..." style={{width:"100%",background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"11px 14px",color:T1,fontSize:12,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:14}}/>

        {filtered.length==0&&(
          <div style={{textAlign:"center",padding:"40px 0",color:T3,fontSize:12}}>No data points match "{query}"</div>
        )}

        {filtered.map(function(cat){
          var isOpen=q?true:!!openCats[cat.id];
          return (
            <div key={cat.id} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,marginBottom:10,overflow:"hidden"}}>
              <div onClick={function(){toggleCat(cat.id);}} style={{display:"flex",alignItems:"center",gap:10,padding:"13px 14px",cursor:"pointer"}}>
                <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:cat.icon}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:700,color:T1}}>{cat.title}</div>
                  <div style={{fontSize:8.5,color:T3,marginTop:1}}>{cat.items.length} items</div>
                </div>
                <span style={{fontSize:12,color:T3,transform:isOpen?"rotate(180deg)":"none",transition:"transform 0.2s"}}>&#9660;</span>
              </div>
              {isOpen&&(
                <div style={{padding:"0 12px 12px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {cat.items.map(function(it,i){
                    var color=it.up===true?UP:it.up===false?DOWN:CYAN;
                    return (
                      <div key={i} onClick={function(){if(it.link)setTab(it.link);}} style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"10px 11px",cursor:it.link?"pointer":"default"}}>
                        <div style={{fontSize:9,color:T3,marginBottom:4,lineHeight:1.2}}>{it.label}</div>
                        <div style={{fontSize:11.5,fontWeight:800,color:T1,marginBottom:2}}>{it.value}</div>
                        <div style={{fontSize:8.5,fontWeight:600,color:color}}>{it.sub}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div style={{background:"rgba(59,130,246,0.06)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:10,padding:"8px 12px",marginTop:8}}>
          <div style={{fontSize:8,color:CYAN}}>Data shown is for educational and informational purposes. Not investment advice. Some values are illustrative pending live API integration.</div>
        </div>
      </div>
    </div>
  );
}
