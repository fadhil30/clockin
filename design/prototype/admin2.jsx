// admin2.jsx — directory, employee form, attendance logs, detail, shell, AdminApp. Exported to window.AdminApp
const { useState:a2Use, useMemo:a2Memo, useEffect:a2Eff } = React;
const CWB = window.CW;

// ---------- employee add/edit drawer ----------
function EmployeeDrawer({ initial, onClose, onSave, onDelete }){
  const isEdit=!!initial;
  const [f,setF]=a2Use(initial || { name:"", role:"", dept:"Engineering", email:"", phone:"", type:"Full-time", status:"Active" });
  const set=(k,v)=>setF(s=>({ ...s, [k]:v }));
  const valid = f.name.trim() && f.email.trim() && f.role.trim();
  return (
    <Overlay onClose={onClose} align="right">
      <div className="scroll-thin" style={{ width:"min(440px,94vw)", height:"100vh", background:"#fff", overflowY:"auto", animation:"cw-slide-up .28s cubic-bezier(.2,.8,.2,1)", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"20px 24px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, background:"#fff", zIndex:2 }}>
          <div><div style={{ fontSize:18, fontWeight:800 }}>{isEdit?"Edit employee":"Add employee"}</div><div style={{ fontSize:12.5, color:"var(--muted-foreground)", fontWeight:600 }}>{isEdit?"Update master data record":"Create a new master data record"}</div></div>
          <IconButton icon={I.x} label="Close" onClick={onClose}/>
        </div>
        <div style={{ padding:24, display:"flex", flexDirection:"column", gap:17, flex:1 }}>
          {isEdit && <div style={{ display:"flex", alignItems:"center", gap:13, paddingBottom:4 }}><Avatar name={f.name} size={52}/><div><div style={{ fontWeight:800, fontSize:15 }}>{f.name}</div><div style={{ fontSize:12.5, color:"var(--muted-foreground)", fontWeight:600 }}>ID {f.id}</div></div></div>}
          <Field label="Full name"><Input icon={I.user} value={f.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Jordan Lee"/></Field>
          <Field label="Role / title"><Input icon={I.briefcase} value={f.role} onChange={e=>set("role",e.target.value)} placeholder="e.g. Frontend Engineer"/></Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label="Department"><Select value={f.dept} onChange={e=>set("dept",e.target.value)}>{CWB.DEPARTMENTS.map(d=><option key={d}>{d}</option>)}</Select></Field>
            <Field label="Type"><Select value={f.type} onChange={e=>set("type",e.target.value)}><option>Full-time</option><option>Contract</option><option>Part-time</option><option>Intern</option></Select></Field>
          </div>
          <Field label="Work email"><Input icon={I.mail} value={f.email} onChange={e=>set("email",e.target.value)} placeholder="name@northwind.co"/></Field>
          <Field label="Phone" hint="Used for clock-in reminders."><Input icon={I.phone} value={f.phone} onChange={e=>set("phone",e.target.value)} placeholder="+1 555 000 0000"/></Field>
          <Field label="Status"><Segmented full value={f.status} onChange={v=>set("status",v)} options={["Active","On leave","Suspended"]}/></Field>
        </div>
        <div style={{ padding:"16px 24px", borderTop:"1px solid var(--border)", display:"flex", gap:10, position:"sticky", bottom:0, background:"#fff" }}>
          {isEdit && <Button variant="dangerGhost" icon={I.trash} onClick={()=>onDelete(f.id)}>Remove</Button>}
          <div style={{ flex:1 }}/>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon={I.check} disabled={!valid} onClick={()=>onSave(f)}>{isEdit?"Save changes":"Add employee"}</Button>
        </div>
      </div>
    </Overlay>
  );
}

// ---------- directory ----------
function DirectoryScreen({ list, onAdd, onEdit }){
  const [q,setQ]=a2Use("");
  const [dept,setDept]=a2Use("All");
  const filtered=list.filter(e=> (dept==="All"||e.dept===dept) && (e.name.toLowerCase().includes(q.toLowerCase())||e.role.toLowerCase().includes(q.toLowerCase())||e.email.toLowerCase().includes(q.toLowerCase())));
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:220 }}><Input icon={I.search} placeholder="Search employees…" value={q} onChange={e=>setQ(e.target.value)}/></div>
        <div style={{ width:190 }}><Select value={dept} onChange={e=>setDept(e.target.value)}><option>All</option>{CWB.DEPARTMENTS.map(d=><option key={d}>{d}</option>)}</Select></div>
        <Button variant="primary" icon={I.plus} onClick={onAdd}>Add employee</Button>
      </div>
      <Card pad={0} style={{ overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }} className="scroll-thin">
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:680 }}>
            <thead><tr style={{ background:"#f7f9fb", borderBottom:"1px solid var(--border)" }}>
              {["Employee","Department","Type","Status","Joined",""].map((h,i)=><th key={i} style={{ textAlign:i>4?"right":"left", padding:"11px 18px", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".04em", color:"var(--muted-foreground)" }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map(e=>(
                <tr key={e.id} style={{ borderBottom:"1px solid var(--border)" }}>
                  <td style={{ padding:"11px 18px" }}><div style={{ display:"flex", alignItems:"center", gap:11 }}><Avatar name={e.name} size={38}/><div><div style={{ fontSize:13.5, fontWeight:700 }}>{e.name}</div><div style={{ fontSize:12, color:"var(--muted-foreground)", fontWeight:500 }}>{e.role}</div></div></div></td>
                  <td style={{ padding:"11px 18px", fontSize:13, fontWeight:600, color:"#4A4458" }}>{e.dept}</td>
                  <td style={{ padding:"11px 18px" }}><Pill tone="neutral" size="sm">{e.type}</Pill></td>
                  <td style={{ padding:"11px 18px" }}><Pill tone={e.status==="Active"?"success":e.status==="On leave"?"info":"danger"} dot size="sm">{e.status}</Pill></td>
                  <td style={{ padding:"11px 18px", fontSize:13, fontWeight:600, color:"var(--muted-foreground)" }} className="tnum">{new Date(e.joined).toLocaleDateString("en-US",{month:"short",year:"numeric"})}</td>
                  <td style={{ padding:"11px 18px", textAlign:"right" }}><Button variant="ghost" size="sm" icon={I.edit} onClick={()=>onEdit(e)}>Edit</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && <Empty icon={I.users} title="No employees found" sub="Try a different search or department filter."/>}
      </Card>
      <div style={{ fontSize:12.5, color:"var(--muted-foreground)", fontWeight:600, paddingLeft:2 }}>{filtered.length} of {list.length} employees</div>
    </div>
  );
}

// ---------- log detail (view only) ----------
function LogDetail({ row, onClose }){
  return (
    <Overlay onClose={onClose} align="right">
      <div className="scroll-thin" style={{ width:"min(460px,94vw)", height:"100vh", background:"#fff", overflowY:"auto", animation:"cw-slide-up .28s cubic-bezier(.2,.8,.2,1)" }}>
        <div style={{ padding:"20px 24px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, background:"#fff", zIndex:2 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}><Avatar name={row.name} size={44}/><div><div style={{ fontSize:16, fontWeight:800 }}>{row.name}</div><div style={{ fontSize:12.5, color:"var(--muted-foreground)", fontWeight:600 }}>{row.role} · {row.dept}</div></div></div>
          <IconButton icon={I.x} label="Close" onClick={onClose}/>
        </div>
        <div style={{ padding:24, display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"#EEF1F4", border:"1px solid #E0E4EA", borderRadius:12, padding:"10px 13px", color:"#566173", fontSize:12.5, fontWeight:600 }}>
            <I.lock size={16}/> View-only record — timestamp and photo can't be altered.
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:".04em", color:"var(--muted-foreground)", marginBottom:8 }}>Photo proof</div>
            <ProofPhoto name={row.name} big time={`${CWB.fmtTime(row.clockIn)} · ${row.location}`}/>
          </div>
          <Card pad={0}>
            {[
              { ic:I.clock, label:"Clock-in time", val:`${CWB.fmtTime(row.clockIn)} · ${CWB.fmtDateShort(row.clockIn)}` },
              { ic:I.mapPin, label:"Location", val:row.location },
              { ic:row.mode==="Home"?I.home:I.briefcase, label:"Work mode", val:row.mode==="Home"?"Work from home":"On-site" },
              { ic:I.shield, label:"Verification", val:"Photo + geotag" },
            ].map((r,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 16px", borderTop:i?"1px solid var(--border)":"none" }}>
                <div style={{ color:"var(--primary)" }}><r.ic size={18}/></div>
                <div style={{ flex:1, fontSize:12.5, color:"var(--muted-foreground)", fontWeight:600 }}>{r.label}</div>
                <div style={{ fontSize:13.5, fontWeight:700, textAlign:"right" }}>{r.val}</div>
              </div>
            ))}
          </Card>
          <MiniMap height={140}/>
          {row.flag==="late" && <div style={{ display:"flex", alignItems:"center", gap:8, background:"#FFF3DF", border:"1px solid #FBE0AE", borderRadius:12, padding:"10px 13px", color:"#8a5a08", fontSize:12.5, fontWeight:600 }}><I.alert size={16}/> Flagged as late (after 09:10).</div>}
        </div>
      </div>
    </Overlay>
  );
}

// ---------- attendance logs ----------
function AttendanceScreen({ onOpen }){
  const [q,setQ]=a2Use("");
  const [dept,setDept]=a2Use("All");
  const [day,setDay]=a2Use("today");
  const rows=CWB.LOGS.filter(r=> (dept==="All"||r.dept===dept) && r.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
        <Segmented value={day} onChange={setDay} options={[{value:"today",label:"Today"},{value:"week",label:"This week"},{value:"month",label:"This month"}]}/>
        <div style={{ flex:1, minWidth:200 }}><Input icon={I.search} placeholder="Search by name…" value={q} onChange={e=>setQ(e.target.value)}/></div>
        <div style={{ width:180 }}><Select value={dept} onChange={e=>setDept(e.target.value)}><option>All</option>{CWB.DEPARTMENTS.map(d=><option key={d}>{d}</option>)}</Select></div>
        <Button variant="outline" icon={I.download}>Export</Button>
      </div>
      <Card pad={0} style={{ overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }} className="scroll-thin">
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:720 }}>
            <thead><tr style={{ background:"#f7f9fb", borderBottom:"1px solid var(--border)" }}>
              {["Employee","Proof","Clock-in","Mode","Location","Status",""].map((h,i)=><th key={i} style={{ textAlign:i>5?"right":"left", padding:"11px 18px", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".04em", color:"var(--muted-foreground)" }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.id} style={{ borderBottom:"1px solid var(--border)", cursor:"pointer" }} onClick={()=>onOpen(r)}
                  onMouseEnter={e=>e.currentTarget.style.background="var(--brand-50)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"10px 18px" }}><div style={{ display:"flex", alignItems:"center", gap:11 }}><Avatar name={r.name} size={36}/><div><div style={{ fontSize:13.5, fontWeight:700 }}>{r.name}</div><div style={{ fontSize:12, color:"var(--muted-foreground)", fontWeight:500 }}>{r.dept}</div></div></div></td>
                  <td style={{ padding:"10px 18px" }}><ProofPhoto name={r.name} size={36}/></td>
                  <td style={{ padding:"10px 18px", fontSize:13.5, fontWeight:700 }} className="tnum">{CWB.fmtTime(r.clockIn)}</td>
                  <td style={{ padding:"10px 18px" }}><span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:13, fontWeight:600, color: r.mode==="Home"?"var(--primary)":"#566173" }}>{r.mode==="Home"?<I.home size={14}/>:<I.briefcase size={14}/>}{r.mode}</span></td>
                  <td style={{ padding:"10px 18px", fontSize:12.5, fontWeight:600, color:"var(--muted-foreground)", maxWidth:200, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.location}</td>
                  <td style={{ padding:"10px 18px" }}>{r.flag==="late"?<Pill tone="warning" size="sm">Late</Pill>:<Pill tone="success" dot size="sm">On time</Pill>}</td>
                  <td style={{ padding:"10px 18px", textAlign:"right" }}><Button variant="ghost" size="sm" iconRight={I.chevR} onClick={(e)=>{e.stopPropagation();onOpen(r);}}>View</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && <Empty icon={I.calendar} title="No records" sub="No clock-ins match these filters."/>}
      </Card>
    </div>
  );
}

// ---------- admin shell ----------
function AdminShell({ page, setPage, onLogout, children, title, sub }){
  const nav=[["dashboard","Dashboard",I.grid],["employees","Employees",I.users],["attendance","Attendance",I.calendar]];
  return (
    <div style={{ minHeight:"100vh", display:"flex", background:"var(--app-bg)" }}>
      {/* sidebar */}
      <aside style={{ width:248, background:"#fff", borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column", padding:"22px 16px", position:"sticky", top:0, height:"100vh" }}>
        <div style={{ display:"flex", alignItems:"center", gap:11, padding:"0 8px 22px" }}>
          <div style={{ width:38, height:38, borderRadius:11, background:"linear-gradient(145deg,#8A4FBF,#4A1D6E)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"var(--shadow-1)" }}><I.clock size={21} style={{ color:"#fff" }}/></div>
          <div><div style={{ fontWeight:800, fontSize:16, letterSpacing:"-.01em" }}>ClockIn</div><div style={{ fontSize:10.5, color:"var(--muted-foreground)", fontWeight:700, textTransform:"uppercase", letterSpacing:".08em" }}>HR Console</div></div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
          {nav.map(([k,l,Ic])=>{
            const active=page===k;
            return <button key={k} onClick={()=>setPage(k)} className="no-tap"
              style={{ display:"flex", alignItems:"center", gap:11, padding:"10px 12px", borderRadius:10, border:"none", cursor:"pointer", textAlign:"left",
                background:active?"var(--brand-50)":"transparent", color:active?"var(--primary)":"#5B5368", fontWeight:active?700:600, fontSize:14, transition:"all .14s" }}
              onMouseEnter={e=>{ if(!active) e.currentTarget.style.background="var(--muted)"; }} onMouseLeave={e=>{ if(!active) e.currentTarget.style.background="transparent"; }}>
              <Ic size={19}/> {l}</button>;
          })}
        </div>
        <div style={{ marginTop:"auto", display:"flex", flexDirection:"column", gap:10 }}>
          <Card pad={14} elev={0} style={{ background:"var(--brand-50)", border:"1px solid var(--brand-100)" }}>
            <div style={{ fontSize:13, fontWeight:800, color:"var(--primary)", marginBottom:3 }}>Records are locked 🔒</div>
            <div style={{ fontSize:11.5, color:"#5B4A6E", fontWeight:500, lineHeight:1.45 }}>Submitted timestamps & photos are view-only to keep attendance tamper-proof.</div>
          </Card>
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"4px 6px" }}>
            <Avatar name="Yara Haddad" size={36}/>
            <div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:13, fontWeight:700 }}>Yara Haddad</div><div style={{ fontSize:11.5, color:"var(--muted-foreground)", fontWeight:600 }}>HR Admin</div></div>
            <IconButton icon={I.logout} label="Sign out" onClick={onLogout}/>
          </div>
        </div>
      </aside>
      {/* main */}
      <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column" }}>
        <header style={{ height:72, borderBottom:"1px solid var(--border)", background:"rgba(255,255,255,.85)", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", padding:"0 32px", gap:18, position:"sticky", top:0, zIndex:10 }}>
          <div style={{ flex:1 }}><div style={{ fontSize:20, fontWeight:800, lineHeight:1.1 }}>{title}</div>{sub && <div style={{ fontSize:12.5, color:"var(--muted-foreground)", fontWeight:600 }}>{sub}</div>}</div>
          <IconButton icon={I.bell} label="Alerts"/>
          <div style={{ width:1, height:28, background:"var(--border)" }}/>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}><Avatar name="Yara Haddad" size={34}/><div style={{ fontSize:13, fontWeight:700 }}>Yara H.</div></div>
        </header>
        <main className="scroll-thin" style={{ flex:1, overflowY:"auto", padding:"26px 32px 40px" }}>{children}</main>
      </div>
    </div>
  );
}

// ---------- controller ----------
function AdminApp({ t, onLogout }){
  const [page,setPage]=a2Use("dashboard");
  const [list,setList]=a2Use(()=>CWB.DIRECTORY.slice());
  const [drawer,setDrawer]=a2Use(null); // {mode, emp}
  const [log,setLog]=a2Use(null);

  const save=(emp)=>{
    setList(l=>{ const i=l.findIndex(x=>x.id===emp.id); if(i>=0){ const n=l.slice(); n[i]=emp; return n; } return [{ ...emp, id:emp.id||("e-"+Math.random().toString(36).slice(2,6)), joined:emp.joined||new Date().toISOString().slice(0,10) }, ...l]; });
    setDrawer(null);
  };
  const del=(id)=>{ setList(l=>l.filter(x=>x.id!==id)); setDrawer(null); };

  const meta={
    dashboard:{ t:"Good morning, Yara", s:"Here's how your team is showing up today." },
    employees:{ t:"Employees", s:`Master data · ${list.length} people` },
    attendance:{ t:"Attendance logs", s:"View-only clock-in records" },
  }[page];

  return (
    <AdminShell page={page} setPage={setPage} onLogout={onLogout} title={meta.t} sub={meta.s}>
      {page==="dashboard" && <AdminDashboard t={t} onOpenLog={setLog} goEmployees={()=>setPage("employees")} goAttendance={()=>setPage("attendance")}/>}
      {page==="employees" && <DirectoryScreen list={list} onAdd={()=>setDrawer({ emp:null })} onEdit={(e)=>setDrawer({ emp:e })}/>}
      {page==="attendance" && <AttendanceScreen onOpen={setLog}/>}
      {drawer && <EmployeeDrawer initial={drawer.emp} onClose={()=>setDrawer(null)} onSave={save} onDelete={del}/>}
      {log && <LogDetail row={log} onClose={()=>setLog(null)}/>}
    </AdminShell>
  );
}

window.AdminApp = AdminApp;
