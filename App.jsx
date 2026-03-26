import { useState, useEffect, useRef } from "react";

/* =============================================
   제64회 진해 군항제 - React + Vite (Vercel 배포용)
   ============================================= */

// ── 전역 CSS 주입 ──
const injectGlobalStyles = () => {
  if (document.getElementById("jinhae-global")) return;
  const style = document.createElement("style");
  style.id = "jinhae-global";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;500;700;900&family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    html { scroll-behavior:smooth; }
    body { font-family:'Noto Sans KR',sans-serif; overflow-x:hidden; background:#fff; }
    a { text-decoration:none; color:inherit; }
    @keyframes fadeInUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
    @keyframes heroIn   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes bounce   { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-10px)} }
    @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.6} }
    .ji-fade { opacity:0; transform:translateY(24px); transition:opacity .8s ease,transform .8s ease; }
    .ji-fade.visible { opacity:1; transform:translateY(0); }
    .ji-prog-card { background:#fff; border-radius:16px; overflow:hidden;
      box-shadow:0 4px 20px rgba(0,0,0,.06); transition:transform .3s,box-shadow .3s; cursor:pointer; }
    .ji-prog-card:hover { transform:translateY(-6px); box-shadow:0 16px 40px rgba(232,127,160,.2); }
    .ji-prog-card-dark { background:linear-gradient(135deg,#1a2744 0%,#3d1a2e 100%);
      border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,.2);
      transition:transform .3s,box-shadow .3s; cursor:pointer; }
    .ji-prog-card-dark:hover { transform:translateY(-6px); }
    .ji-tour-card { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1);
      border-radius:14px; padding:28px 16px; text-align:center; cursor:pointer;
      transition:all .3s; text-decoration:none; display:block; }
    .ji-tour-card:hover { background:rgba(247,184,200,.1); border-color:#f7b8c8; transform:translateY(-4px); }
    .ji-notice-link { display:flex; align-items:center; gap:10; padding:14px 0;
      text-decoration:none; color:#2a2a2a; font-size:13px; transition:color .2s; }
    .ji-notice-link:hover { color:#e87fa0; }
    @media (max-width:900px) {
      .ji-about-inner { grid-template-columns:1fr !important; gap:40px !important; }
      .ji-notice-inner { grid-template-columns:1fr !important; }
      .ji-footer-inner { grid-template-columns:1fr !important; gap:30px !important; }
      .ji-desktop-nav { display:none !important; }
      .ji-mobile-btn  { display:block !important; }
      .ji-header-social { display:none !important; }
    }
    @media (max-width:600px) {
      .ji-dday-sep { display:none !important; }
      .ji-hero-cta { flex-direction:column; align-items:center; }
    }
  `;
  document.head.appendChild(style);
};

/* ── 벚꽃 캔버스 ── */
function PetalCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const mk = () => ({
      x: Math.random() * canvas.width, y: -20,
      size: Math.random() * 10 + 6,
      sx: Math.random() * 2 - 1, sy: Math.random() * 1.5 + 0.8,
      rot: Math.random() * Math.PI * 2, rs: (Math.random() - 0.5) * 0.04,
      op: Math.random() * 0.5 + 0.3,
      sw: Math.random() * 0.03, st: Math.random() * Math.PI * 2,
      color: Math.random() > 0.3 ? "#f7b8c8" : "#fce4ec",
    });
    const petals = Array.from({ length: 28 }, () => { const p = mk(); p.y = Math.random() * window.innerHeight; return p; });
    const draw = p => {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.globalAlpha = p.op; ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.restore();
    };
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petals.forEach(p => {
        p.st += p.sw; p.x += p.sx + Math.sin(p.st) * 0.8; p.y += p.sy; p.rot += p.rs;
        if (p.y > canvas.height + 20) Object.assign(p, mk());
        draw(p);
      });
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position:"fixed", top:0, left:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:999 }} />;
}

/* ── 카운트다운 훅 ── */
function useCountdown() {
  const calc = () => {
    const s = new Date("2026-03-27T00:00:00"), e = new Date("2026-04-05T23:59:59"), n = new Date();
    if (n >= s && n <= e) return { status:"live" };
    if (n > e) return { status:"ended" };
    const d = s - n;
    return { status:"countdown",
      days: Math.floor(d / 86400000),
      hours: Math.floor((d % 86400000) / 3600000),
      minutes: Math.floor((d % 3600000) / 60000),
      seconds: Math.floor((d % 60000) / 1000),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => { const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id); }, []);
  return t;
}

/* ── 페이드인 훅 ── */
function useFadeIn() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".ji-fade").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });
}

/* ─────────────── HEADER ─────────────── */
function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const go = id => { document.getElementById(id)?.scrollIntoView({ behavior:"smooth" }); setMobileOpen(false); };
  const navItems = [["about","군항제 소개"],["programs","프로그램"],["tour","관광안내"],["notice","알림마당"],["contact","오시는 길"]];

  return (
    <>
      <header style={{
        position:"fixed", top:0, left:0, right:0, zIndex:200,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 40px", height:70,
        background: scrolled ? "rgba(13,20,34,.98)" : "rgba(26,39,68,.92)",
        backdropFilter:"blur(14px)",
        borderBottom:"1px solid rgba(201,168,76,.3)",
        transition:"background .3s",
      }}>
        {/* 로고 */}
        <div style={{ display:"flex", alignItems:"center", gap:14, cursor:"pointer" }} onClick={()=>go("top")}>
          <div style={{ width:44, height:44, border:"2px solid #c9a84c", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>🌸</div>
          <div>
            <span style={{ fontSize:10, color:"#c9a84c", letterSpacing:3, textTransform:"uppercase", display:"block" }}>Jinhae Naval Festival</span>
            <span style={{ fontFamily:"Noto Serif KR,serif", fontSize:15, fontWeight:700, color:"#fff", display:"block" }}>진해 군항제</span>
          </div>
        </div>

        {/* PC 네비 */}
        <nav className="ji-desktop-nav" style={{ display:"flex" }}>
          {navItems.map(([id, label]) => (
            <span key={id} onClick={() => go(id)} style={{ color:"rgba(255,255,255,.8)", fontSize:13, padding:"8px 16px", borderRadius:4, cursor:"pointer", transition:"color .2s" }}
              onMouseEnter={e=>e.target.style.color="#c9a84c"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,.8)"}>{label}</span>
          ))}
        </nav>

        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div className="ji-header-social" style={{ display:"flex", gap:10 }}>
            <a href="https://www.instagram.com/jgfestival" target="_blank" rel="noreferrer" style={{ color:"rgba(255,255,255,.6)", fontSize:18 }}>📸</a>
            <a href="https://www.facebook.com/jgfestival" target="_blank" rel="noreferrer" style={{ color:"rgba(255,255,255,.6)", fontSize:18 }}>👍</a>
          </div>
          <button className="ji-mobile-btn" style={{ display:"none", background:"none", border:"none", color:"#fff", fontSize:26, cursor:"pointer", lineHeight:1 }} onClick={() => setMobileOpen(true)}>☰</button>
        </div>
      </header>

      {/* 모바일 풀스크린 메뉴 */}
      {mobileOpen && (
        <div style={{ position:"fixed", inset:0, background:"rgba(13,20,34,.97)", zIndex:500, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:36 }}>
          <button onClick={()=>setMobileOpen(false)} style={{ position:"absolute", top:24, right:28, background:"none", border:"none", color:"rgba(255,255,255,.6)", fontSize:30, cursor:"pointer" }}>✕</button>
          {navItems.map(([id, label]) => (
            <span key={id} onClick={() => go(id)} style={{ fontFamily:"Noto Serif KR,serif", fontSize:26, color:"#fff", cursor:"pointer", transition:"color .2s" }}
              onMouseEnter={e=>e.target.style.color="#f7b8c8"} onMouseLeave={e=>e.target.style.color="#fff"}>{label}</span>
          ))}
        </div>
      )}
    </>
  );
}

/* ─────────────── HERO ─────────────── */
function Hero() {
  const go = id => document.getElementById(id)?.scrollIntoView({ behavior:"smooth" });
  return (
    <section id="top" style={{
      minHeight:"100vh", paddingTop:70,
      background:"linear-gradient(160deg,#0d1826 0%,#1a2744 40%,#2d1a33 80%,#3d1a2e 100%)",
      display:"flex", alignItems:"center", justifyContent:"center",
      textAlign:"center", position:"relative", overflow:"hidden",
    }}>
      {/* 배경 글로우 */}
      <div style={{ position:"absolute", inset:0, background:`
        radial-gradient(ellipse at 20% 50%,rgba(232,127,160,.18) 0%,transparent 50%),
        radial-gradient(ellipse at 80% 30%,rgba(201,168,76,.12) 0%,transparent 50%),
        radial-gradient(ellipse at 50% 90%,rgba(45,63,110,.5) 0%,transparent 60%)
      `}} />

      {/* 벚꽃 나무 (SVG) */}
      {[false, true].map(flip => (
        <svg key={flip} style={{ position:"absolute", bottom:0, [flip?"right":"left"]:"-30px", opacity:.2, transform:flip?"scaleX(-1)":"none", pointerEvents:"none" }} width="220" height="520" viewBox="0 0 220 520">
          <line x1="110" y1="520" x2="110" y2="300" stroke="#f7b8c8" strokeWidth="9" strokeLinecap="round"/>
          <line x1="110" y1="390" x2="35"  y2="280" stroke="#f7b8c8" strokeWidth="5" strokeLinecap="round"/>
          <line x1="110" y1="350" x2="175" y2="250" stroke="#f7b8c8" strokeWidth="5" strokeLinecap="round"/>
          <circle cx="110" cy="200" r="95" fill="rgba(232,127,160,.3)"/>
          <circle cx="40"  cy="210" r="65" fill="rgba(247,184,200,.2)"/>
          <circle cx="175" cy="175" r="70" fill="rgba(232,127,160,.2)"/>
          <circle cx="85"  cy="130" r="60" fill="rgba(247,184,200,.18)"/>
        </svg>
      ))}

      <div style={{ position:"relative", zIndex:2, animation:"heroIn 1.2s ease both", padding:"50px 20px" }}>
        <div style={{ display:"inline-block", border:"1px solid #c9a84c", color:"#c9a84c", fontSize:11, letterSpacing:4, padding:"6px 22px", marginBottom:28 }}>🌸 봄의 시작 · Spring Festival</div>
        <div style={{ fontFamily:"Noto Serif KR,serif", fontSize:"clamp(18px,4vw,26px)", color:"#f7b8c8", fontWeight:300, letterSpacing:6, marginBottom:14, display:"block" }}>제 64회</div>
        <h1 style={{ fontFamily:"Noto Serif KR,serif", fontSize:"clamp(52px,10vw,108px)", fontWeight:900, color:"#fff", lineHeight:1, marginBottom:10, textShadow:"0 4px 40px rgba(232,127,160,.35)" }}>
          진해<span style={{color:"#f7b8c8"}}>군항제</span>
        </h1>
        <div style={{ fontFamily:"Noto Serif KR,serif", fontSize:"clamp(20px,4.5vw,44px)", fontWeight:300, color:"rgba(255,255,255,.85)", letterSpacing:9, marginBottom:44, display:"block" }}>NAVAL FESTIVAL</div>

        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:46 }}>
          {[
            ["📅","2026년 3월 27일(금) ~ 4월 5일(일)","· 10일간"],
            ["📍","창원시 진해구 중원로터리 및 진해루 등 일원",""],
          ].map(([ic,txt,sub])=>(
            <div key={txt} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, color:"rgba(255,255,255,.85)", fontSize:15, flexWrap:"wrap" }}>
              <span style={{color:"#c9a84c",fontSize:16}}>{ic}</span>
              <span><strong style={{color:"#fff"}}>{txt}</strong> {sub}</span>
            </div>
          ))}
        </div>

        <div className="ji-hero-cta" style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={()=>go("programs")} style={{ background:"#e87fa0", color:"#fff", padding:"14px 38px", fontSize:14, fontWeight:500, border:"none", borderRadius:40, letterSpacing:1, cursor:"pointer", boxShadow:"0 4px 22px rgba(232,127,160,.45)", transition:"all .3s" }}
            onMouseEnter={e=>{e.target.style.transform="translateY(-2px)";e.target.style.boxShadow="0 8px 32px rgba(232,127,160,.55)"}}
            onMouseLeave={e=>{e.target.style.transform="none";e.target.style.boxShadow="0 4px 22px rgba(232,127,160,.45)"}}>
            🎪 프로그램 보기
          </button>
          <button onClick={()=>go("tour")} style={{ border:"1px solid #c9a84c", color:"#c9a84c", padding:"14px 38px", fontSize:14, background:"transparent", borderRadius:40, letterSpacing:1, cursor:"pointer", transition:"all .3s" }}
            onMouseEnter={e=>{e.target.style.background="#c9a84c";e.target.style.color="#1a2744";e.target.style.transform="translateY(-2px)"}}
            onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color="#c9a84c";e.target.style.transform="none"}}>
            🗺 관광안내
          </button>
        </div>
      </div>

      {/* 스크롤 힌트 */}
      <div style={{ position:"absolute", bottom:34, left:"50%", display:"flex", flexDirection:"column", alignItems:"center", gap:8, color:"rgba(255,255,255,.4)", fontSize:11, letterSpacing:2, animation:"bounce 2s infinite" }}>
        <span>SCROLL</span>
        <div style={{ width:1, height:40, background:"linear-gradient(to bottom,rgba(201,168,76,.8),transparent)" }}/>
      </div>
    </section>
  );
}

/* ─────────────── COUNTDOWN ─────────────── */
function Countdown() {
  const t = useCountdown();
  const pad = n => String(n).padStart(2, "0");
  return (
    <div style={{ background:"#1a2744", padding:"52px 40px", textAlign:"center" }}>
      <span style={{ display:"block", color:"#c9a84c", fontSize:11, letterSpacing:4, textTransform:"uppercase", marginBottom:22 }}>🌸 Festival Countdown · 개막까지</span>
      {t.status === "live" && <div style={{ display:"inline-block", background:"#e87fa0", color:"#fff", padding:"10px 28px", borderRadius:40, fontSize:14, fontWeight:500, letterSpacing:2, animation:"pulse 1.5s infinite" }}>🌸 현재 축제가 진행 중입니다! 지금 진해로 오세요!</div>}
      {t.status === "ended" && <span style={{ color:"rgba(255,255,255,.4)", fontSize:18 }}>제64회 진해군항제가 종료되었습니다. 내년에 다시 만나요! 🌸</span>}
      {t.status === "countdown" && (
        <div style={{ display:"flex", justifyContent:"center", gap:36, flexWrap:"wrap", alignItems:"center" }}>
          {[["일",t.days],["시간",pad(t.hours)],["분",pad(t.minutes)],["초",pad(t.seconds)]].map(([label,val],i)=>(
            <>
              <div key={label} style={{ textAlign:"center" }}>
                <span style={{ fontFamily:"Noto Serif KR,serif", fontSize:"clamp(44px,8vw,76px)", fontWeight:700, color:"#f7b8c8", lineHeight:1, display:"block" }}>{val}</span>
                <span style={{ color:"rgba(255,255,255,.5)", fontSize:12, letterSpacing:2, marginTop:4, display:"block" }}>{label.toUpperCase()}</span>
              </div>
              {i < 3 && <span key={`sep-${i}`} className="ji-dday-sep" style={{ fontSize:60, color:"rgba(255,255,255,.12)", display:"flex", alignItems:"center" }}>:</span>}
            </>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────── ABOUT ─────────────── */
function About() {
  return (
    <section id="about" style={{ background:"#fff", padding:"100px 40px" }}>
      <div className="ji-about-inner" style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"center" }}>

        {/* 비주얼 */}
        <div className="ji-fade" style={{ position:"relative" }}>
          <div style={{ background:"linear-gradient(135deg,#1a2744 0%,#2d3f6e 50%,#4a2050 100%)", borderRadius:20, height:380, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", position:"relative" }}>
            <span style={{ fontFamily:"Noto Serif KR,serif", fontSize:130, fontWeight:900, color:"rgba(255,255,255,.06)", position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", userSelect:"none" }}>64</span>
            <div style={{ position:"relative", zIndex:1, textAlign:"center" }}>
              <span style={{ fontFamily:"Noto Serif KR,serif", fontSize:56, fontWeight:900, color:"#fff", display:"block", lineHeight:1 }}>64<span style={{fontSize:26}}>회</span></span>
              <span style={{ fontSize:15, color:"#c9a84c", letterSpacing:3, marginTop:8, display:"block" }}>SINCE 1963</span>
              <span style={{ color:"rgba(255,255,255,.35)", fontSize:12, letterSpacing:2, marginTop:10, display:"block" }}>진해 군항제</span>
            </div>
            <span style={{ position:"absolute", top:18, left:22, fontSize:40, opacity:.6 }}>🌸</span>
            <span style={{ position:"absolute", bottom:22, right:28, fontSize:40, opacity:.6 }}>🌸</span>
          </div>
          <div style={{ position:"absolute", bottom:-22, right:-22, background:"#e87fa0", color:"#fff", borderRadius:"50%", width:92, height:92, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:600, textAlign:"center", boxShadow:"0 8px 26px rgba(232,127,160,.45)", lineHeight:1.4 }}>
            <span style={{fontSize:22}}>🏆</span><span>한국<br/>3대 축제</span>
          </div>
        </div>

        {/* 텍스트 */}
        <div className="ji-fade">
          <h2 style={{ fontFamily:"Noto Serif KR,serif", fontSize:"clamp(26px,4vw,38px)", fontWeight:700, color:"#1a2744", marginBottom:24, lineHeight:1.35 }}>
            대한민국 최대<br/><em style={{color:"#e87fa0",fontStyle:"normal"}}>벚꽃 축제</em>의 봄
          </h2>
          <p style={{ color:"#666", fontSize:15, lineHeight:1.95, marginBottom:18 }}>
            해마다 봄이 되면 진해는 하얀 벚꽃으로 뒤덮입니다. 국내 최대 규모의 벚꽃 축제인 진해군항제는 1963년부터 이어져 온 유서 깊은 행사로, 매년 100만 명 이상의 관광객이 찾는 대한민국을 대표하는 봄 축제입니다.
          </p>
          <p style={{ color:"#666", fontSize:15, lineHeight:1.95 }}>
            군항의 도시 진해에서 만개한 벚꽃과 함께 다양한 문화 공연, 군악의장 퍼레이드, 체리블라썸 뮤직 페스티벌 등 풍성한 프로그램을 즐겨보세요.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginTop:38 }}>
            {[["64회","축제 역사"],["10일간","행사 기간"],["100만+","연간 방문객"],["360만주","벚나무"]].map(([n,l])=>(
              <div key={l} style={{ borderLeft:"3px solid #f7b8c8", paddingLeft:16 }}>
                <span style={{ fontFamily:"Noto Serif KR,serif", fontSize:28, fontWeight:700, color:"#1a2744", display:"block" }}>{n}</span>
                <span style={{ fontSize:12, color:"#999", marginTop:2, display:"block" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── PROGRAMS ─────────────── */
function Programs() {
  const list = [
    { icon:"🎵", title:"체리블라썸 뮤직 페스티벌", desc:"흩날리는 벚꽃 속에서 트롯, K-POP, 밴드 음악까지 전 세대를 아우르는 봄을 여는 뮤직 페스티벌!", date:"2026.04.03(금)~04.05(일)", place:"진해공설운동장" },
    { icon:"🍺", title:"군항 빌리지", desc:"전국의 유명 맛집 음식과 맥주가 어우러진 특별한 먹거리 공간으로, 다양한 플리마켓도 함께 즐기세요.", date:"2026.03.27(금)~04.05(일)", place:"중원로터리 ~ 창범슈퍼" },
    { icon:"🛍", title:"군항 브랜드 페어", desc:"벚꽃과 바다 향기 속에서 전국의 생활·잡화·농수산물 등 다양한 상품을 직접 보고 맛보고 즐기는 특별한 장터", date:"2026.03.27(금)~04.05(일)", place:"중원로터리 ~ 미진이지비아APT" },
    { icon:"🌙", title:"군항 나이트 페스타", desc:"진해군항제의 밤을 열기로 가득 채울 야간 축제! 화려한 조명과 라이브 공연이 펼쳐집니다.", date:"2026.03.30(월)~04.05(일) 19:00~21:00", place:"중원로터리" },
    { icon:"⚓", title:"군부대 개방행사", desc:"군복 체험, 군 장비 탑승 체험, 무기체계 체험 등 다양한 이벤트! 해군의 특별한 세계로 초대합니다.", date:"2026.03.28(토)~04.05(일)", place:"해군사관학교, 진해기지사령부" },
    { icon:"🥁", title:"진해군악의장 페스티벌", desc:"대한민국 해군의 화려한 군악·의장 퍼레이드! 블라썸 퍼레이드로 진해의 봄을 수놓습니다.", date:"축제 기간 중 진행", place:"진해 일원", dark:true },
  ];
  return (
    <section id="programs" style={{ background:"#fdf0f4", padding:"100px 40px" }}>
      <div className="ji-fade" style={{ textAlign:"center", marginBottom:70 }}>
        <span style={{ display:"inline-block", color:"#e87fa0", fontSize:11, letterSpacing:4, textTransform:"uppercase", marginBottom:12 }}>Programs · 행사 안내</span>
        <h2 style={{ fontFamily:"Noto Serif KR,serif", fontSize:"clamp(28px,5vw,44px)", fontWeight:700, color:"#1a2744", marginBottom:16 }}>진해군항제 주요 프로그램</h2>
        <p style={{ color:"#888", fontSize:15 }}>봄 벚꽃과 함께하는 다양한 문화 공연과 특별 이벤트를 만나보세요</p>
        <div style={{ width:60, height:2, background:"linear-gradient(to right,#e87fa0,#c9a84c)", margin:"20px auto 0" }}/>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:24, maxWidth:1200, margin:"0 auto" }}>
        {list.map(p => (
          <div key={p.title} className={p.dark ? "ji-prog-card-dark ji-fade" : "ji-prog-card ji-fade"}>
            <div style={{ padding:"28px 28px 16px", borderBottom: p.dark ? "1px solid rgba(255,255,255,.08)" : "1px solid rgba(0,0,0,.05)" }}>
              <div style={{ width:50, height:50, background: p.dark ? "linear-gradient(135deg,#f0d080,#c9a84c)" : "linear-gradient(135deg,#f7b8c8,#e87fa0)", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:16 }}>{p.icon}</div>
              <h3 style={{ fontFamily:"Noto Serif KR,serif", fontSize:18, fontWeight:700, color: p.dark ? "#fff" : "#1a2744", marginBottom:6 }}>{p.title}</h3>
            </div>
            <div style={{ padding:"16px 28px 28px" }}>
              <p style={{ color: p.dark ? "rgba(255,255,255,.6)" : "#666", fontSize:13, lineHeight:1.75, marginBottom:16 }}>{p.desc}</p>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {[["일시",p.date],["장소",p.place]].map(([label,val])=>(
                  <div key={label} style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:12, color: p.dark ? "rgba(255,255,255,.5)" : "#888" }}>
                    <span style={{ color: p.dark ? "#c9a84c" : "#e87fa0", fontWeight:600, minWidth:28, flexShrink:0 }}>{label}</span>
                    <span>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────── TOUR ─────────────── */
function Tour() {
  const items = [
    { icon:"🌸", name:"벚꽃 개화상황", url:"https://www.changwon.go.kr/cwportal/depart/11063/11090/15284.web" },
    { icon:"🏛", name:"부대 개방", url:"https://www.jgfestival.or.kr" },
    { icon:"🚌", name:"교통안내",  url:"https://www.jgfestival.or.kr" },
    { icon:"🏨", name:"숙박안내",  url:"https://changwon.go.kr/tour/index.do" },
    { icon:"🍜", name:"식당안내",  url:"https://changwon.go.kr/tour/index.do" },
    { icon:"🗺", name:"창원관광안내", url:"https://changwon.go.kr/tour/index.do" },
  ];
  return (
    <section id="tour" style={{ background:"#1a2744", padding:"100px 40px" }}>
      <div className="ji-fade" style={{ textAlign:"center", marginBottom:70 }}>
        <span style={{ display:"inline-block", color:"#c9a84c", fontSize:11, letterSpacing:4, textTransform:"uppercase", marginBottom:12 }}>Tourism · 관광 정보</span>
        <h2 style={{ fontFamily:"Noto Serif KR,serif", fontSize:"clamp(28px,5vw,44px)", fontWeight:700, color:"#fff", marginBottom:16 }}>관광안내</h2>
        <div style={{ width:60, height:2, background:"linear-gradient(to right,#e87fa0,#c9a84c)", margin:"20px auto 0" }}/>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:16, maxWidth:1000, margin:"0 auto" }}>
        {items.map(item => (
          <a key={item.name} className="ji-tour-card ji-fade" href={item.url} target="_blank" rel="noreferrer">
            <span style={{ fontSize:32, marginBottom:12, display:"block" }}>{item.icon}</span>
            <div style={{ color:"#fff", fontSize:13, fontWeight:500 }}>{item.name}</div>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ─────────────── NOTICE ─────────────── */
function Notice() {
  const notices = [
    { text:'제64회 진해군항제 「블라썸심포니」 TIME 안내', url:"https://www.jgfestival.or.kr/bbs/board.php?bo_table=notice&wr_id=118", isNew:true },
    { text:'「군항AI 영상 공모전」 결과 안내', url:"https://www.jgfestival.or.kr/bbs/board.php?bo_table=notice&wr_id=117", isNew:true },
    { text:'「경화역 런웨이」 선정 결과 발표', url:"https://www.jgfestival.or.kr/bbs/board.php?bo_table=notice&wr_id=116" },
    { text:'2026 진해군악의장페스티벌 「블라썸 퍼레이드」 안내', url:"https://www.jgfestival.or.kr/bbs/board.php?bo_table=notice&wr_id=115" },
  ];
  const press = [
    { text:'제63회 진해군항제 보도자료', url:"https://www.jgfestival.or.kr/bbs/board.php?bo_table=press&wr_id=7" },
    { text:'제62회 진해군항제 보도 폐막 자료', url:"https://www.jgfestival.or.kr/bbs/board.php?bo_table=press&wr_id=6" },
    { text:'제62회 진해군항제 개막 전 보도 자료', url:"https://www.jgfestival.or.kr/bbs/board.php?bo_table=press&wr_id=5" },
    { text:'제61회 진해군항제 보도 폐막 자료', url:"https://www.jgfestival.or.kr/bbs/board.php?bo_table=press&wr_id=4" },
  ];
  return (
    <section id="notice" style={{ background:"#fdf0f4", padding:"100px 40px" }}>
      <div className="ji-fade" style={{ textAlign:"center", marginBottom:70 }}>
        <span style={{ display:"inline-block", color:"#e87fa0", fontSize:11, letterSpacing:4, textTransform:"uppercase", marginBottom:12 }}>Notice · 알림마당</span>
        <h2 style={{ fontFamily:"Noto Serif KR,serif", fontSize:"clamp(28px,5vw,44px)", fontWeight:700, color:"#1a2744", marginBottom:16 }}>공지 및 언론보도</h2>
        <div style={{ width:60, height:2, background:"linear-gradient(to right,#e87fa0,#c9a84c)", margin:"20px auto 0" }}/>
      </div>
      <div className="ji-notice-inner ji-fade" style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:40 }}>
        {[["📢 공지사항", notices],["📰 언론보도", press]].map(([title, list]) => (
          <div key={title}>
            <div style={{ fontFamily:"Noto Serif KR,serif", fontSize:20, fontWeight:700, color:"#1a2744", marginBottom:20, paddingBottom:12, borderBottom:"2px solid #f7b8c8" }}>{title}</div>
            <ul style={{ listStyle:"none" }}>
              {list.map(item => (
                <li key={item.url} style={{ borderBottom:"1px solid rgba(0,0,0,.07)" }}>
                  <a className="ji-notice-link" href={item.url} target="_blank" rel="noreferrer">
                    <span style={{ width:6, height:6, background:"#e87fa0", borderRadius:"50%", flexShrink:0, display:"inline-block" }}/>
                    {item.isNew && <span style={{ background:"#e87fa0", color:"#fff", fontSize:9, padding:"2px 6px", borderRadius:3, flexShrink:0 }}>NEW</span>}
                    <span>{item.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────── CONTACT ─────────────── */
function Contact() {
  const info = [
    { icon:"🚌", title:"대중교통", desc:"창원중앙역 → 버스 이용\n부산역 → 직행버스 운행" },
    { icon:"🚗", title:"자가용", desc:"남해고속도로 진해IC 이용\n주차장 사전 확인 권장" },
    { icon:"🚐", title:"셔틀버스", desc:"공식 셔틀버스 운행\n카카오모빌리티 사전예약" },
    { icon:"📞", title:"문의", desc:"055-546-4310\n055-542-8222" },
  ];
  return (
    <section id="contact" style={{ background:"#fff", padding:"100px 40px" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <div className="ji-fade" style={{ textAlign:"center", marginBottom:60 }}>
          <span style={{ display:"inline-block", color:"#e87fa0", fontSize:11, letterSpacing:4, textTransform:"uppercase", marginBottom:12 }}>Location · 오시는 길</span>
          <h2 style={{ fontFamily:"Noto Serif KR,serif", fontSize:"clamp(28px,5vw,44px)", fontWeight:700, color:"#1a2744", marginBottom:16 }}>행사장 안내</h2>
          <p style={{ color:"#888", fontSize:15 }}>창원시 진해구 중원로터리 및 진해루 일원에서 펼쳐집니다</p>
          <div style={{ width:60, height:2, background:"linear-gradient(to right,#e87fa0,#c9a84c)", margin:"20px auto 0" }}/>
        </div>
        <div className="ji-fade" style={{ borderRadius:16, overflow:"hidden", boxShadow:"0 8px 32px rgba(0,0,0,.1)", marginBottom:36 }}>
          <iframe
            src="https://map.kakao.com/link/embed/map/진해중원로터리,35.1378,128.6940"
            width="100%" height="340" frameBorder="0" title="행사장 위치" style={{display:"block"}}
          />
        </div>
        <div className="ji-fade" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))", gap:18 }}>
          {info.map(item => (
            <div key={item.title} style={{ background:"#fdf0f4", borderRadius:14, padding:24, display:"flex", gap:16, alignItems:"flex-start" }}>
              <div style={{ width:44, height:44, background:"#e87fa0", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{item.icon}</div>
              <div>
                <h4 style={{ fontSize:13, fontWeight:600, color:"#1a2744", marginBottom:6 }}>{item.title}</h4>
                <p style={{ fontSize:12, color:"#888", lineHeight:1.7, whiteSpace:"pre-line" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── FOOTER ─────────────── */
function Footer() {
  const go = id => document.getElementById(id)?.scrollIntoView({ behavior:"smooth" });
  const links = [["군항제 소개","about"],["주요 프로그램","programs"],["관광안내","tour"],["공지사항","notice"]];
  return (
    <footer style={{ background:"#0d1422", color:"rgba(255,255,255,.5)", padding:"60px 40px 40px" }}>
      <div className="ji-footer-inner" style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:50 }}>
        <div>
          <span style={{ fontFamily:"Noto Serif KR,serif", fontSize:16, fontWeight:700, color:"#fff", marginBottom:14, display:"block" }}>🌸 진해 군항제</span>
          <p style={{ fontSize:12, lineHeight:2 }}>
            <span style={{color:"rgba(255,255,255,.7)"}}>주소</span> 창원시 진해구 백구로 41-1<br/>
            <span style={{color:"rgba(255,255,255,.7)"}}>전화</span> 055-546-4310, 055-542-8222<br/>
            <span style={{color:"rgba(255,255,255,.7)"}}>이메일</span> syh4310@hanmail.net<br/>
            <span style={{color:"rgba(255,255,255,.7)"}}>사업자</span> 609-82-03101
          </p>
        </div>
        <div>
          <span style={{ color:"#c9a84c", fontSize:11, letterSpacing:3, textTransform:"uppercase", marginBottom:16, display:"block" }}>Quick Links</span>
          <ul style={{ listStyle:"none" }}>
            {links.map(([l,id])=>(
              <li key={id} style={{ marginBottom:8 }}>
                <span onClick={()=>go(id)} style={{ color:"rgba(255,255,255,.5)", fontSize:13, cursor:"pointer", transition:"color .2s" }}
                  onMouseEnter={e=>e.target.style.color="#f7b8c8"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,.5)"}>{l}</span>
              </li>
            ))}
            <li><a href="https://www.jgfestival.or.kr" target="_blank" rel="noreferrer" style={{ color:"rgba(255,255,255,.5)", fontSize:13 }}>공식 홈페이지 →</a></li>
          </ul>
        </div>
        <div>
          <span style={{ color:"#c9a84c", fontSize:11, letterSpacing:3, textTransform:"uppercase", marginBottom:16, display:"block" }}>Follow Us</span>
          <div style={{ display:"flex", gap:12, marginBottom:20 }}>
            {[["https://www.instagram.com/jgfestival","📸","Instagram"],["https://www.facebook.com/jgfestival","👍","Facebook"]].map(([href,icon,title])=>(
              <a key={title} href={href} target="_blank" rel="noreferrer" title={title}
                style={{ width:40, height:40, border:"1px solid rgba(255,255,255,.12)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,.5)", fontSize:17, transition:"all .2s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#f7b8c8";e.currentTarget.style.color="#f7b8c8"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.12)";e.currentTarget.style.color="rgba(255,255,255,.5)"}}>
                {icon}
              </a>
            ))}
          </div>
          <p style={{ fontSize:12, lineHeight:1.9 }}>사단법인 이충무공선양군항제위원회<br/>대표 : 김환태</p>
        </div>
      </div>
      <div style={{ maxWidth:1100, margin:"38px auto 0", paddingTop:22, borderTop:"1px solid rgba(255,255,255,.06)", display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:11, flexWrap:"wrap", gap:10 }}>
        <span>Copyright © 2026 진해 군항제. All rights reserved.</span>
        <span style={{color:"rgba(255,255,255,.25)"}}>🌸 제64회 진해 군항제 2026.03.27 ~ 04.05</span>
      </div>
    </footer>
  );
}

/* ─────────────── APP ─────────────── */
export default function App() {
  useEffect(() => { injectGlobalStyles(); }, []);
  useFadeIn();
  return (
    <div style={{ fontFamily:"Noto Sans KR,sans-serif", overflowX:"hidden" }}>
      <PetalCanvas />
      <Header />
      <Hero />
      <Countdown />
      <About />
      <Programs />
      <Tour />
      <Notice />
      <Contact />
      <Footer />
    </div>
  );
}
