// app.jsx — root: login, role routing, accent theming, tweaks. Mounts the app.
const { useState:rUse, useEffect:rEff } = React;
const CWR = window.CW;

// ---------- accent palettes ----------
const ACCENTS = {
  "#FF6F50":{ strong:"#E8512F", soft:"#FFEDE8", fg:"#4A1606", name:"Coral" },
  "#12A150":{ strong:"#0E8A45", soft:"#E7F6EC", fg:"#08361C", name:"Green" },
  "#F59E0B":{ strong:"#D98309", soft:"#FEF3DD", fg:"#4A2D00", name:"Amber" },
  "#2D7FF9":{ strong:"#1A63D8", soft:"#E8F0FF", fg:"#0A2A5E", name:"Blue" },
  "#9A4DD6":{ strong:"#7C2FB8", soft:"#F3E9FB", fg:"#2E0F47", name:"Violet" },
};
function applyAccent(hex){
  const a=ACCENTS[hex]||ACCENTS["#FF6F50"]; const r=document.documentElement.style;
  r.setProperty("--accent",hex); r.setProperty("--accent-strong",a.strong);
  r.setProperty("--accent-soft",a.soft); r.setProperty("--accent-foreground",a.fg);
}

// ---------- login ----------
function Login({ onEnter }){
  const [email,setEmail]=rUse("maya.putri@northwind.co");
  const [pw,setPw]=rUse("clockin");
  const [show,setShow]=rUse(false);
  const [role,setRole]=rUse("employee");
  const [busy,setBusy]=rUse(false);

  const go=(r)=>{ setBusy(r); setTimeout(()=>onEnter(r),650); };

  return (
    <div style={{ minHeight:"100vh", display:"flex", background:"radial-gradient(1100px 560px at 80% -5%, #E9DBF6, var(--app-bg))" }}>
      {/* brand panel (desktop) */}
      <div className="cw-loginbrand" style={{ width:"46%", maxWidth:560, background:"linear-gradient(160deg,#33134D,#5E2A8C 55%,#8A4FBF)", color:"#fff", padding:"54px 52px", position:"relative", overflow:"hidden", flexDirection:"column", justifyContent:"space-between" }}>
        <div style={{ position:"absolute", right:-80, top:-80, width:320, height:320, borderRadius:"50%", background:"radial-gradient(circle,color-mix(in srgb,var(--accent) 55%,transparent),transparent 70%)" }}/>
        <div style={{ position:"absolute", left:-60, bottom:-60, width:240, height:240, borderRadius:"50%", border:"40px solid rgba(255,255,255,.06)" }}/>
        <div style={{ position:"relative", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:42, height:42, borderRadius:12, background:"rgba(255,255,255,.16)", display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid rgba(255,255,255,.25)" }}><I.clock size={23}/></div>
          <span style={{ fontWeight:800, fontSize:20, letterSpacing:"-.01em" }}>ClockIn</span>
        </div>
        <div style={{ position:"relative" }}>
          <div style={{ fontSize:34, fontWeight:800, lineHeight:1.12, letterSpacing:"-.02em", textWrap:"balance" }}>Clock in from anywhere, with proof in a tap.</div>
          <p style={{ fontSize:15, opacity:.82, marginTop:16, lineHeight:1.6, maxWidth:380, fontWeight:500 }}>A friendlier way to track remote attendance — timestamped, geotagged, photo-verified, and impossible to fudge.</p>
          <div style={{ display:"flex", gap:22, marginTop:30 }}>
            {[["⏱","One-tap clock-in"],["📍","Geo + photo proof"],["🔒","Tamper-proof logs"]].map(([e,l])=>(
              <div key={l} style={{ display:"flex", flexDirection:"column", gap:6 }}><span style={{ fontSize:22 }}>{e}</span><span style={{ fontSize:12.5, opacity:.85, fontWeight:600, maxWidth:90 }}>{l}</span></div>
            ))}
          </div>
        </div>
        <div style={{ position:"relative", fontSize:12.5, opacity:.6, fontWeight:500 }}>© 2026 ClockIn · Demo workspace</div>
      </div>

      {/* form */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 24px" }}>
        <div style={{ width:"100%", maxWidth:392 }}>
          <div className="cw-loginlogo" style={{ display:"none", alignItems:"center", gap:11, marginBottom:26 }}>
            <div style={{ width:40, height:40, borderRadius:11, background:"linear-gradient(145deg,#8A4FBF,#4A1D6E)", display:"flex", alignItems:"center", justifyContent:"center" }}><I.clock size={22} style={{ color:"#fff" }}/></div>
            <span style={{ fontWeight:800, fontSize:19 }}>ClockIn</span>
          </div>
          <div style={{ fontSize:27, fontWeight:800, letterSpacing:"-.01em" }}>Welcome back 👋</div>
          <div style={{ fontSize:14.5, color:"var(--muted-foreground)", fontWeight:500, marginTop:6 }}>Sign in to log your attendance for the day.</div>

          <div style={{ marginTop:24, marginBottom:18 }}>
            <div style={{ fontSize:12.5, fontWeight:700, color:"#4A4458", marginBottom:8 }}>I'm signing in as</div>
            <Segmented full value={role} onChange={setRole} options={[{value:"employee",label:"Employee",icon:I.user},{value:"admin",label:"HR Admin",icon:I.shield}]}/>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:15 }}>
            <Field label="Work email"><Input icon={I.mail} value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@northwind.co"/></Field>
            <Field label="Password"><Input icon={I.lock} type={show?"text":"password"} value={pw} onChange={e=>setPw(e.target.value)}
              suffix={<IconButton size={34} icon={show?I.eyeOff:I.eye} label="Toggle password" onClick={()=>setShow(s=>!s)}/>}/></Field>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:13 }}>
              <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontWeight:600, color:"#4A4458" }}>
                <input type="checkbox" defaultChecked style={{ width:16, height:16, accentColor:"var(--primary)" }}/> Keep me signed in</label>
              <a style={{ color:"var(--primary)", fontWeight:700, cursor:"pointer" }}>Forgot?</a>
            </div>
            <Button variant="primary" size="lg" full disabled={!!busy} onClick={()=>go(role)} iconRight={busy?null:I.arrowR}>
              {busy?<Spinner size={20} color="#fff"/>:`Sign in as ${role==="admin"?"HR Admin":"Employee"}`}
            </Button>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"22px 0 16px", color:"var(--muted-foreground)", fontSize:12, fontWeight:600 }}>
            <div style={{ flex:1, height:1, background:"var(--border)" }}/> DEMO QUICK ACCESS <div style={{ flex:1, height:1, background:"var(--border)" }}/>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Button variant="outline" full icon={I.user} disabled={!!busy} onClick={()=>go("employee")}>Employee app</Button>
            <Button variant="outline" full icon={I.shield} disabled={!!busy} onClick={()=>go("admin")}>HR console</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- tweaks ----------
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#FF6F50",
  "heroStyle": "spotlight",
  "photoStyle": "camera",
  "dashLayout": "cards"
}/*EDITMODE-END*/;

// ---------- root ----------
function Root(){
  const [t,setTweak]=useTweaks(TWEAK_DEFAULTS);
  const [role,setRole]=rUse(null);

  rEff(()=>{ applyAccent(t.accent); },[t.accent]);

  return (
    <>
      {role===null && <Login onEnter={setRole}/>}
      {role==="employee" && <EmployeeApp t={t} onLogout={()=>setRole(null)}/>}
      {role==="admin" && <AdminApp t={t} onLogout={()=>setRole(null)}/>}

      <TweaksPanel>
        <TweakSection label="Theme"/>
        <TweakColor label="Accent color" value={t.accent}
          options={Object.keys(ACCENTS)} onChange={v=>setTweak("accent",v)}/>
        <TweakSection label="Employee · clock-in hero"/>
        <TweakRadio label="Hero style" value={t.heroStyle}
          options={[{value:"spotlight",label:"Spotlight"},{value:"ring",label:"Ring"},{value:"minimal",label:"Minimal"}]}
          onChange={v=>setTweak("heroStyle",v)}/>
        <TweakSection label="Employee · photo proof"/>
        <TweakRadio label="Capture" value={t.photoStyle}
          options={[{value:"camera",label:"Live camera"},{value:"upload",label:"Upload first"}]}
          onChange={v=>setTweak("photoStyle",v)}/>
        <TweakSection label="HR · dashboard"/>
        <TweakRadio label="Layout" value={t.dashLayout}
          options={[{value:"cards",label:"Stat cards"},{value:"focus",label:"Presence focus"}]}
          onChange={v=>setTweak("dashLayout",v)}/>
      </TweaksPanel>
    </>
  );
}

// responsive: hide brand panel on narrow screens
const mq=document.createElement("style");
mq.textContent=`
@media (max-width:880px){ .cw-loginbrand{ display:none !important; } .cw-loginlogo{ display:flex !important; } }
@media (min-width:881px){ .cw-loginbrand{ display:flex !important; } }
`;
document.head.appendChild(mq);

ReactDOM.createRoot(document.getElementById("root")).render(<Root/>);
