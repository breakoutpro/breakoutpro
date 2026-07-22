import { useState } from "react";
import { BOOK_CATEGORIES } from "./BookLibraryData";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - BookLibrary.jsx
// Trading Books Library - real, well-known books with original summaries
// only (no copyrighted text reproduced). Reuses the same
// useAcademyProgress() instance passed down from AcademyHome - no second
// hook, no duplicate localStorage key beyond the one distinct book-status
// key already added inside that same hook file.
// Rules: no backtick, no triple-equals, ASCII only.

var CB="#0F1629",BD="#1E2D4A";
var T1="#FFFFFF",T2="#8899BB",T3="#5B6472",GOLD="#D4AF37",UP="#22C55E";

var STATUS_LABEL = { not_started:"Not Started", reading:"Reading", completed:"Completed" };
var STATUS_COLOR = { not_started:T3, reading:GOLD, completed:UP };
var STATUS_ORDER = ["not_started","reading","completed"];

function difficultyColor(d){
  if(d=="Beginner") return UP;
  if(d=="Advanced") return "#EF4444";
  return GOLD; // Intermediate
}

export default function BookLibrary(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BLUE=theme.c.blue; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BLUE = theme.c.gold, T3 = theme.c.text3; T1=theme.c.text1; UP=theme.c.up;
  var BG = theme.c.bg, CB = theme.c.card, BD = theme.c.border, T2 = theme.c.text2;

  var progress = props.progress; // shared useAcademyProgress() instance, not a new hook
  var onBack = props.onBack || function(){};

  function cycleStatus(bookId){
    var current = progress.bookStatus(bookId);
    var idx = STATUS_ORDER.indexOf(current);
    var next = STATUS_ORDER[(idx+1) % STATUS_ORDER.length];
    progress.setBookStatus(bookId, next);
  }

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:CB,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div>
          <div style={{fontSize:16,fontWeight:800,color:T1}}>Trading Library</div>
          <div style={{fontSize:12,color:T2}}>Real books, original summaries. Educational only.</div>
        </div>
      </div>

      <div style={{padding:16}}>
        {BOOK_CATEGORIES.map(function(cat){
          return (
            <div key={cat.id} style={{marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <span style={{fontSize:16}}>{cat.icon}</span>
                <span style={{fontSize:12,fontWeight:800,color:T1}}>{cat.title}</span>
              </div>
              {cat.books.map(function(b){
                var status = progress.bookStatus(b.id);
                var saved = progress.isSaved(b.id);
                return (
                  <div key={b.id} style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:8}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:8}}>
                      <div>
                        <div style={{fontSize:14,fontWeight:700,color:T1}}>{b.title}</div>
                        <div style={{fontSize:12,color:T2,marginTop:4}}>by {b.author}</div>
                      </div>
                      <button onClick={function(){progress.toggleSaved(b.id);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:saved?BLUE:T3,padding:4,minWidth:44,minHeight:44}}>{saved?"\u2605":"\u2606"}</button>
                    </div>

                    <div style={{fontSize:12,color:T2,lineHeight:1.6,marginBottom:8}}>{b.summary}</div>
                    <div style={{fontSize:12,color:T2,lineHeight:1.5,marginBottom:12,fontStyle:"italic"}}>{b.whyRead}</div>

                    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
                      <span style={{fontSize:12,fontWeight:700,color:difficultyColor(b.difficulty),background:difficultyColor(b.difficulty)+"18",border:"1px solid "+difficultyColor(b.difficulty)+"40",borderRadius:6,padding:"4px 8px"}}>{b.difficulty}</span>
                      <span style={{fontSize:12,fontWeight:700,color:T2,background:theme.c.card2,border:"1px solid "+BD,borderRadius:16,padding:"4px 8px"}}>{b.readTime}</span>
                    </div>

                    <button onClick={function(){cycleStatus(b.id);}} style={{width:"100%",background:"transparent",border:"1px solid "+STATUS_COLOR[status],borderRadius:10,padding:"8px 12px",color:STATUS_COLOR[status],fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>{STATUS_LABEL[status]} &#8226; tap to update</button>
                  </div>
                );
              })}
            </div>
          );
        })}

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:12,marginTop:8}}>
          <div style={{fontSize:12,color:theme.c.warn,lineHeight:1.5}}>All summaries above are written fresh for this app and do not reproduce any book's actual text. Educational only - not investment advice. More books per category are planned.</div>
        </div>
      </div>
    </div>
  );
}
