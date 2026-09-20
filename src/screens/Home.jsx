import EquityHome from "./home/EquityHome";

// BreakoutPro - Home.jsx
//
// ROOT CAUSE FIX: this file used to have TWO different rules depending on
// breakpoint. Desktop/Laptop/TV had an early return that always rendered
// the current six-feature EquityHome dashboard, with a comment explaining
// exactly why: "a professional trading workstation must never silently
// switch to a different Home screen based on time-of-day session logic or
// a stale admin debug override." Mobile and Tablet were explicitly carved
// out of that protection ("Mobile/Tablet keep the exact existing behavior
// below, unchanged") and fell through to old time-of-day logic
// (getSession(): "day" 6:00-23:30 IST, otherwise "global") and a
// localStorage override (bp_settings.homeOverride), which could render
// GlobalHome.jsx (the old "GIFT NIFTY FUTURES / Global Markets / Key
// Global Indicators / Tomorrow Market Prediction / AI Prediction"
// dashboard) or CommodityHome.jsx instead of the real Home.
//
// Breakout Pro has ONE Home product now. The same protection Desktop
// already had is extended to every breakpoint: Home always renders
// EquityHome, full stop - no time-of-day switch, no override, no old
// dashboard. EquityHome.jsx does its own responsive breakpoint check
// internally to pick the Desktop/Laptop/Tablet/Mobile layout variant, so
// this file no longer needs to branch on breakpoint at all.
//
// GlobalHome.jsx and CommodityHome.jsx are untouched as files -
// CommodityHome still has its own legitimate standalone route elsewhere in
// App.jsx (the "Commodities" screen, unrelated to Home) - they are simply
// no longer imported or reachable from here.
export default function HomeScreen(props) {
  return <EquityHome {...props}/>;
}
