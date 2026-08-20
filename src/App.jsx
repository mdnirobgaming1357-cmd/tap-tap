/**
 * ============================================================
 *  Earn Wallet — React Frontend (Graphite & Emerald Premium UI)
 *  Language: English
 *  Currency: USDT ($)
 *  API: https://www.gajarbotol.site/nirob/api.php
 * ============================================================
 *  CHANGES:
 *   1. Tap system now uses LOCAL counter (no server call per tap).
 *   2. Claim button appears after 1000 taps (configurable via tapBatchSize).
 *   3. One API call to claim the batch reward.
 *   4. Balance card restored on Home.
 *   5. Withdrawal success uses a modal (not full-screen).
 * ============================================================
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
//  CONFIG
// ============================================================
const API_URL = "https://www.gajarbotol.site/nirob/config11.php";

// ============================================================
//  Premium icon set — clean inline-SVG line icons
// ============================================================
function mkIcon(inner, vb = "0 0 24 24") {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" fill="none" stroke="#e7f3ee" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const ICONS = {
  home:     mkIcon('<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9h13v-9"/><path d="M10 19v-5h4v5"/>'),
  earn:     mkIcon('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v9M9.3 9.3c0-1.1 1.2-1.8 2.7-1.8 1.7 0 2.8.9 2.8 2 0 1.3-1.2 1.7-2.8 2.1-1.6.4-2.9.9-2.9 2.2 0 1.1 1.2 2 2.9 2 1.5 0 2.7-.7 2.7-1.8"/>'),
  withdraw: mkIcon('<path d="M12 4v11"/><path d="M7.5 11 12 15.5 16.5 11"/><path d="M4.5 17.5h15v3h-15z"/>'),
  bolt:     mkIcon('<path d="M13 3 5 14h6l-1 7 8-11h-6z"/>'),
  gift:     mkIcon('<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M4 9h16v4H4z"/><path d="M12 9v11"/><path d="M12 9C10.5 6 8 6 7 7c-1 1 0 2 2 2M12 9c1.5-3 4-3 5-2 1 1 0 2-2 2"/>'),
  star:     mkIcon('<path d="M12 3.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6z"/>'),
  fire:     mkIcon('<path d="M12 21c4 0 6.5-2.6 6.5-6 0-2.7-1.6-4.3-2.6-6-.4 1.6-1.3 2.2-2 1.6.6-3-1-5.4-2.9-6.6.4 2.3-.7 4-2.3 5.4-1.7 1.5-3.2 3.4-3.2 5.6 0 3.4 2.5 6 6.5 6z"/>'),
  chart:    mkIcon('<path d="M4 19V10M10 19V5M16 19v-7M21 19H3"/>'),
  coin:     mkIcon('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v9M9.3 9.3c0-1.1 1.2-1.8 2.7-1.8 1.7 0 2.8.9 2.8 2 0 1.3-1.2 1.7-2.8 2.1-1.6.4-2.9.9-2.9 2.2 0 1.1 1.2 2 2.9 2 1.5 0 2.7-.7 2.7-1.8"/>'),
  check:    mkIcon('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/>'),
  tv:       mkIcon('<rect x="3" y="5" width="18" height="12.5" rx="1.5"/><path d="M9 21h6M12 17.5V21"/><path d="M10 9.3v3.9l3.3-1.95z"/>'),
  bell:     mkIcon('<path d="M6 10.5a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14.5 6 10.5Z"/><path d="M10 19a2 2 0 0 0 4 0"/>'),
  share:    mkIcon('<circle cx="18" cy="6" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8 15.8 7.2M8.2 13.2l7.6 3.6"/>'),
  rocket:   mkIcon('<path d="M12 3c3.5 1.2 5.5 4.4 5.5 8.5 0 2-1 4-1 4l-2 1.5-2-1.5-2 1.5-2-1.5s-1-2-1-4C7.5 7.4 9.5 4.2 12 3Z"/><circle cx="12" cy="10" r="1.6"/><path d="M9 16.5 7 21l3-1.5M15 16.5l2 4.5-3-1.5"/>'),
  clock:    mkIcon('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.3 2"/>'),
  lock:     mkIcon('<rect x="5.5" y="11" width="13" height="9" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  trophy:   mkIcon('<path d="M7 4h10v5a5 5 0 0 1-10 0Z"/><path d="M7 5.5H4a3.5 3.5 0 0 0 3.5 3.5M17 5.5h3a3.5 3.5 0 0 1-3.5 3.5"/><path d="M12 14v3M9 20h6M8.5 20c0-1.7 1.5-3 3.5-3s3.5 1.3 3.5 3"/>'),
  target:   mkIcon('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="#e7f3ee"/>'),
  gem:      mkIcon('<path d="M5 9 9 3h6l4 6-7 12z"/><path d="M5 9h14M9 3l1.5 6L12 21l1.5-12L15 3"/>'),
  users:    mkIcon('<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><circle cx="17" cy="9.5" r="2.5"/><path d="M15 19c0-2.3 1.7-4.2 4-4.7"/>'),
  hand:     mkIcon('<path d="M9 12V5.5a1.5 1.5 0 0 1 3 0V11"/><path d="M12 11V4.5a1.5 1.5 0 0 1 3 0V11"/><path d="M15 11V6a1.5 1.5 0 0 1 3 0v8c0 3.3-2.5 6-6.5 6-2.6 0-4-1-5-2.3L3.7 14a1.4 1.4 0 0 1 2-2L9 15"/>'),
  pickaxe:  mkIcon('<path d="M4.5 4.5c3.5 0 7 1.6 9.3 4.5M19.5 4.5c-3.5 0-7 1.6-9.3 4.5"/><path d="M9.2 9.5 3.5 15.2a1.6 1.6 0 0 0 0 2.3l1 1a1.6 1.6 0 0 0 2.3 0L12.5 12.8"/>'),
};

// ============================================================
//  GLOBAL CSS — Graphite & Emerald Premium Design
// ============================================================
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  :root {
    --bg: #0a0d10;
    --surface: #10151a;
    --surface2: #171e24;
    --surface3: #202931;
    --text: #eef3f1;
    --text-dim: #7d8b8f;
    --text-mid: #aab8bb;
    --border: #1b2328;
    --border2: #263038;
    --primary: #16b88a;
    --primary2: #34d1a0;
    --primary3: #7fe6c4;
    --gold: #d4a24c;
    --gold2: #b8842f;
    --green: #34d1a0;
    --warning: #e8b84b;
    --danger: #f2685c;
    --grad-a: #0d8f6a;
    --grad-b: #16b88a;
    --grad-c: #34d1a0;
    --radius-lg: 24px;
    --radius-md: 16px;
    --radius-sm: 12px;
    --glow-violet: 0 10px 44px rgba(22,184,138,0.28);
    --glow-violet-strong: 0 16px 64px rgba(22,184,138,0.44);
    --shadow-card: 0 6px 24px rgba(0,0,0,0.4);
  }

  * { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
  html { background: var(--bg); }
  body {
    background:
      radial-gradient(1200px 600px at 50% -10%, rgba(22,184,138,0.13) 0%, transparent 60%),
      radial-gradient(900px 500px at 100% 110%, rgba(212,162,76,0.08) 0%, transparent 55%),
      var(--bg);
    color:var(--text); font-family:'Inter',sans-serif; overflow-x:hidden;
  }
  #root { max-width:480px; margin:0 auto; min-height:100vh; padding-bottom:100px; position:relative; }

  /* ===================== LOADER ===================== */
  .loader-overlay {
    position:fixed; inset:0; background:var(--bg); z-index:9999;
    display:flex; flex-direction:column;
    justify-content:center; align-items:center;
    transition:opacity 0.6s ease, transform 0.6s ease;
  }
  .loader-bg-glow {
    position:absolute; inset:0;
    background: radial-gradient(ellipse at center, rgba(22,184,138,0.2) 0%, transparent 62%);
    animation: pulseGlowViolet 2.6s ease-in-out infinite alternate;
  }
  @keyframes pulseGlowViolet {
    0% { opacity:0.35; transform:scale(0.8); }
    100% { opacity:1; transform:scale(1.25); }
  }
  .loader-gem-container {
    position:relative; z-index:2; width:160px; height:160px;
    display:flex; align-items:center; justify-content:center;
  }
  .orbit-ring {
    position:absolute; border-radius:50%;
    border:1.5px solid rgba(22,184,138,0.22);
  }
  .orbit-ring.r1 { width:160px; height:160px; animation:orbitSpin 4s linear infinite; border-top-color:var(--primary2); }
  .orbit-ring.r2 { width:120px; height:120px; animation:orbitSpin 3s linear infinite reverse; border-right-color:var(--gold); }
  .orbit-ring.r3 { width:86px; height:86px; animation:orbitSpin 5.5s linear infinite; border-bottom-color:var(--primary3); }
  @keyframes orbitSpin {
    from { transform:rotate(0deg); }
    to   { transform:rotate(360deg); }
  }
  .gem-svg {
    width:64px; height:64px; position:relative; z-index:2;
    filter: drop-shadow(0 0 22px rgba(22,184,138,0.85)) drop-shadow(0 0 44px rgba(212,162,76,0.35));
    animation: gemFloat 2.2s ease-in-out infinite;
  }
  @keyframes gemFloat {
    0%,100% { transform:translateY(0) scale(1); }
    50% { transform:translateY(-6px) scale(1.06); }
  }
  .orbit-dot {
    position:absolute; width:7px; height:7px; border-radius:50%;
    background:var(--gold2); box-shadow:0 0 12px rgba(212,162,76,0.9);
    top:-3.5px; left:50%; margin-left:-3.5px;
  }
  .loader-progress-wrap {
    position:relative; z-index:2;
    margin-top:46px;
    display:flex; flex-direction:column; align-items:center; gap:16px;
    width:85%; max-width:280px;
  }
  .loader-progress-bar {
    width:100%; height:8px;
    background:rgba(255,255,255,0.06);
    border-radius:10px;
    overflow:hidden;
    box-shadow:inset 0 2px 4px rgba(0,0,0,0.6), 0 0 20px rgba(22,184,138,0.15);
    border:1px solid rgba(22,184,138,0.15);
  }
  .loader-progress-fill {
    height:100%;
    background:linear-gradient(90deg, var(--grad-a), var(--grad-b), var(--grad-c), var(--grad-a));
    background-size:200% 100%;
    border-radius:10px;
    transition:width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow:0 0 22px rgba(22,184,138,0.5), inset 0 1px 2px rgba(255,255,255,0.2);
    width:0%;
    animation: gradientShift 2s linear infinite;
  }
  @keyframes gradientShift {
    0% { background-position: 0% center; }
    100% { background-position: 200% center; }
  }
  .loader-progress-text {
    font-size:0.95rem; font-weight:600;
    color:var(--text-mid); letter-spacing:0.8px;
  }
  .loader-progress-text span {
    color:var(--gold); font-weight:900; font-size:1.1rem;
  }

  /* ===================== TOAST ===================== */
  .toast {
    position:fixed; top:-100px; left:50%; transform:translateX(-50%);
    background:var(--surface2); color:var(--text);
    box-shadow:0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px var(--border2);
    border-radius:100px; padding:12px 22px;
    font-size:0.88rem; font-weight:600;
    display:flex; align-items:center; gap:9px;
    z-index:10000; transition:top 0.4s cubic-bezier(0.175,0.885,0.32,1.275);
    max-width:88%; white-space:nowrap; pointer-events:none;
    font-family:'Inter',sans-serif;
  }
  .toast.show { top:20px; }
  .toast-icon { width:18px; height:18px; flex-shrink:0; }

  /* ===================== SUCCESS MODAL (Withdrawal) ===================== */
  .modal-overlay {
    position:fixed; inset:0; z-index:300;
    background:rgba(4,6,7,0.72);
    backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
    display:flex; align-items:center; justify-content:center;
    animation:fadeUp 0.25s ease both;
  }
  .modal-card {
    width:calc(100% - 44px); max-width:380px;
    background:linear-gradient(170deg, #131c22 0%, #10151a 55%, #121b1c 100%);
    border:1px solid rgba(22,184,138,0.32);
    border-radius:26px; padding:30px 24px 24px;
    position:relative; overflow:hidden; text-align:center;
    box-shadow:0 30px 80px rgba(0,0,0,0.6), var(--glow-violet);
    animation:modalPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  @keyframes modalPop {
    from { opacity:0; transform:scale(0.7) translateY(40px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  .modal-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:3px;
    background:linear-gradient(90deg, var(--grad-a), var(--grad-b), var(--gold));
  }
  .modal-glow {
    position:absolute; inset:0; pointer-events:none;
    background: radial-gradient(ellipse at 50% 0%, rgba(22,184,138,0.22) 0%, transparent 55%);
  }
  .modal-icon {
    width:72px; height:72px; margin:0 auto 16px; border-radius:50%;
    background:rgba(52,209,160,0.12); border:1px solid rgba(52,209,160,0.35);
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 0 30px rgba(52,209,160,0.2);
    position:relative; z-index:1;
  }
  .modal-icon img { width:36px; height:36px; }
  .modal-card h3 {
    font-size:1.5rem; font-weight:900; letter-spacing:-0.5px; color:#fff;
    position:relative; z-index:1;
  }
  .modal-sub {
    font-size:0.82rem; color:var(--text-mid); margin-top:6px;
    position:relative; z-index:1;
  }
  .modal-details {
    margin:20px 0 14px; background:rgba(10,13,16,0.5);
    border:1px solid var(--border2); border-radius:16px;
    padding:6px 16px; position:relative; z-index:1;
  }
  .modal-row {
    display:flex; justify-content:space-between; align-items:center;
    padding:11px 0; border-bottom:1px solid var(--border);
  }
  .modal-row:last-child { border-bottom:none; }
  .modal-row span { font-size:0.78rem; color:var(--text-dim); font-weight:500; }
  .modal-row strong {
    font-size:0.86rem; color:var(--text); font-weight:700;
    font-variant-numeric:tabular-nums; max-width:60%; text-align:right;
    word-break:break-all;
  }
  .modal-row strong.status-txt { color:var(--warning); }
  .modal-note {
    font-size:0.74rem; color:var(--text-dim); line-height:1.7;
    margin-bottom:18px; position:relative; z-index:1;
  }
  .btn-modal-close {
    width:100%; padding:15px; border:none; border-radius:14px;
    background:linear-gradient(135deg, var(--grad-a), var(--grad-b));
    color:#fff; font-size:0.95rem; font-weight:800; cursor:pointer;
    position:relative; z-index:1;
    transition:0.2s; box-shadow:0 6px 24px rgba(22,184,138,0.4);
  }
  .btn-modal-close:active { transform:scale(0.97); opacity:0.9; }

  /* ===================== TOP NAV ===================== */
  .top-nav {
    display:flex; justify-content:space-between; align-items:center;
    padding:16px 18px 14px; position:sticky; top:0; z-index:50;
    background: linear-gradient(to bottom, var(--bg) 60%, transparent);
  }
  .user-pill { display:flex; align-items:center; gap:12px; flex:1; min-width:0; }
  .user-avatar { position:relative; flex-shrink:0; }
  .user-avatar img {
    width:44px; height:44px; border-radius:50%;
    border:2px solid var(--primary); object-fit:cover;
    box-shadow:0 0 0 3px rgba(22,184,138,0.22), 0 0 30px rgba(22,184,138,0.15);
  }
  .avatar-status {
    position:absolute; bottom:1px; right:1px; width:12px; height:12px;
    background:var(--green); border-radius:50%; border:2px solid var(--bg);
    animation:statusPulse 2s ease-in-out infinite;
  }
  @keyframes statusPulse {
    0%,100%{box-shadow:0 0 0 0 rgba(52,209,160,0.4)}
    50%{box-shadow:0 0 0 4px rgba(52,209,160,0)}
  }
  .user-info { flex:1; min-width:0; }
  .user-info h3 {
    font-size:0.95rem; font-weight:700; color:var(--text);
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:110px;
  }
  .user-info p {
    font-size:0.65rem; color:var(--text-dim); letter-spacing:0.3px;
  }
  .notif-btn {
    width:40px; height:40px; background:var(--surface2); border:1px solid var(--border2);
    border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center;
    transition:0.2s; position:relative; flex-shrink:0;
  }
  .notif-btn img { width:18px; height:18px; }
  .notif-dot {
    position:absolute; top:7px; right:7px; width:7px; height:7px;
    background:var(--danger); border-radius:50%; border:2px solid var(--bg);
  }
  .notif-btn:active { transform:scale(0.92); }

  /* ===================== PAGES ===================== */
  .page { display:none; padding:0 16px; }
  .page.active {
    display:block;
    animation:pageSlideIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  @keyframes pageSlideIn {
    from { opacity:0; transform:translateY(24px) scale(0.96); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }

  /* ===================== BALANCE CARD ===================== */
  .balance-card {
    margin: 0 16px 20px;
    background: linear-gradient(148deg, #11221c 0%, #0f1a17 38%, #131c1a 72%, #11221c 100%);
    border:1px solid rgba(22,184,138,0.38);
    border-radius:var(--radius-lg); padding:28px 24px 24px;
    position:relative; overflow:hidden;
    box-shadow: var(--glow-violet), 0 0 0 1px rgba(22,184,138,0.14) inset;
    animation: cardGlowIn 0.9s cubic-bezier(0.34,1.56,0.64,1) both;
    transition:box-shadow 0.6s;
  }
  .balance-card:hover {
    box-shadow: var(--glow-violet-strong), 0 0 0 2px rgba(22,184,138,0.26) inset;
  }
  @keyframes cardGlowIn {
    from { transform:scale(0.85) translateY(30px); opacity:0; box-shadow:0 0 0 rgba(22,184,138,0); }
    to   { transform:scale(1) translateY(0); opacity:1; box-shadow:var(--glow-violet); }
  }
  .bc-glow {
    position:absolute; inset:0; pointer-events:none;
    background: radial-gradient(ellipse at 18% 8%, rgba(22,184,138,0.32) 0%, transparent 52%),
                radial-gradient(ellipse at 82% 92%, rgba(212,162,76,0.18) 0%, transparent 50%),
                radial-gradient(ellipse at 50% 50%, rgba(127,230,196,0.08) 0%, transparent 40%);
    animation: glowDrift 7s ease-in-out infinite alternate;
  }
  @keyframes glowDrift {
    0% { opacity:0.6; transform:scale(1) rotate(-2deg); }
    100% { opacity:1; transform:scale(1.08) rotate(2deg); }
  }
  .bc-grid {
    position:absolute; inset:0; pointer-events:none;
    background-image: linear-gradient(rgba(22,184,138,0.05) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(22,184,138,0.05) 1px, transparent 1px);
    background-size: 28px 28px;
    opacity:0.5;
  }
  .bc-label {
    font-size:0.68rem; text-transform:uppercase; letter-spacing:3px;
    color:rgba(127,230,196,0.85); font-weight:700; margin-bottom:10px;
    position:relative; z-index:1;
  }
  .bc-amount {
    font-size:3.2rem; font-weight:900; color:#fff; letter-spacing:-2px; line-height:1;
    position:relative; z-index:1;
    font-variant-numeric:tabular-nums;
    text-shadow:0 0 60px rgba(22,184,138,0.35);
  }
  .bc-dollar { font-size:1.7rem; font-weight:700; opacity:0.75; margin-right:2px; }
  .bc-sym { font-size:1.3rem; font-weight:600; opacity:0.7; }
  .bc-footer {
    display:flex; gap:20px; margin-top:22px; position:relative; z-index:1;
    padding-top:16px; border-top:1px solid rgba(22,184,138,0.18);
  }
  .bc-mini span:first-child {
    font-size:0.65rem; color:rgba(127,230,196,0.6); font-weight:600; display:block;
  }
  .bc-mini span:last-child { font-size:0.95rem; color:#fff; font-weight:700; font-variant-numeric:tabular-nums; }

  /* ===================== SECTION HEADING ===================== */
  .sec-head {
    font-size:0.9rem; font-weight:700; margin:24px 0 14px;
    display:flex; align-items:center; gap:8px; color:var(--text);
    text-transform:uppercase; letter-spacing:0.5px;
  }
  .sec-head img { width:18px; height:18px; }

  /* ===================== STATS GRID ===================== */
  .stats-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:18px; }
  .stat-card {
    background:var(--surface); border:1px solid var(--border);
    border-radius:var(--radius-md); padding:16px 14px;
    transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1), border-color 0.3s, box-shadow 0.3s;
    animation: cardJump 0.7s cubic-bezier(0.34,1.56,0.64,1) both;
    cursor:default;
  }
  .stat-card:nth-child(1){ animation-delay:0.04s; }
  .stat-card:nth-child(2){ animation-delay:0.10s; }
  .stat-card:nth-child(3){ animation-delay:0.16s; }
  .stat-card:nth-child(4){ animation-delay:0.22s; }
  @keyframes cardJump {
    0% { opacity:0; transform:translateY(30px) scale(0.92) rotate(-1deg); }
    30% { transform:translateY(-10px) scale(1.03) rotate(0.5deg); }
    60% { transform:translateY(4px) scale(0.99) rotate(-0.2deg); }
    100% { opacity:1; transform:translateY(0) scale(1) rotate(0deg); }
  }
  .stat-card:hover {
    transform:translateY(-6px) scale(1.02);
    border-color:rgba(22,184,138,0.4);
    box-shadow:0 10px 30px rgba(22,184,138,0.12);
  }
  .stat-card:active { transform:scale(0.96) translateY(0); }
  .stat-icon-wrap {
    width:36px; height:36px; border-radius:11px;
    display:flex; align-items:center; justify-content:center;
    margin-bottom:12px;
  }
  .stat-icon-wrap img { width:22px; height:22px; }
  .stat-icon-wrap.blue   { background:rgba(22,184,138,0.12); border:1px solid rgba(22,184,138,0.22); }
  .stat-icon-wrap.purple { background:rgba(212,162,76,0.12);  border:1px solid rgba(212,162,76,0.22); }
  .stat-icon-wrap.green  { background:rgba(52,209,160,0.12);   border:1px solid rgba(52,209,160,0.22); }
  .stat-icon-wrap.orange { background:rgba(232,184,75,0.12);   border:1px solid rgba(232,184,75,0.22); }
  .stat-card p { font-size:0.7rem; color:var(--text-dim); font-weight:500; margin-bottom:5px; }
  .stat-card h4 { font-size:1.4rem; font-weight:800; letter-spacing:-0.5px; color:var(--text); font-variant-numeric:tabular-nums; }

  /* ===================== REFERRAL TEASER ===================== */
  .ref-teaser {
    background:var(--surface); border:1px solid var(--border);
    border-radius:var(--radius-lg); padding:18px; margin-bottom:18px;
    display:flex; align-items:center; gap:14px; cursor:pointer;
    position:relative; overflow:hidden; transition:0.2s;
  }
  .ref-teaser::before {
    content:''; position:absolute; top:0; left:0; right:0; height:2.5px;
    background: linear-gradient(90deg, var(--grad-a), var(--grad-b), var(--gold));
  }
  .ref-teaser:active { transform:scale(0.98); }
  .ref-teaser-icon {
    width:46px; height:46px; border-radius:14px; flex-shrink:0;
    background:rgba(22,184,138,0.14); border:1px solid rgba(22,184,138,0.22);
    display:flex; align-items:center; justify-content:center;
  }
  .ref-teaser-icon img { width:24px; height:24px; }
  .ref-teaser-text { flex:1; min-width:0; }
  .ref-teaser-text h4 { font-size:0.9rem; font-weight:700; margin-bottom:3px; }
  .ref-teaser-text p { font-size:0.74rem; color:var(--text-dim); }
  .ref-teaser-arrow { font-size:1.2rem; color:var(--primary2); flex-shrink:0; }

  /* ===================== TAP COIN (UPDATED) ===================== */
  .tap-card {
    background: linear-gradient(160deg, #11221c 0%, #0f1a17 55%, #131c1a 100%);
    border:1px solid rgba(212,162,76,0.32);
    border-radius:var(--radius-lg); padding:22px 18px 20px;
    margin-bottom:18px; text-align:center; position:relative; overflow:hidden;
  }
  .tap-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:2.5px;
    background: linear-gradient(90deg, var(--gold2), var(--gold), var(--primary2));
  }
  .tap-head { display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:4px; }
  .tap-head img { width:16px; height:16px; }
  .tap-head span { font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:var(--text-dim); }
  .tap-count { font-size:0.76rem; color:var(--text-mid); font-weight:600; margin-bottom:16px; }
  .tap-count b { color:var(--gold); }
  .tap-coin-btn {
    width:132px; height:132px; border-radius:50%; margin:0 auto 16px;
    border:none; cursor:pointer; position:relative;
    background: radial-gradient(circle at 34% 30%, #f3d488, var(--gold) 46%, var(--gold2) 100%);
    box-shadow: 0 10px 34px rgba(212,162,76,0.4), inset 0 2px 6px rgba(255,255,255,0.4), inset 0 -6px 14px rgba(0,0,0,0.25);
    display:flex; align-items:center; justify-content:center;
    transition: transform 0.12s ease;
  }
  .tap-coin-btn:active:not(:disabled) { transform:scale(0.92); }
  .tap-coin-btn:disabled { filter:grayscale(0.6) brightness(0.6); cursor:not-allowed; }
  .tap-coin-btn img { width:52px; height:52px; filter:brightness(0.15); }
  .tap-coin-btn .tap-ring {
    position:absolute; inset:-8px; border-radius:50%;
    border:2px solid rgba(212,162,76,0.35);
  }
  .tap-float {
    position:absolute; left:50%; top:14px; transform:translateX(-50%);
    font-size:1rem; font-weight:800; color:var(--gold);
    pointer-events:none; animation:tapFloatUp 0.9s ease-out forwards;
  }
  @keyframes tapFloatUp {
    0% { opacity:0; transform:translate(-50%, 0) scale(0.8); }
    20% { opacity:1; transform:translate(-50%, -10px) scale(1.05); }
    100% { opacity:0; transform:translate(-50%, -46px) scale(1); }
  }
  .tap-status { font-size:0.76rem; color:var(--text-dim); font-weight:600; }
  .tap-status.limit { color:var(--gold); font-weight:700; }
  .tap-progress { margin-top:12px; }

  /* ===================== MINING PAGE ===================== */
  .mine-card {
    background: linear-gradient(160deg, #0f1d1a 0%, #0c1614 55%, #101a19 100%);
    border:1px solid rgba(52,209,160,0.28);
    border-radius:var(--radius-lg); padding:26px 18px 22px;
    margin:4px 0 18px; text-align:center; position:relative; overflow:hidden;
  }
  .mine-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:2.5px;
    background: linear-gradient(90deg, var(--primary), var(--primary2), var(--gold));
  }
  .mine-head { display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:6px; }
  .mine-head img { width:17px; height:17px; }
  .mine-head span { font-size:0.74rem; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:var(--text-dim); }
  .mine-sub { font-size:0.78rem; color:var(--text-mid); font-weight:600; margin-bottom:18px; }
  .mine-sub b { color:var(--primary2); }
  .mine-btn-wrap { position:relative; display:inline-block; margin-bottom:16px; }
  .mine-btn {
    width:168px; height:168px; border-radius:50%;
    border:none; cursor:pointer; position:relative;
    background: radial-gradient(circle at 34% 30%, #4fe8bb, var(--primary2) 44%, var(--grad-a) 100%);
    box-shadow: var(--glow-violet-strong), inset 0 3px 8px rgba(255,255,255,0.35), inset 0 -8px 18px rgba(0,0,0,0.28);
    display:flex; align-items:center; justify-content:center;
    transition: transform 0.1s ease;
  }
  .mine-btn:active:not(:disabled) { transform:scale(0.93); }
  .mine-btn:disabled { filter:grayscale(0.6) brightness(0.6); cursor:not-allowed; }
  .mine-btn .mine-letter {
    font-family:'Inter',sans-serif; font-weight:900; font-size:3.6rem;
    color:rgba(10,13,16,0.85); line-height:1; user-select:none;
  }
  .mine-btn .mine-ring1, .mine-btn .mine-ring2 {
    position:absolute; border-radius:50%; pointer-events:none;
  }
  .mine-btn .mine-ring1 { inset:-10px; border:2px solid rgba(52,209,160,0.32); }
  .mine-btn .mine-ring2 { inset:-20px; border:1.5px solid rgba(52,209,160,0.16); }
  .mine-float {
    position:absolute; left:50%; top:6px; transform:translateX(-50%);
    font-size:1rem; font-weight:800; color:var(--primary2);
    pointer-events:none; animation:tapFloatUp 0.9s ease-out forwards;
  }
  .mine-progress-track {
    width:100%; height:10px; border-radius:8px; background:var(--surface3);
    overflow:hidden; margin-bottom:10px; border:1px solid var(--border2);
  }
  .mine-progress-fill {
    height:100%; border-radius:8px;
    background: linear-gradient(90deg, var(--grad-a), var(--primary2));
    transition: width 0.25s ease;
  }
  .mine-status { font-size:0.76rem; color:var(--text-dim); font-weight:600; }
  .mine-status.limit { color:var(--danger); }
  .mine-status.done { color:var(--primary2); }

  /* ===================== ADS ===================== */
  .ad-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .ad-box {
    background:var(--surface); border:1px solid var(--border);
    border-radius:var(--radius-md); padding:18px 14px; text-align:center;
    transition:transform 0.2s, border-color 0.2s;
    animation:fadeUp 0.5s ease both;
  }
  .ad-box:active { transform:scale(0.97); }
  .ad-icon {
    width:48px; height:48px; border-radius:14px;
    background:rgba(22,184,138,0.1); border:1px solid rgba(22,184,138,0.16);
    display:flex; align-items:center; justify-content:center;
    margin:0 auto 12px;
  }
  .ad-icon img { width:26px; height:26px; }
  .ad-box h4 { font-size:0.88rem; font-weight:600; margin-bottom:6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ad-reward { font-size:0.72rem; font-weight:700; color:var(--green); margin-bottom:8px; }
  .ad-counter {
    font-size:0.7rem; background:var(--surface2); border:1px solid var(--border);
    color:var(--text-dim); padding:3px 10px; border-radius:20px;
    display:inline-block; margin-bottom:14px; font-weight:500;
  }
  .ad-btn {
    background: linear-gradient(135deg, var(--grad-a), var(--grad-b));
    color:#fff; border:none; padding:10px 0; width:100%;
    border-radius:10px; font-size:0.83rem; font-weight:600; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:6px;
    transition:0.2s; box-shadow:0 3px 12px rgba(22,184,138,0.22);
  }
  .ad-btn img { width:14px; height:14px; filter:brightness(10); }
  .ad-btn:active:not(:disabled) { transform:scale(0.96); opacity:0.85; }
  .ad-btn:disabled {
    background:var(--surface2); color:var(--text-dim); cursor:not-allowed;
    border:1px solid var(--border); box-shadow:none;
  }
  .ad-progress {
    width:100%; height:5px; margin-top:10px;
    background:rgba(255,255,255,0.06); border-radius:10px; overflow:hidden;
    border:1px solid rgba(22,184,138,0.15);
  }
  .ad-progress-fill {
    height:100%; border-radius:10px;
    background:linear-gradient(90deg, var(--grad-b), var(--gold));
    transition:width 1s linear;
    box-shadow:0 0 10px rgba(212,162,76,0.4);
  }

  /* ===================== TASKS ===================== */
  .task-list { display:flex; flex-direction:column; gap:10px; }
  .task-item {
    background:var(--surface); border:1px solid var(--border);
    border-radius:var(--radius-md); padding:14px 16px;
    display:flex; align-items:center; justify-content:space-between;
    transition:transform 0.2s, border-color 0.2s;
    animation:fadeUp 0.5s ease both;
  }
  .task-item:active { transform:scale(0.99); }
  .task-left { display:flex; align-items:center; gap:14px; }
  .task-thumb {
    width:46px; height:46px; border-radius:var(--radius-sm);
    object-fit:cover; background:var(--surface2); flex-shrink:0;
  }
  .task-info h4 { font-size:0.9rem; font-weight:600; color:var(--text); margin-bottom:4px; }
  .task-reward { font-size:0.76rem; font-weight:700; color:var(--green); }
  .btn-task {
    padding:9px 15px; border-radius:10px; font-size:0.8rem;
    font-weight:600; cursor:pointer; border:none; transition:0.2s;
    white-space:nowrap;
  }
  .btn-task-start {
    background: linear-gradient(135deg, var(--grad-a), var(--grad-b));
    color:#fff; box-shadow:0 3px 12px rgba(22,184,138,0.24);
  }
  .btn-task-start:disabled { opacity:0.6; cursor:not-allowed; }
  .btn-task-wait { background:var(--surface2); color:var(--text-dim); cursor:not-allowed; border:1px solid var(--border); }
  .btn-task-claim {
    background: linear-gradient(135deg, var(--gold2), var(--gold));
    color:#0a0d10; animation:claimPulse 1.2s ease-in-out infinite;
    box-shadow:0 3px 14px rgba(212,162,76,0.3);
  }
  .btn-task-claim:disabled { opacity:0.6; cursor:not-allowed; animation:none; }
  @keyframes claimPulse {
    0%,100%{box-shadow:0 3px 14px rgba(212,162,76,0.3)}
    50%{box-shadow:0 4px 22px rgba(212,162,76,0.6)}
  }

  /* ===================== MISSIONS ===================== */
  .mission-list { display:flex; flex-direction:column; gap:12px; }
  .mission-card {
    background:var(--surface); border:1px solid var(--border);
    border-radius:var(--radius-md); padding:16px;
    animation:fadeUp 0.5s ease both; position:relative; overflow:hidden;
  }
  .mission-card.done { border-color:rgba(212,162,76,0.35); }
  .mission-top { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
  .mission-icon {
    width:42px; height:42px; border-radius:13px; flex-shrink:0;
    background:rgba(212,162,76,0.12); border:1px solid rgba(212,162,76,0.22);
    display:flex; align-items:center; justify-content:center;
  }
  .mission-icon img { width:22px; height:22px; }
  .mission-info h4 { font-size:0.9rem; font-weight:700; margin-bottom:3px; }
  .mission-info p { font-size:0.72rem; color:var(--text-dim); }
  .mission-progress-bar {
    width:100%; height:7px; background:rgba(255,255,255,0.06);
    border-radius:10px; overflow:hidden; margin-bottom:10px;
    border:1px solid var(--border2);
  }
  .mission-progress-fill {
    height:100%; border-radius:10px;
    background:linear-gradient(90deg, var(--grad-a), var(--grad-c));
    transition:width 0.4s ease;
  }
  .mission-bottom { display:flex; justify-content:space-between; align-items:center; }
  .mission-count { font-size:0.72rem; color:var(--text-mid); font-weight:600; }
  .btn-mission-claim {
    padding:8px 16px; border-radius:10px; font-size:0.78rem; font-weight:700;
    border:none; cursor:pointer; transition:0.2s;
    background:linear-gradient(135deg, var(--gold2), var(--gold));
    color:#0a0d10; box-shadow:0 3px 12px rgba(212,162,76,0.28);
  }
  .btn-mission-claim:disabled {
    opacity:0.55; cursor:not-allowed; box-shadow:none;
    background:var(--surface2); color:var(--text-dim);
  }
  .mission-claimed-badge {
    font-size:0.72rem; font-weight:700; color:var(--green);
    display:flex; align-items:center; gap:5px;
  }
  .mission-claimed-badge img { width:14px; height:14px; }

  /* ===================== METHOD SELECTOR ===================== */
  .method-selector-wrap { margin-bottom:16px; }
  .method-label {
    font-size:0.68rem; color:var(--text-dim); font-weight:600; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px; display:block;
  }
  .method-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .method-card {
    background:var(--surface); border:2px solid var(--border);
    border-radius:var(--radius-md); padding:16px 12px; text-align:center;
    cursor:pointer; transition:0.2s; position:relative;
    animation:fadeUp 0.5s ease both;
  }
  .method-card:hover {
    border-color:rgba(22,184,138,0.3);
    transform:translateY(-2px);
    box-shadow:0 4px 16px rgba(22,184,138,0.1);
  }
  .method-card.active {
    background:rgba(22,184,138,0.1);
    border-color:var(--primary);
    box-shadow:0 0 30px rgba(22,184,138,0.28);
  }
  .method-card:active { transform:scale(0.97); }
  .method-card h5 { font-size:0.88rem; font-weight:700; color:var(--text); margin-bottom:6px; }
  .method-card p { font-size:0.7rem; color:var(--text-dim); }
  .method-check {
    position:absolute; top:8px; right:8px; width:18px; height:18px;
    background:var(--primary); border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    opacity:0; transition:0.2s; transform:scale(0);
  }
  .method-card.active .method-check { opacity:1; transform:scale(1); }
  .method-check::after { content:'✓'; color:#fff; font-size:12px; font-weight:800; }

  /* ===================== WITHDRAW ===================== */
  .info-banner {
    background:rgba(22,184,138,0.06); border:1px solid rgba(22,184,138,0.18);
    border-radius:var(--radius-sm); padding:14px 16px;
    display:flex; align-items:flex-start; gap:12px; margin-bottom:16px;
  }
  .info-banner img { width:18px; height:18px; flex-shrink:0; margin-top:1px; }
  .info-banner p { font-size:0.8rem; color:var(--text-mid); line-height:1.65; }
  .info-banner p strong { color:var(--text); }
  .input-wrap { position:relative; margin-bottom:12px; }
  .input-icon { position:absolute; top:50%; transform:translateY(-50%); left:15px; width:16px; height:16px; pointer-events:none; }
  .form-inp {
    width:100%; padding:15px 15px 15px 44px;
    background:var(--surface); border:1px solid var(--border2);
    border-radius:var(--radius-sm); color:var(--text); font-size:0.93rem;
    font-weight:500; outline:none; transition:0.2s;
  }
  .form-inp:focus { border-color:var(--primary); box-shadow:0 0 0 3px rgba(22,184,138,0.12); }
  .form-inp::placeholder { color:var(--text-dim); opacity:0.8; }
  .btn-submit {
    width:100%; padding:16px; border:none; border-radius:var(--radius-sm);
    background: linear-gradient(135deg, var(--grad-a), var(--grad-b));
    color:#fff; font-size:0.97rem; font-weight:700; cursor:pointer;
    margin-top:6px; display:flex; align-items:center; justify-content:center; gap:8px;
    transition:0.2s; box-shadow:0 4px 20px rgba(22,184,138,0.3);
  }
  .btn-submit:active:not(:disabled) { transform:scale(0.98); opacity:0.9; }
  .btn-submit:disabled { background:var(--surface2); box-shadow:none; cursor:not-allowed; color:var(--text-dim); }
  .btn-submit img { width:18px; height:18px; filter:brightness(10); }

  /* ===================== HISTORY ===================== */
  .hist-wrap {
    background:var(--surface); border:1px solid var(--border);
    border-radius:var(--radius-md); overflow:hidden;
  }
  .hist-item {
    display:flex; justify-content:space-between; align-items:center;
    padding:14px 16px; border-bottom:1px solid var(--border);
    animation:fadeUp 0.4s ease both;
  }
  .hist-item:last-child { border-bottom:none; }
  .hist-left { display:flex; align-items:center; gap:13px; }
  .hist-icon {
    width:40px; height:40px; border-radius:12px;
    background:var(--surface2); display:flex; align-items:center; justify-content:center;
  }
  .hist-icon img { width:20px; height:20px; }
  .hist-info h4 { font-size:0.88rem; font-weight:600; }
  .hist-info small { font-size:0.7rem; color:var(--text-dim); }
  .hist-right { text-align:right; }
  .hist-amt { font-size:0.92rem; font-weight:700; display:block; margin-bottom:4px; }
  .hist-badge { font-size:0.62rem; padding:2px 8px; border-radius:6px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; }
  .status-pending  { background:rgba(232,184,75,0.12); color:var(--warning); }
  .status-completed{ background:rgba(52,209,160,0.12); color:var(--green); }
  .status-rejected { background:rgba(242,104,92,0.12); color:var(--danger); }

  /* ===================== REFERRAL PAGE ===================== */
  .ref-card {
    background:var(--surface); border:1px solid var(--border);
    border-radius:var(--radius-lg); padding:20px 18px;
    margin-bottom:18px; position:relative; overflow:hidden;
  }
  .ref-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:2.5px;
    background: linear-gradient(90deg, var(--grad-a), var(--grad-b), var(--grad-c));
  }
  .ref-top { display:flex; align-items:center; gap:14px; margin-bottom:16px; }
  .ref-icon {
    width:44px; height:44px; border-radius:14px;
    background:rgba(22,184,138,0.14); border:1px solid rgba(22,184,138,0.22);
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
  }
  .ref-icon img { width:24px; height:24px; }
  .ref-title h4 { font-size:0.95rem; font-weight:700; }
  .ref-badge {
    display:inline-flex; align-items:center; gap:4px;
    background:rgba(212,162,76,0.12); border:1px solid rgba(212,162,76,0.28);
    color:var(--gold); padding:3px 10px; border-radius:20px;
    font-size:0.7rem; font-weight:700; margin-top:4px;
    animation:badgePop 0.5s cubic-bezier(0.34,1.56,0.64,1) both 0.3s;
  }
  @keyframes badgePop { from{transform:scale(0)} to{transform:scale(1)} }
  .ref-badge img { width:12px; height:12px; }
  .ref-label { font-size:0.68rem; color:var(--text-dim); font-weight:600; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; }
  .ref-input-row {
    display:flex; background:var(--surface2); border:1px solid var(--border2);
    border-radius:var(--radius-sm); padding:5px 5px 5px 14px; margin-bottom:12px; align-items:center;
  }
  .ref-inp { flex:1; background:transparent; border:none; color:var(--text-mid); font-size:0.8rem; font-weight:500; outline:none; min-width:0; }
  .btn-copy {
    background: linear-gradient(135deg, var(--grad-a), var(--grad-b));
    color:#fff; border:none; padding:9px 15px; border-radius:9px;
    font-size:0.8rem; font-weight:600; cursor:pointer;
    display:flex; align-items:center; gap:6px; transition:0.2s; flex-shrink:0;
    box-shadow:0 3px 12px rgba(22,184,138,0.25);
  }
  .btn-copy img { width:14px; height:14px; filter:brightness(10); }
  .btn-copy:active { transform:scale(0.93); opacity:0.85; }
  .btn-copy:disabled { opacity:0.6; cursor:not-allowed; }
  .btn-share {
    width:100%; padding:14px; border:none; border-radius:var(--radius-sm);
    background: linear-gradient(135deg, var(--grad-a), var(--grad-b));
    color:#fff; font-size:0.92rem; font-weight:700; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:8px;
    transition:0.2s; box-shadow:0 4px 20px rgba(22,184,138,0.35);
  }
  .btn-share img { width:18px; height:18px; filter:brightness(10); }
  .btn-share:active { transform:scale(0.97); opacity:0.9; }
  .btn-share:disabled { opacity:0.6; cursor:not-allowed; }

  /* ===================== BOTTOM NAV ===================== */
  .bottom-nav {
    position:fixed; bottom:16px; left:50%; transform:translateX(-50%);
    width:calc(100% - 24px); max-width:440px;
    background:rgba(10,13,16,0.92); border:1px solid var(--border2);
    padding:6px 4px; border-radius:100px; display:flex; justify-content:space-around;
    z-index:100; box-shadow:0 12px 48px rgba(0,0,0,0.6);
    backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
  }
  .nav-item {
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    width:50px; height:52px; cursor:pointer; transition:0.25s; gap:3px;
    border-radius:50px; position:relative;
  }
  .nav-item .nav-img {
    width:21px; height:21px; object-fit:contain;
    filter:grayscale(1) brightness(0.35); transition:0.25s;
  }
  .nav-item span { font-size:0.5rem; font-weight:600; color:var(--text-dim); opacity:0; transition:0.2s; }
  .nav-item.active { background:rgba(22,184,138,0.08); }
  .nav-item.active .nav-img { filter:none; transform:scale(1.1); }
  .nav-item.active span { opacity:1; color:var(--primary2); }
  .nav-item:active { transform:scale(0.92); }
  .nav-dot {
    width:4px; height:4px; background:var(--primary2); border-radius:50%;
    position:absolute; bottom:5px; display:none;
    animation:dotPop 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes dotPop { from{transform:scale(0)} to{transform:scale(1)} }
  .nav-item.active .nav-dot { display:block; }

  /* ===================== EMPTY STATE ===================== */
  .empty-state { text-align:center; padding:32px 10px; color:var(--text-dim); font-size:0.86rem; }
  .empty-state img { width:40px; height:40px; opacity:0.25; display:block; margin:0 auto 12px; }

  /* ===================== SCROLLBAR ===================== */
  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:var(--border2); border-radius:4px; }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(12px); }
    to   { opacity:1; transform:translateY(0); }
  }
`;

// ============================================================
//  Telegram WebApp
// ============================================================
const tg = window.Telegram?.WebApp || {
    ready: () => {},
    expand: () => {},
    setHeaderColor: () => {},
    setBackgroundColor: () => {},
    initData: '',
    initDataUnsafe: { user: { id: 'Dev', first_name: 'User', photo_url: '' }, start_param: null },
    HapticFeedback: { impactOccurred: () => {}, notificationOccurred: () => {} },
    openLink: (u) => window.open(u, '_blank'),
    openTelegramLink: (u) => window.open(u, '_blank'),
};

tg.ready();
tg.expand();
tg.setHeaderColor?.('#0a0d10');
tg.setBackgroundColor?.('#0a0d10');

const INIT_DATA = tg.initData || '';

// ============================================================
//  Currency formatting
// ============================================================
function fmtAmt(n, sym) {
    const v = Number(n) || 0;
    return `$${v.toFixed(2)} ${sym || 'USDT'}`;
}

function fmtMineAmt(n, sym) {
    const v = Number(n) || 0;
    return `+$${v.toFixed(3)} ${sym || 'USDT'}`;
}

// ============================================================
//  API helper
// ============================================================
async function apiCall(action, method = 'GET', body = null) {
    try {
        let url = `${API_URL}?action=${action}`;
        if (method === 'GET') {
            if (INIT_DATA && action !== 'getConfig') url += `&initData=${encodeURIComponent(INIT_DATA)}`;
            if (body) Object.keys(body).forEach(k => (url += `&${k}=${encodeURIComponent(body[k])}`));
        }
        const opts = { method, cache: 'no-store' };
        if (method !== 'GET') {
            opts.headers = { 'Content-Type': 'application/json' };
            opts.body = JSON.stringify({ initData: INIT_DATA, ...(body || {}) });
        }
        const res = await fetch(url, opts);
        const data = await res.json();
        if (res.status === 401) {
            showToastGlobal('error', 'Session expired. Please restart the app.');
            return null;
        }
        return data;
    } catch {
        return null;
    }
}

// ============================================================
//  Loader
// ============================================================
function Loader({ hiding, progress }) {
    return (
        <div className="loader-overlay" style={hiding ? { opacity: 0, transform: 'scale(1.05)' } : {}}>
            <div className="loader-bg-glow" />
            <div className="loader-gem-container">
                <div className="orbit-ring r1"><div className="orbit-dot" /></div>
                <div className="orbit-ring r2"><div className="orbit-dot" /></div>
                <div className="orbit-ring r3"><div className="orbit-dot" /></div>
                <svg className="gem-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="gemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#7fe6c4" />
                            <stop offset="50%" stopColor="#16b88a" />
                            <stop offset="100%" stopColor="#0d8f6a" />
                        </linearGradient>
                    </defs>
                    <rect x="10" y="10" width="80" height="80" rx="22" fill="url(#gemGrad)" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" />
                    <text x="50" y="68" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="52" fill="rgba(10,13,16,0.92)">T</text>
                </svg>
            </div>

            <div className="loader-progress-wrap">
                <div className="loader-progress-bar">
                    <div className="loader-progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
                <div className="loader-progress-text">Loading... <span>{Math.min(progress, 100)}%</span></div>
            </div>
        </div>
    );
}

// ============================================================
//  Toast
// ============================================================
const TOAST_ICONS = {
    success: ICONS.check,
    error:   ICONS.bell,
    warning: ICONS.bolt,
};

function Toast({ type, msg, show }) {
    return (
        <div className={`toast ${show ? 'show' : ''}`}>
            <img className="toast-icon" src={TOAST_ICONS[type] || ICONS.bell} alt="" />
            <span>{msg}</span>
        </div>
    );
}

// ============================================================
//  Home Page — balance card restored
// ============================================================
function HomePage({ appState, onGoReferral, onTap, tapLocalCount, tapBatchSize, onClaimTapBatch, tapState }) {
    const u   = appState.user;
    const cfg = appState.config;
    const sym = cfg.currencySymbol || 'USDT';
    const refBonus = cfg.referralBonus || 0;
    const totalAdViews = Object.values(u.dailyAds || {}).reduce((s, c) => s + c, 0);
    const tapLimit = cfg.dailyTapLimit || 0;

    return (
        <div className="page active">
            {/* Balance Card */}
            <div className="balance-card">
                <div className="bc-glow" />
                <div className="bc-grid" />
                <div className="bc-label">Total Balance</div>
                <div className="bc-amount">
                    <span className="bc-dollar">$</span>{(u.balance || 0).toFixed(2)}
                    <span className="bc-sym"> {sym}</span>
                </div>
                <div className="bc-footer">
                    <div className="bc-mini">
                        <span>Total Earned</span>
                        <span>${(u.totalEarned || 0).toFixed(2)}</span>
                    </div>
                    <div className="bc-mini">
                        <span>Referrals</span>
                        <span>{u.referrals || 0}</span>
                    </div>
                    <div className="bc-mini">
                        <span>Ads Watched</span>
                        <span>{totalAdViews}</span>
                    </div>
                </div>
            </div>

            <div className="stats-grid" style={{ marginTop: 0 }}>
                <div className="stat-card">
                    <div className="stat-icon-wrap blue">
                        <img src={ICONS.tv} alt="" />
                    </div>
                    <p>Ads Watched</p>
                    <h4>{totalAdViews}</h4>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-wrap purple">
                        <img src={ICONS.share} alt="" />
                    </div>
                    <p>Total Referrals</p>
                    <h4>{u.referrals || 0}</h4>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-wrap green">
                        <img src={ICONS.check} alt="" />
                    </div>
                    <p>Tasks Completed</p>
                    <h4>{u.completedTaskCount || 0}</h4>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-wrap orange">
                        <img src={ICONS.coin} alt="" />
                    </div>
                    <p>Total Earned</p>
                    <h4>${(u.totalEarned || 0).toFixed(2)}</h4>
                </div>
            </div>

            {tapLimit > 0 && (
                <TapCoinCard
                    cfg={cfg}
                    sym={sym}
                    tapLocalCount={tapLocalCount}
                    tapBatchSize={tapBatchSize}
                    onTap={onTap}
                    onClaim={onClaimTapBatch}
                />
            )}

            <div className="ref-teaser" onClick={onGoReferral}>
                <div className="ref-teaser-icon">
                    <img src={ICONS.users} alt="" />
                </div>
                <div className="ref-teaser-text">
                    <h4>Invite &amp; Earn</h4>
                    <p>Get {fmtAmt(refBonus, sym)} for every friend who joins</p>
                </div>
                <div className="ref-teaser-arrow">›</div>
            </div>
        </div>
    );
}

// ============================================================
//  Tap Coin (UPDATED: local counter + claim button)
// ============================================================
function TapCoinCard({ cfg, sym, tapLocalCount, tapBatchSize, onTap, onClaim }) {
    const reached = tapLocalCount >= tapBatchSize;
    const progress = Math.min(100, (tapLocalCount / tapBatchSize) * 100);
    const [floats, setFloats] = useState([]);
    const [claiming, setClaiming] = useState(false);

    async function handleTap() {
        if (reached) return;
        const reward = await onTap();
        if (reward != null) {
            const id = Date.now() + Math.random();
            setFloats(f => [...f, { id, reward }]);
            setTimeout(() => setFloats(f => f.filter(x => x.id !== id)), 900);
        }
    }

    async function handleClaim() {
        if (!reached || claiming) return;
        setClaiming(true);
        await onClaim();
        setClaiming(false);
    }

    return (
        <div className="tap-card">
            <div className="tap-head">
                <img src={ICONS.coin} alt="" />
                <span>Tap Coin</span>
            </div>
            <div className="tap-count">
                <b>{tapLocalCount}</b> / {tapBatchSize} taps to claim
            </div>

            <div style={{ position: 'relative', display: 'inline-block' }}>
                {!reached ? (
                    <button className="tap-coin-btn" onClick={handleTap}>
                        <div className="tap-ring" />
                        <img src={ICONS.coin} alt="" />
                    </button>
                ) : (
                    <button
                        className="tap-coin-btn"
                        onClick={handleClaim}
                        disabled={claiming}
                        style={{ background: 'linear-gradient(135deg, #d4a24c, #b8842f)' }}
                    >
                        <div className="tap-ring" style={{ borderColor: 'rgba(212,162,76,0.8)' }} />
                        <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0a0d10' }}>
                            {claiming ? '⏳' : '💰'}
                        </span>
                    </button>
                )}
                {floats.map(f => (
                    <div className="tap-float" key={f.id}>+{fmtAmt(f.reward, sym)}</div>
                ))}
            </div>

            <div className="tap-progress">
                <div className="mine-progress-track">
                    <div
                        className="mine-progress-fill"
                        style={{
                            width: `${progress}%`,
                            background: reached ? 'linear-gradient(90deg, #d4a24c, #b8842f)' : ''
                        }}
                    />
                </div>
            </div>

            <div className={`tap-status ${reached ? 'limit' : ''}`}>
                {reached
                    ? '🎉 Claim your bonus!'
                    : `Keep tapping – ${tapBatchSize - tapLocalCount} taps left`}
            </div>
        </div>
    );
}

// ============================================================
//  Mining Page
// ============================================================
function MiningPage({ appState, onMine, mineState }) {
    const cfg    = appState.config;
    const sym    = cfg.currencySymbol || 'USDT';
    const limit  = cfg.dailyMiningLimit || 0;
    const reward = cfg.miningReward || 0;
    const done   = mineState.count;
    const busy   = mineState.busy;
    const reached = limit > 0 && done >= limit;
    const pct    = limit > 0 ? Math.min(100, (done / limit) * 100) : 0;
    const total  = (reward * limit).toFixed(2);
    const [floats, setFloats] = useState([]);

    async function handleTap() {
        if (busy || reached) return;
        const r = await onMine();
        if (r != null) {
            const id = Date.now() + Math.random();
            setFloats(f => [...f, { id, reward: r }]);
            setTimeout(() => setFloats(f => f.filter(x => x.id !== id)), 900);
        }
    }

    if (limit <= 0 || reward <= 0) {
        return (
            <div className="page active">
                <div className="sec-head">
                    <img src={ICONS.pickaxe} alt="" /> Mining
                </div>
                <div className="empty-state">
                    <p>Mining is not available right now. Please check back later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page active">
            <div className="sec-head">
                <img src={ICONS.pickaxe} alt="" /> Mining
            </div>

            <div className="mine-card">
                <div className="mine-head">
                    <img src={ICONS.pickaxe} alt="" />
                    <span>Tap To Mine</span>
                </div>
                <div className="mine-sub">
                    Tap <b>{limit}</b> times to mine <b>{fmtAmt(total, sym)}</b>
                </div>

                <div className="mine-btn-wrap">
                    <button className="mine-btn" onClick={handleTap} disabled={busy || reached}>
                        <div className="mine-ring2" />
                        <div className="mine-ring1" />
                        <span className="mine-letter">T</span>
                    </button>
                    {floats.map(f => (
                        <div className="mine-float" key={f.id}>{fmtMineAmt(f.reward, sym)}</div>
                    ))}
                </div>

                <div className="mine-progress-track">
                    <div className="mine-progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className={`mine-status ${reached ? 'done' : ''}`}>
                    <b>{done}</b>/{limit} taps today
                </div>
                <div className={`mine-status ${reached ? 'limit' : ''}`} style={{ marginTop: 6 }}>
                    {reached ? 'Today\'s mining run is complete. Come back tomorrow!' : busy ? 'Processing...' : 'Keep tapping the T to mine'}
                </div>
            </div>
        </div>
    );
}

// ============================================================
//  Referral Page
// ============================================================
function ReferralPage({ appState, onCopy, onShare }) {
    const u   = appState.user;
    const cfg = appState.config;
    const sym = cfg.currencySymbol || 'USDT';
    const botUsername = cfg.botUsername || 'YourBotUsername';
    const userId = u.id || '';
    const refLink = `https://t.me/${botUsername}/app?startapp=${userId}`;
    const refBonus = cfg.referralBonus || 0;

    return (
        <div className="page active">
            <div className="sec-head">
                <img src={ICONS.users} alt="" /> Referral Program
            </div>

            <div className="stats-grid" style={{ marginTop: 4 }}>
                <div className="stat-card">
                    <div className="stat-icon-wrap blue">
                        <img src={ICONS.users} alt="" />
                    </div>
                    <p>Total Referrals</p>
                    <h4>{u.referrals || 0}</h4>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-wrap orange">
                        <img src={ICONS.coin} alt="" />
                    </div>
                    <p>Reward / Referral</p>
                    <h4>${refBonus.toFixed(2)}</h4>
                </div>
            </div>

            <div className="ref-card">
                <div className="ref-top">
                    <div className="ref-icon">
                        <img src={ICONS.rocket} alt="" />
                    </div>
                    <div className="ref-title">
                        <h4>Invite Friends</h4>
                        <div className="ref-badge">
                            <img src={ICONS.gift} alt="" />
                            Earn {fmtAmt(refBonus, sym)} per referral!
                        </div>
                    </div>
                </div>
                <div className="ref-label">Your Referral Link</div>
                <div className="ref-input-row">
                    <input className="ref-inp" readOnly value={refLink} onChange={() => {}} />
                    <button className="btn-copy" onClick={() => onCopy(refLink)}>
                        <img src={ICONS.share} alt="" /> Copy
                    </button>
                </div>
                <button className="btn-share" onClick={() => onShare(refLink)}>
                    <img src={ICONS.rocket} alt="" /> Share on Telegram
                </button>
            </div>
        </div>
    );
}

// ============================================================
//  Earn Page
// ============================================================
function EarnPage({ appState, onAdDone, onTaskBegin }) {
    const cfg   = appState.config;
    const u     = appState.user;
    const sym   = cfg.currencySymbol || 'USDT';
    const now   = Date.now();
    const slots = cfg.adSlots || [];
    const limit = cfg.dailyAdLimit || 10;
    const today = new Date().toISOString().slice(0, 10);
    const tasks = cfg.webTasks || {};
    const pendingTasks = [], completedTasks = [];

    Object.keys(tasks).forEach(k => {
        const t = tasks[k];
        const h = (u.taskHistory && u.taskHistory[k]) || {};
        if (t.type === 'onetime' && h.ts) return;
        let isDone = false;
        if (t.type === 'daily' && h.ts && (now - h.ts) < 86400000) isDone = true;
        if (isDone) completedTasks.push({ k, t, h });
        else pendingTasks.push({ k, t, h });
    });

    return (
        <div className="page active">
            <div className="sec-head">
                <img src={ICONS.tv} alt="" /> Watch Ads &amp; Earn
            </div>
            {slots.length === 0 ? (
                <div className="empty-state">
                    <img src={ICONS.tv} alt="" />
                    No ads available right now.
                </div>
            ) : (
                <div className="ad-grid">
                    {slots.map((s, i) => (
                        <AdBox
                            key={s.id} slot={s} index={i} sym={sym}
                            done={u.lastActive === today ? (u.dailyAds?.[s.id] || 0) : 0}
                            limit={limit} onAdDone={onAdDone}
                        />
                    ))}
                </div>
            )}
            <div className="sec-head" style={{ marginTop: 28 }}>
                <img src={ICONS.check} alt="" /> Special Tasks
            </div>
            {pendingTasks.length === 0 && completedTasks.length === 0 ? (
                <div className="empty-state">
                    <img src={ICONS.chart} alt="" />
                    No tasks available.
                </div>
            ) : (
                <div className="task-list">
                    {[...pendingTasks, ...completedTasks].map(({ k, t, h }) => (
                        <TaskItem key={k} id={k} task={t} history={h} sym={sym} now={now} onBegin={onTaskBegin} />
                    ))}
                </div>
            )}
            <div style={{ height: 10 }} />
        </div>
    );
}

// ============================================================
//  Ad cooldown state
// ============================================================
const AD_STATE_KEY = '__earnwallet_adstates';

function readAdStates() {
    try { return JSON.parse(localStorage.getItem(AD_STATE_KEY)) || {}; } catch { return {}; }
}
function writeAdStates(states) {
    try { localStorage.setItem(AD_STATE_KEY, JSON.stringify(states)); } catch {}
}
function setAdState(slotId, data) {
    const st = readAdStates();
    st[slotId] = data;
    writeAdStates(st);
}
function clearAdState(slotId) {
    const st = readAdStates();
    delete st[slotId];
    writeAdStates(st);
}

// ============================================================
//  Ad Box
// ============================================================
function AdBox({ slot, index, done, limit, onAdDone, sym }) {
    const WATCH_SECONDS    = slot.watchSeconds   || (index === 0 ? 17 : index === 1 ? 30 : 17);
    const COOLDOWN_SECONDS = slot.cooldownSeconds || (index === 0 ? 7  : index === 1 ? 10 : 7);

    const [phase, setPhase] = useState('idle');
    const [countdown, setCountdown] = useState(0);
    const timerRef = useRef(null);
    const lockRef = useRef(false);
    const phaseRef = useRef('idle');
    const adOpenRef = useRef(false);
    const adFailedRef = useRef(false);

    function updatePhase(p) {
        phaseRef.current = p;
        setPhase(p);
    }

    function clearTimer() {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }

    useEffect(() => {
        const st = readAdStates()[slot.id];
        if (st && st.cooldownEnd) {
            if (st.cooldownEnd > Date.now()) {
                updatePhase('cooldown');
                startCountdown(st.cooldownEnd - Date.now(), () => {
                    clearAdState(slot.id);
                    resetToIdle();
                });
            } else {
                clearAdState(slot.id);
            }
        }
        return () => clearTimer();
    }, [slot.id]);

    function startCountdown(totalMs, onDone) {
        const endAt = Date.now() + totalMs;
        clearTimer();
        const tick = () => {
            const remaining = Math.max(0, Math.round((endAt - Date.now()) / 1000));
            setCountdown(remaining);
            if (remaining <= 0) {
                clearTimer();
                onDone();
            } else {
                timerRef.current = setTimeout(tick, 250);
            }
        };
        tick();
    }

    function resetToIdle() {
        clearTimer();
        clearAdState(slot.id);
        updatePhase('idle');
        setCountdown(0);
        lockRef.current = false;
        adOpenRef.current = false;
        adFailedRef.current = false;
    }

    function waitFor(fn, timeoutMs) {
        return new Promise(resolve => {
            const start = Date.now();
            const check = () => {
                if (fn()) return resolve(true);
                if (Date.now() - start >= timeoutMs) return resolve(false);
                setTimeout(check, 200);
            };
            check();
        });
    }

    async function ensureAdLoaded() {
        if (slot.network === 'monetag') {
            await waitFor(() => window[`show_${slot.id}`], 10000);
            return !!window[`show_${slot.id}`];
        }
        if (slot.network === 'adsgram') {
            await waitFor(() => window.Adsgram, 10000);
            return !!window.Adsgram;
        }
        return false;
    }

    function openAd() {
        return new Promise(resolve => {
            if (slot.network === 'monetag' && window[`show_${slot.id}`]) {
                adOpenRef.current = true;
                adFailedRef.current = false;
                try { window[`show_${slot.id}`](); } catch {}
                resolve(true);
                return;
            }
            if (slot.network === 'adsgram' && window.Adsgram) {
                if (!window.__adsgramControllers) window.__adsgramControllers = {};
                if (!window.__adsgramControllers[slot.id]) {
                    window.__adsgramControllers[slot.id] = window.Adsgram.init({ blockId: slot.id });
                }
                adOpenRef.current = true;
                adFailedRef.current = false;
                window.__adsgramControllers[slot.id].show()
                    .then(() => { adOpenRef.current = false; })
                    .catch(() => {
                        adOpenRef.current = false;
                        adFailedRef.current = true;
                        if (phaseRef.current === 'watching') {
                            showToastGlobal('error', 'Ad was not completed. Please try again.');
                            resetToIdle();
                        }
                    });
                resolve(true);
                return;
            }
            resolve(false);
        });
    }

    async function triggerAd() {
        if (lockRef.current || done >= limit) return;
        lockRef.current = true;
        try { tg.HapticFeedback.impactOccurred('light'); } catch {}

        updatePhase('loading');
        setCountdown(0);

        const loaded = await ensureAdLoaded();
        if (!loaded) {
            showToastGlobal('error', 'The ad failed to load. Please try again.');
            resetToIdle();
            return;
        }

        const opened = await openAd();
        if (!opened) {
            showToastGlobal('error', 'Unable to show the ad. Please try again.');
            resetToIdle();
            return;
        }

        updatePhase('watching');
        startCountdown(WATCH_SECONDS * 1000, () => {
            waitFor(() => !adOpenRef.current || adFailedRef.current, 30000).then(() => {
                if (adFailedRef.current) {
                    showToastGlobal('error', 'Ad was not completed. Please try again.');
                    resetToIdle();
                    return;
                }
                completeWatch();
            });
        });
    }

    async function completeWatch() {
        try {
            await onAdDone(slot.id);
            try { tg.HapticFeedback.notificationOccurred('success'); } catch {}
        } catch { /* ignore */ }

        updatePhase('cooldown');
        setAdState(slot.id, { cooldownEnd: Date.now() + COOLDOWN_SECONDS * 1000 });
        startCountdown(COOLDOWN_SECONDS * 1000, () => {
            clearAdState(slot.id);
            resetToIdle();
        });
    }

    const total = phase === 'watching' ? WATCH_SECONDS : phase === 'cooldown' ? COOLDOWN_SECONDS : 0;
    const progress = total > 0 ? Math.min(100, Math.round(((total - countdown) / total) * 100)) : 0;

    return (
        <div className="ad-box" style={{ animationDelay: `${index * 0.08}s` }}>
            <div className="ad-icon">
                <img src={ICONS.tv} alt="" />
            </div>
            <h4>{slot.title || `Ad ${index + 1}`}</h4>
            {slot.reward > 0 && <div className="ad-reward">+{fmtAmt(slot.reward, sym)}</div>}
            <div className="ad-counter">{done}/{limit}</div>
            <button className="ad-btn" onClick={triggerAd} disabled={phase !== 'idle' || done >= limit}>
                {phase === 'loading' ? (
                    <><img src={ICONS.rocket} alt="" /> Loading...</>
                ) : phase === 'watching' ? (
                    <><img src={ICONS.clock} alt="" /> {countdown}s to reward</>
                ) : phase === 'cooldown' ? (
                    <><img src={ICONS.lock} alt="" /> Again in {countdown}s</>
                ) : done >= limit ? (
                    <><img src={ICONS.lock} alt="" /> Completed</>
                ) : (
                    <><img src={ICONS.bolt} alt="" /> Watch</>
                )}
            </button>
            {(phase === 'watching' || phase === 'cooldown') && (
                <div className="ad-progress">
                    <div className="ad-progress-fill" style={{ width: `${progress}%` }} />
                </div>
            )}
        </div>
    );
}

// ============================================================
//  Task Item
// ============================================================
function TaskItem({ id, task, history, sym, now, onBegin }) {
    const [state, setState] = useState('idle');
    const [countdown, setCountdown] = useState(5);
    const timerRef = useRef(null);
    const lockRef = useRef(false);

    const isDailyDone = task.type === 'daily' && history.ts && (now - history.ts) < 86400000;
    const left = isDailyDone ? (86400000 - (now - history.ts)) : 0;
    const hrs  = Math.floor(left / 3600000);
    const mins = Math.floor((left % 3600000) / 60000);

    function handleStart() {
        if (lockRef.current) return;
        lockRef.current = true;
        tg.openLink(task.url);
        tg.HapticFeedback.impactOccurred('medium');
        setState('waiting');
        let sec = 5;
        setCountdown(sec);
        timerRef.current = setInterval(() => {
            sec--;
            setCountdown(sec);
            if (sec <= 0) {
                clearInterval(timerRef.current);
                setState('claim');
                lockRef.current = false;
            }
        }, 1000);
    }

    async function handleClaim() {
        if (lockRef.current) return;
        lockRef.current = true;
        setState('claiming');
        const ok = await onBegin(id, task);
        lockRef.current = false;
        if (!ok) setState('claim');
    }

    useEffect(() => () => clearInterval(timerRef.current), []);

    const thumbSrc = task.imageUrl || task.iconUrl || (task.icon && !task.icon.startsWith('http') ? null : task.icon) || null;

    return (
        <div className="task-item" style={{ opacity: isDailyDone ? 0.5 : 1 }}>
            <div className="task-left">
                {thumbSrc ? (
                    <img src={thumbSrc} className="task-thumb" alt={task.name} />
                ) : (
                    <div className="task-thumb" style={{
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:'1.4rem', background:'var(--surface2)'
                    }}>
                        <img src={ICONS.star} alt="" style={{ width: 20, height: 20 }} />
                    </div>
                )}
                <div className="task-info">
                    <h4>{task.name}</h4>
                    <div className="task-reward">+{fmtAmt(task.reward, sym)}</div>
                </div>
            </div>
            {isDailyDone ? (
                <button className="btn-task btn-task-wait" disabled>
                    <img src={ICONS.clock} alt="" style={{width:12,height:12}} /> {hrs}h {mins}m
                </button>
            ) : state === 'claiming' ? (
                <button className="btn-task btn-task-wait" disabled>Processing...</button>
            ) : state === 'idle' ? (
                <button className="btn-task btn-task-start" onClick={handleStart} disabled={lockRef.current}>Start</button>
            ) : state === 'waiting' ? (
                <button className="btn-task btn-task-wait" disabled>{countdown}s</button>
            ) : (
                <button className="btn-task btn-task-claim" onClick={handleClaim} disabled={lockRef.current}>Claim!</button>
            )}
        </div>
    );
}

// ============================================================
//  Mission Page
// ============================================================
function MissionPage({ appState, onClaimMission }) {
    const cfg = appState.config;
    const u   = appState.user;
    const sym = cfg.currencySymbol || 'USDT';
    const missions = cfg.missions || {};
    const claimed = u.claimedMissions || {};
    const refs = u.referrals || 0;
    const ids = Object.keys(missions);
    const [processing, setProcessing] = useState({});

    async function handleClaim(id) {
        if (processing[id]) return;
        setProcessing(p => ({ ...p, [id]: true }));
        await onClaimMission(id);
        setProcessing(p => ({ ...p, [id]: false }));
    }

    return (
        <div className="page active">
            <div className="sec-head">
                <img src={ICONS.trophy} alt="" /> Missions &amp; Bonuses
            </div>
            {ids.length === 0 ? (
                <div className="empty-state">
                    <img src={ICONS.target} alt="" />
                    No missions available right now.
                </div>
            ) : (
                <div className="mission-list">
                    {ids.map(id => {
                        const m = missions[id];
                        const required = m.requiredReferrals || 0;
                        const isClaimed = !!claimed[id];
                        const isEligible = refs >= required && !isClaimed;
                        const pct = required > 0 ? Math.min(100, Math.round((refs / required) * 100)) : 100;
                        const isProcessing = !!processing[id];
                        return (
                            <div className={`mission-card ${isClaimed ? 'done' : ''}`} key={id}>
                                <div className="mission-top">
                                    <div className="mission-icon">
                                        <img src={ICONS.target} alt="" />
                                    </div>
                                    <div className="mission-info">
                                        <h4>{m.title || 'Mission'}</h4>
                                        <p>Refer {required} to earn +{fmtAmt(m.bonus, sym)}</p>
                                    </div>
                                </div>
                                <div className="mission-progress-bar">
                                    <div className="mission-progress-fill" style={{ width: `${pct}%` }} />
                                </div>
                                <div className="mission-bottom">
                                    <span className="mission-count">{Math.min(refs, required)}/{required} referrals</span>
                                    {isClaimed ? (
                                        <span className="mission-claimed-badge">
                                            <img src={ICONS.check} alt="" /> Claimed
                                        </span>
                                    ) : (
                                        <button
                                            className="btn-mission-claim"
                                            disabled={!isEligible || isProcessing}
                                            onClick={() => handleClaim(id)}
                                        >
                                            {isProcessing ? 'Processing...' : 'Claim Bonus'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            <div style={{ height: 10 }} />
        </div>
    );
}

// ============================================================
//  Withdraw Page
// ============================================================
function WithdrawPage({ appState, onWithdraw }) {
    const cfg    = appState.config;
    const u      = appState.user;
    const sym    = cfg.currencySymbol || 'USDT';
    const methods = cfg.withdrawMethods || [];
    const minRef  = cfg.minWithdrawReferrals || 0;

    const [method,     setMethod]     = useState(methods.length > 0 ? methods[0].name : '');
    const [account,    setAccount]    = useState('');
    const [amount,     setAmount]     = useState('');
    const [processing, setProcessing] = useState(false);
    const lockRef = useRef(false);

    const selectedMethod = methods.find(m => m.name === method) || methods[0];
    const sysMin = parseFloat(selectedMethod?.min || 10);

    const statusMap = { pending:'Pending', completed:'Completed', rejected:'Rejected' };
    const histIcons = {
        completed: ICONS.check,
        rejected:  ICONS.bell,
        pending:   ICONS.clock,
    };
    const histColors = {
        completed: 'var(--green)',
        rejected:  'var(--danger)',
        pending:   'var(--warning)',
    };

    async function handleSubmit() {
        if (processing || lockRef.current) return;
        if (!lockRef.current) {
            lockRef.current = true;
            if (u.referrals < minRef) {
                showToastGlobal('warning', `A minimum of ${minRef} referrals is required to withdraw.`);
                tg.HapticFeedback.notificationOccurred('warning');
                lockRef.current = false;
                return;
            }
            const reqAmt = parseFloat(amount);
            if (!account || account.trim().length < 3) {
                showToastGlobal('error', 'Please enter a valid account number.');
                lockRef.current = false;
                return;
            }
            if (!reqAmt || isNaN(reqAmt) || reqAmt < sysMin) {
                showToastGlobal('error', `Minimum withdrawal is ${fmtAmt(sysMin, sym)}.`);
                tg.HapticFeedback.notificationOccurred('error');
                lockRef.current = false;
                return;
            }
            if (reqAmt > u.balance) {
                showToastGlobal('error', 'Insufficient balance.');
                tg.HapticFeedback.notificationOccurred('error');
                lockRef.current = false;
                return;
            }
            setProcessing(true);
            const ok = await onWithdraw({ userId: u.id, userName: u.firstName, amount: reqAmt, method: method || selectedMethod?.name, account: account.trim() });
            setProcessing(false);
            lockRef.current = false;
            if (ok) { setAmount(''); setAccount(''); }
        }
    }

    return (
        <div className="page active">
            <div className="sec-head">
                <img src={ICONS.withdraw} alt="" /> Withdraw
            </div>
            <div className="info-banner">
                <img src={ICONS.bolt} alt="" />
                <div>
                    <p>
                        <strong>Minimum:</strong> {fmtAmt(sysMin, sym)} &nbsp;|&nbsp;
                        <strong>Min. Referrals:</strong> {minRef}
                    </p>
                </div>
            </div>

            {methods.length > 0 && (
                <div className="method-selector-wrap">
                    <span className="method-label">Select Payment Method</span>
                    <div className="method-grid">
                        {methods.map(m => (
                            <div
                                key={m.name}
                                className={`method-card ${method === m.name ? 'active' : ''}`}
                                onClick={() => setMethod(m.name)}
                            >
                                <h5>{m.name}</h5>
                                <p>Min ${m.min}</p>
                                <div className="method-check" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="input-wrap">
                <img className="input-icon" src={ICONS.share} alt="" />
                <input className="form-inp" placeholder="Account number / tag" value={account} onChange={e => setAccount(e.target.value)} />
            </div>
            <div className="input-wrap">
                <img className="input-icon" src={ICONS.coin} alt="" />
                <input className="form-inp" type="number" placeholder="Withdrawal amount" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <button className="btn-submit" onClick={handleSubmit} disabled={processing || lockRef.current}>
                {processing
                    ? <><img src={ICONS.clock} alt="" /> Processing...</>
                    : <><img src={ICONS.withdraw} alt="" /> Request Withdrawal</>
                }
            </button>

            <div className="sec-head" style={{ marginTop: 34 }}>
                <img src={ICONS.chart} alt="" /> Recent Transactions
            </div>
            <div className="hist-wrap">
                {(!appState.history || appState.history.length === 0) ? (
                    <div className="empty-state">
                        <img src={ICONS.chart} alt="" />
                        No transactions yet.
                    </div>
                ) : appState.history.map((d, idx) => {
                    const sl = d.status?.toLowerCase() || 'pending';
                    const dt = new Date(d.timestamp);
                    return (
                        <div className="hist-item" key={idx}>
                            <div className="hist-left">
                                <div className="hist-icon">
                                    <img src={histIcons[sl] || ICONS.coin} alt="" style={{ filter: `drop-shadow(0 0 4px ${histColors[sl]||'transparent'})` }} />
                                </div>
                                <div className="hist-info">
                                    <h4>{d.method}</h4>
                                    <small>
                                        {dt.toLocaleDateString('en-US')} &middot; {dt.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}
                                    </small>
                                </div>
                            </div>
                            <div className="hist-right">
                                <span className="hist-amt">{fmtAmt(d.amount, sym)}</span>
                                <span className={`hist-badge status-${sl}`}>{statusMap[sl] || sl}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div style={{ height: 10 }} />
        </div>
    );
}

// ============================================================
//  Global toast ref
// ============================================================
let showToastGlobal = () => {};

// ============================================================
//  App
// ============================================================
export default function App() {
    const tgUser = tg.initDataUnsafe?.user || { id: 'Dev', first_name: 'User', photo_url: '' };

    const [loaderHide, setLoaderHide] = useState(false);
    const [appReady,   setAppReady]   = useState(false);
    const [activePage, setActivePage] = useState('home');
    const [toast,      setToast]      = useState({ show: false, type: 'success', msg: '' });
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [withdrawModal, setWithdrawModal] = useState(null);
    const [tapState, setTapState] = useState({ count: 0, busy: false });
    const [mineState, setMineState] = useState({ count: 0, busy: false });

    // ---------- NEW: Local tap counter ----------
    const [tapLocalCount, setTapLocalCount] = useState(() => {
        const saved = localStorage.getItem(`tapLocal_${tgUser.id}`);
        return saved ? parseInt(saved, 10) : 0;
    });

    const [appState, setAppState] = useState({
        user: {
            id: tgUser.id,
            firstName: tgUser.first_name,
            photoUrl: tgUser.photo_url || '',
            balance: 0, totalEarned: 0, referrals: 0,
            dailyAds: {}, taskHistory: {}, claimedMissions: {}, completedTaskCount: 0,
            dailyTaps: 0,
            dailyMines: 0,
            lastActive: '',
        },
        config: {},
        history: [],
    });

    const toastTimer = useRef(null);
    const withdrawLock = useRef(false);
    const tapLock = useRef(false); // for batch claim

    // ---------- Persist local tap count ----------
    useEffect(() => {
        localStorage.setItem(`tapLocal_${tgUser.id}`, String(tapLocalCount));
    }, [tapLocalCount, tgUser.id]);

    const showToast = useCallback((type, msg) => {
        setToast({ show: true, type, msg });
        try { tg.HapticFeedback.impactOccurred('light'); } catch {}
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(p => ({ ...p, show: false })), 3200);
    }, []);

    useEffect(() => { showToastGlobal = showToast; }, [showToast]);

    function saveLocal(state) {
        try { localStorage.setItem(`app_${state.user.id}`, JSON.stringify(state)); } catch {}
    }

    // ===== INIT =====
    useEffect(() => {
        const cached = localStorage.getItem(`app_${tgUser.id}`);
        if (cached) {
            try { setAppState(JSON.parse(cached)); } catch {}
        }

        (async () => {
            try {
                setLoadingProgress(5);
                const config = await apiCall('getConfig');
                setLoadingProgress(35);
                const user = await apiCall('login', 'POST', {
                    id:        tgUser.id,
                    firstName: tgUser.first_name,
                    photoUrl:  tgUser.photo_url || '',
                    refId:     tg.initDataUnsafe?.start_param || '',
                });
                setLoadingProgress(65);
                const hist = await apiCall('getHistory', 'POST', { id: tgUser.id });
                setLoadingProgress(95);

                setAppState(prev => {
                    const next = {
                        user: {
                            ...prev.user,
                            ...(user || {}),
                            dailyAds:        user?.dailyAds        || prev.user.dailyAds        || {},
                            taskHistory:     user?.taskHistory     || prev.user.taskHistory     || {},
                            claimedMissions: user?.claimedMissions || prev.user.claimedMissions || {},
                        },
                        config:  config || prev.config,
                        history: hist   || prev.history,
                    };
                    saveLocal(next);
                    return next;
                });

                const today = new Date().toISOString().slice(0, 10);
                if (user && user.lastActive === today) {
                    setTapState(t => ({ ...t, count: user.dailyTaps || 0 }));
                    setMineState(m => ({ ...m, count: user.dailyMines || 0 }));
                } else {
                    setTapState(t => ({ ...t, count: 0 }));
                    setMineState(m => ({ ...m, count: 0 }));
                }

                if (config?.adSlots) loadAdScripts(config.adSlots);

                setLoadingProgress(100);
                setTimeout(() => {
                    setLoaderHide(true);
                    setTimeout(() => setAppReady(true), 500);
                }, 400);

            } catch {
                setLoadingProgress(100);
                setTimeout(() => {
                    setLoaderHide(true);
                    setTimeout(() => {
                        setAppReady(true);
                        showToast('error', 'Connection failed. Running offline.');
                    }, 500);
                }, 400);
            }
        })();

        return () => {};
    }, []); // eslint-disable-line

    // ===== Auto-refresh =====
    useEffect(() => {
        if (!appReady) return;

        const refreshConfig = async () => {
            const freshConfig = await apiCall('getConfig');
            if (!freshConfig) return;
            setAppState(prev => {
                const next = { ...prev, config: freshConfig };
                saveLocal(next);
                return next;
            });
            if (freshConfig.adSlots) loadAdScripts(freshConfig.adSlots);
        };

        const pollId = setInterval(refreshConfig, 15000);

        const handleVisible = () => {
            if (document.visibilityState === 'visible') refreshConfig();
        };
        document.addEventListener('visibilitychange', handleVisible);
        window.addEventListener('focus', refreshConfig);

        return () => {
            clearInterval(pollId);
            document.removeEventListener('visibilitychange', handleVisible);
            window.removeEventListener('focus', refreshConfig);
        };
    }, [appReady]);

    function loadAdScripts(adSlots) {
        adSlots.forEach(s => {
            if (s.network === 'monetag' && !document.querySelector(`script[data-zone="${s.id}"]`)) {
                const sc = document.createElement('script');
                sc.src = '//libtl.com/sdk.js';
                sc.dataset.zone = s.id;
                sc.dataset.sdk  = `show_${s.id}`;
                document.body.appendChild(sc);
            }
            if (s.network === 'adsgram' && !window.__adsgramSdkLoaded) {
                window.__adsgramSdkLoaded = true;
                const sc = document.createElement('script');
                sc.src = 'https://sad.adsgram.ai/js/sad.min.js';
                document.body.appendChild(sc);
            }
        });
    }

    // ===== AD REWARD =====
    const adLock = useRef(false);
    async function handleAdDone(slotId) {
        if (adLock.current) return;
        adLock.current = true;
        const today = new Date().toISOString().slice(0, 10);
        const res = await apiCall('claimAdReward', 'POST', { slotId });
        adLock.current = false;
        if (!res || res.error) {
            showToast('error', res?.error || 'Failed to claim reward.');
            return;
        }
        const rwrd = res.reward;
        setAppState(prev => {
            const dailyAds = { ...(prev.user.dailyAds || {}) };
            if (prev.user.lastActive !== today) Object.keys(dailyAds).forEach(k => delete dailyAds[k]);
            dailyAds[slotId] = (dailyAds[slotId] || 0) + 1;
            const next = {
                ...prev,
                user: {
                    ...prev.user,
                    balance: res.newBalance,
                    totalEarned: (prev.user.totalEarned || 0) + rwrd,
                    dailyAds,
                    lastActive: today,
                },
            };
            saveLocal(next);
            return next;
        });
        showToast('success', `+${fmtAmt(rwrd, appState.config.currencySymbol)} reward!`);
    }

    // ===== TAP (LOCAL) =====
    const tapReward = appState.config.tapReward || 0.001;
    const tapBatchSize = appState.config.tapBatchSize || 1000;

    async function handleTapLocal() {
        if (tapLocalCount >= tapBatchSize) return null;
        setTapLocalCount(prev => prev + 1);
        try { tg.HapticFeedback.impactOccurred('light'); } catch {}
        return tapReward;
    }

    // ===== CLAIM BATCH =====
    async function handleClaimTapBatch() {
        const totalTaps = tapLocalCount;
        if (totalTaps < tapBatchSize) {
            showToast('warning', `Need ${tapBatchSize} taps to claim.`);
            return;
        }
        if (tapLock.current) return;
        tapLock.current = true;

        const res = await apiCall('claimTapBatch', 'POST', { count: totalTaps });
        tapLock.current = false;

        if (!res || res.error) {
            showToast('error', res?.error || 'Failed to claim bonus.');
            return;
        }

        const reward = res.reward; // total bonus
        const sym = appState.config.currencySymbol || 'USDT';
        setAppState(prev => {
            const next = {
                ...prev,
                user: {
                    ...prev.user,
                    balance: res.newBalance,
                    totalEarned: (prev.user.totalEarned || 0) + reward,
                    dailyTaps: res.dailyTaps,
                    lastActive: new Date().toISOString().slice(0, 10),
                },
            };
            saveLocal(next);
            return next;
        });

        setTapLocalCount(0);
        showToast('success', `🎉 Bonus claimed! +${fmtAmt(reward, sym)}`);
        tg.HapticFeedback.notificationOccurred('success');
    }

    // ===== MINE =====
    const mineLock = useRef(false);
    async function handleMine() {
        if (mineLock.current) return null;
        mineLock.current = true;
        setMineState(m => ({ ...m, busy: true }));
        const res = await apiCall('claimMine', 'POST', {});
        mineLock.current = false;
        if (!res || res.error) {
            if (res?.code !== 'DAILY_LIMIT') showToast('error', res?.error || 'Failed to register tap.');
            setMineState(m => ({ ...m, busy: false, count: res?.count ?? m.count }));
            return null;
        }
        const rwrd = res.reward;
        const today = new Date().toISOString().slice(0, 10);
        setAppState(prev => {
            const next = {
                ...prev,
                user: {
                    ...prev.user,
                    balance: res.newBalance,
                    totalEarned: (prev.user.totalEarned || 0) + rwrd,
                    dailyMines: res.count,
                    lastActive: today,
                },
            };
            saveLocal(next);
            return next;
        });
        setMineState({ count: res.count, busy: false });
        try { tg.HapticFeedback.impactOccurred('light'); } catch {}
        return rwrd;
    }

    // ===== TASK =====
    const taskLock = useRef(false);
    async function handleTaskBegin(id) {
        if (taskLock.current) return false;
        taskLock.current = true;
        const res = await apiCall('claimTaskReward', 'POST', { taskId: id });
        taskLock.current = false;
        if (!res || res.error) {
            showToast('error', res?.error || 'Failed to claim reward.');
            return false;
        }
        const rwrd = res.reward;
        setAppState(prev => {
            const next = {
                ...prev,
                user: {
                    ...prev.user,
                    balance: res.newBalance,
                    totalEarned: (prev.user.totalEarned || 0) + rwrd,
                    taskHistory: { ...(prev.user.taskHistory || {}), [id]: { ts: Date.now() } },
                    completedTaskCount: (prev.user.completedTaskCount || 0) + 1,
                },
            };
            saveLocal(next);
            return next;
        });
        showToast('success', 'Task completed! Reward added.');
        tg.HapticFeedback.notificationOccurred('success');
        return true;
    }

    // ===== MISSION =====
    const missionLock = useRef(false);
    async function handleClaimMission(missionId) {
        if (missionLock.current) return;
        missionLock.current = true;
        const res = await apiCall('claimMission', 'POST', { missionId });
        missionLock.current = false;
        if (!res || res.error) {
            showToast('error', res?.error || 'Failed to claim mission.');
            return;
        }
        const bonus = res.bonus;
        setAppState(prev => {
            const next = {
                ...prev,
                user: {
                    ...prev.user,
                    balance: res.newBalance,
                    totalEarned: (prev.user.totalEarned || 0) + bonus,
                    claimedMissions: { ...(prev.user.claimedMissions || {}), [missionId]: Date.now() },
                },
            };
            saveLocal(next);
            return next;
        });
        showToast('success', `Mission complete! +${fmtAmt(bonus, appState.config.currencySymbol)} bonus.`);
        tg.HapticFeedback.notificationOccurred('success');
    }

    // ===== WITHDRAW =====
    async function handleWithdraw(payload) {
        if (withdrawLock.current) return false;
        withdrawLock.current = true;
        const rData = await apiCall('withdraw', 'POST', payload);
        withdrawLock.current = false;
        if (rData?.success) {
            const newBalance = Math.max(0, (appState.user.balance || 0) - payload.amount);
            setAppState(prev => {
                const next = { ...prev, user: { ...prev.user, balance: newBalance } };
                saveLocal(next);
                return next;
            });
            const updtHist = await apiCall('getHistory', 'POST', { id: appState.user.id });
            if (updtHist) {
                setAppState(prev => { const n = { ...prev, history: updtHist }; saveLocal(n); return n; });
            }
            setWithdrawModal({
                amount: payload.amount,
                method: payload.method,
                account: payload.account,
                balance: newBalance,
            });
            showToast('success', 'Withdrawal request submitted!');
            tg.HapticFeedback.notificationOccurred('success');
            return true;
        } else {
            showToast('error', rData?.message || 'Server error. Please try again.');
            return false;
        }
    }

    function handleCopy(link) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(link).then(() => showToast('success', 'Link copied!'));
        } else {
            const tmp = document.createElement('input');
            tmp.value = link;
            document.body.appendChild(tmp);
            tmp.select();
            document.execCommand('copy');
            document.body.removeChild(tmp);
            showToast('success', 'Link copied!');
        }
        tg.HapticFeedback.notificationOccurred('success');
    }

    function handleShare(link) {
        tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('Join now and start earning!')}`);
    }

    function openSupport() {
        if (appState.config.supportLink) tg.openLink(appState.config.supportLink);
        else showToast('warning', 'Support link is not configured.');
    }

    function handleNav(page) {
        if (page === activePage) return;
        setActivePage(page);
        try { tg.HapticFeedback.impactOccurred('light'); } catch {}

        if (page === 'withdraw') {
            apiCall('getHistory', 'POST', { id: appState.user.id }).then(data => {
                if (data) {
                    setAppState(prev => { const n = { ...prev, history: data }; saveLocal(n); return n; });
                }
            });
        }
    }

    const u   = appState.user;
    const cfg = appState.config;
    const sym = cfg.currencySymbol || 'USDT';
    const totalAdViews = Object.values(u.dailyAds || {}).reduce((s, c) => s + c, 0);

    return (
        <>
            <style>{css}</style>

            {!appReady && <Loader hiding={loaderHide} progress={loadingProgress} />}
            <Toast type={toast.type} msg={toast.msg} show={toast.show} />

            {withdrawModal && (
                <div className="modal-overlay" onClick={() => setWithdrawModal(null)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-glow" />
                        <div className="modal-icon">
                            <img src={ICONS.check} alt="" />
                        </div>
                        <h3>Withdrawal Submitted</h3>
                        <p className="modal-sub">Your request has been sent successfully</p>
                        <div className="modal-details">
                            <div className="modal-row">
                                <span>Amount</span>
                                <strong>{fmtAmt(withdrawModal.amount, sym)}</strong>
                            </div>
                            <div className="modal-row">
                                <span>Payment Method</span>
                                <strong>{withdrawModal.method}</strong>
                            </div>
                            <div className="modal-row">
                                <span>Account</span>
                                <strong>{withdrawModal.account}</strong>
                            </div>
                            <div className="modal-row">
                                <span>New Balance</span>
                                <strong>{fmtAmt(withdrawModal.balance, sym)}</strong>
                            </div>
                            <div className="modal-row">
                                <span>Status</span>
                                <strong className="status-txt">Pending</strong>
                            </div>
                        </div>
                        <p className="modal-note">
                            Our team processes requests within 24 hours.
                            Contact support if you need any assistance.
                        </p>
                        <button className="btn-modal-close" onClick={() => setWithdrawModal(null)}>OK</button>
                    </div>
                </div>
            )}

            {appReady && (
                <>
                    <header className="top-nav">
                        <div className="user-pill">
                            <div className="user-avatar">
                                <img
                                    src={u.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.firstName||'U')}&background=16b88a&color=fff&size=88`}
                                    alt={u.firstName}
                                />
                                <div className="avatar-status" />
                            </div>
                            <div className="user-info">
                                <h3>{u.firstName || tgUser.first_name}</h3>
                                <p>ID: {u.id || tgUser.id}</p>
                            </div>
                        </div>
                        <button className="notif-btn" onClick={openSupport} aria-label="Support">
                            <img src={ICONS.bell} alt="Support" />
                            <div className="notif-dot" />
                        </button>
                    </header>

                    <main>
                        {activePage === 'home' && (
                            <HomePage
                                appState={appState}
                                onGoReferral={() => handleNav('referral')}
                                onTap={handleTapLocal}
                                tapLocalCount={tapLocalCount}
                                tapBatchSize={tapBatchSize}
                                onClaimTapBatch={handleClaimTapBatch}
                                tapState={tapState}
                            />
                        )}
                        {activePage === 'earn'     && <EarnPage     appState={appState} onAdDone={handleAdDone} onTaskBegin={handleTaskBegin} />}
                        {activePage === 'mining'   && <MiningPage   appState={appState} onMine={handleMine} mineState={mineState} />}
                        {activePage === 'mission'  && <MissionPage  appState={appState} onClaimMission={handleClaimMission} />}
                        {activePage === 'referral' && <ReferralPage appState={appState} onCopy={handleCopy} onShare={handleShare} />}
                        {activePage === 'withdraw' && <WithdrawPage appState={appState} onWithdraw={handleWithdraw} />}
                    </main>

                    <nav className="bottom-nav" aria-label="Main navigation">
                        {[
                            { page:'home',     icon:ICONS.home,     label:'Home' },
                            { page:'earn',     icon:ICONS.earn,     label:'Earn' },
                            { page:'mining',   icon:ICONS.pickaxe,  label:'Mining' },
                            { page:'mission',  icon:ICONS.trophy,   label:'Missions' },
                            { page:'referral', icon:ICONS.users,    label:'Refer' },
                            { page:'withdraw', icon:ICONS.withdraw, label:'Withdraw' },
                        ].map(({ page, icon, label }) => (
                            <div
                                key={page}
                                className={`nav-item ${activePage === page ? 'active' : ''}`}
                                onClick={() => handleNav(page)}
                                role="button"
                                aria-label={label}
                                tabIndex={0}
                                onKeyDown={e => e.key === 'Enter' && handleNav(page)}
                            >
                                <img className="nav-img" src={icon} alt={label} />
                                <span>{label}</span>
                                <div className="nav-dot" />
                            </div>
                        ))}
                    </nav>
                </>
            )}
        </>
    );
}
