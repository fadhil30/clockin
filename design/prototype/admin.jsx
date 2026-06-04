// admin.jsx — HR admin shell, proof-photo placeholder, dashboard. Exported to window.
const { useState:aUse, useEffect:aEff, useMemo:aMemo } = React;
const CWA = window.CW;

// ---------- stylized photo-proof placeholder (deterministic) ----------
function ProofPhoto({ name, time, size, style, big }){
  const c1 = CWA.avatarColor(name||"x");
  return (
    <div style={{ position:"relative", width:size||"100%", aspectRatio:"1", borderRadius: big?16:10, overflow:"hidden",
      background:`linear-gradient(150deg, ${c1}22, ${c1}44 60%, #0c1622)`, border:"1px solid var(--border)", ...style }}>
      {/* room vibe */}
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(120% 80% at 50% 120%, rgba(255,255,255,.5), transparent 60%)" }}/>
      {/* silhouette head + shoulders */}
      <svg viewBox="0 0 100 100" style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} preserveAspectRatio="xMidYMax meet">
        <circle cx="50" cy="42" r="20" fill={c1} opacity="0.9"/>
        <path d="M14 100 C16 74 32 64 50 64 C68 64 84 74 86 100 Z" fill={c1} opacity="0.9"/>
      </svg>
      {/* timestamp watermark */}
      {time && <div style={{ position:"absolute", left:0, right:0, bottom:0, padding: big?"10px 12px":"5px 7px", background:"linear-gradient(transparent,rgba(0,0,0,.6))", color:"#fff", fontSize: big?12:9.5, fontWeight:700, display:"flex", alignItems:"center", gap:5 }}>
        <I.mapPin size={big?13:10}/> <span className="tnum">{time}</span></div>}
    </div>
  );
}

// ---------- donut ----------
function Donut({ segments, size=132, thickness=18, center }){
  const r=(size-thickness)/2, circ=2*Math.PI*r, total=segments.reduce((a,s)=>a+s.value,0)||1;
  let off=0;
  return (
    <div style={{ position:"relative", width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--muted)" strokeWidth={thickness}/>
        {segments.map((s,i)=>{
          const len=circ*(s.value/total);
          const el=<circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={s.color} strokeWidth={thickness}
            strokeDasharray={`${len} ${circ-len}`} strokeDashoffset={-off} strokeLinecap="round"/>;
          off+=len; return el;
        })}
      </svg>
      {center && <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>{center}</div>}
    </div>
  );
}

// ---------- KPI card ----------
function KPI({ icon:Ic, label, value, tone="brand", delta, deltaTone, sub }){
  const tn=window.PILL_TONES[tone];
  return (
    <Card pad={18} hover style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ width:38, height:38, borderRadius:11, background:tn.bg, color:tn.fg, display:"flex", alignItems:"center", justifyContent:"center" }}><Ic size={20}/></div>
        {delta && <Pill tone={deltaTone||"success"} size="sm">{delta}</Pill>}
      </div>
      <div>
        <div className="tnum" style={{ fontSize:30, fontWeight:800, lineHeight:1, color:"var(--foreground)" }}>{value}</div>
        <div style={{ fontSize:13, color:"var(--muted-foreground)", fontWeight:600, marginTop:5 }}>{label}</div>
        {sub && <div style={{ fontSize:11.5, color:"#9aa4b2", fontWeight:500, marginTop:2 }}>{sub}</div>}
      </div>
    </Card>
  );
}

// ---------- presence panel ----------
function PresencePanel({ onViewAll, compact }){
  const team=CWA.TEAM;
  const counts={ in:team.filter(p=>p.status==="in").length, break:team.filter(p=>p.status==="break").length, leave:team.filter(p=>p.status==="leave").length, out:team.filter(p=>p.status==="out").length };
  const segs=[{value:counts.in,color:"var(--success)"},{value:counts.break,color:"var(--warning)"},{value:counts.leave,color:"var(--info)"},{value:counts.out,color:"#cdd3da"}];
  const present=counts.in+counts.break;
  return (
    <Card pad={20}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div><div style={{ fontSize:16, fontWeight:800 }}>Team presence</div><div style={{ fontSize:12.5, color:"var(--muted-foreground)", fontWeight:600 }}>Live · today</div></div>
        {onViewAll && <Button variant="ghost" size="sm" iconRight={I.chevR} onClick={onViewAll}>Directory</Button>}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:24, flexWrap:"wrap" }}>
        <Donut segments={segs} size={compact?120:140} center={<><span className="tnum" style={{ fontSize:28, fontWeight:800 }}>{present}</span><span style={{ fontSize:11, color:"var(--muted-foreground)", fontWeight:700 }}>of {team.length} in</span></>}/>
        <div style={{ flex:1, minWidth:160, display:"flex", flexDirection:"column", gap:11 }}>
          {[["Clocked in",counts.in,"var(--success)"],["On break",counts.break,"var(--warning)"],["On leave",counts.leave,"var(--info)"],["Not in yet",counts.out,"#cdd3da"]].map(([l,v,c])=>(
            <div key={l} style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ width:10, height:10, borderRadius:3, background:c }}/>
              <span style={{ flex:1, fontSize:13.5, fontWeight:600, color:"#4A4458" }}>{l}</span>
              <span className="tnum" style={{ fontSize:14, fontWeight:800 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ---------- recent submissions feed ----------
function SubmissionsFeed({ onOpen, limit=6 }){
  const rows=CWA.LOGS.slice(0,limit);
  return (
    <Card pad={0}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 20px 14px" }}>
        <div><div style={{ fontSize:16, fontWeight:800 }}>Today's submissions</div><div style={{ fontSize:12.5, color:"var(--muted-foreground)", fontWeight:600 }}>{CWA.LOGS.length} clock-ins recorded</div></div>
        <Pill tone="success" dot>Live</Pill>
      </div>
      {rows.map((r,i)=>(
        <div key={r.id} onClick={()=>onOpen&&onOpen(r)} className="no-tap"
          style={{ display:"flex", alignItems:"center", gap:13, padding:"11px 20px", borderTop:"1px solid var(--border)", cursor:"pointer", transition:"background .12s" }}
          onMouseEnter={e=>e.currentTarget.style.background="var(--brand-50)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <ProofPhoto name={r.name} size={40} time={null}/>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13.5, fontWeight:700 }}>{r.name}</div>
            <div style={{ fontSize:12, color:"var(--muted-foreground)", fontWeight:600 }}>{r.dept} · {r.mode}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div className="tnum" style={{ fontSize:13.5, fontWeight:800 }}>{CWA.fmtTime(r.clockIn)}</div>
            {r.flag==="late" ? <Pill tone="warning" size="sm" style={{ marginTop:2 }}>Late</Pill> : <Pill tone="success" size="sm" dot style={{ marginTop:2 }}>On time</Pill>}
          </div>
        </div>
      ))}
    </Card>
  );
}

// ---------- dashboard ----------
function AdminDashboard({ t, onOpenLog, goEmployees, goAttendance }){
  const team=CWA.TEAM;
  const present=team.filter(p=>p.status==="in"||p.status==="break").length;
  const onLeave=team.filter(p=>p.status==="leave").length;
  const late=CWA.LOGS.filter(r=>r.flag==="late").length;

  const kpis=(
    <>
      <KPI icon={I.users} label="Present today" value={`${present}/${CWA.DIRECTORY.length}`} tone="success" delta="+2" sub="vs. yesterday"/>
      <KPI icon={I.clock} label="Avg clock-in" value="8:58" tone="brand" sub="Target 09:00"/>
      <KPI icon={I.alert} label="Late arrivals" value={late} tone="warning" delta="+1" deltaTone="warning" sub="after 09:10"/>
      <KPI icon={I.coffee} label="On leave" value={onLeave} tone="info" sub="approved today"/>
    </>
  );

  if(t.dashLayout==="focus"){
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:18, alignItems:"start" }}>
          <PresencePanel onViewAll={goEmployees}/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>{kpis}</div>
        </div>
        <SubmissionsFeed onOpen={onOpenLog} limit={7}/>
      </div>
    );
  }
  // default: cards
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>{kpis}</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.2fr", gap:18, alignItems:"start" }}>
        <PresencePanel onViewAll={goEmployees}/>
        <SubmissionsFeed onOpen={onOpenLog}/>
      </div>
    </div>
  );
}

window.ProofPhoto = ProofPhoto;
window.Donut = Donut;
window.KPI = KPI;
window.PresencePanel = PresencePanel;
window.SubmissionsFeed = SubmissionsFeed;
window.AdminDashboard = AdminDashboard;
