// employee2.jsx — employee screens + shell + EmployeeApp. Exported to window.EmployeeApp
const { useState:e2Use, useEffect:e2Eff, useRef:e2Ref, useMemo:e2Memo } = React;
const CW2 = window.CW;

// ---------- small stat ----------
function StatChip({ icon:Ic, label, value, tone="brand" }){
  const t = window.PILL_TONES[tone];
  return (
    <div style={{ flex:1, background:"#fff", border:"1px solid var(--border)", borderRadius:14, padding:"13px 14px" }}>
      <div style={{ width:30, height:30, borderRadius:9, background:t.bg, color:t.fg, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:9 }}><Ic size={17}/></div>
      <div className="tnum" style={{ fontSize:20, fontWeight:800, lineHeight:1, color:"var(--foreground)" }}>{value}</div>
      <div style={{ fontSize:11.5, color:"var(--muted-foreground)", fontWeight:600, marginTop:3 }}>{label}</div>
    </div>
  );
}

// ---------- employee home ----------
function EmployeeHome({ t, now, att, startFlow, onClockOut, goTeam, goHistory }){
  const me = CW2.ME;
  const weekHrs = e2Memo(()=>{ // sum last 5 working days present
    let h=0,c=0; for(const r of CW2.HISTORY){ if(r.kind==="present"){ h+=r.hours; c++; if(c>=5) break; } } return h;
  },[]);
  const recent = e2Memo(()=> CW2.HISTORY.filter(r=>r.kind==="present").slice(0,3), []);
  const present = CW2.TEAM.filter(p=>p.status==="in"||p.status==="break").length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      {/* greeting */}
      <div className="anim-fade-up" style={{ display:"flex", alignItems:"center", gap:13 }}>
        <Avatar name={me.name} size={48} ring/>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, color:"var(--muted-foreground)", fontWeight:600 }}>{CW2.greeting(now)},</div>
          <div style={{ fontSize:19, fontWeight:800, lineHeight:1.1, color:"var(--foreground)" }}>{me.name.split(" ")[0]} 👋</div>
        </div>
        <IconButton icon={I.bell} label="Notifications"/>
      </div>

      {/* hero */}
      <div className="anim-fade-up" style={{ animationDelay:".05s" }}>
        <ClockHero style={t.heroStyle} now={now} clockedIn={att.clockedIn} clockInTime={att.clockInTime} onClockIn={startFlow} onClockOut={onClockOut}/>
      </div>

      {/* today timeline when clocked in */}
      {att.clockedIn && (
        <Card pad={16} style={{ animation:"cw-fade-up .4s both" }}>
          <div style={{ fontSize:13, fontWeight:800, color:"var(--foreground)", marginBottom:12, display:"flex", alignItems:"center", gap:7 }}><I.clock size={16}/> Today's record</div>
          <div style={{ display:"flex", gap:13 }}>
            {att.photo && <img src={att.photo} alt="proof" style={{ width:62, height:62, borderRadius:12, objectFit:"cover", border:"1px solid var(--border)" }}/>}
            <div style={{ flex:1, display:"flex", flexDirection:"column", gap:7 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}><span style={{ color:"var(--muted-foreground)", fontWeight:600 }}>Clock-in</span><span className="tnum" style={{ fontWeight:700 }}>{CW2.fmtTime(new Date(att.clockInTime))}</span></div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}><span style={{ color:"var(--muted-foreground)", fontWeight:600 }}>Location</span><span style={{ fontWeight:700, display:"inline-flex", gap:4, alignItems:"center" }}><I.mapPin size={13}/>{me.location.split(" · ")[0]}</span></div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}><span style={{ color:"var(--muted-foreground)", fontWeight:600 }}>Proof</span><Pill tone="success" dot size="sm">Verified</Pill></div>
            </div>
          </div>
        </Card>
      )}

      {/* quick stats */}
      <div className="anim-fade-up" style={{ display:"flex", gap:10, animationDelay:".1s" }}>
        <StatChip icon={I.clock} label="This week" value={CW2.fmtDur(weekHrs)} tone="brand"/>
        <StatChip icon={I.flame} label="On-time streak" value="12 days" tone="warning"/>
        <StatChip icon={I.users} label="Team in" value={`${present}/${CW2.TEAM.length}`} tone="success"/>
      </div>

      {/* team peek */}
      <Card pad={16} className="anim-fade-up" hover style={{ animationDelay:".14s", cursor:"pointer" }} onClick={goTeam}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:13 }}>
          <div style={{ fontSize:14, fontWeight:800 }}>Who's working today</div>
          <span style={{ color:"var(--primary)", fontWeight:700, fontSize:12.5, display:"inline-flex", alignItems:"center", gap:3 }}>See all <I.chevR size={14}/></span>
        </div>
        <div style={{ display:"flex", alignItems:"center" }}>
          {CW2.TEAM.filter(p=>p.status==="in"||p.status==="break").slice(0,6).map((p,i)=>(
            <div key={p.id} style={{ marginLeft:i?-10:0 }}><Avatar name={p.name} size={36} style={{ boxShadow:"0 0 0 2.5px #fff" }}/></div>
          ))}
          <div style={{ marginLeft:12, fontSize:13, color:"var(--muted-foreground)", fontWeight:600 }}>{present} people clocked in</div>
        </div>
      </Card>

      {/* recent */}
      <div className="anim-fade-up" style={{ animationDelay:".18s" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10, padding:"0 2px" }}>
          <div style={{ fontSize:14, fontWeight:800 }}>Recent attendance</div>
          <button onClick={goHistory} style={{ background:"none", border:"none", color:"var(--primary)", fontWeight:700, fontSize:12.5, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:3 }}>History <I.chevR size={14}/></button>
        </div>
        <Card pad={0}>
          {recent.map((r,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:13, padding:"13px 16px", borderTop:i?"1px solid var(--border)":"none" }}>
              <div style={{ width:42, height:42, borderRadius:11, background:"var(--brand-50)", color:"var(--primary)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", lineHeight:1 }}>
                <span style={{ fontSize:9, fontWeight:700, textTransform:"uppercase" }}>{CW2.DOW[r.date.getDay()]}</span>
                <span className="tnum" style={{ fontSize:16, fontWeight:800 }}>{r.date.getDate()}</span>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13.5, fontWeight:700 }}>{CW2.fmtTime(r.clockIn)} – {CW2.fmtTime(r.clockOut)}</div>
                <div style={{ fontSize:12, color:"var(--muted-foreground)", fontWeight:600, display:"flex", gap:6, alignItems:"center", marginTop:2 }}><I.mapPin size={12}/>{r.mode}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div className="tnum" style={{ fontSize:13.5, fontWeight:800 }}>{CW2.fmtDur(r.hours)}</div>
                {r.late ? <Pill tone="warning" size="sm" style={{ marginTop:3 }}>Late</Pill> : <Pill tone="success" size="sm" dot style={{ marginTop:3 }}>On time</Pill>}
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ---------- clock-in flow ----------
function ClockFlow({ t, now, onCancel, onComplete }){
  const [step,setStep] = e2Use("locating"); // locating | photo | review | success
  const [photo,setPhoto] = e2Use(null);
  const stamp = e2Ref(new Date());

  e2Eff(()=>{ if(step==="locating"){ const id=setTimeout(()=>setStep("photo"),1500); return ()=>clearTimeout(id); } },[step]);

  const Header = ({ title, sub, onBack, stepN }) => (
    <div style={{ padding:"16px 20px 14px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, background:"#fff", zIndex:2 }}>
      <IconButton icon={I.arrowL} label="Back" onClick={onBack}/>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:15.5, fontWeight:800 }}>{title}</div>
        {sub && <div style={{ fontSize:12, color:"var(--muted-foreground)", fontWeight:600 }}>{sub}</div>}
      </div>
      <div style={{ display:"flex", gap:5 }}>{["locating","photo","review"].map((s,i)=>(
        <span key={s} style={{ width:i===["locating","photo","review"].indexOf(step)?20:7, height:7, borderRadius:99, background:i<=["locating","photo","review"].indexOf(step)?"var(--accent)":"var(--muted)", transition:"all .3s" }}/>
      ))}</div>
    </div>
  );

  return (
    <div style={{ position:"absolute", inset:0, background:"#fff", zIndex:30, display:"flex", flexDirection:"column", animation:"cw-slide-up .32s cubic-bezier(.2,.8,.2,1)" }}>
      {step==="locating" && (<>
        <Header title="Clocking in" sub="Capturing your timestamp" onBack={onCancel}/>
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:22, padding:24 }}>
          <div style={{ position:"relative", width:96, height:96, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ position:"absolute", inset:0, borderRadius:"50%", background:"color-mix(in srgb,var(--accent) 22%,transparent)", animation:"cw-ring 1.8s ease-out infinite" }}/>
            <div style={{ width:74, height:74, borderRadius:"50%", background:"var(--accent)", color:"var(--accent-foreground)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"var(--shadow-accent)" }}><I.mapPin size={32}/></div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontWeight:800, fontSize:17 }}>Verifying your location…</div>
            <div className="tnum" style={{ fontSize:13.5, color:"var(--muted-foreground)", fontWeight:600, marginTop:5 }}>{CW2.fmtTime(now)} · {CW2.fmtDateShort(now)}</div>
          </div>
          <Spinner size={22} color="var(--primary)"/>
        </div>
      </>)}

      {step==="photo" && (<>
        <Header title="Photo proof" sub="Show us you're at your workspace" onBack={()=>setStep("locating")}/>
        <div className="scroll-thin" style={{ flex:1, overflowY:"auto", padding:"22px 20px 28px" }}>
          <CameraCapture mode={t.photoStyle} onCapture={(p)=>{ setPhoto(p); setStep("review"); }}/>
        </div>
      </>)}

      {step==="review" && (<>
        <Header title="Review & confirm" sub="Check your details before submitting" onBack={()=>setStep("photo")}/>
        <div className="scroll-thin" style={{ flex:1, overflowY:"auto", padding:"20px 20px 24px", display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ position:"relative" }}>
            <img src={photo} alt="proof" style={{ width:"100%", aspectRatio:"1", objectFit:"cover", borderRadius:18, border:"1px solid var(--border)" }}/>
            <button onClick={()=>setStep("photo")} style={{ position:"absolute", right:12, bottom:12, height:36, padding:"0 14px", borderRadius:10, border:"none", background:"rgba(12,18,28,.72)", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", display:"inline-flex", gap:6, alignItems:"center", backdropFilter:"blur(4px)" }}><I.refresh size={15}/> Retake</button>
          </div>
          <Card pad={0}>
            {[
              { ic:I.clock, label:"Timestamp", val:`${CW2.fmtTime(stamp.current)} · ${CW2.fmtDateShort(stamp.current)}` },
              { ic:I.mapPin, label:"Location", val:CW2.ME.location },
              { ic:I.home, label:"Work mode", val:"Work from home" },
            ].map((r,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 16px", borderTop:i?"1px solid var(--border)":"none" }}>
                <div style={{ color:"var(--primary)" }}><r.ic size={18}/></div>
                <div style={{ flex:1, fontSize:12.5, color:"var(--muted-foreground)", fontWeight:600 }}>{r.label}</div>
                <div style={{ fontSize:13.5, fontWeight:700, textAlign:"right" }}>{r.val}</div>
              </div>
            ))}
          </Card>
          <MiniMap height={120}/>
          <div style={{ display:"flex", gap:8, alignItems:"flex-start", fontSize:12, color:"var(--muted-foreground)", padding:"0 2px" }}>
            <I.shield size={15} style={{ color:"var(--success)", flexShrink:0, marginTop:1 }}/>
            <span>Your timestamp and photo are locked once submitted and can't be edited.</span>
          </div>
        </div>
        <div style={{ padding:"14px 20px", borderTop:"1px solid var(--border)", background:"#fff", display:"flex", gap:10 }}>
          <Button variant="outline" onClick={()=>setStep("photo")}>Back</Button>
          <Button variant="accent" full icon={I.check} onClick={()=>setStep("success")}>Confirm clock-in</Button>
        </div>
      </>)}

      {step==="success" && (
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, padding:24, textAlign:"center" }}>
          <div style={{ position:"relative", width:108, height:108, marginBottom:8 }}>
            <span style={{ position:"absolute", inset:0, borderRadius:"50%", background:"color-mix(in srgb,var(--success) 20%,transparent)", animation:"cw-ring 1.6s ease-out infinite" }}/>
            <div style={{ width:108, height:108, borderRadius:"50%", background:"var(--success)", display:"flex", alignItems:"center", justifyContent:"center", animation:"cw-pop .5s cubic-bezier(.2,.8,.2,1) both" }}>
              <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m20 6-11 11-5-5" style={{ strokeDasharray:48, animation:"cw-check .5s .25s ease both" }}/></svg>
            </div>
          </div>
          <div style={{ fontSize:23, fontWeight:800, animation:"cw-fade-up .4s .2s both" }}>You're clocked in! 🎉</div>
          <div className="tnum" style={{ fontSize:14, color:"var(--muted-foreground)", fontWeight:600, animation:"cw-fade-up .4s .28s both" }}>{CW2.fmtTime(stamp.current)} · {CW2.fmtDateLong(stamp.current)}</div>
          <div style={{ marginTop:6, animation:"cw-fade-up .4s .34s both" }}><Pill tone="success" dot>Attendance recorded</Pill></div>
          <div style={{ width:"100%", maxWidth:300, marginTop:26, animation:"cw-fade-up .4s .4s both" }}>
            <Button variant="primary" full size="lg" onClick={()=>onComplete({ clockedIn:true, clockInTime:stamp.current.toISOString(), photo, location:CW2.ME.location })}>Back to home</Button>
          </div>
        </div>
      )}
    </div>
  );
}

window.StatChip = StatChip;
window.EmployeeHome = EmployeeHome;
window.ClockFlow = ClockFlow;
