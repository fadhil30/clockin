// employee.jsx — employee WFH attendance app. Exported to window.EmployeeApp
const { useState:eUse, useEffect:eEff, useRef:eRef, useMemo:eMemo } = React;
const CWE = window.CW;

// ============ live photo capture (camera + upload fallback) ============
function CameraCapture({ onCapture, mode="camera" }){
  const videoRef = eRef(null), canvasRef = eRef(null), streamRef = eRef(null);
  const [ready,setReady] = eUse(false);
  const [err,setErr] = eUse(false);
  const fileRef = eRef(null);

  eEff(()=>{
    if(mode!=="camera") return;
    let active=true;
    navigator.mediaDevices?.getUserMedia({ video:{ facingMode:"user", width:720, height:720 }, audio:false })
      .then(s=>{ if(!active){ s.getTracks().forEach(t=>t.stop()); return; } streamRef.current=s; if(videoRef.current){ videoRef.current.srcObject=s; videoRef.current.play().then(()=>setReady(true)).catch(()=>setReady(true)); } })
      .catch(()=>setErr(true));
    return ()=>{ active=false; streamRef.current?.getTracks().forEach(t=>t.stop()); };
  },[mode]);

  const snap = ()=>{
    const v=videoRef.current, c=canvasRef.current; if(!v||!c) return;
    const sz=Math.min(v.videoWidth,v.videoHeight)||640; c.width=sz; c.height=sz;
    const ctx=c.getContext("2d");
    ctx.translate(sz,0); ctx.scale(-1,1); // mirror selfie
    ctx.drawImage(v, (v.videoWidth-sz)/2*-1*-1, (v.videoHeight-sz)/-2, v.videoWidth, v.videoHeight);
    // simpler centered crop
    ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,sz,sz);
    ctx.translate(sz,0); ctx.scale(-1,1);
    ctx.drawImage(v, (v.videoWidth-sz)/2, (v.videoHeight-sz)/2, sz,sz, 0,0, sz,sz);
    streamRef.current?.getTracks().forEach(t=>t.stop());
    onCapture(c.toDataURL("image/jpeg",0.85));
  };

  const onFile = (e)=>{
    const f=e.target.files?.[0]; if(!f) return;
    const r=new FileReader(); r.onload=()=>onCapture(r.result); r.readAsDataURL(f);
  };

  if(mode==="camera" && !err){
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:18 }}>
        <div style={{ position:"relative", width:"100%", aspectRatio:"1", borderRadius:24, overflow:"hidden",
          background:"#0c1622", boxShadow:"var(--shadow-2)" }}>
          <video ref={videoRef} playsInline muted style={{ width:"100%", height:"100%", objectFit:"cover", transform:"scaleX(-1)", opacity:ready?1:0, transition:"opacity .4s" }}/>
          {!ready && <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, color:"#cbd5e1" }}><Spinner size={26} color="#fff"/><span style={{ fontSize:13 }}>Starting camera…</span></div>}
          {/* framing guides */}
          <div style={{ position:"absolute", inset:18, border:"2px dashed rgba(255,255,255,.35)", borderRadius:18, pointerEvents:"none" }}/>
          <div style={{ position:"absolute", left:0, right:0, bottom:0, padding:"22px 0 16px", textAlign:"center",
            background:"linear-gradient(transparent,rgba(0,0,0,.55))", color:"#fff", fontSize:12.5, fontWeight:600 }}>Center your face in the frame</div>
        </div>
        <button onClick={snap} disabled={!ready} className="no-tap"
          style={{ width:74, height:74, borderRadius:"50%", border:"5px solid #fff", background:"var(--accent)", cursor:ready?"pointer":"default",
            boxShadow:"var(--shadow-accent)", display:"flex", alignItems:"center", justifyContent:"center", opacity:ready?1:.5, transition:"transform .12s" }}
          onMouseDown={e=>e.currentTarget.style.transform="scale(.92)"} onMouseUp={e=>e.currentTarget.style.transform="none"}>
          <I.camera size={28}/>
        </button>
        <button onClick={()=>fileRef.current?.click()} style={{ background:"none", border:"none", color:"var(--primary)", fontWeight:700, fontSize:13.5, cursor:"pointer", display:"inline-flex", gap:7, alignItems:"center" }}>
          <I.upload size={16}/> Upload from device instead
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display:"none" }}/>
        <canvas ref={canvasRef} style={{ display:"none" }}/>
      </div>
    );
  }

  // upload-first (or camera blocked)
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {err && <div style={{ display:"flex", gap:10, alignItems:"flex-start", background:"#FFF3DF", border:"1px solid #FBE0AE", color:"#8a5a08", padding:"11px 13px", borderRadius:12, fontSize:12.5, fontWeight:600 }}>
        <I.info size={17}/><span>Camera unavailable in this preview — upload a photo to continue.</span></div>}
      <button onClick={()=>fileRef.current?.click()} className="no-tap"
        style={{ border:"2px dashed #b9c6d3", background:"var(--brand-50)", borderRadius:20, padding:"34px 20px", cursor:"pointer",
          display:"flex", flexDirection:"column", alignItems:"center", gap:12, transition:"all .15s" }}
        onMouseEnter={e=>{e.currentTarget.style.background="#dbe9f4";e.currentTarget.style.borderColor="var(--accent)";}}
        onMouseLeave={e=>{e.currentTarget.style.background="var(--brand-50)";e.currentTarget.style.borderColor="#b9c6d3";}}>
        <div style={{ width:58, height:58, borderRadius:"50%", background:"var(--accent)", color:"var(--accent-foreground)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"var(--shadow-accent)" }}><I.image size={26}/></div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontWeight:700, fontSize:15, color:"var(--foreground)" }}>Tap to upload a photo</div>
          <div style={{ fontSize:12.5, color:"var(--muted-foreground)", marginTop:3 }}>JPG or PNG · proof you're at your workspace</div>
        </div>
      </button>
      {!err && <button onClick={()=>fileRef.current?.click()} style={{ background:"none", border:"none", color:"var(--primary)", fontWeight:700, fontSize:13.5, cursor:"pointer", display:"inline-flex", gap:7, alignItems:"center", justifyContent:"center" }}>
        <I.camera size={16}/> Use live camera</button>}
      <input ref={fileRef} type="file" accept="image/*" capture="user" onChange={onFile} style={{ display:"none" }}/>
    </div>
  );
}

// ============ mini map placeholder ============
function MiniMap({ height=128 }){
  return (
    <div style={{ position:"relative", height, borderRadius:14, overflow:"hidden", background:"#e8eef3", border:"1px solid var(--border)" }}>
      <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(#d4dde6 1px,transparent 1px),linear-gradient(90deg,#d4dde6 1px,transparent 1px)", backgroundSize:"26px 26px", opacity:.7 }}/>
      <div style={{ position:"absolute", top:"30%", left:0, right:0, height:14, background:"#cdd8e2", transform:"rotate(-8deg)" }}/>
      <div style={{ position:"absolute", top:0, bottom:0, left:"58%", width:11, background:"#cdd8e2", transform:"rotate(6deg)" }}/>
      <div style={{ position:"absolute", top:"62%", left:"8%", width:62, height:46, background:"#dce6ee", borderRadius:4 }}/>
      <div style={{ position:"absolute", top:"18%", left:"70%", width:48, height:40, background:"#dce6ee", borderRadius:4 }}/>
      <div style={{ position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-100%)" }}>
        <span style={{ position:"absolute", left:"50%", top:"100%", transform:"translate(-50%,-6px)", width:26, height:26, borderRadius:"50%", background:"color-mix(in srgb,var(--accent) 30%,transparent)", animation:"cw-ring 2s ease-out infinite" }}/>
        <div style={{ color:"var(--accent-strong)", filter:"drop-shadow(0 2px 3px rgba(0,0,0,.25))" }}><I.mapPin size={32} fill="var(--accent)"/></div>
      </div>
    </div>
  );
}

// ============ clock-in hero variations ============
function ClockHero({ style, now, clockedIn, clockInTime, onClockIn, onClockOut }){
  const { hm, s, ap } = CWE.fmtTimeSec(now);
  const worked = clockedIn && clockInTime ? CWE.fmtDur(CWE.hoursBetween(new Date(clockInTime), now)) : null;

  // ---- shared inner content for "clocked in" state ----
  if(clockedIn){
    return (
      <div className="anim-scale-in" style={{ background:"linear-gradient(150deg,#3A1659,#5E2A8C 60%,#8A4FBF)", borderRadius:"var(--radius-lg)", padding:"26px 24px", color:"#fff", boxShadow:"var(--shadow-2)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", right:-40, top:-40, width:170, height:170, borderRadius:"50%", background:"radial-gradient(circle,color-mix(in srgb,var(--accent) 55%,transparent),transparent 70%)" }}/>
        <div style={{ position:"relative" }}>
          <Pill tone="accent" dot style={{ background:"rgba(255,255,255,.16)", color:"#fff", border:"1px solid rgba(255,255,255,.25)" }}>Clocked in · {CWE.fmtTime(new Date(clockInTime))}</Pill>
          <div style={{ marginTop:18, display:"flex", alignItems:"baseline", gap:8 }}>
            <span className="tnum" style={{ fontSize:54, fontWeight:800, lineHeight:1 }}>{worked}</span>
          </div>
          <div style={{ fontSize:13.5, opacity:.8, marginTop:6, fontWeight:500 }}>worked today · live</div>
          <button onClick={onClockOut} className="no-tap"
            style={{ marginTop:22, width:"100%", height:50, borderRadius:14, border:"1.5px solid rgba(255,255,255,.4)", background:"rgba(255,255,255,.12)", color:"#fff", fontWeight:700, fontSize:15.5, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:9, backdropFilter:"blur(4px)" }}>
            <I.logout size={19}/> Clock out
          </button>
        </div>
      </div>
    );
  }

  // ---- variation A: spotlight (gradient card, big button) ----
  if(style==="spotlight"){
    return (
      <div className="anim-scale-in" style={{ background:"linear-gradient(155deg,#33134D,#5E2A8C 55%,#8A4FBF)", borderRadius:"var(--radius-lg)", padding:"28px 24px 26px", color:"#fff", boxShadow:"var(--shadow-2)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", right:-50, top:-60, width:200, height:200, borderRadius:"50%", background:"radial-gradient(circle,color-mix(in srgb,var(--accent) 60%,transparent),transparent 70%)", opacity:.85 }}/>
        <div style={{ position:"relative", textAlign:"center" }}>
          <div style={{ fontSize:13, opacity:.82, fontWeight:600, letterSpacing:".02em" }}>{CWE.fmtDOW(now)} · {CWE.fmtDateShort(now)}</div>
          <div className="tnum" style={{ marginTop:6, fontSize:64, fontWeight:800, lineHeight:1 }}>{hm}<span style={{ fontSize:22, fontWeight:700, marginLeft:6, opacity:.85 }}>{ap}</span></div>
          <div style={{ fontSize:13, opacity:.7, marginTop:4 }}>You haven't clocked in yet</div>
          <button onClick={onClockIn} className="no-tap"
            style={{ marginTop:22, width:"100%", height:58, borderRadius:16, border:"none", background:"var(--accent)", color:"var(--accent-foreground)", fontWeight:800, fontSize:17, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, boxShadow:"0 10px 30px -6px rgba(0,0,0,.4)", animation:"cw-breathe 3.4s ease-in-out infinite" }}>
            <I.zap size={20}/> Clock in now
          </button>
        </div>
      </div>
    );
  }

  // ---- variation B: ring (big circular tappable ring) ----
  if(style==="ring"){
    const secFrac = now.getSeconds()/60;
    return (
      <div className="anim-scale-in" style={{ background:"#fff", borderRadius:"var(--radius-lg)", padding:"26px 24px 28px", border:"1px solid var(--border)", boxShadow:"var(--shadow-1)", textAlign:"center" }}>
        <div style={{ fontSize:13, color:"var(--muted-foreground)", fontWeight:600 }}>{CWE.fmtDOW(now)} · {CWE.fmtDateShort(now)}</div>
        <div style={{ position:"relative", width:212, height:212, margin:"16px auto 8px" }}>
          <svg width="212" height="212" style={{ transform:"rotate(-90deg)" }}>
            <circle cx="106" cy="106" r="96" fill="none" stroke="var(--muted)" strokeWidth="10"/>
            <circle cx="106" cy="106" r="96" fill="none" stroke="var(--accent)" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={2*Math.PI*96} strokeDashoffset={2*Math.PI*96*(1-secFrac)} style={{ transition:"stroke-dashoffset 1s linear" }}/>
          </svg>
          <button onClick={onClockIn} className="no-tap"
            style={{ position:"absolute", inset:24, borderRadius:"50%", border:"none", cursor:"pointer", background:"radial-gradient(circle at 50% 35%,#8A4FBF,#4A1D6E)", color:"#fff", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4, boxShadow:"var(--shadow-2)", transition:"transform .14s" }}
            onMouseDown={e=>e.currentTarget.style.transform="scale(.96)"} onMouseUp={e=>e.currentTarget.style.transform="none"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>
            <I.zap size={26}/>
            <span style={{ fontSize:18, fontWeight:800 }}>Clock in</span>
            <span className="tnum" style={{ fontSize:12.5, opacity:.8 }}>{hm} {ap}</span>
          </button>
        </div>
        <div style={{ fontSize:13, color:"var(--muted-foreground)", marginTop:6 }}>Tap the ring to start your day</div>
      </div>
    );
  }

  // ---- variation C: minimal ----
  return (
    <div className="anim-scale-in" style={{ background:"#fff", borderRadius:"var(--radius-lg)", padding:24, border:"1px solid var(--border)", boxShadow:"var(--shadow-1)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:13, color:"var(--muted-foreground)", fontWeight:600 }}>{CWE.fmtDOW(now)}, {CWE.fmtDateShort(now)}</div>
          <div className="tnum" style={{ fontSize:46, fontWeight:800, lineHeight:1.05, marginTop:4, color:"var(--foreground)" }}>{hm}<span style={{ fontSize:18, fontWeight:700, marginLeft:5, color:"var(--muted-foreground)" }}>{ap}</span></div>
        </div>
        <Pill tone="warning" dot>Not in yet</Pill>
      </div>
      <Button variant="accent" size="lg" full icon={I.zap} onClick={onClockIn} style={{ marginTop:20 }}>Clock in now</Button>
    </div>
  );
}

window.CameraCapture = CameraCapture;
window.MiniMap = MiniMap;
window.ClockHero = ClockHero;
