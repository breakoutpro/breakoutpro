import { useState } from "react";
import { CATEGORIES, SUGGESTED_QUESTIONS, KNOWLEDGE_BASE, askMentor } from "./AIMentorData";
import { MODULES } from "./AcademyData";
import { BOOK_CATEGORIES } from "./BookLibraryData";
import { PRACTICE_LIST } from "./PracticeData";
import { useTheme } from "../theme/ThemeProvider";

// BreakoutPro - AIMentor.jsx
// Offline, rule-based AI Mentor. No API call, no fake AI, no typing
// animation, no artificial "thinking" delay - answers render immediately
// on submit, straight from the local knowledge base.
// Rules: no backtick, no triple-equals, ASCII only.

var CARD="#101318",BD="#20242D";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472",BLUE="#3B82F6",WARN="#F97316";

var ALL_BOOKS = [];
BOOK_CATEGORIES.forEach(function(cat){ cat.books.forEach(function(b){ ALL_BOOKS.push(b); }); });

function findModule(id){ return MODULES.filter(function(m){ return m.id==id; })[0]; }
function findBook(id){ return ALL_BOOKS.filter(function(b){ return b.id==id; })[0]; }
function findPractice(id){ return PRACTICE_LIST.filter(function(p){ return p.id==id; })[0]; }

export default function AIMentor(props){

  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  CARD=theme.c.card; BD=theme.c.border;
  T1=theme.c.text1; T2=theme.c.text2; T3=theme.c.text3; BLUE=theme.c.blue; WARN=theme.c.warn;
  var onBack = props.onBack || function(){};
  var onOpenModule = props.onOpenModule || function(){};
  var onOpenLibrary = props.onOpenLibrary || function(){};
  var onOpenPractice = props.onOpenPractice || function(){};

  var [category, setCategory] = useState("All");
  var [query, setQuery] = useState("");
  var [result, setResult] = useState(null);

  function ask(text){
    var q = text!=null ? text : query;
    if(!q.trim()) return;
    setQuery(q);
    setResult(askMentor(q)); // synchronous - no fake delay, no typing animation
  }

  var visibleQuestions = category=="All"
    ? SUGGESTED_QUESTIONS
    : KNOWLEDGE_BASE.filter(function(e){ return e.category==category; }).map(function(e){ return e.question; });

  return (
    <div style={{background:theme.c.bg,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:CARD,padding:"12px 14px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:40,height:40,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div>
          <div style={{fontSize:15,fontWeight:800,color:T1}}>AI Mentor</div>
          <div style={{fontSize:9,color:T2}}>Offline, rule-based answers. Educational only.</div>
        </div>
      </div>

      <div style={{padding:14}}>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <input value={query} onChange={function(ev){setQuery(ev.target.value);}} onKeyDown={function(ev){ if(ev.key=="Enter") ask(); }} placeholder="Ask a trading question..." style={{flex:1,background:CARD,border:"1px solid "+BD,borderRadius:10,padding:"11px 12px",color:T1,fontSize:13,fontFamily:"inherit"}}/>
          <button onClick={function(){ask();}} style={{background:BLUE,border:"none",borderRadius:10,padding:"0 16px",color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Ask</button>
        </div>

        <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
          <span onClick={function(){setCategory("All");}} style={{fontSize:9,fontWeight:700,color:category=="All"?"#fff":T2,background:category=="All"?BLUE:CARD,border:"1px solid "+(category=="All"?BLUE:BD),borderRadius:8,padding:"5px 10px",cursor:"pointer"}}>All</span>
          {CATEGORIES.map(function(c){
            return <span key={c} onClick={function(){setCategory(c);}} style={{fontSize:9,fontWeight:700,color:category==c?"#fff":T2,background:category==c?BLUE:CARD,border:"1px solid "+(category==c?BLUE:BD),borderRadius:8,padding:"5px 10px",cursor:"pointer"}}>{c}</span>;
          })}
        </div>

        {result ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:14,marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,color:T2,marginBottom:8}}>Q: {query}</div>
            <div style={{fontSize:12,color:"#C9D4E5",lineHeight:1.6,marginBottom:result.matched?12:0}}>{result.answer}</div>

            {result.matched && result.entry ? (
              <div>
                {result.entry.relatedModuleIds.length>0 ? (
                  <div style={{marginTop:10}}>
                    <div style={{fontSize:9,fontWeight:800,color:T2,marginBottom:6}}>RELATED LESSONS</div>
                    {result.entry.relatedModuleIds.map(function(id){
                      var m = findModule(id);
                      if(!m) return null;
                      return <div key={id} onClick={function(){onOpenModule(id);}} style={{fontSize:11,color:BLUE,cursor:"pointer",marginBottom:4}}>{m.icon} {m.title}</div>;
                    })}
                  </div>
                ) : null}
                {result.entry.relatedBookIds.length>0 ? (
                  <div style={{marginTop:10}}>
                    <div style={{fontSize:9,fontWeight:800,color:T2,marginBottom:6}}>RELATED BOOKS</div>
                    {result.entry.relatedBookIds.map(function(id){
                      var b = findBook(id);
                      if(!b) return null;
                      return <div key={id} onClick={onOpenLibrary} style={{fontSize:11,color:BLUE,cursor:"pointer",marginBottom:4}}>{b.title} - {b.author}</div>;
                    })}
                  </div>
                ) : null}
                {result.entry.relatedPracticeIds.length>0 ? (
                  <div style={{marginTop:10}}>
                    <div style={{fontSize:9,fontWeight:800,color:T2,marginBottom:6}}>RELATED PRACTICE</div>
                    {result.entry.relatedPracticeIds.map(function(id){
                      var p = findPractice(id);
                      if(!p) return null;
                      return <div key={id} onClick={function(){onOpenPractice(id);}} style={{fontSize:11,color:BLUE,cursor:"pointer",marginBottom:4}}>{p.icon} {p.title}</div>;
                    })}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        <div style={{fontSize:10,fontWeight:800,color:T2,marginBottom:10}}>SUGGESTED QUESTIONS</div>
        {visibleQuestions.map(function(q,i){
          return (
            <div key={i} onClick={function(){ask(q);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:"11px 14px",marginBottom:8,fontSize:11,color:T1,cursor:"pointer"}}>{q}</div>
          );
        })}

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11,marginTop:16}}>
          <div style={{fontSize:8.5,color:WARN,lineHeight:1.5}}>Offline, rule-based answers only - not a live AI model, not investment advice. If a topic isn't covered yet, the Mentor says so honestly.</div>
        </div>
      </div>
    </div>
  );
}
