import { useState, useEffect } from "react";
import IndexDetail from "./IndexDetail";

var BG="#07111F",CARD="#0D1B2A",BD="#203A5A";
var BLUE="#3B82F6",BLUE2="#60A5FA";
var PURPLE="#8B5CF6",PURPLE2="#A78BFA";
var GOLD="#F5B942";
var UP="#22C55E",DOWN="#EF4444",T1="#FFFFFF",T2="#C9D4E5",T3="#8A9BB5";

function MiniChart(props){
  var d=props.d||[],col=props.col||BLUE2,w=props.w||60,h=props.h||28;
  if(d.length<2)return null;
  var mn=Math.min.apply(null,d),mx=Math.max.apply(null,d),rng=mx-mn||1;
  var pts=d.map(function(v,i){return(i/(d.length-1))*w+","+(h-((v-mn)/rng)*(h-4)+2);}).join(" ");
  return <svg width={w} height={h} style={{display:"block"}}><polyline points={pts} fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}

function genSpark(base,n){var a=[],p=base;for(var i=0;i<(n||20);i++){p=parseFloat((p*(1+(Math.random()-0.48)*0.004)).toFixed(2));a.push(p);}return a;}

var INDICES=[
  {label:"NIFTY 50",  base:23969.20,pct:1.47,up:true},
  {label:"SENSEX",    base:76692.70,pct:1.54,up:true},
  {label:"BANK NIFTY",base:52134.80,pct:1.69,up:true},
  {label:"MIDCAP 50", base:43876.20,pct:0.74,up:true},
];

var COMM_IDX=[
  {label:"GOLD",      base:71245,pct:0.45, up:true},
  {label:"SILVER",    base:87654,pct:0.82, up:true},
  {label:"CRUDEOIL",  base:6823, pct:-0.34,up:false},
  {label:"NATURALGAS",base:243,  pct:1.20, up:true},
];

var GLOBAL=[
  {label:"Gift Nifty",val:"24,035",chg:"+65", up:true},
  {label:"Dow Jones", val:"42,750",chg:"+234",up:true},
  {label:"Nasdaq",    val:"18,920",chg:"+87", up:true},
  {label:"Crude Oil", val:"$82.4", chg:"-0.3%",up:false},
  {label:"Gold",      val:"$2,312",chg:"+0.2%",up:true},
];

var EVENTS=[
  {type:"Expiry",  label:"NIFTY Weekly Expiry", color:DOWN},
  {type:"Earnings",label:"Reliance Q4 Results", color:GOLD},
  {type:"Data",    label:"US CPI at 6:30 PM",   color:DOWN},
  {type:"IPO",     label:"Ather Energy IPO",    color:BLUE},
];

var NEWS_TICKER=[
  "RBI Policy Today",
  "NIFTY above 24,000",
  "Crude Oil +2%",
  "FIIs Net Buyers Rs 2,800 Cr",
  "Banking sector strong momentum",
];

var WATCHLIST=[
  {sym:"RELIANCE",reason:"Q4 results today",color:BLUE},
  {sym:"TCS",reason:"FII buying interest",color:PURPLE2},
  {sym:"ICICIBANK",reason:"Strong support zone",color:UP},
  {sym:"HDFCBANK",reason:"Breakout watch",color:GOLD},
];

var GAINERS=[
  {sym:"ADANIENT",pct:4.21},
  {sym:"TATASTEEL",pct:3.45},
  {sym:"SBIN",pct:2.89},
];

var LOSERS=[
  {sym:"WIPRO",pct:-2.14},
  {sym:"HCLTECH",pct:-1.67},
  {sym:"ASIANPAINT",pct:-1.23},
];

var SECTORS=[
  {name:"IT",up:true},{name:"Banking",up:true},{name:"Auto",up:false},
  {name:"Metal",up:true},{name:"Pharma",up:true},{name:"Realty",up:false},
];

function getSession(){
  var d=new Date();
  var mins=d.getHours()*60+d.getMinutes();
  if(mins>=5*60&&mins<9*60) return "morning";
  if(mins>=9*60&&mins<15*60+30) return "live";
  if(mins>=15*60+30&&mins<18*60) return "closing";
  if(mins>=18*60&&mins<23*60+30) return "mcx";
  return "global";
}

var SESSION_META={
  morning:    {label:"Pre Market",     icon:"PM",col:GOLD},
  live:       {label:"Live Market",    icon:"LM",col:UP},
  closing:    {label:"Closing Summary",icon:"CS",col:BLUE2},
  mcx:        {label:"MCX Live",       icon:"MX",col:GOLD},
  global:     {label:"Global Markets", icon:"GM",col:BLUE},
};

export { MiniChart, genSpark, INDICES, COMM_IDX, GLOBAL, EVENTS, NEWS_TICKER, WATCHLIST, GAINERS, LOSERS, SECTORS, getSession, SESSION_META };
