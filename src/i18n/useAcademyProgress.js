import { useState } from "react";

// BreakoutPro - useAcademyProgress.js
// Single source of truth for Trading Academy progress - lessons, the
// Trading Library book catalog, Practice Zone scores, AI Trade Replay
// history, and the Phase 4 achievement system (streak + certificate
// name). Five distinct localStorage keys are used because each tracks a
// genuinely different data shape - this remains one hook, not a
// duplicate one; all are exposed from this same file.
// XP, level, and badges are NEVER stored as separate numbers - they are
// always computed live from the real underlying data above, so they can
// never drift from reality or be fabricated.
// Rules: no backtick, no triple-equals, ASCII only.

var KEY = "bp_academy_progress";
var BOOK_KEY = "bp_academy_books";
var PRACTICE_KEY = "bp_academy_practice";
var REPLAY_KEY = "bp_academy_replay";
var STREAK_KEY = "bp_academy_streak";

function load(){
  try{ var s = localStorage.getItem(KEY); return s ? JSON.parse(s) : {}; }catch(e){ return {}; }
}
function save(map){
  try{ localStorage.setItem(KEY, JSON.stringify(map)); }catch(e){}
}
function loadBooks(){
  try{ var s = localStorage.getItem(BOOK_KEY); return s ? JSON.parse(s) : {}; }catch(e){ return {}; }
}
function saveBooks(map){
  try{ localStorage.setItem(BOOK_KEY, JSON.stringify(map)); }catch(e){}
}
function loadPractice(){
  try{ var s = localStorage.getItem(PRACTICE_KEY); return s ? JSON.parse(s) : {}; }catch(e){ return {}; }
}
function savePractice(map){
  try{ localStorage.setItem(PRACTICE_KEY, JSON.stringify(map)); }catch(e){}
}
function loadReplay(){
  try{ var s = localStorage.getItem(REPLAY_KEY); return s ? JSON.parse(s) : {}; }catch(e){ return {}; }
}
function saveReplay(map){
  try{ localStorage.setItem(REPLAY_KEY, JSON.stringify(map)); }catch(e){}
}
function loadStreak(){
  try{ var s = localStorage.getItem(STREAK_KEY); return s ? JSON.parse(s) : { lastActiveDate:null, current:0, best:0, certName:"" }; }catch(e){ return { lastActiveDate:null, current:0, best:0, certName:"" }; }
}
function saveStreak(obj){
  try{ localStorage.setItem(STREAK_KEY, JSON.stringify(obj)); }catch(e){}
}
function todayKey(){
  var d = new Date();
  return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
}
function yesterdayKey(){
  var d = new Date();
  d.setDate(d.getDate()-1);
  return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
}

export function useAcademyProgress(){
  var [map, setMap] = useState(function(){ return load(); });
  var [books, setBooks] = useState(function(){ return loadBooks(); });
  var [practice, setPractice] = useState(function(){ return loadPractice(); });
  var [replay, setReplay] = useState(function(){ return loadReplay(); });
  var [streak, setStreak] = useState(function(){ return loadStreak(); });

  // Called internally by every real academy action below. Only advances
  // the streak once per real calendar day, and only when the previous
  // active day was genuinely yesterday - any gap resets to 1, never
  // silently continuing a broken streak.
  function recordDailyActivity(){
    setStreak(function(prev){
      var today = todayKey();
      if(prev.lastActiveDate==today) return prev; // already counted today
      var next;
      if(prev.lastActiveDate==yesterdayKey()){
        var cur = prev.current+1;
        next = { lastActiveDate:today, current:cur, best:Math.max(prev.best,cur), certName:prev.certName };
      } else {
        next = { lastActiveDate:today, current:1, best:Math.max(prev.best,1), certName:prev.certName };
      }
      saveStreak(next);
      return next;
    });
  }
  function streakInfo(){
    return { current: streak.current||0, best: streak.best||0 };
  }
  function getCertName(){
    return streak.certName || "";
  }
  function setCertName(name){
    setStreak(function(prev){
      var next = Object.assign({}, prev, { certName: name });
      saveStreak(next);
      return next;
    });
  }

  function isComplete(lessonId){
    return !!map[lessonId];
  }
  function markComplete(lessonId){
    setMap(function(prev){
      var next = {}; for(var k in prev){ if(prev.hasOwnProperty(k)) next[k]=prev[k]; }
      next[lessonId] = true;
      save(next);
      return next;
    });
    recordDailyActivity();
  }
  // Real percentage: completed lessons (excluding comingSoon ones, since
  // those have no content to complete) divided by total available lessons.
  function moduleProgress(module){
    var real = module.lessons.filter(function(l){ return !l.comingSoon; });
    if(real.length==0) return {done:0, total:0, pct:0};
    var done = real.filter(function(l){ return isComplete(l.id); }).length;
    return {done:done, total:real.length, pct:Math.round((done/real.length)*100)};
  }
  function overallProgress(allModules){
    var done=0, total=0;
    allModules.forEach(function(m){
      var real = m.lessons.filter(function(l){ return !l.comingSoon; });
      total += real.length;
      done += real.filter(function(l){ return isComplete(l.id); }).length;
    });
    return {done:done, total:total, pct: total>0 ? Math.round((done/total)*100) : 0};
  }

  // Book status: "not_started" | "reading" | "completed". Real, user-set
  // only - a book is never marked reading/completed automatically.
  function bookStatus(bookId){
    var b = books[bookId];
    return (b && b.status) ? b.status : "not_started";
  }
  function isSaved(bookId){
    var b = books[bookId];
    return !!(b && b.saved);
  }
  function setBookStatus(bookId, status){
    setBooks(function(prev){
      var next = {}; for(var k in prev){ if(prev.hasOwnProperty(k)) next[k]=Object.assign({},prev[k]); }
      next[bookId] = Object.assign({}, next[bookId], { status: status });
      saveBooks(next);
      return next;
    });
    recordDailyActivity();
  }
  function toggleSaved(bookId){
    setBooks(function(prev){
      var next = {}; for(var k in prev){ if(prev.hasOwnProperty(k)) next[k]=Object.assign({},prev[k]); }
      var current = !!(next[bookId] && next[bookId].saved);
      next[bookId] = Object.assign({}, next[bookId], { saved: !current });
      saveBooks(next);
      return next;
    });
    recordDailyActivity();
  }

  // Practice Zone: real attempt/correct counters per practiceId. Never a
  // fabricated score - only incremented when the user actually answers.
  function practiceScore(practiceId){
    var p = practice[practiceId];
    return { attempts: (p && p.attempts) || 0, correct: (p && p.correct) || 0 };
  }
  function recordPracticeAttempt(practiceId, wasCorrect){
    setPractice(function(prev){
      var next = {}; for(var k in prev){ if(prev.hasOwnProperty(k)) next[k]=Object.assign({},prev[k]); }
      var cur = next[practiceId] || { attempts:0, correct:0 };
      next[practiceId] = { attempts: cur.attempts+1, correct: cur.correct + (wasCorrect?1:0) };
      savePractice(next);
      return next;
    });
    recordDailyActivity();
  }

  // AI Trade Replay: real per-category correct/wrong tallies, updated one
  // decision at a time as the user actually plays through a scenario.
  // Never a fabricated score.
  function recordReplayDecision(category, wasCorrect){
    setReplay(function(prev){
      var next = {}; for(var k in prev){ if(prev.hasOwnProperty(k)) next[k]=Object.assign({},prev[k]); }
      var cur = next[category] || { correct:0, wrong:0 };
      next[category] = { correct: cur.correct + (wasCorrect?1:0), wrong: cur.wrong + (wasCorrect?0:1) };
      saveReplay(next);
      return next;
    });
    recordDailyActivity();
  }
  function replayStats(){
    var out = {};
    for(var k in replay){ if(replay.hasOwnProperty(k)) out[k] = replay[k]; }
    return out;
  }

  // ---- Phase 4: Achievements, XP, Levels, Certificates ----
  // Every number below is computed live from the real data already
  // tracked above - never a separately stored, potentially-fabricated
  // statistic.

  function lessonsCompletedCount(){
    var n=0; for(var k in map){ if(map.hasOwnProperty(k) && map[k]) n++; } return n;
  }
  function booksCompletedCount(){
    var n=0; for(var k in books){ if(books.hasOwnProperty(k) && books[k] && books[k].status=="completed") n++; } return n;
  }
  function practiceCorrectTotal(){
    var n=0; for(var k in practice){ if(practice.hasOwnProperty(k)) n += (practice[k].correct||0); } return n;
  }
  function replayCorrectTotal(){
    var n=0; for(var k in replay){ if(replay.hasOwnProperty(k)) n += (replay[k].correct||0); } return n;
  }

  var XP_PER_LESSON = 15, XP_PER_PRACTICE_CORRECT = 3, XP_PER_REPLAY_CORRECT = 5, XP_PER_BOOK = 25;

  function getXP(){
    return lessonsCompletedCount()*XP_PER_LESSON
      + practiceCorrectTotal()*XP_PER_PRACTICE_CORRECT
      + replayCorrectTotal()*XP_PER_REPLAY_CORRECT
      + booksCompletedCount()*XP_PER_BOOK;
  }

  var LEVELS = [
    { name:"Beginner", min:0 }, { name:"Learner", min:60 }, { name:"Trader", min:150 },
    { name:"Advanced Trader", min:300 }, { name:"Professional", min:500 },
    { name:"Expert", min:750 }, { name:"Master", min:1050 }, { name:"Elite Trader", min:1400 }
  ];
  function getLevel(){
    var xp = getXP();
    var current = LEVELS[0], next = null;
    for(var i=0;i<LEVELS.length;i++){
      if(xp>=LEVELS[i].min) current = LEVELS[i];
      if(xp<LEVELS[i].min){ next = LEVELS[i]; break; }
    }
    return { name:current.name, xp:xp, nextName: next?next.name:null, nextMin: next?next.min:null };
  }

  function getBadges(allModules){
    var s = streakInfo();
    var overall = overallProgress(allModules||[]);
    var list = [];
    if(lessonsCompletedCount()>=1) list.push({ id:"first_lesson", label:"First Lesson", earned:true });
    else list.push({ id:"first_lesson", label:"First Lesson", earned:false });
    if(lessonsCompletedCount()>=1) list.push({ id:"first_quiz", label:"First Quiz", earned:true });
    else list.push({ id:"first_quiz", label:"First Quiz", earned:false });
    list.push({ id:"streak7", label:"7 Day Streak", earned: s.best>=7 });
    list.push({ id:"streak30", label:"30 Day Streak", earned: s.best>=30 });
    list.push({ id:"replay_master", label:"Replay Master", earned: replayCorrectTotal()>=20 });
    list.push({ id:"practice_champion", label:"Practice Champion", earned: practiceCorrectTotal()>=20 });
    list.push({ id:"book_reader", label:"Book Reader", earned: booksCompletedCount()>=1 });
    list.push({ id:"academy_graduate", label:"Academy Graduate", earned: overall.total>0 && overall.pct==100 });
    return list;
  }

  function isEligibleForCertificate(allModules){
    var overall = overallProgress(allModules||[]);
    return overall.total>0 && overall.pct==100;
  }
  function generateCertificateId(){
    var s = streak.certId;
    if(s) return s;
    var id = "BPA-"+Date.now().toString(36).toUpperCase()+"-"+getXP();
    setStreak(function(prev){
      var next = Object.assign({}, prev, { certId: id });
      saveStreak(next);
      return next;
    });
    return id;
  }

  return {
    isComplete:isComplete, markComplete:markComplete, moduleProgress:moduleProgress, overallProgress:overallProgress,
    bookStatus:bookStatus, isSaved:isSaved, setBookStatus:setBookStatus, toggleSaved:toggleSaved,
    practiceScore:practiceScore, recordPracticeAttempt:recordPracticeAttempt,
    recordReplayDecision:recordReplayDecision, replayStats:replayStats,
    streakInfo:streakInfo, getCertName:getCertName, setCertName:setCertName,
    lessonsCompletedCount:lessonsCompletedCount, booksCompletedCount:booksCompletedCount,
    practiceCorrectTotal:practiceCorrectTotal, replayCorrectTotal:replayCorrectTotal,
    getXP:getXP, getLevel:getLevel, getBadges:getBadges,
    isEligibleForCertificate:isEligibleForCertificate, generateCertificateId:generateCertificateId
  };
}
