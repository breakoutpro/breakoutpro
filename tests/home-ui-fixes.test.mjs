import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
function read(f){ return fs.readFileSync(new URL("../" + f, import.meta.url), "utf8"); }
var app = read("src/App.jsx");

var auth = read("src/screens/AuthScreen.jsx");
test("password eye toggle (now in the new AuthScreen): hidden by default, toggles type, accessible", function(){
  assert.ok(/useState\(false\)/.test(auth.slice(auth.indexOf("showPass"), auth.indexOf("showPass") + 120)) || /\[showPass,\s*setShowPass\]\s*=\s*useState\(false\)/.test(auth), "password starts hidden");
  assert.ok(auth.indexOf('type={showPass?"text":"password"}') >= 0, "input type follows state");
  assert.ok(auth.indexOf("setShowPass(!showPass)") >= 0, "button toggles");
  assert.ok(auth.indexOf("aria-pressed={showPass}") >= 0, "aria-pressed");
  assert.equal((auth.match(/type=\{showPass/g) || []).length, 1, "single password input shared by Login and Register");
});
test("the old dark login page is gone from App.jsx and the new one is the only auth screen", function(){
  assert.ok(app.indexOf("function AuthScreen") < 0, "old inline AuthScreen still in App.jsx");
  assert.ok(app.indexOf('import AuthScreen from "./screens/AuthScreen"') >= 0);
  assert.ok(app.indexOf("#0B1220") < 0 && auth.indexOf("rgba(22,28,38") < 0, "dark login colours remain");
  assert.ok(app.indexOf("if(!user) return <AuthScreen") < 0, "login wall still blocks public Home");
  assert.ok(app.indexOf("if(!user && authMode)") >= 0);
});
test("welcome modal does not open on startup", function(){
  assert.ok(/\[showTutorial,setShowTutorial\]\s*=\s*useState\(false\)/.test(app));
});
test("notification banner removed, tab bar kept, permission API untouched elsewhere", function(){
  assert.ok(app.indexOf("Enable Alert Notifications") < 0);
  assert.ok(app.indexOf("<TabBar") >= 0);
});
test("Next Move card opens on tap, no View Full Analysis link", function(){
  var c = read("src/screens/NextMoveHomeCard.jsx");
  assert.ok(c.indexOf("home.view_full_analysis") < 0 && c.indexOf("props.onOpen") < 0);
  var root = c.slice(c.indexOf('data-testid="nm-home-card"'), c.indexOf('data-testid="nm-home-card"') + 200);
  assert.ok(root.indexOf("stopPropagation") < 0, "card root must let taps reach the card");
  assert.ok(/onClick=\{function\(e\)\{ e.stopPropagation\(\); \}\}>\s*<DetailedAnalysis/.test(c), "expandable section keeps its own taps");
  var hubSrc = read("src/screens/home/HomeHub.jsx");
  ["breakoutscan","oi","scalper","movers"].forEach(function(d){ assert.ok(hubSrc.indexOf('tab:"' + d + '"') >= 0, "hub card must open " + d); });
  ["Mobile","Tablet","Laptop","Desktop"].forEach(function(n){
    assert.ok(read("src/screens/home/EquityHome" + n + ".jsx").indexOf("<HomeHub") >= 0, n + " renders the hub");
  });
});
test("back navigation is history aware", function(){
  assert.ok(app.indexOf("function goBack()") >= 0 && app.indexOf("window.history.back()") >= 0);
  assert.ok(app.indexOf("onClose={goBack}") >= 0 && app.indexOf("onBack={goBack}") >= 0);
  assert.ok(app.indexOf("setTab:goTo") >= 0, "Home navigation pushes history");
});
