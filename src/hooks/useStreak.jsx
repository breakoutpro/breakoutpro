import { useState, useEffect } from "react";

function todayStr(){
  return new Date().toISOString().slice(0,10);
}
function yesterdayStr(){
  var d=new Date();
  d.setDate(d.getDate()-1);
  return d.toISOString().slice(0,10);
}

function loadStreakData(){
  try{
    var saved=JSON.parse(localStorage.getItem("bp_streak")||"null");
    if(saved)return saved;
  }catch(e){}
  return {count:0,lastVisit:null,longest:0,totalDays:0};
}

function saveStreakData(d){
  try{localStorage.setItem("bp_streak",JSON.stringify(d));}catch(e){}
}

// Call once per app session (e.g. mounted in App.jsx or Home).
// Increments streak if visiting on a new day, resets if a day was missed.
export function useStreak(){
  var [streak,setStreak]=useState(function(){return loadStreakData();});
  var [isNewDay,setIsNewDay]=useState(false);

  useEffect(function(){
    var data=loadStreakData();
    var today=todayStr();
    if(data.lastVisit==today){
      // already counted today, nothing to do
      setStreak(data);
      return;
    }
    var newCount;
    if(data.lastVisit==yesterdayStr()){
      newCount=data.count+1; // continued streak
    }else{
      newCount=1; // missed a day or first ever visit, restart
    }
    var updated={
      count:newCount,
      lastVisit:today,
      longest:Math.max(data.longest||0,newCount),
      totalDays:(data.totalDays||0)+1,
    };
    saveStreakData(updated);
    setStreak(updated);
    setIsNewDay(true);
  },[]);

  return {streak:streak.count,longest:streak.longest,totalDays:streak.totalDays,isNewDay:isNewDay};
}
