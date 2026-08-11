"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ─── Data ─────────────────────────────────────────────────── */

type Project = {
  id: string;
  eyebrow: string;
  title: string;
  company: string;
  year: string;
  summary: string;
  role: string;
  technologies: string[];
  problem: string;
  solution: string;
  outcome: string;
  tone: string;
};

type CursorState = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  scale: number;
  active: boolean;
  label: string;
  magnetic: boolean;
  magnetX: number;
  magnetY: number;
};

const projects: Project[] = [
  {
    id: "aws-transit",
    eyebrow: "Project 01 / Secure Hybrid Routing",
    title: "AWS Transit Gateway Segmentation",
    company: "Fortinet",
    year: "2024 - Present",
    summary:
      "Designed segmented campus-to-cloud routing domains for a strict cutover window, balancing security posture with predictable convergence.",
    role: "Architecture, HLD/LLD, rollback SOPs, deployment automation",
    technologies: ["AWS Transit Gateway", "Direct Connect", "IPSec VPN", "Route 53", "Terraform", "Python"],
    problem:
      "Campus and cloud environments needed clean isolation without slowing application teams or introducing fragile route dependencies during migration.",
    solution:
      "Mapped routing domains, codified Transit Gateway attachment workflows, wrote rollback-ready implementation documents, and validated failover through redundant paths.",
    outcome:
      "Standardized the operational handoff and reduced manual change risk for hybrid AWS connectivity.",
    tone: "cyan",
  },
  {
    id: "fortigate-telemetry",
    eyebrow: "Project 02 / Threat-Aware Operations",
    title: "FortiGate Telemetry Correlation",
    company: "Fortinet",
    year: "2025",
    summary:
      "Connected firewall enforcement signals with AI-assisted telemetry correlation to accelerate incident investigation.",
    role: "Firewall policy review, telemetry analysis, incident runbook refinement",
    technologies: ["Fortinet FortiGate", "Splunk", "SolarWinds", "AI-assisted triage", "ServiceNow"],
    problem:
      "Production incidents required engineers to manually connect control-plane drift, firewall policy changes, and telemetry signals under pressure.",
    solution:
      "Audited topologies, aligned enforcement data with monitoring signals, and fed root-cause patterns back into runbooks and SOPs.",
    outcome:
      "Cut incident triage time from 90 minutes to 35 minutes using real operational telemetry.",
    tone: "amber",
  },
  {
    id: "azure-wan",
    eyebrow: "Project 03 / Enterprise Edge Stabilization",
    title: "Azure WAN Path Stabilization",
    company: "Lumen Technologies",
    year: "2023 - 2024",
    summary:
      "Stabilized WAN degradation across enterprise circuits by tracing loss through Azure paths and Juniper edge routing.",
    role: "Incident investigation, migration support, jitter control, observability",
    technologies: ["Azure VNet", "ExpressRoute", "Azure Firewall", "Azure VPN Gateway", "Juniper Junos", "BGP"],
    problem:
      "Latency-sensitive flows were affected by recurring WAN degradation and inconsistent path selection across hybrid boundaries.",
    solution:
      "Correlated Azure telemetry with edge router behavior, verified BGP reachability, and refined proactive alerting for bandwidth bottlenecks.",
    outcome:
      "Restored reliable service patterns for a 5,000-user enterprise edge network.",
    tone: "violet",
  },
  {
    id: "gcp-campus",
    eyebrow: "Project 04 / Campus + Cloud Boundary",
    title: "GCP Boundary Hardening",
    company: "Capital One",
    year: "2020 - 2021",
    summary:
      "Hardened campus and data center connectivity across GCP boundary paths while supporting SD-WAN, wireless, and load-balancing operations.",
    role: "Deployment engineering, runbook standardization, routing support",
    technologies: ["Google Cloud VPC", "Cloud VPN", "Cloud Interconnect", "Cisco Catalyst", "Cisco ISE", "F5 BIG-IP"],
    problem:
      "Boundary changes across GCP, campus, and data center paths needed predictable endpoint access during financial maintenance windows.",
    solution:
      "Tuned VPC routing, documented scattered procedures, supported Viptela SD-WAN deployments, and automated BGP/OSPF adjacency configuration with Ansible.",
    outcome:
      "Improved repeatability for cloud boundary changes and expanded campus network capacity.",
    tone: "green",
  },
];

const skills = [
  { name: "BGP", group: "Routing", detail: "Routing convergence and hybrid edge reachability" },
  { name: "OSPF", group: "Routing", detail: "Campus and data center control-plane design" },
  { name: "FortiGate", group: "Security", detail: "Perimeter enforcement and inspection policy" },
  { name: "Cisco ISE", group: "Security", detail: "Access control and campus segmentation" },
  { name: "AWS TGW", group: "Cloud", detail: "Transit Gateway segmentation and attachments" },
  { name: "ExpressRoute", group: "Cloud", detail: "Azure private connectivity and cutover validation" },
  { name: "Cloud Interconnect", group: "Cloud", detail: "GCP private boundary connectivity" },
  { name: "Terraform", group: "Automation", detail: "Idempotent network infrastructure workflows" },
  { name: "Ansible", group: "Automation", detail: "Repeatable routing and device configuration" },
  { name: "Python", group: "Automation", detail: "Health checks and remediation routines" },
  { name: "Splunk", group: "Telemetry", detail: "Incident correlation and operational signals" },
  { name: "SolarWinds", group: "Telemetry", detail: "Network health and bottleneck detection" },
];

const experiences = [
  {
    company: "Fortinet",
    role: "Senior Network Engineer",
    place: "Frisco, TX",
    time: "Nov 2024 - Present",
    focus: "Secure AWS segmentation, FortiGate enforcement, Direct Connect and IPSec rollout design, automation workflows.",
  },
  {
    company: "Lumen Technologies",
    role: "Network Operational Engineer",
    place: "Seattle, WA",
    time: "Jan 2023 - Oct 2024",
    focus: "WAN degradation analysis, ExpressRoute migration support, Azure edge telemetry, ITIL incident and change records.",
  },
  {
    company: "Capital One",
    role: "Network Deployment Engineer",
    place: "Mc Lean, VI",
    time: "Feb 2020 - Dec 2021",
    focus: "GCP boundary hardening, Cisco campus expansion, Viptela SD-WAN support, F5 BIG-IP load balancing.",
  },
];

/* ─── Hooks ─────────────────────────────────────────────────── */

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function useSmoothScroll() {
  const scrollY = useRef(0);
  const velocity = useRef(0);
  useEffect(() => {
    let last = window.scrollY;
    const tick = () => {
      const current = window.scrollY;
      velocity.current = current - last;
      scrollY.current = current;
      last = current;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);
  return { scrollY, velocity };
}

/* ─── Advanced Particle System ───────────────────────────────── */

function ParticleField({ reduced }: { reduced: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointer = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, frame = 0, raf = 0;
    let lastScroll = window.scrollY;
    let scrollVel = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Multi-layer particles
    const bgCount = window.innerWidth < 760 ? 20 : 50;
    const fgCount = window.innerWidth < 760 ? 10 : 25;

    type Particle = {
      x: number; y: number; ox: number; oy: number;
      vx: number; vy: number;
      phase: number; size: number; speed: number;
      layer: "bg" | "fg"; hue: number; alpha: number;
    };

    const particles: Particle[] = [];

    // Background particles — subtle, slow
    for (let i = 0; i < bgCount; i++) {
      particles.push({
        x: Math.random(), y: Math.random(),
        ox: Math.random(), oy: Math.random(),
        vx: 0, vy: 0,
        phase: Math.random() * Math.PI * 2,
        size: 0.6 + Math.random() * 0.8,
        speed: 0.3 + Math.random() * 0.4,
        layer: "bg",
        hue: [190, 35, 260, 145][Math.floor(Math.random() * 4)],
        alpha: 0.15 + Math.random() * 0.2,
      });
    }

    // Foreground particles — brighter, larger
    for (let i = 0; i < fgCount; i++) {
      particles.push({
        x: Math.random(), y: Math.random(),
        ox: Math.random(), oy: Math.random(),
        vx: 0, vy: 0,
        phase: Math.random() * Math.PI * 2,
        size: 1.0 + Math.random() * 1.5,
        speed: 0.6 + Math.random() * 0.8,
        layer: "fg",
        hue: [190, 35, 260][Math.floor(Math.random() * 3)],
        alpha: 0.3 + Math.random() * 0.4,
      });
    }

    // Shooting stars
    type ShootingStar = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number };
    const shootingStars: ShootingStar[] = [];
    let nextShoot = 200 + Math.random() * 400;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onPointerMove = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY, active: true };
    };
    const onPointerLeave = () => { pointer.current.active = false; };

    const animate = () => {
      const cs = window.scrollY;
      scrollVel += (cs - lastScroll - scrollVel) * 0.06;
      lastScroll = cs;

      const speedMul = reduced ? 0.15 : 1;
      frame += 0.006 * speedMul + Math.min(Math.abs(scrollVel) * 0.0004, 0.015);

      ctx.clearRect(0, 0, w, h);

      // Ambient radial glow
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.3, 0, w * 0.5, h * 0.3, Math.max(w, h) * 0.7);
      grad.addColorStop(0, "rgba(56, 189, 248, 0.04)");
      grad.addColorStop(0.3, "rgba(139, 92, 246, 0.02)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      const pts: { x: number; y: number; size: number; layer: string; hue: number; alpha: number }[] = [];

      // Update particles
      for (const p of particles) {
        const flowX = Math.sin(frame * p.speed + p.phase + p.y * 5) * 22;
        const flowY = Math.cos(frame * p.speed * 0.7 + p.phase + p.x * 4) * 16;
        let tx = p.ox * w + flowX;
        let ty = p.oy * h + flowY + scrollVel * (p.layer === "fg" ? 0.3 : 0.12);

        // Mouse repulsion
        if (pointer.current.active && !reduced) {
          const dx = tx - pointer.current.x;
          const dy = ty - pointer.current.y;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const force = Math.max(0, 180 - dist) / 180;
          tx += (dx / dist) * force * 55;
          ty += (dy / dist) * force * 55;
        }

        p.vx += (tx - p.x * w) * 0.0012;
        p.vy += (ty - p.y * h) * 0.0012;
        p.vx *= 0.93;
        p.vy *= 0.93;
        p.x += p.vx / w;
        p.y += p.vy / h;

        pts.push({ x: p.x * w, y: p.y * h, size: p.size, layer: p.layer, hue: p.hue, alpha: p.alpha });
      }

      // Draw connecting lines (foreground particles only)
      const fgPts = pts.filter(p => p.layer === "fg");
      for (let i = 0; i < fgPts.length; i++) {
        for (let j = i + 1; j < fgPts.length; j++) {
          const dx = fgPts[i].x - fgPts[j].x;
          const dy = fgPts[i].y - fgPts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const opacity = (1 - dist / 180) * 0.12;
            const gradient = ctx.createLinearGradient(fgPts[i].x, fgPts[i].y, fgPts[j].x, fgPts[j].y);
            gradient.addColorStop(0, `hsla(${fgPts[i].hue}, 80%, 70%, ${opacity})`);
            gradient.addColorStop(1, `hsla(${fgPts[j].hue}, 80%, 70%, ${opacity})`);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(fgPts[i].x, fgPts[i].y);
            ctx.lineTo(fgPts[j].x, fgPts[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles with glow
      for (const p of pts) {
        const pulse = Math.sin(frame * 2 + p.x * 0.01 + p.y * 0.01) * 0.3 + 0.7;
        const alpha = p.alpha * pulse;

        // Glow
        if (p.layer === "fg") {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 8);
          glow.addColorStop(0, `hsla(${p.hue}, 90%, 70%, ${alpha * 0.3})`);
          glow.addColorStop(1, `hsla(${p.hue}, 90%, 70%, 0)`);
          ctx.fillStyle = glow;
          ctx.fillRect(p.x - p.size * 8, p.y - p.size * 8, p.size * 16, p.size * 16);
        }

        // Dot
        ctx.fillStyle = `hsla(${p.hue}, 85%, ${p.layer === "fg" ? 78 : 62}%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shooting stars
      nextShoot--;
      if (nextShoot <= 0 && !reduced) {
        const angle = -0.3 - Math.random() * 0.5;
        const speed = 4 + Math.random() * 6;
        shootingStars.push({
          x: Math.random() * w * 0.8 + w * 0.1,
          y: Math.random() * h * 0.3,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 30 + Math.random() * 30,
        });
        nextShoot = 300 + Math.random() * 600;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life++;
        const progress = s.life / s.maxLife;
        const fade = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;
        const tailLen = 20 + progress * 30;

        const sg = ctx.createLinearGradient(
          s.x, s.y, s.x - s.vx * tailLen / Math.sqrt(s.vx * s.vx + s.vy * s.vy) * 0.5,
          s.y - s.vy * tailLen / Math.sqrt(s.vx * s.vx + s.vy * s.vy) * 0.5
        );
        sg.addColorStop(0, `rgba(255, 255, 255, ${fade * 0.7})`);
        sg.addColorStop(1, `rgba(56, 189, 248, 0)`);
        ctx.strokeStyle = sg;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(
          s.x - s.vx * tailLen / Math.sqrt(s.vx * s.vx + s.vy * s.vy) * 0.5,
          s.y - s.vy * tailLen / Math.sqrt(s.vx * s.vx + s.vy * s.vy) * 0.5
        );
        ctx.stroke();

        if (s.life >= s.maxLife) shootingStars.splice(i, 1);
      }

      raf = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerleave", onPointerLeave);
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} className="particle-field" aria-hidden="true" />;
}

/* ─── Premium Custom Cursor ──────────────────────────────────── */

function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const state = useRef<CursorState>({
    x: 0, y: 0, tx: 0, ty: 0,
    scale: 1, active: false, label: "",
    magnetic: false, magnetX: 0, magnetY: 0,
  });

  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!canHover) return;

    let raf = 0;
    const dotPos = { x: 0, y: 0 };
    const ringPos = { x: 0, y: 0 };

    const move = (e: PointerEvent) => {
      state.current.tx = e.clientX;
      state.current.ty = e.clientY;

      // Check magnetic elements
      const els = document.querySelectorAll("[data-magnetic]");
      let foundMagnetic = false;
      els.forEach((el) => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          foundMagnetic = true;
          state.current.magnetic = true;
          state.current.magnetX = cx + dx * 0.3;
          state.current.magnetY = cy + dy * 0.3;
        }
      });
      if (!foundMagnetic) state.current.magnetic = false;
    };

    const over = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const interactive = target?.closest("[data-cursor]") as HTMLElement | null;
      state.current.active = Boolean(interactive);
      state.current.label = interactive?.dataset.cursor || "";
    };

    const render = () => {
      const s = state.current;
      const targetX = s.magnetic ? s.magnetX : s.tx;
      const targetY = s.magnetic ? s.magnetY : s.ty;

      // Dot follows tightly (lerp 0.25)
      dotPos.x += (targetX - dotPos.x) * 0.25;
      dotPos.y += (targetY - dotPos.y) * 0.25;

      // Ring follows loosely (lerp 0.12) for spring effect
      ringPos.x += (targetX - ringPos.x) * 0.12;
      ringPos.y += (targetY - ringPos.y) * 0.12;

      const scale = s.active ? 2.5 : s.magnetic ? 1.8 : 1;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) scale(${scale})`;
        ringRef.current.dataset.active = String(s.active);
      }
      if (labelRef.current) {
        labelRef.current.style.transform = `translate3d(${ringPos.x + 24}px, ${ringPos.y + 24}px, 0)`;
        labelRef.current.textContent = s.label;
        labelRef.current.dataset.visible = String(s.active && Boolean(s.label));
      }

      raf = requestAnimationFrame(render);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    raf = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={labelRef} className="cursor-label" aria-hidden="true" />
    </>
  );
}

/* ─── Cinematic Loader ───────────────────────────────────────── */

function Loader({ reduced }: { reduced: boolean }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (reduced) { setDone(true); return; }
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 12 + 3;
      if (p >= 100) { p = 100; clearInterval(interval); setTimeout(() => setDone(true), 400); }
      setProgress(p);
    }, 60);
    return () => clearInterval(interval);
  }, [reduced]);

  return (
    <div className="loader" data-done={done} aria-hidden={done}>
      <div className="loader-content">
        <div className="loader-ring">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" className="loader-track-circle" />
            <circle cx="50" cy="50" r="44"
              className="loader-progress-circle"
              style={{ strokeDashoffset: 276.46 - (276.46 * Math.min(progress, 100)) / 100 }}
            />
          </svg>
          <span className="loader-initials">TG</span>
        </div>
        <div className="loader-bar">
          <div className="loader-bar-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
        <p className="loader-text">
          <span className="loader-glitch" data-text="Initializing secure routes">Initializing secure routes</span>
        </p>
      </div>
    </div>
  );
}

/* ─── Signal Core Visual (Hero) ──────────────────────────────── */

function SignalCore() {
  return (
    <div className="signal-core" aria-hidden="true">
      <div className="core-grid" />
      <span className="core-axis core-axis-x" />
      <span className="core-axis core-axis-y" />
      <span className="core-ring core-ring-inner" />
      <span className="core-ring core-ring-outer" />
      <span className="core-ring core-ring-orbit" />
      <div className="core-hub">
        <span>TG</span>
        <small>Network Core</small>
      </div>
      <i className="core-node core-node-a" />
      <i className="core-node core-node-b" />
      <i className="core-node core-node-c" />
      <i className="core-node core-node-d" />
      <span className="core-pulse-ring core-pulse-1" />
      <span className="core-pulse-ring core-pulse-2" />
      <span className="core-beam core-beam-1" />
      <span className="core-beam core-beam-2" />
      <span className="core-beam core-beam-3" />
    </div>
  );
}

/* ─── Project Field Visual ───────────────────────────────────── */

function ProjectField({ tone, index }: { tone: string; index: number }) {
  return (
    <div className={`project-field ${tone}`} aria-hidden="true">
      <span className="field-glow" />
      <span className="field-ring field-ring-a" />
      <span className="field-ring field-ring-b" />
      <span className="field-ring field-ring-c" />
      <span className="field-axis field-axis-x" />
      <span className="field-axis field-axis-y" />
      <i className="field-node field-node-a" />
      <i className="field-node field-node-b" />
      <i className="field-node field-node-c" />
      <i className="field-node field-node-d" />
      <span className="field-core">{String(index + 1).padStart(2, "0")}</span>
      {/* Orbiting particle */}
      <span className="field-orbiter" />
    </div>
  );
}

/* ─── Network Visual for Contact & Modal ─────────────────────── */

function NetworkVisual({ tone = "cyan" }: { tone?: string }) {
  return (
    <div className={`network-visual ${tone}`} aria-hidden="true">
      <span className="nv-node n1" />
      <span className="nv-node n2" />
      <span className="nv-node n3" />
      <span className="nv-node n4" />
      <span className="nv-route r1" />
      <span className="nv-route r2" />
      <span className="nv-route r3" />
      <span className="nv-route r4" />
      <span className="nv-route r5" />
      <span className="nv-signal s1" />
      <span className="nv-signal s2" />
      <span className="nv-signal s3" />
    </div>
  );
}

/* ─── Skill Constellation Canvas ─────────────────────────────── */

function SkillConstellation({ activeIndex }: { activeIndex: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const positions = useRef<{ x: number; y: number }[]>([]);

  const getPositions = useCallback((w: number, h: number) => {
    const cols = w > 600 ? 4 : 2;
    const rows = Math.ceil(8 / cols);
    const cellW = w / cols;
    const cellH = h / rows;
    return Array.from({ length: 8 }, (_, i) => ({
      x: (i % cols) * cellW + cellW / 2,
      y: Math.floor(i / cols) * cellH + cellH / 2,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let frame = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      positions.current = getPositions(w, h);
    };

    const draw = () => {
      frame += 0.008;
      const parent = canvas.parentElement;
      if (!parent) { raf = requestAnimationFrame(draw); return; }
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const pts = positions.current;
      if (pts.length === 0) { raf = requestAnimationFrame(draw); return; }

      // Draw constellation lines
      const connections = [
        [0, 1], [1, 2], [2, 3], [0, 4], [1, 5], [2, 6], [3, 7], [4, 5], [5, 6], [6, 7],
      ];

      for (const [a, b] of connections) {
        if (!pts[a] || !pts[b]) continue;
        const isActive = a === activeIndex || b === activeIndex;
        const pulse = Math.sin(frame * 2 + a + b) * 0.3 + 0.5;
        const alpha = isActive ? 0.25 + pulse * 0.2 : 0.06 + pulse * 0.04;

        ctx.strokeStyle = isActive
          ? `rgba(56, 189, 248, ${alpha})`
          : `rgba(148, 163, 184, ${alpha})`;
        ctx.lineWidth = isActive ? 1.5 : 0.5;
        ctx.beginPath();
        ctx.moveTo(pts[a].x, pts[a].y);
        ctx.lineTo(pts[b].x, pts[b].y);
        ctx.stroke();

        // Animated signal along active lines
        if (isActive) {
          const t = (Math.sin(frame * 3 + a) + 1) / 2;
          const sx = pts[a].x + (pts[b].x - pts[a].x) * t;
          const sy = pts[a].y + (pts[b].y - pts[a].y) * t;
          const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 6);
          g.addColorStop(0, "rgba(56, 189, 248, 0.8)");
          g.addColorStop(1, "rgba(56, 189, 248, 0)");
          ctx.fillStyle = g;
          ctx.fillRect(sx - 6, sy - 6, 12, 12);
        }
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf); };
  }, [activeIndex, getPositions]);

  return <canvas ref={canvasRef} className="skill-constellation-canvas" aria-hidden="true" />;
}

/* ─── Main Page Component ────────────────────────────────────── */

export default function Home() {
  const reduced = useReducedMotion();
  const { scrollY } = useSmoothScroll();
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const [activeSkill, setActiveSkill] = useState(skills[0]);
  const [activeSkillIndex, setActiveSkillIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroReady, setHeroReady] = useState(false);

  // Scroll reveal observer
  useEffect(() => {
    const els = Array.from(document.querySelectorAll("[data-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Stagger children
            const children = entry.target.querySelectorAll("[data-reveal-child]");
            children.forEach((child, i) => {
              (child as HTMLElement).style.transitionDelay = `${i * 80 + 100}ms`;
              child.setAttribute("data-visible", "true");
            });
            entry.target.setAttribute("data-visible", "true");
          }
        });
      },
      { threshold: 0.1 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Hero entrance
  useEffect(() => {
    const timer = setTimeout(() => setHeroReady(true), reduced ? 100 : 1200);
    return () => clearTimeout(timer);
  }, [reduced]);

  // Lock body on modal
  useEffect(() => {
    document.body.dataset.modal = String(Boolean(openProject));
  }, [openProject]);

  const navLinks = ["work", "about", "skills", "experience", "contact"];

  return (
    <main>
      <Loader reduced={reduced} />
      <ParticleField reduced={reduced} />
      <CustomCursor />

      {/* ── Navigation ────────────────────────── */}
      <nav className="nav" aria-label="Primary navigation">
        <a href="#top" className="brand" data-cursor="TOP" data-magnetic onClick={() => setMenuOpen(false)}>
          <span className="brand-mark">TG</span>
          <small>Tarun Goluguri</small>
        </a>
        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-label="Toggle navigation"
          onClick={() => setMenuOpen((v) => !v)}>
          <span data-open={menuOpen} />
          <span data-open={menuOpen} />
        </button>
        <div className="nav-links" data-open={menuOpen}>
          {navLinks.map((link) => (
            <a key={link} href={`#${link}`} data-cursor="GO" data-magnetic onClick={() => setMenuOpen(false)}>
              {link}
            </a>
          ))}
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────── */}
      <section id="top" className="hero section">
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-grid-bg" aria-hidden="true" />

        <div className="hero-copy" data-ready={heroReady}>
          <p className="kicker" data-reveal-child>
            <span className="kicker-line" />
            Tarun Goluguri / Senior Network Engineer / Frisco, TX
          </p>
          <h1>
            <span className="hero-name" data-reveal-child>Tarun</span>
            <span className="hero-name hero-name-outline" data-reveal-child>Goluguri</span>
          </h1>
          <p className="hero-tagline" data-reveal-child>
            Secure enterprise and multi-cloud networks, designed for reliability.
          </p>
          <div className="hero-actions" data-reveal-child>
            <a href="#work" className="btn btn-primary" data-cursor="EXPLORE" data-magnetic>
              <span>Explore work</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="mailto:tarun.gr515@gmail.com" className="btn btn-ghost" data-cursor="EMAIL" data-magnetic>
              Contact
            </a>
          </div>
        </div>

        <div className="hero-visual" data-ready={heroReady}>
          <SignalCore />
          <div className="hero-readout">
            <span>Secure routing</span>
            <span>Hybrid cloud</span>
          </div>
        </div>

        <div className="scroll-indicator" aria-hidden="true" data-ready={heroReady}>
          <span>Scroll</span>
          <div className="scroll-line"><i /></div>
        </div>
      </section>

      {/* ── Selected Work ─────────────────────── */}
      <section id="work" className="work section">
        <div className="section-header" data-reveal>
          <p className="section-index" data-reveal-child>01 / Selected Work</p>
          <h2 data-reveal-child>Selected network<br />systems.</h2>
        </div>
        <div className="project-stream">
          {projects.map((project, index) => (
            <article
              key={project.id}
              className={`project-row ${project.tone}`}
              data-reveal
            >
              <button
                type="button"
                data-cursor="VIEW"
                onClick={() => setOpenProject(project)}
                aria-label={`Open case study for ${project.title}`}
              >
                <div className="project-index" data-reveal-child>
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="project-info" data-reveal-child>
                  <p className="project-eyebrow">{project.eyebrow}</p>
                  <h3>{project.title}</h3>
                  <span className="project-meta">{project.company} / {project.year}</span>
                </div>
                <ProjectField tone={project.tone} index={index} />
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* ── About ─────────────────────────────── */}
      <section id="about" className="about section">
        <div className="about-statement" data-reveal>
          <p className="section-index" data-reveal-child>02 / About</p>
          <h2 data-reveal-child>
            Infrastructure designed<br />to stay dependable<br />under pressure.
          </h2>
        </div>
        <div className="about-details" data-reveal>
          <p data-reveal-child>
            Senior network engineer with 5 years of experience across enterprise, data center, and multi-cloud environments.
          </p>
          <div className="education-card" data-reveal-child>
            <span className="card-label">Education</span>
            <strong>University of Memphis</strong>
            <small>Master&apos;s in Information Systems</small>
          </div>
        </div>
      </section>

      {/* ── Skills ────────────────────────────── */}
      <section id="skills" className="skills section">
        <div className="section-header" data-reveal>
          <p className="section-index" data-reveal-child>03 / Core Expertise</p>
          <h2 data-reveal-child>Focused technical<br />capability.</h2>
        </div>
        <div className="skill-lab" data-reveal>
          <div className="skill-map">
            <SkillConstellation activeIndex={activeSkillIndex} />
            {skills.slice(0, 8).map((skill, i) => (
              <button
                key={skill.name}
                type="button"
                className={`skill-node ${activeSkillIndex === i ? "active" : ""}`}
                onMouseEnter={() => { setActiveSkill(skill); setActiveSkillIndex(i); }}
                onFocus={() => { setActiveSkill(skill); setActiveSkillIndex(i); }}
                data-cursor="INSPECT"
              >
                <span className="skill-dot" />
                {skill.name}
              </button>
            ))}
          </div>
          <aside className="skill-panel">
            <span className="card-label">{activeSkill.group}</span>
            <h3>{activeSkill.name}</h3>
            <p>{activeSkill.detail}</p>
          </aside>
        </div>
      </section>

      {/* ── Experience ────────────────────────── */}
      <section id="experience" className="experience section">
        <div className="section-header" data-reveal>
          <p className="section-index" data-reveal-child>04 / Experience</p>
          <h2 data-reveal-child>Professional<br />experience.</h2>
        </div>
        <div className="timeline">
          {experiences.map((item, index) => (
            <article key={item.company} className="timeline-item" data-reveal>
              <div className="timeline-marker" data-reveal-child>
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="timeline-content" data-reveal-child>
                <span className="timeline-meta">{item.time} / {item.place}</span>
                <h3>{item.role}</h3>
                <strong>{item.company}</strong>
                <p>{item.focus}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Contact ───────────────────────────── */}
      <section id="contact" className="contact section">
        <div className="contact-content" data-reveal>
          <p className="section-index" data-reveal-child>05 / Contact</p>
          <h2 data-reveal-child>
            Let&apos;s build infrastructure<br />worth trusting.
          </h2>
          <div className="contact-links" data-reveal-child>
            <a href="mailto:tarun.gr515@gmail.com" className="btn btn-primary" data-cursor="EMAIL" data-magnetic>
              tarun.gr515@gmail.com
            </a>
            <a href="tel:+15129859123" className="btn btn-ghost" data-cursor="CALL" data-magnetic>
              +1 (512) 985-9123
            </a>
            <a
              href="https://www.linkedin.com/in/tarun-reddy313b65551/"
              className="btn btn-ghost"
              target="_blank"
              rel="noreferrer"
              data-cursor="OPEN"
              data-magnetic
            >
              LinkedIn
            </a>
          </div>
        </div>
        <div className="contact-visual" data-reveal>
          <NetworkVisual tone="amber" />
        </div>
      </section>

      {/* ── Footer ────────────────────────────── */}
      <footer>
        <span>Tarun Goluguri</span>
        <span>Senior Network Engineer</span>
        <a href="https://www.linkedin.com/in/tarun-reddy313b65551/" target="_blank" rel="noreferrer" data-cursor="OPEN">
          LinkedIn
        </a>
        <span>2026</span>
      </footer>

      {/* ── Case Study Modal ──────────────────── */}
      {openProject ? (
        <div className="case-modal" role="dialog" aria-modal="true" aria-labelledby="case-title">
          <div className="case-modal-backdrop" onClick={() => setOpenProject(null)} />
          <button className="case-close" type="button" onClick={() => setOpenProject(null)} data-cursor="CLOSE" data-magnetic>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Close
          </button>
          <div className="case-body">
            <div className={`case-hero ${openProject.tone}`}>
              <NetworkVisual tone={openProject.tone} />
              <div>
                <p>{openProject.eyebrow}</p>
                <h2 id="case-title">{openProject.title}</h2>
                <span>{openProject.company} / {openProject.year}</span>
              </div>
            </div>
            <div className="case-content">
              <section>
                <span>Context</span>
                <p>{openProject.summary}</p>
              </section>
              <section>
                <span>Problem</span>
                <p>{openProject.problem}</p>
              </section>
              <section>
                <span>Solution</span>
                <p>{openProject.solution}</p>
              </section>
              <section>
                <span>Outcome</span>
                <p>{openProject.outcome}</p>
              </section>
              <section className="tech-tags">
                <span>Technology</span>
                <div>
                  {openProject.technologies.map((tech) => (
                    <i key={tech}>{tech}</i>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
