import { useState, useEffect } from "react";
import EquityHome from "./EquityHome";
import GlobalHome from "./GlobalHome";

function getSession() {
  var mins = new Date().getHours()*60 + new Date().getMinutes();
  if (mins >= 6*60 && mins < 23*60+30) return "day";
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
            if (newSess == "global") {
              new Notification("BreakoutPro", {body: "Global Markets Active - Check Tomorrow Setup", icon:"/favicon.ico"});
            } else {
              new Notification("BreakoutPro", {body: "Good Morning! NSE Market Dashboard Active", icon:"/favicon.ico"});
            }
          } catch(e) {}
        }
      }
    }, 30000);
    return function(){clearInterval(t);};
  }, [session]);

  if (session == "global") return <GlobalHome {...props} greeting={getGreeting()}/>;
  return <EquityHome {...props} greeting={getGreeting()}/>;
}
