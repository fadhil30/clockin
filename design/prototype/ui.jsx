// ui.jsx — shared UI primitives. Exported to window.
const { useState, useEffect, useRef, useMemo, useCallback } = React;
const { initials, avatarColor } = window.CW;

// ---------- Avatar ----------
function Avatar({ name, size = 40, src, ring, style }) {
  const bg = avatarColor(name || "?");
  return (
    <div style={{
      width:size, height:size, borderRadius:"50%", flexShrink:0,
      background: src ? `center/cover url(${src})` : bg,
      color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
      fontWeight:700, fontSize:size*0.36, letterSpacing:"-.01em",
      boxShadow: ring ? `0 0 0 2px #fff, 0 0 0 4px ${bg}` : "none",
      userSelect:"none", ...style,
    }}>
      {!src && initials(name || "?")}
    </div>
  );
}

// ---------- Button ----------
function Button({ children, variant = "primary", size = "md", icon, iconRight, full, disabled, style, ...p }) {
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);
  const sizes = {
    sm:{ h:36, px:14, fs:13.5, gap:7, ic:16 },
    md:{ h:44, px:18, fs:15, gap:9, ic:18 },
    lg:{ h:54, px:24, fs:16.5, gap:10, ic:20 },
  }[size];
  const base = {
    height:sizes.h, padding:`0 ${sizes.px}px`, fontSize:sizes.fs, fontWeight:700,
    display:"inline-flex", alignItems:"center", justifyContent:"center", gap:sizes.gap,
    borderRadius:"var(--radius-sm)", border:"1px solid transparent", cursor: disabled?"not-allowed":"pointer",
    width: full?"100%":"auto", whiteSpace:"nowrap", transition:"all .16s ease",
    transform: down && !disabled ? "translateY(1px) scale(.99)" : "none",
    opacity: disabled?0.55:1, lineHeight:1, ...style,
  };
  const variants = {
    primary:{ background:"var(--primary)", color:"#fff", boxShadow:hover&&!disabled?"var(--shadow-2)":"var(--shadow-1)", borderColor:"var(--primary)", filter:hover&&!disabled?"brightness(1.08)":"none" },
    accent:{ background:"var(--accent)", color:"var(--accent-foreground)", boxShadow:hover&&!disabled?"var(--shadow-accent)":"var(--shadow-1)", filter:hover&&!disabled?"brightness(1.04)":"none" },
    outline:{ background:hover&&!disabled?"var(--brand-50)":"#fff", color:"var(--primary)", borderColor:"#DCCDEC" },
    ghost:{ background:hover&&!disabled?"var(--muted)":"transparent", color:"var(--foreground)" },
    soft:{ background:hover&&!disabled?"#E7D8F4":"var(--brand-50)", color:"var(--primary)" },
    danger:{ background:hover&&!disabled?"#C2363B":"var(--destructive)", color:"#fff" },
    dangerGhost:{ background:hover&&!disabled?"#FCE9EA":"transparent", color:"var(--destructive)" },
  };
  const Ic = icon, IcR = iconRight;
  return (
    <button disabled={disabled} style={{ ...base, ...variants[variant] }}
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>{setHover(false);setDown(false);}}
      onMouseDown={()=>setDown(true)} onMouseUp={()=>setDown(false)} className="no-tap" {...p}>
      {Ic && <Ic size={sizes.ic}/>}{children}{IcR && <IcR size={sizes.ic}/>}
    </button>
  );
}

// ---------- IconButton ----------
function IconButton({ icon:Ic, size=40, label, active, danger, style, ...p }){
  const [h,setH]=useState(false);
  return (
    <button aria-label={label} title={label} className="no-tap"
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ width:size,height:size,borderRadius:"var(--radius-sm)",border:"1px solid transparent",
        display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .15s ease",
        background: active?"var(--brand-50)":(h?"var(--muted)":"transparent"),
        color: danger?"var(--destructive)":(active?"var(--primary)":"var(--muted-foreground)"), ...style }} {...p}>
      <Ic size={Math.round(size*0.5)}/>
    </button>
  );
}

// ---------- Card ----------
function Card({ children, pad = 20, elev = 1, style, hover, ...p }){
  const [h,setH]=useState(false);
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--radius)",
        padding:pad, boxShadow: (hover&&h)?"var(--shadow-2)":(elev===2?"var(--shadow-2)":elev===0?"none":"var(--shadow-1)"),
        transition:"box-shadow .18s ease, transform .18s ease", ...style }} {...p}>
      {children}
    </div>
  );
}

// ---------- Pill / Badge ----------
const PILL_TONES = {
  success:{ bg:"#E7F6EC", fg:"#0A7A3C", bd:"#BFE6CC" },
  info:{ bg:"#E8F0FF", fg:"#1D5FD0", bd:"#C5DBFB" },
  warning:{ bg:"#FEF3DD", fg:"#9A6700", bd:"#FBE3AE" },
  danger:{ bg:"#FCE9EA", fg:"#B81722", bd:"#F5C5C8" },
  neutral:{ bg:"#F1EEF6", fg:"#6B6480", bd:"#E4DCEF" },
  brand:{ bg:"var(--brand-50)", fg:"var(--brand-700)", bd:"var(--brand-100)" },
  accent:{ bg:"var(--accent-soft)", fg:"var(--accent-strong)", bd:"color-mix(in srgb,var(--accent) 35%,#fff)" },
};
function Pill({ children, tone="neutral", dot, icon:Ic, size="md", style }){
  const t = PILL_TONES[tone] || PILL_TONES.neutral;
  const s = size==="sm" ? { fs:11.5, px:8, py:2.5, h:6 } : { fs:12.5, px:10, py:4, h:7 };
  return (
    <span style={{ display:"inline-flex",alignItems:"center",gap:6,background:t.bg,color:t.fg,
      border:`1px solid ${t.bd}`,borderRadius:999,padding:`${s.py}px ${s.px}px`,fontSize:s.fs,fontWeight:600,
      lineHeight:1, whiteSpace:"nowrap", ...style }}>
      {dot && <span style={{ width:s.h,height:s.h,borderRadius:"50%",background:"currentColor",flexShrink:0 }}/>}
      {Ic && <Ic size={13}/>}
      {children}
    </span>
  );
}

// ---------- Field + Input ----------
function Field({ label, hint, children, error, optional }){
  return (
    <label style={{ display:"flex", flexDirection:"column", gap:7 }}>
      {label && <span style={{ fontSize:13, fontWeight:600, color:"#4A4458", display:"flex", justifyContent:"space-between" }}>
        <span>{label}</span>{optional && <span style={{ color:"var(--muted-foreground)", fontWeight:500 }}>Optional</span>}</span>}
      {children}
      {error ? <span style={{ fontSize:12, color:"var(--destructive)", fontWeight:600 }}>{error}</span>
        : hint ? <span style={{ fontSize:12, color:"var(--muted-foreground)" }}>{hint}</span> : null}
    </label>
  );
}
function Input({ icon:Ic, suffix, error, style, ...p }){
  const [f,setF]=useState(false);
  return (
    <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
      {Ic && <span style={{ position:"absolute", left:13, color: f?"var(--primary)":"var(--muted-foreground)", display:"flex" }}><Ic size={18}/></span>}
      <input onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{ width:"100%", height:46, padding:`0 ${suffix?44:14}px 0 ${Ic?40:14}px`, fontSize:15,
          borderRadius:"var(--radius-sm)", border:`1.5px solid ${error?"var(--destructive)":(f?"var(--primary)":"var(--border)")}`,
          outline:"none", background:"#fff", color:"var(--foreground)", transition:"border-color .15s, box-shadow .15s",
          boxShadow: f?`0 0 0 3.5px ${error?"#f4c3c855":"color-mix(in srgb,var(--primary) 14%,transparent)"}`:"none", ...style }} {...p}/>
      {suffix && <span style={{ position:"absolute", right:8 }}>{suffix}</span>}
    </div>
  );
}
function Select({ children, style, ...p }){
  const [f,setF]=useState(false);
  return (
    <div style={{ position:"relative" }}>
      <select onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{ width:"100%", height:46, padding:"0 38px 0 14px", fontSize:15, appearance:"none",
          borderRadius:"var(--radius-sm)", border:`1.5px solid ${f?"var(--primary)":"var(--border)"}`, outline:"none",
          background:"#fff", color:"var(--foreground)", cursor:"pointer",
          boxShadow: f?"0 0 0 3.5px color-mix(in srgb,var(--primary) 14%,transparent)":"none", ...style }} {...p}>
        {children}
      </select>
      <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:"var(--muted-foreground)", pointerEvents:"none", display:"flex" }}><I.chevD size={18}/></span>
    </div>
  );
}

// ---------- Toggle ----------
function Toggle({ on, onChange, size=22 }){
  return (
    <button onClick={()=>onChange(!on)} className="no-tap"
      style={{ width:size*1.85, height:size+6, borderRadius:999, border:"none", cursor:"pointer", padding:3,
        background: on?"var(--accent)":"#D6CEE2", transition:"background .2s", display:"flex", alignItems:"center" }}>
      <span style={{ width:size, height:size, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 3px rgba(0,0,0,.25)",
        transform: on?`translateX(${size*0.85}px)`:"none", transition:"transform .2s cubic-bezier(.2,.8,.2,1)" }}/>
    </button>
  );
}

// ---------- Segmented control ----------
function Segmented({ value, onChange, options, full, size="md" }){
  const h = size==="sm"?34:40;
  return (
    <div style={{ display:"inline-flex", background:"var(--muted)", borderRadius:"var(--radius-sm)", padding:4, gap:2,
      width: full?"100%":"auto" }}>
      {options.map(o=>{
        const v=o.value??o, lab=o.label??o, active=v===value;
        return (
          <button key={v} onClick={()=>onChange(v)} className="no-tap"
            style={{ flex: full?1:"none", height:h, padding:"0 16px", border:"none", cursor:"pointer", borderRadius:8,
              background: active?"#fff":"transparent", color: active?"var(--primary)":"var(--muted-foreground)",
              fontWeight: active?700:600, fontSize:13.5, boxShadow: active?"var(--shadow-1)":"none",
              transition:"all .15s ease", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:7 }}>
            {o.icon && <o.icon size={16}/>}{lab}
          </button>
        );
      })}
    </div>
  );
}

// ---------- Spinner ----------
function Spinner({ size=18, color="currentColor", w=2.5 }){
  return <span style={{ width:size, height:size, borderRadius:"50%", display:"inline-block",
    border:`${w}px solid color-mix(in srgb,${color} 22%,transparent)`, borderTopColor:color, animation:"cw-spin .7s linear infinite" }}/>;
}

// ---------- Modal / Sheet ----------
function Overlay({ children, onClose, align="center" }){
  useEffect(()=>{ const k=e=>{ if(e.key==="Escape") onClose&&onClose(); }; window.addEventListener("keydown",k); return ()=>window.removeEventListener("keydown",k); },[onClose]);
  return (
    <div onClick={onClose} className="anim-fade"
      style={{ position:"fixed", inset:0, background:"rgba(16,28,45,.42)", backdropFilter:"blur(3px)", zIndex:80,
        display:"flex", alignItems: align==="center"?"center":"stretch", justifyContent: align==="right"?"flex-end":"center", padding: align==="center"?20:0 }}>
      <div onClick={e=>e.stopPropagation()}>{children}</div>
    </div>
  );
}

// ---------- Empty state ----------
function Empty({ icon:Ic, title, sub }){
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 20px", textAlign:"center", color:"var(--muted-foreground)" }}>
      <div style={{ width:56, height:56, borderRadius:16, background:"var(--muted)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14, color:"#A99DBC" }}>{Ic && <Ic size={26}/>}</div>
      <div style={{ fontWeight:700, color:"#4A4458", fontSize:15 }}>{title}</div>
      {sub && <div style={{ fontSize:13.5, marginTop:4, maxWidth:280 }}>{sub}</div>}
    </div>
  );
}

// ---------- status dot for presence ----------
const PRESENCE = {
  in:{ tone:"success", label:"Clocked in" },
  break:{ tone:"warning", label:"On break" },
  leave:{ tone:"info", label:"On leave" },
  out:{ tone:"neutral", label:"Not in yet" },
};

Object.assign(window, {
  Avatar, Button, IconButton, Card, Pill, PILL_TONES, Field, Input, Select,
  Toggle, Segmented, Spinner, Overlay, Empty, PRESENCE,
});
