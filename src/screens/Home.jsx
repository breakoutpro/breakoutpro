import { useState, useEffect } from "react";
import EquityHome from "./EquityHome";
import CommodityHome from "./CommodityHome";
import GlobalHome from "./GlobalHome";

function getSession() {
  var h = new Date().getHours();
  var m = new Date().getMinutes();
  var mins = h*60 + m;
  if (mins >= 6*60 && mins < 9*60+15)  return "morning";
  if (mins >= 9*60+15 && mins < 15*60+30) return "equity";
  if (mins >= 15*60+30 && mins < 23*60+30) return "commodity";
  return "global";
}

function getGreeting() {
  var h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good Morning";
  if (h >= 12 && h < 17) return "Good Afternoon";
  if (h >= 17 && h < 21) return "Good Evening";
  return "Good Night";
}

export default function HomeScreen(props) {
  var [session, setSession] = useState(getSession());

  useEffect(function(){
    var t = setInterval(function(){
      var newSess = getSession();
      if (newSess != session) {
        setSession(newSess);
        if (typeof Notification != "undefined" && Notification.permission == "granted") {
          try {
            if (newSess == "equity") {
              new Notification("BreakoutPro", {body: "NSE Market Open! Equity Dashboard Live", icon:"/favicon.ico"});
            } else if (newSess == "commodity") {
              new Notification("BreakoutPro", {body: "Equity Closed - MCX Commodity Dashboard Active", icon:"/favicon.ico"});
            } else if (newSess == "global") {
              new Notification("BreakoutPro", {body: "Global Markets Active - Check Tomorrow Setup", icon:"/favicon.ico"});
            } else {
              new Notification("BreakoutPro", {body: "Market Opens at 9:15 AM - Morning Prep Time!", icon:"/favicon.ico"});
            }
          } catch(e) {}
        }
      }
    }, 30000);
    return function(){clearInterval(t);};
  }, [session]);

  if (session == "morning") return <EquityHome {...props} session="morning" greeting={getGreeting()}/>;
  if (session == "equity") return <EquityHome {...props} session="equity" greeting={getGreeting()}/>;
  if (session == "commodity") return <CommodityHome {...props} greeting={getGreeting()}/>;
  return <GlobalHome {...props} greeting={getGreeting()}/>;
}
