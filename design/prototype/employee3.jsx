// employee3.jsx — history, team, profile, shell, EmployeeApp controller. Exported to window.EmployeeApp
const { useState:e3Use, useEffect:e3Eff, useMemo:e3Memo } = React;
const CW3 = window.CW;

// ---------- screen header ----------
function ScreenTop({ title, sub, right }){
  return (
    <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:16 }}>
      <div>
        <div style={{ fontSize:22, fontWeight:800, lineHeight:1.1, color:"var(--foreground)" }}>{title}</div>
        {sub && <div style={{ fontSize:13, color:"var(--muted-foreground)", fontWeight:600, marginTop:3 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

// ---------- history ----------
function HistoryScreen(){
  const [view,setView] = e3Use("list");
  const [month,setMonth] = e3Use(0); // 0 = current
  const recs = CW3.HISTORY;
  const present = recs.filter(r=>r.kind==="present");
  const stats = e3Memo(()=>{
    const totH = present.reduce((a,r)=>a+r.hours,0);
    const late = present.filter(r=>r.late).length;
    const leave = recs.filter(r=>r.kind==="leave").length;
    const avgIn = present.length ? present.reduce((a,r)=>a+r.clockIn.getHours()*60+r.clockIn.getMinutes(),0)/present.length : 540;
    const ah=Math.floor(avgIn/60), am=Math.round(avgIn%60);
    return { totH, late, leave, presentDays:present.length, avgIn:`${ah}:${String(am).padStart(2,"0")}` };
  },[]);

  // build calendar for current month
  const cal = e3Memo(()=>{
    const ref=new Date(); ref.setDate(1); ref.setMonth(ref.getMonth()-month);
    const y=ref.getFullYear(), m=ref.getMonth();
    const first=new Date(y,m,1).getDay();
    const days=new Date(y,m+1,0).getDate();
    const cells=[];
    for(let i=0;i<first;i++) cells.push(null);
    for(let d=1;d<=days;d++){
      const date=new Date(y,m,d);
      const rec=recs.find(r=> r.date.getFullYear()===y && r.date.getMonth()===m && r.date.getDate()===d);
      cells.push({ d, rec, future: date> new Date() });
    }
    return { cells, label:`${CW3.MON[m]} ${y}` };
  },[month]);

  const dotColor = (rec)=> !rec?"transparent": rec.kind==="weekend"?"#d9dee4": rec.kind==="leave"?"var(--info)": rec.late?"var(--warning)":"var(--success)";

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <ScreenTop title="Attendance" sub="Your clock-in history"
        right={<Segmented size="sm" value={view} onChange={setView} options={[{value:"list",label:"List",icon:I.list},{value:"cal",label:"Month",icon:I.calendar}]}/>}/>

      {/* summary */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <StatChip icon={I.checkCircle} label="Days present" value={`${stats.presentDays}`} tone="success"/>
        <StatChip icon={I.clock} label="Avg clock-in" value={stats.avgIn} tone="brand"/>
        <StatChip icon={I.trend} label="Hours logged" value={`${Math.round(stats.totH)}h`} tone="accent"/>
        <StatChip icon={I.coffee} label="Leave taken" value={`${stats.leave} days`} tone="info"/>
      </div>

      {view==="cal" ? (
        <Card pad={16}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <IconButton icon={I.chevL} label="Prev" onClick={()=>setMonth(m=>m+1)}/>
            <div style={{ fontWeight:800, fontSize:15 }}>{cal.label}</div>
            <IconButton icon={I.chevR} label="Next" onClick={()=>setMonth(m=>Math.max(0,m-1))} style={{ opacity:month===0?.35:1 }}/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, textAlign:"center" }}>
            {["S","M","T","W","T","F","S"].map((d,i)=><div key={i} style={{ fontSize:11, fontWeight:700, color:"var(--muted-foreground)", padding:"2px 0 8px" }}>{d}</div>)}
            {cal.cells.map((c,i)=>(
              <div key={i} style={{ aspectRatio:"1", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3, borderRadius:10,
                background: c&&c.rec&&c.rec.kind==="present"?"var(--brand-50)":"transparent", opacity:c&&c.future?.4:1 }}>
                {c && <><span className="tnum" style={{ fontSize:12.5, fontWeight:c.rec&&c.rec.kind==="present"?700:500, color:c.rec&&c.rec.kind!=="weekend"?"var(--foreground)":"var(--muted-foreground)" }}>{c.d}</span>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:dotColor(c.rec) }}/></>}
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:14, marginTop:14, paddingTop:14, borderTop:"1px solid var(--border)", flexWrap:"wrap" }}>
            {[["On time","var(--success)"],["Late","var(--warning)"],["Leave","var(--info)"]].map(([l,c])=>(
              <span key={l} style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:12, color:"var(--muted-foreground)", fontWeight:600 }}><span style={{ width:8, height:8, borderRadius:"50%", background:c }}/>{l}</span>
            ))}
          </div>
        </Card>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
          {recs.filter(r=>r.kind!=="weekend").slice(0,16).map((r,i)=>(
            <Card key={i} pad={14} hover style={{ display:"flex", alignItems:"center", gap:13 }}>
              <div style={{ width:44, height:44, borderRadius:11, background: r.kind==="leave"?"#E5F4FB":"var(--brand-50)", color: r.kind==="leave"?"var(--info)":"var(--primary)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", lineHeight:1 }}>
                <span style={{ fontSize:9, fontWeight:700, textTransform:"uppercase" }}>{CW3.DOW[r.date.getDay()]}</span>
                <span className="tnum" style={{ fontSize:16, fontWeight:800 }}>{r.date.getDate()}</span>
              </div>
              {r.kind==="leave" ? (
                <><div style={{ flex:1 }}><div style={{ fontSize:13.5, fontWeight:700 }}>{r.label}</div><div style={{ fontSize:12, color:"var(--muted-foreground)", fontWeight:600 }}>{CW3.MON[r.date.getMonth()]} {r.date.getDate()}</div></div><Pill tone="info">Leave</Pill></>
              ) : (
                <><div style={{ flex:1 }}>
                  <div className="tnum" style={{ fontSize:13.5, fontWeight:700 }}>{CW3.fmtTime(r.clockIn)} – {CW3.fmtTime(r.clockOut)}</div>
                  <div style={{ fontSize:12, color:"var(--muted-foreground)", fontWeight:600, display:"flex", gap:6, alignItems:"center", marginTop:2 }}><I.mapPin size={12}/>{r.mode} · {CW3.MON[r.date.getMonth()]} {r.date.getDate()}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div className="tnum" style={{ fontSize:13.5, fontWeight:800 }}>{CW3.fmtDur(r.hours)}</div>
                  {r.late ? <Pill tone="warning" size="sm" style={{ marginTop:3 }}>Late</Pill> : <Pill tone="success" size="sm" dot style={{ marginTop:3 }}>On time</Pill>}
                </div></>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- team presence ----------
function TeamScreen(){
  const [q,setQ] = e3Use("");
  const groups = [
    { key:"in", label:"Clocked in", tone:"success" },
    { key:"break", label:"On break", tone:"warning" },
    { key:"leave", label:"On leave", tone:"info" },
    { key:"out", label:"Not in yet", tone:"neutral" },
  ];
  const filtered = CW3.TEAM.filter(p=> p.name.toLowerCase().includes(q.toLowerCase()) || p.dept.toLowerCase().includes(q.toLowerCase()));
  const present = CW3.TEAM.filter(p=>p.status==="in"||p.status==="break").length;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <ScreenTop title="Team" sub={`${present} of ${CW3.TEAM.length} working today`}/>
      <Input icon={I.search} placeholder="Search people or teams…" value={q} onChange={e=>setQ(e.target.value)}/>
      {groups.map(g=>{
        const ppl = filtered.filter(p=>p.status===g.key);
        if(!ppl.length) return null;
        const tn = window.PILL_TONES[g.tone];
        return (
          <div key={g.key}>
            <div style={{ display:"flex", alignItems:"center", gap:8, margin:"4px 2px 10px" }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:tn.fg }}/>
              <span style={{ fontSize:13, fontWeight:800, color:"var(--foreground)" }}>{g.label}</span>
              <span style={{ fontSize:12.5, color:"var(--muted-foreground)", fontWeight:600 }}>{ppl.length}</span>
            </div>
            <Card pad={0}>
              {ppl.map((p,i)=>(
                <div key={p.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 15px", borderTop:i?"1px solid var(--border)":"none" }}>
                  <div style={{ position:"relative" }}>
                    <Avatar name={p.name} size={42}/>
                    <span style={{ position:"absolute", right:-1, bottom:-1, width:13, height:13, borderRadius:"50%", background:tn.fg, border:"2.5px solid #fff" }}/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:700 }}>{p.name}</div>
                    <div style={{ fontSize:12, color:"var(--muted-foreground)", fontWeight:600 }}>{p.role}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    {p.mode && <div style={{ fontSize:12.5, fontWeight:700, display:"inline-flex", alignItems:"center", gap:4, color: p.mode==="Home"?"var(--primary)":"var(--muted-foreground)" }}>{p.mode==="Home"?<I.home size={13}/>:<I.briefcase size={13}/>}{p.mode}</div>}
                    <div className="tnum" style={{ fontSize:11.5, color:"var(--muted-foreground)", fontWeight:600, marginTop:2 }}>{p.since}</div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        );
      })}
    </div>
  );
}

// ---------- profile ----------
function ProfileScreen({ onLogout, onReset, att }){
  const me = CW3.ME;
  const [alerts,setAlerts] = e3Use(true);
  const [reminder,setReminder] = e3Use(true);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <ScreenTop title="Profile"/>
      <Card style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", padding:"24px 20px" }}>
        <Avatar name={me.name} size={76} ring/>
        <div style={{ fontSize:19, fontWeight:800, marginTop:13 }}>{me.name}</div>
        <div style={{ fontSize:13.5, color:"var(--muted-foreground)", fontWeight:600 }}>{me.role} · {me.dept}</div>
        <div style={{ display:"flex", gap:8, marginTop:12 }}>
          <Pill tone={att.clockedIn?"success":"neutral"} dot>{att.clockedIn?"Clocked in":"Off the clock"}</Pill>
          <Pill tone="brand">{me.schedule.split(" · ")[0]}</Pill>
        </div>
      </Card>
      <Card pad={0}>
        {[
          { ic:I.mail, label:"Email", val:me.email },
          { ic:I.phone, label:"Phone", val:me.phone },
          { ic:I.mapPin, label:"Default location", val:me.location },
          { ic:I.calendar, label:"Schedule", val:me.schedule },
          { ic:I.briefcase, label:"Joined", val:me.joined },
        ].map((r,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", gap:13, padding:"13px 16px", borderTop:i?"1px solid var(--border)":"none" }}>
            <div style={{ color:"var(--primary)" }}><r.ic size={18}/></div>
            <div style={{ flex:1, fontSize:12.5, color:"var(--muted-foreground)", fontWeight:600 }}>{r.label}</div>
            <div style={{ fontSize:13.5, fontWeight:700, textAlign:"right" }}>{r.val}</div>
          </div>
        ))}
      </Card>
      <Card pad={0}>
        {[["Email alerts","Daily clock-in reminders",alerts,setAlerts],["Location reminder","Prompt when I forget to clock in",reminder,setReminder]].map(([l,s,v,set],i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", gap:13, padding:"14px 16px", borderTop:i?"1px solid var(--border)":"none" }}>
            <div style={{ flex:1 }}><div style={{ fontSize:14, fontWeight:700 }}>{l}</div><div style={{ fontSize:12, color:"var(--muted-foreground)", fontWeight:500 }}>{s}</div></div>
            <Toggle on={v} onChange={set}/>
          </div>
        ))}
      </Card>
      <Button variant="outline" full icon={I.refresh} onClick={onReset}>Reset demo data</Button>
      <Button variant="dangerGhost" full icon={I.logout} onClick={onLogout}>Sign out</Button>
    </div>
  );
}

// ---------- shell ----------
function EmployeeShell({ tab, setTab, children }){
  const tabs = [["home","Home",I.home],["history","History",I.history],["team","Team",I.users],["profile","Profile",I.user]];
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px 16px", background:"radial-gradient(1200px 600px at 50% -10%, #dceaf5, var(--app-bg))" }}>
      <div style={{ width:"100%", maxWidth:430, height:"min(880px, calc(100vh - 48px))", background:"#fff", borderRadius:34, boxShadow:"var(--shadow-3)", overflow:"hidden", position:"relative", display:"flex", flexDirection:"column", border:"1px solid rgba(255,255,255,.6)" }}>
        <div className="scroll-thin" style={{ flex:1, overflowY:"auto", padding:"22px 20px 96px" }}>{children}</div>
        {/* bottom nav */}
        <div style={{ position:"absolute", left:0, right:0, bottom:0, height:74, background:"rgba(255,255,255,.92)", backdropFilter:"blur(12px)", borderTop:"1px solid var(--border)", display:"flex", alignItems:"stretch", padding:"0 8px" }}>
          {tabs.map(([k,l,Ic])=>{
            const active=tab===k;
            return (
              <button key={k} onClick={()=>setTab(k)} className="no-tap"
                style={{ flex:1, border:"none", background:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4, color:active?"var(--primary)":"var(--muted-foreground)", paddingBottom:6 }}>
                <div style={{ position:"relative", display:"flex", flexDirection:"column", alignItems:"center" }}>
                  {active && <span style={{ position:"absolute", top:-12, width:26, height:3, borderRadius:99, background:"var(--accent)" }}/>}
                  <Ic size={23}/>
                </div>
                <span style={{ fontSize:11, fontWeight:active?700:600 }}>{l}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------- controller ----------
function EmployeeApp({ t, onLogout }){
  const [now,setNow] = e3Use(new Date());
  const [tab,setTab] = e3Use("home");
  const [flow,setFlow] = e3Use(false);
  const saved = e3Memo(()=> CW3.loadState().att || { clockedIn:false }, []);
  const [att,setAtt] = e3Use(saved);

  e3Eff(()=>{ const id=setInterval(()=>setNow(new Date()),1000); return ()=>clearInterval(id); },[]);
  e3Eff(()=>{ CW3.saveState({ ...CW3.loadState(), att }); },[att]);

  const complete = (rec)=>{ setAtt(rec); setFlow(false); setTab("home"); };
  const clockOut = ()=>{ setAtt(a=>({ ...a, clockedIn:false, clockOutTime:new Date().toISOString() })); };
  const reset = ()=>{ CW3.resetState(); setAtt({ clockedIn:false }); setTab("home"); };

  return (
    <EmployeeShell tab={tab} setTab={setTab}>
      {tab==="home" && <EmployeeHome t={t} now={now} att={att} startFlow={()=>setFlow(true)} onClockOut={clockOut} goTeam={()=>setTab("team")} goHistory={()=>setTab("history")}/>}
      {tab==="history" && <HistoryScreen/>}
      {tab==="team" && <TeamScreen/>}
      {tab==="profile" && <ProfileScreen onLogout={onLogout} onReset={reset} att={att}/>}
      {flow && <ClockFlow t={t} now={now} onCancel={()=>setFlow(false)} onComplete={complete}/>}
    </EmployeeShell>
  );
}

window.EmployeeApp = EmployeeApp;
