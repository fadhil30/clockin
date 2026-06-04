// data.jsx — mock data, formatters, persistence helpers. Exported to window.

// ---------- avatar color from name ----------
const AVATAR_BG = ["#5E2A8C","#8A4FBF","#FF6F50","#12A150","#F59E0B","#2D7FF9","#C5468A","#9A4DD6","#0E9D9D","#E8512F"];
function initials(name){ return name.split(/\s+/).slice(0,2).map(s=>s[0]||"").join("").toUpperCase(); }
function avatarColor(name){ let h=0; for(const c of name) h=(h*31+c.charCodeAt(0))>>>0; return AVATAR_BG[h%AVATAR_BG.length]; }

// ---------- date / time formatters ----------
const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fmtTime(d){ let h=d.getHours(),m=d.getMinutes(); const ap=h>=12?"PM":"AM"; h=h%12||12; return `${h}:${String(m).padStart(2,"0")} ${ap}`; }
function fmtTimeSec(d){ let h=d.getHours(),m=d.getMinutes(),s=d.getSeconds(); const ap=h>=12?"PM":"AM"; h=h%12||12; return {hm:`${h}:${String(m).padStart(2,"0")}`, s:String(s).padStart(2,"0"), ap}; }
function fmtDateLong(d){ return `${DOW[d.getDay()]}, ${MON[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; }
function fmtDateShort(d){ return `${MON[d.getMonth()]} ${d.getDate()}`; }
function fmtDOW(d){ return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()]; }
function greeting(d){ const h=d.getHours(); return h<12?"Good morning":h<17?"Good afternoon":"Good evening"; }
function hoursBetween(a,b){ return Math.max(0,(b-a)/3.6e6); }
function fmtDur(hrs){ const h=Math.floor(hrs); const m=Math.round((hrs-h)*60); return `${h}h ${String(m).padStart(2,"0")}m`; }

// ---------- current employee ----------
const ME = {
  id:"e-001", name:"Maya Putri", role:"Product Designer", dept:"Design",
  email:"maya.putri@northwind.co", phone:"+62 811 2200 145",
  location:"Home Office · Jakarta, ID", joined:"Mar 2023",
  schedule:"Mon–Fri · 09:00–18:00",
};

// ---------- team ----------
const TEAM = [
  { id:"e-002", name:"Arjun Mehta", role:"Engineering Lead", dept:"Engineering", status:"in", since:"08:46 AM", mode:"Home" },
  { id:"e-003", name:"Sofia Reyes", role:"Brand Designer", dept:"Design", status:"in", since:"09:03 AM", mode:"Home" },
  { id:"e-004", name:"Daniel Kim", role:"Backend Engineer", dept:"Engineering", status:"in", since:"08:58 AM", mode:"Office" },
  { id:"e-005", name:"Priya Nair", role:"Product Manager", dept:"Product", status:"break", since:"09:12 AM", mode:"Home" },
  { id:"e-006", name:"Leo Fontaine", role:"Growth Marketer", dept:"Marketing", status:"in", since:"09:21 AM", mode:"Home" },
  { id:"e-007", name:"Hana Suzuki", role:"UX Researcher", dept:"Design", status:"leave", since:"On leave", mode:"" },
  { id:"e-008", name:"Marcus Bell", role:"Sales Executive", dept:"Sales", status:"in", since:"08:30 AM", mode:"Office" },
  { id:"e-009", name:"Yara Haddad", role:"People Ops", dept:"People", status:"in", since:"08:52 AM", mode:"Home" },
  { id:"e-010", name:"Tom Becker", role:"Finance Analyst", dept:"Finance", status:"out", since:"—", mode:"" },
  { id:"e-011", name:"Aisha Khan", role:"Support Specialist", dept:"Support", status:"in", since:"09:08 AM", mode:"Home" },
  { id:"e-012", name:"Diego Santos", role:"iOS Engineer", dept:"Engineering", status:"break", since:"09:00 AM", mode:"Home" },
];

// ---------- HR directory (master data) ----------
const DIRECTORY = [
  { id:"e-001", name:"Maya Putri", role:"Product Designer", dept:"Design", email:"maya.putri@northwind.co", phone:"+62 811 2200 145", status:"Active", joined:"2023-03-14", type:"Full-time" },
  { id:"e-002", name:"Arjun Mehta", role:"Engineering Lead", dept:"Engineering", email:"arjun.mehta@northwind.co", phone:"+91 98200 11234", status:"Active", joined:"2021-07-02", type:"Full-time" },
  { id:"e-003", name:"Sofia Reyes", role:"Brand Designer", dept:"Design", email:"sofia.reyes@northwind.co", phone:"+34 612 998 200", status:"Active", joined:"2022-11-21", type:"Full-time" },
  { id:"e-004", name:"Daniel Kim", role:"Backend Engineer", dept:"Engineering", email:"daniel.kim@northwind.co", phone:"+82 10 4477 1200", status:"Active", joined:"2023-01-09", type:"Full-time" },
  { id:"e-005", name:"Priya Nair", role:"Product Manager", dept:"Product", email:"priya.nair@northwind.co", phone:"+91 99000 22110", status:"Active", joined:"2020-05-18", type:"Full-time" },
  { id:"e-006", name:"Leo Fontaine", role:"Growth Marketer", dept:"Marketing", email:"leo.fontaine@northwind.co", phone:"+33 6 12 88 90 14", status:"Active", joined:"2024-02-12", type:"Full-time" },
  { id:"e-007", name:"Hana Suzuki", role:"UX Researcher", dept:"Design", email:"hana.suzuki@northwind.co", phone:"+81 90 7788 1200", status:"On leave", joined:"2022-08-30", type:"Full-time" },
  { id:"e-008", name:"Marcus Bell", role:"Sales Executive", dept:"Sales", email:"marcus.bell@northwind.co", phone:"+1 415 200 9912", status:"Active", joined:"2021-09-27", type:"Full-time" },
  { id:"e-009", name:"Yara Haddad", role:"People Ops", dept:"People", email:"yara.haddad@northwind.co", phone:"+971 50 220 1188", status:"Active", joined:"2019-04-03", type:"Full-time" },
  { id:"e-010", name:"Tom Becker", role:"Finance Analyst", dept:"Finance", email:"tom.becker@northwind.co", phone:"+49 151 2200 8841", status:"Active", joined:"2023-06-15", type:"Contract" },
  { id:"e-011", name:"Aisha Khan", role:"Support Specialist", dept:"Support", email:"aisha.khan@northwind.co", phone:"+92 300 1122 334", status:"Active", joined:"2024-07-08", type:"Full-time" },
  { id:"e-012", name:"Diego Santos", role:"iOS Engineer", dept:"Engineering", email:"diego.santos@northwind.co", phone:"+55 11 99887 1200", status:"Active", joined:"2022-03-19", type:"Full-time" },
];

const DEPARTMENTS = ["Engineering","Design","Product","Marketing","Sales","People","Finance","Support"];
const ROLES_BY_DEPT = { Design:"Designer", Engineering:"Engineer", Product:"Product Manager", Marketing:"Marketer", Sales:"Sales Executive", People:"People Ops", Finance:"Analyst", Support:"Support Specialist" };

// ---------- employee attendance history (last ~6 weeks) ----------
function buildHistory(){
  const out=[]; const today=new Date(); today.setHours(0,0,0,0);
  // deterministic pseudo-random
  let seed=42; const rnd=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
  for(let i=1;i<=42;i++){
    const d=new Date(today); d.setDate(today.getDate()-i);
    const dow=d.getDay();
    if(dow===0||dow===6){ out.push({ date:new Date(d), kind:"weekend" }); continue; }
    const r=rnd();
    if(r<0.07){ out.push({ date:new Date(d), kind:"leave", label: r<0.035?"Annual leave":"Sick leave" }); continue; }
    // clock in around 9, late sometimes
    const lateMin = r<0.18 ? Math.floor(rnd()*38)+6 : Math.floor(rnd()*8);
    const inH=9, inM=lateMin;
    const ci=new Date(d); ci.setHours(inH,inM,Math.floor(rnd()*59));
    const workHrs = 8 + (rnd()*1.4-0.4);
    const co=new Date(ci.getTime()+workHrs*3.6e6);
    out.push({
      date:new Date(d), kind:"present",
      clockIn:ci, clockOut:co, hours:hoursBetween(ci,co),
      late: lateMin>10, mode: rnd()<0.8?"Home":"Office",
      location: rnd()<0.8?"Home Office · Jakarta, ID":"HQ · Jakarta, ID",
    });
  }
  return out;
}
const HISTORY = buildHistory();

// ---------- HR attendance log (today's submissions across team) ----------
function buildLogs(){
  const rows=[]; const base=new Date(); base.setHours(0,0,0,0);
  const samp=[
    { id:"e-002", inH:8, inM:46, mode:"Home", loc:"Home · Mumbai, IN", flag:null },
    { id:"e-003", inH:9, inM:3, mode:"Home", loc:"Home · Madrid, ES", flag:null },
    { id:"e-004", inH:8, inM:58, mode:"Office", loc:"HQ · Seoul, KR", flag:null },
    { id:"e-006", inH:9, inM:21, mode:"Home", loc:"Home · Lyon, FR", flag:"late" },
    { id:"e-008", inH:8, inM:30, mode:"Office", loc:"HQ · San Francisco, US", flag:null },
    { id:"e-009", inH:8, inM:52, mode:"Home", loc:"Home · Dubai, AE", flag:null },
    { id:"e-011", inH:9, inM:8, mode:"Home", loc:"Home · Karachi, PK", flag:null },
    { id:"e-001", inH:9, inM:2, mode:"Home", loc:"Home Office · Jakarta, ID", flag:null },
    { id:"e-005", inH:9, inM:12, mode:"Home", loc:"Home · Bangalore, IN", flag:"late" },
    { id:"e-012", inH:9, inM:0, mode:"Home", loc:"Home · São Paulo, BR", flag:null },
  ];
  for(const s of samp){
    const emp=DIRECTORY.find(e=>e.id===s.id);
    const ci=new Date(base); ci.setHours(s.inH,s.inM,Math.floor(Math.random()*40));
    rows.push({ ...emp, clockIn:ci, mode:s.mode, location:s.loc, flag:s.flag, photoSeed:s.id });
  }
  rows.sort((a,b)=>a.clockIn-b.clockIn);
  return rows;
}
const LOGS = buildLogs();

// ---------- mock geolocation ----------
const GEO = { label:"Home Office", area:"Jakarta, Indonesia", lat:-6.2088, lng:106.8456, accuracy:12 };

// ---------- persistence ----------
const LS_KEY = "clockin.state.v1";
function loadState(){
  try{ return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }catch(e){ return {}; }
}
function saveState(s){ try{ localStorage.setItem(LS_KEY, JSON.stringify(s)); }catch(e){} }
function resetState(){ try{ localStorage.removeItem(LS_KEY); }catch(e){} }

window.CW = {
  ME, TEAM, DIRECTORY, DEPARTMENTS, ROLES_BY_DEPT, HISTORY, LOGS, GEO,
  initials, avatarColor, fmtTime, fmtTimeSec, fmtDateLong, fmtDateShort, fmtDOW,
  greeting, hoursBetween, fmtDur, DOW, MON,
  loadState, saveState, resetState,
};
