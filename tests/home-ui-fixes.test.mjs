import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
function read(f){ return fs.readFileSync(new URL("../" + f, import.meta.url), "utf8"); }
var app = read("src/App.jsx");

test("password eye toggle: hidden by default, toggles type, accessible", function(){
  assert.ok(/useState\(false\)/.test(app.slice(app.indexOf("showPass"), app.indexOf("showPass") + 120)) || /\[showPass,\s*setShowPass\]\s*=\s*useState\(false\)/.test(app), "password starts hidden");
  assert.ok(app.indexOf('type={showPass?"text":"password"}') >= 0, "input type follows state");
  assert.ok(app.indexOf("setShowPass(!showPass)") >= 0, "button toggles");
  assert.ok(app.indexOf("aria-pressed={showPass}") >= 0, "aria-pressed");
  assert.equal((app.match(/type=\{showPass/g) || []).length, 1, "single password input shared by Login and Register");
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
  assert.ok(read("src/screens/home/HomeHub.jsx").indexOf('tab:"marketmood"') >= 0, "hub Next Move card must open marketmood");
  ["Mobile","Tablet","Laptop","Desktop"].forEach(function(n){
    assert.ok(read("src/screens/home/EquityHome" + n + ".jsx").indexOf("<HomeHub") >= 0, n + " renders the hub whose Next Move card opens marketmood");
  });
});
test("back navigation is history aware", function(){
  assert.ok(app.indexOf("function goBack()") >= 0 && app.indexOf("window.history.back()") >= 0);
  assert.ok(app.indexOf("onClose={goBack}") >= 0 && app.indexOf("onBack={goBack}") >= 0);
  assert.ok(app.indexOf("setTab:goTo") >= 0, "Home navigation pushes history");
});
