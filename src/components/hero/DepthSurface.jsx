import { useEffect, useRef } from "react";
import * as THREE from "three";

/* ------------------------------------------------------------------ *
 * A limit-order-book depth surface: price across, time receding,
 * resting size as height.
 *
 * The data is SYNTHETIC — a shaped random walk, not a replay of a real
 * session — and the hero says so on screen. If that label is ever
 * removed, drive this from real data first.
 * ------------------------------------------------------------------ */

const VERT = /* glsl */ `
  uniform vec2 uPointer;
  uniform float uHeight;
  attribute float aDepth;

  varying float vH;
  varying float vDepth;
  varying float vGlow;

  void main() {
    vH = clamp(position.y / uHeight, 0.0, 1.4);
    vDepth = aDepth;

    float d = distance(vec2(position.x, position.z), uPointer);
    vGlow = 1.0 - smoothstep(0.0, 7.5, d);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;

  uniform vec3 uLow;
  uniform vec3 uMid;
  uniform vec3 uHigh;
  uniform vec3 uBlue;
  uniform float uOpacity;
  uniform float uAdditive;

  varying float vH;
  varying float vDepth;
  varying float vGlow;

  void main() {
    vec3 c = mix(uLow, uMid, smoothstep(0.02, 0.55, vH));
    c = mix(c, uHigh, smoothstep(0.55, 1.05, vH));
    c = mix(c, uBlue, vDepth * 0.32);
    c += uHigh * vGlow * 0.30;

    float fade = mix(0.22, 1.0, 1.0 - vDepth);
    float a = uOpacity * fade * (0.22 + 0.78 * smoothstep(0.0, 0.4, vH));

    /* Additively, distance is dimmer light; normally, it is thinner ink. */
    gl_FragColor = vec4(c * mix(1.0, fade, uAdditive), a);
  }
`;

export default function DepthSurface({ reduced, palette, onReady }) {
  const mount = useRef(null);
  const uniforms = useRef(null);
  const material = useRef(null);

  /* Colours change with the theme; rebuilding the scene for that would be
     wasteful, so they live in uniforms updated by their own effect. */
  useEffect(() => {
    const u = uniforms.current;
    const m = material.current;
    if (!u || !m) return;

    u.uLow.value.set(palette.low);
    u.uMid.value.set(palette.mid);
    u.uHigh.value.set(palette.high);
    u.uBlue.value.set(palette.blue);
    u.uOpacity.value = palette.opacity;
    u.uAdditive.value = palette.additive ? 1 : 0;

    m.blending = palette.additive
      ? THREE.AdditiveBlending
      : THREE.NormalBlending;
    m.needsUpdate = true;
  }, [palette]);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;

    const small = window.matchMedia("(max-width: 720px)").matches;
    const COLS = small ? 52 : 84;
    const ROWS = small ? 40 : 62;
    const WIDTH = 30;
    const DEPTH = 20;
    const HEIGHT = 2.8;
    const SPACING = DEPTH / (ROWS - 1);
    const STEP_MS = 118;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !small,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return; /* no WebGL — the CSS backdrop behind this is the fallback */
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 2));
    const canvas = renderer.domElement;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.cursor = "grab";
    canvas.style.touchAction = "pan-y";
    el.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 220);

    const geo = new THREE.PlaneGeometry(WIDTH, DEPTH, COLS - 1, ROWS - 1);
    geo.rotateX(-Math.PI / 2);

    /* Per-vertex distance from the near edge, so the shader can fade the
       far rows without recomputing anything per frame. */
    const depthAttr = new Float32Array(COLS * ROWS);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) depthAttr[r * COLS + c] = r / (ROWS - 1);
    }
    geo.setAttribute("aDepth", new THREE.BufferAttribute(depthAttr, 1));

    const u = {
      uLow: { value: new THREE.Color(palette.low) },
      uMid: { value: new THREE.Color(palette.mid) },
      uHigh: { value: new THREE.Color(palette.high) },
      uBlue: { value: new THREE.Color(palette.blue) },
      uOpacity: { value: palette.opacity },
      uAdditive: { value: palette.additive ? 1 : 0 },
      uHeight: { value: HEIGHT },
      uPointer: { value: new THREE.Vector2(0, -40) },
    };
    uniforms.current = u;

    const mat = new THREE.ShaderMaterial({
      uniforms: u,
      vertexShader: VERT,
      fragmentShader: FRAG,
      wireframe: true,
      transparent: true,
      depthWrite: false,
      blending: palette.additive
        ? THREE.AdditiveBlending
        : THREE.NormalBlending,
    });
    material.current = mat;

    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    /* ---- the synthetic book ---- */

    let midCol = COLS / 2;
    const grid = [];

    const raw = new Float32Array(COLS);

    const makeRow = () => {
      for (let c = 0; c < COLS; c++) {
        const dist = Math.abs(c - midCol);
        const shape =
          Math.exp(-Math.pow((dist - 7) / 9, 2)) * (1 - Math.exp(-dist / 1.6));
        const noise = 0.62 + Math.random() * 0.72;
        const block = Math.random() > 0.99 ? 1.9 : 1;
        raw[c] = shape * noise * block;
      }

      /* A light 3-tap smooth: real resting size is lumpy but continuous,
         and unsmoothed noise renders as a spike field. */
      const row = new Float32Array(COLS);
      for (let c = 0; c < COLS; c++) {
        const a = raw[Math.max(0, c - 1)];
        const b = raw[c];
        const d = raw[Math.min(COLS - 1, c + 1)];
        row[c] = a * 0.26 + b * 0.48 + d * 0.26;
      }
      return row;
    };

    for (let r = 0; r < ROWS; r++) grid.push(makeRow());

    const pos = geo.attributes.position;
    const arr = pos.array;

    const applyGrid = () => {
      for (let r = 0; r < ROWS; r++) {
        const row = grid[r];
        const fade = 1 - (r / ROWS) * 0.55;
        for (let c = 0; c < COLS; c++) {
          arr[(r * COLS + c) * 3 + 1] = row[c] * HEIGHT * fade;
        }
      }
      pos.needsUpdate = true;
    };

    applyGrid();
    geo.computeBoundingSphere();

    /* ---- camera ---- */

    let yaw = -0.36;
    let pitch = 0.44;
    let px = 0;
    let py = 0; /* eased pointer parallax */
    let tx = 0;
    let ty = 0;

    const place = () => {
      const d = 33;
      const y = yaw + px * 0.11;
      const p = Math.max(0.1, Math.min(1.15, pitch + py * 0.05));
      camera.position.set(
        Math.sin(y) * d * Math.cos(p),
        Math.sin(p) * d,
        Math.cos(y) * d * Math.cos(p)
      );
      camera.lookAt(0, 1.1, 0);
    };
    place();

    const draw = () => renderer.render(scene, camera);

    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      draw();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(el);

    /* ---- interaction ---- */

    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const onDown = (e) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.style.cursor = "grabbing";
      canvas.setPointerCapture?.(e.pointerId);
    };

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      if (e.clientY >= r.top && e.clientY <= r.bottom) {
        const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
        const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
        tx = nx;
        ty = ny;
        u.uPointer.value.set(nx * (WIDTH * 0.5), ny * (DEPTH * 0.35));
      }

      if (!dragging) return;
      yaw -= (e.clientX - lastX) * 0.005;
      pitch = Math.max(0.1, Math.min(1.15, pitch + (e.clientY - lastY) * 0.004));
      lastX = e.clientX;
      lastY = e.clientY;
      place();
      if (reduced) draw();
    };

    const onUp = (e) => {
      if (!dragging) return;
      dragging = false;
      canvas.style.cursor = "grab";
      canvas.releasePointerCapture?.(e.pointerId);
    };

    const onLeave = () => {
      tx = 0;
      ty = 0;
      u.uPointer.value.set(0, -40);
    };

    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    el.addEventListener("pointerleave", onLeave);

    /* ---- loop ---- */

    let raf = 0;
    let last = 0;
    let acc = 0;
    let tick = 0;
    let visible = true;
    let onScreen = true;

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(64, now - (last || now));
      last = now;

      acc += dt;
      if (acc >= STEP_MS) {
        acc -= STEP_MS;
        tick += 1;
        if (tick % 9 === 0 && Math.random() > 0.45) {
          midCol += Math.random() > 0.5 ? 1 : -1;
          midCol = Math.max(COLS * 0.36, Math.min(COLS * 0.64, midCol));
        }
        grid.pop();
        grid.unshift(makeRow());
        applyGrid();
      }

      /* Slide the mesh by the fraction of a row we are through, so the
         tape flows continuously instead of stepping. */
      mesh.position.z = -(acc / STEP_MS) * SPACING;

      px += (tx - px) * 0.045;
      py += (ty - py) * 0.045;
      if (!dragging) yaw += 0.00045;
      place();
      draw();
    };

    const running = () => visible && onScreen && !reduced;

    const sync = () => {
      if (running() && !raf) {
        last = 0;
        raf = requestAnimationFrame(loop);
      } else if (!running() && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
        draw();
      }
    };

    const onVisibility = () => {
      visible = document.visibilityState !== "hidden";
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0 }
    );
    io.observe(el);

    const onLost = (e) => {
      e.preventDefault();
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    canvas.addEventListener("webglcontextlost", onLost);

    resize();
    draw();
    onReady?.();
    sync();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("webglcontextlost", onLost);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointerleave", onLeave);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      uniforms.current = null;
      material.current = null;
      canvas.remove();
    };
    /* Palette is handled by the uniform effect above, so it is
       deliberately not a dependency here. */
  }, [reduced]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={mount} className="hero__gl" aria-hidden="true" />;
}
