// icons.jsx — line icon set (24x24, currentColor, stroke 2). Exported to window.
const Svg = ({ children, size = 20, sw = 2, fill = "none", style, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style} {...p}>
    {children}
  </svg>
);

const I = {
  clock: (p) => <Svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Svg>,
  home: (p) => <Svg {...p}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/></Svg>,
  history: (p) => <Svg {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 4v4h4"/><path d="M12 8v4l3 2"/></Svg>,
  calendar: (p) => <Svg {...p}><rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/></Svg>,
  users: (p) => <Svg {...p}><circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3.2 3.2 0 0 1 0 6.1"/><path d="M17.5 14.4a5.5 5.5 0 0 1 3 5.1"/></Svg>,
  user: (p) => <Svg {...p}><circle cx="12" cy="8" r="3.6"/><path d="M5 20a7 7 0 0 1 14 0"/></Svg>,
  camera: (p) => <Svg {...p}><path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.2l1-1.6A1.5 1.5 0 0 1 9 3.7h6a1.5 1.5 0 0 1 1.3.7l1 1.6h1.2A2.5 2.5 0 0 1 21 8.5v9A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5z"/><circle cx="12" cy="13" r="3.6"/></Svg>,
  upload: (p) => <Svg {...p}><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M5 20h14"/></Svg>,
  image: (p) => <Svg {...p}><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.8"/><path d="m4 18 5-5 4 3.5 3-2.5 4 4"/></Svg>,
  mapPin: (p) => <Svg {...p}><path d="M12 22s7-5.5 7-12a7 7 0 1 0-14 0c0 6.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.6"/></Svg>,
  check: (p) => <Svg {...p}><path d="m20 6-11 11-5-5"/></Svg>,
  checkCircle: (p) => <Svg {...p}><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/></Svg>,
  x: (p) => <Svg {...p}><path d="M6 6l12 12M18 6 6 18"/></Svg>,
  chevR: (p) => <Svg {...p}><path d="m9 5 7 7-7 7"/></Svg>,
  chevL: (p) => <Svg {...p}><path d="m15 5-7 7 7 7"/></Svg>,
  chevD: (p) => <Svg {...p}><path d="m5 9 7 7 7-7"/></Svg>,
  arrowR: (p) => <Svg {...p}><path d="M4 12h16M14 6l6 6-6 6"/></Svg>,
  arrowL: (p) => <Svg {...p}><path d="M20 12H4M10 6l-6 6 6 6"/></Svg>,
  search: (p) => <Svg {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></Svg>,
  plus: (p) => <Svg {...p}><path d="M12 5v14M5 12h14"/></Svg>,
  filter: (p) => <Svg {...p}><path d="M3 5h18l-7 8v6l-4 2v-8z"/></Svg>,
  bell: (p) => <Svg {...p}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></Svg>,
  logout: (p) => <Svg {...p}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 17l5-5-5-5M15 12H3"/></Svg>,
  settings: (p) => <Svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.2A1.6 1.6 0 0 0 7 19.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.2A1.6 1.6 0 0 0 4.7 7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V3a2 2 0 1 1 4 0v.2A1.6 1.6 0 0 0 17 4.7l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.4 1.8z"/></Svg>,
  briefcase: (p) => <Svg {...p}><rect x="3" y="7.5" width="18" height="12.5" rx="2.5"/><path d="M8 7.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5M3 13h18"/></Svg>,
  mail: (p) => <Svg {...p}><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/></Svg>,
  phone: (p) => <Svg {...p}><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L16 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></Svg>,
  lock: (p) => <Svg {...p}><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/></Svg>,
  eye: (p) => <Svg {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></Svg>,
  eyeOff: (p) => <Svg {...p}><path d="M3 3l18 18"/><path d="M10.6 6.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-3.3 4M6.3 7.8A18 18 0 0 0 2 12s3.5 7 10 7a10.6 10.6 0 0 0 4.2-.8"/><path d="M9.5 10.5a3 3 0 0 0 4 4"/></Svg>,
  sun: (p) => <Svg {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/></Svg>,
  moon: (p) => <Svg {...p}><path d="M20 13.5A8 8 0 1 1 10.5 4 6.5 6.5 0 0 0 20 13.5z"/></Svg>,
  coffee: (p) => <Svg {...p}><path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 10h2.5a2.5 2.5 0 0 1 0 5H17"/><path d="M7 3v2M11 3v2"/></Svg>,
  trend: (p) => <Svg {...p}><path d="m3 16 5-5 4 4 8-8"/><path d="M15 7h6v6"/></Svg>,
  edit: (p) => <Svg {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></Svg>,
  trash: (p) => <Svg {...p}><path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-9 0 1 13a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-13"/></Svg>,
  dots: (p) => <Svg {...p}><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></Svg>,
  grid: (p) => <Svg {...p}><rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/></Svg>,
  list: (p) => <Svg {...p}><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/></Svg>,
  shield: (p) => <Svg {...p}><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/></Svg>,
  info: (p) => <Svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></Svg>,
  alert: (p) => <Svg {...p}><path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/></Svg>,
  download: (p) => <Svg {...p}><path d="M12 4v11m0 0 5-5m-5 5-5-5"/><path d="M5 20h14"/></Svg>,
  refresh: (p) => <Svg {...p}><path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v5h-5"/></Svg>,
  zap: (p) => <Svg {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></Svg>,
  flame: (p) => <Svg {...p}><path d="M12 3c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1.2.4-2 .8-2.6C9 9.8 9 8 8 7c3 .5 3.5-2.5 4-4z"/></Svg>,
  star: (p) => <Svg {...p}><path d="m12 3 2.6 5.6 6 .8-4.4 4.2 1.1 6L12 17l-5.3 2.6 1.1-6L3.4 9.4l6-.8z"/></Svg>,
};

window.I = I;
window.Svg = Svg;
