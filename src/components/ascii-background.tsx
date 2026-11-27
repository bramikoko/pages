"use client";

import { useEffect, useRef } from "react";
import type * as THREE from "three";

const ASCII_CHARS = " .,:;~=+*x#%$08@";

const PALETTES = {
  dark: {
    bg: "#0a0a0a",
    ink: "#ededed",
    strength: 0.34,
    activeStrength: 0.56,
  },
  light: {
    bg: "#f2f2f2",
    ink: "#141414",
    strength: 0.25,
    activeStrength: 0.44,
  },
} as const;

function activePalette() {
  return document.documentElement.dataset.theme === "light"
    ? PALETTES.light
    : PALETTES.dark;
}

/**
 * Generates a 16-cell horizontal monochrome glyph atlas on a 2D canvas.
 * Drawn white-on-black so the red channel acts directly as an antialiased glyph mask.
 */
function createGlyphAtlas(three: typeof THREE): THREE.CanvasTexture {
  const cell = 64;
  const count = ASCII_CHARS.length;
  const atlas = document.createElement("canvas");
  atlas.width = cell * count;
  atlas.height = cell;

  const ctx = atlas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, atlas.width, atlas.height);
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const fontFamily =
      getComputedStyle(document.body).fontFamily ||
      '"JetBrains Mono", ui-monospace, monospace';
    ctx.font = `700 44px ${fontFamily}`;

    for (let i = 0; i < count; i++) {
      const ch = ASCII_CHARS[i];
      if (ch !== " ") {
        ctx.fillText(ch, i * cell + cell / 2, cell / 2 + 2);
      }
    }
  }

  const tex = new three.CanvasTexture(atlas);
  tex.minFilter = three.LinearFilter;
  tex.magFilter = three.LinearFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

const SCULPTURE_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uScrollProgress;
  uniform float uScrollVel;
  uniform vec2 uMouse;

  varying vec3 vNormal;
  varying vec3 vViewPos;

  void main() {
    float wave =
      sin(position.x * 2.1 + uTime * 1.15 + uScrollProgress * 4.0) *
      cos(position.y * 2.1 - uTime * 0.95) *
      sin(position.z * 2.1 + uTime * 0.75);

    float amp = 0.08 + clamp(abs(uScrollVel) * 0.16, 0.0, 0.24) + length(uMouse) * 0.04;
    vec3 displaced = position + normal * (wave * amp);

    // Subtle twist modulated by scroll velocity
    float twist = displaced.y * (0.18 * clamp(uScrollVel, -1.6, 1.6));
    float c = cos(twist);
    float s = sin(twist);
    displaced.xz = mat2(c, -s, s, c) * displaced.xz;

    vec4 mvPos = modelViewMatrix * vec4(displaced, 1.0);
    vViewPos = -mvPos.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const SCULPTURE_FRAG = /* glsl */ `
  precision highp float;

  uniform vec3 uLightPos;
  varying vec3 vNormal;
  varying vec3 vViewPos;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewPos);
    vec3 L1 = normalize(uLightPos + vViewPos);
    vec3 L2 = normalize(vec3(-0.8, -0.6, 0.4));

    float diff1 = max(dot(N, L1), 0.0);
    float diff2 = max(dot(N, L2), 0.0);
    float spec = pow(max(dot(reflect(-L1, N), V), 0.0), 22.0);
    float rim = pow(1.0 - max(dot(N, V), 0.0), 2.2);

    float lum = clamp(0.14 + diff1 * 0.68 + diff2 * 0.22 + spec * 0.5 + rim * 0.68, 0.0, 1.0);
    gl_FragColor = vec4(vec3(lum), 1.0);
  }
`;

const POINTS_VERT = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uScrollProgress;
  uniform float uScrollVel;
  uniform float uPixelRatio;

  varying float vAlpha;

  void main() {
    vec3 p = position;
    float angle = uTime * (0.15 + aSeed * 0.12) + uScrollProgress * 2.5;
    float c = cos(angle);
    float s = sin(angle);
    p.xz = mat2(c, -s, s, c) * p.xz;
    p.y += sin(uTime * 0.7 + aSeed * 12.0) * 0.22;

    vec4 mvPos = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = clamp((16.0 + aSeed * 14.0 + abs(uScrollVel) * 8.0) / -mvPos.z, 3.0, 22.0) * uPixelRatio;
    vAlpha = 0.45 + 0.45 * sin(uTime * 1.4 + aSeed * 18.0);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const POINTS_FRAG = /* glsl */ `
  precision highp float;
  varying float vAlpha;

  void main() {
    vec2 p = abs(gl_PointCoord - 0.5);
    if (max(p.x, p.y) > 0.36) discard;
    gl_FragColor = vec4(vec3(clamp(vAlpha, 0.25, 0.95)), 1.0);
  }
`;

const ASCII_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const ASCII_FRAG = /* glsl */ `
  precision highp float;

  uniform sampler2D uSceneTex;
  uniform sampler2D uAtlasTex;
  uniform vec2 uResolution;
  uniform vec2 uCellSize;
  uniform float uCharCount;
  uniform float uTime;
  uniform float uScrollY;
  uniform float uScrollVel;
  uniform vec2 uMouse;
  uniform float uMouseSpeed;
  uniform vec3 uBgColor;
  uniform vec3 uInkColor;
  uniform float uStrength;
  uniform float uActiveStrength;

  varying vec2 vUv;

  float hash21(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec2 fragPx = vUv * uResolution;
    vec2 cell = floor(fragPx / uCellSize);
    vec2 localUv = fract(fragPx / uCellSize);
    vec2 cellCenterPx = (cell + 0.5) * uCellSize;
    vec2 sampleUv = cellCenterPx / uResolution;

    // Mouse field: localized ripple + glyph displacement
    vec2 mousePx = uMouse * uResolution;
    vec2 toMouse = cellCenterPx - mousePx;
    float dist = length(toMouse);
    float radius = max(120.0, min(uResolution.x, uResolution.y) * 0.25);
    float mouseAura = exp(-(dist * dist) / (radius * radius));
    float ripple = sin(dist * 0.048 - uTime * 8.0) * mouseAura * min(uMouseSpeed, 1.4);
    vec2 pushDir = dist > 0.001 ? toMouse / dist : vec2(0.0);

    sampleUv -= pushDir * (mouseAura * 0.026 * (0.35 + uMouseSpeed) + ripple * 0.012);

    // Scroll-velocity horizontal scanline shear
    float rowNoise = hash21(vec2(cell.y, floor(uTime * 15.0)));
    sampleUv.x += (rowNoise - 0.5) * clamp(uScrollVel, -1.5, 1.5) * 0.024;

    float sceneLum = texture2D(uSceneTex, clamp(sampleUv, 0.001, 0.999)).r;

    // Continuous background terminal matrix wave driven smoothly by scrollY
    vec2 gridPos = cell + vec2(0.0, uScrollY * 0.032);
    float wave =
      sin(gridPos.x * 0.13 + uTime * 0.5) *
      cos(gridPos.y * 0.11 - uTime * 0.38) * 0.5 + 0.5;
    float cellSeed = hash21(floor(gridPos));
    float twinkle = step(0.915, fract(cellSeed + floor(uTime * 2.2 + cellSeed * 7.0) * 0.19));
    float ambient = wave * 0.14 + twinkle * 0.14;

    float lum = max(sceneLum, ambient);
    lum = clamp(lum + mouseAura * (0.26 + 0.36 * min(uMouseSpeed, 1.3)), 0.0, 1.0);

    float idx = floor(lum * (uCharCount - 0.001));

    // Local terminal scramble inside the active cursor aura when moving fast
    if (mouseAura > 0.3 && (uMouseSpeed > 0.08 || sceneLum > 0.2)) {
      float scramble = hash21(cell + floor(uTime * 14.0));
      if (scramble > 0.58) {
        idx = mod(idx + floor(scramble * 5.0), uCharCount);
      }
    }

    float glyph = 0.0;
    if (idx > 0.5) {
      vec2 atlasUv = vec2(
        (idx + mix(0.04, 0.96, localUv.x)) / uCharCount,
        mix(0.04, 0.96, localUv.y)
      );
      glyph = texture2D(uAtlasTex, atlasUv).r;
    }

    float emphasis = clamp(mouseAura * 0.75 + sceneLum * 0.45, 0.0, 1.0);
    float baseFade = mix(0.42, 1.0, smoothstep(0.14, 0.36, sceneLum + mouseAura * 0.8));
    float inkAlpha = glyph * mix(uStrength, uActiveStrength, emphasis) * baseFade;

    vec3 col = mix(uBgColor, uInkColor, clamp(inkAlpha, 0.0, 0.65));
    gl_FragColor = vec4(col, 1.0);
  }
`;

/**
 * Lightweight 2D Canvas ASCII fallback when WebGL is unavailable.
 */
function startFallback2D(canvas: HTMLCanvasElement, reduced: boolean) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  let w = 0;
  let h = 0;
  let raf = 0;
  let running = true;
  let mx = 0.5;
  let my = 0.5;
  let t = 0;

  const resize = () => {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
  };

  const draw = () => {
    const pal = activePalette();
    const cw = 14;
    const ch = 17;
    const cols = Math.ceil(w / cw);
    const rows = Math.ceil(h / ch);
    const scrollOffset = window.scrollY * 0.03;

    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, w, h);
    ctx.font = `700 13px "JetBrains Mono", monospace`;
    ctx.textBaseline = "top";
    ctx.fillStyle = pal.ink;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const nx = c / Math.max(cols, 1);
        const ny = r / Math.max(rows, 1);
        const dx = nx - mx;
        const dy = ny - my;
        const d = Math.hypot(dx, dy);
        const wave =
          Math.sin(c * 0.18 + t + scrollOffset) *
          Math.cos(r * 0.16 - t * 0.7 + scrollOffset * 0.5);
        const ring = Math.sin(d * 18 - t * 3) * Math.exp(-d * 4);
        const val = Math.max(0, Math.min(1, 0.35 + wave * 0.35 + ring * 0.55));
        const idx = Math.floor(val * (ASCII_CHARS.length - 1));
        if (idx > 0) {
          ctx.globalAlpha = 0.08 + val * 0.22;
          ctx.fillText(ASCII_CHARS[idx], c * cw, r * ch);
        }
      }
    }
    ctx.globalAlpha = 1;
  };

  const loop = () => {
    if (!running) return;
    t += 0.025;
    draw();
    raf = requestAnimationFrame(loop);
  };

  const onPointer = (e: PointerEvent) => {
    mx = e.clientX / Math.max(window.innerWidth, 1);
    my = e.clientY / Math.max(window.innerHeight, 1);
  };

  const onTheme = () => {
    if (reduced) draw();
  };

  resize();
  if (reduced) {
    draw();
  } else {
    loop();
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("themechange", onTheme);

  return () => {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onPointer);
    window.removeEventListener("themechange", onTheme);
  };
}

/**
 * Interactive Three.js WebGL ASCII background:
 * Renders an animated 3D sculptural scene (torus knot, geodesic wireframe,
 * and orbital points) into an offscreen target, then quantizes it through a
 * GPU glyph-atlas ASCII shader driven by pointer inertia and smooth scroll.
 */
export default function AsciiBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const three = await import("three");
        if (disposed) return;

        const renderer = new three.WebGLRenderer({
          canvas,
          antialias: false,
          powerPreference: "high-performance",
          alpha: false,
        });
        renderer.setClearColor(0x000000, 1);

        // Offscreen 3D scene rendered in grayscale luminance
        const scene = new three.Scene();
        const camera = new three.PerspectiveCamera(44, 1, 0.1, 100);
        camera.position.set(0, 0, 5.4);

        const group = new three.Group();
        scene.add(group);

        const knotUniforms = {
          uTime: { value: 0 },
          uScrollProgress: { value: 0 },
          uScrollVel: { value: 0 },
          uMouse: { value: new three.Vector2(0, 0) },
          uLightPos: { value: new three.Vector3(2.2, 2.0, 4.0) },
        };

        const knotGeo = new three.TorusKnotGeometry(1.22, 0.38, 160, 28, 2, 3);
        const knotMat = new three.ShaderMaterial({
          uniforms: knotUniforms,
          vertexShader: SCULPTURE_VERT,
          fragmentShader: SCULPTURE_FRAG,
        });
        const knotMesh = new three.Mesh(knotGeo, knotMat);
        group.add(knotMesh);

        // Outer geodesic wireframe shell for architectural depth
        const cageGeo = new three.EdgesGeometry(new three.IcosahedronGeometry(2.35, 1));
        const cageMat = new three.LineBasicMaterial({
          color: 0x777777,
          transparent: true,
          opacity: 0.55,
        });
        const cageMesh = new three.LineSegments(cageGeo, cageMat);
        group.add(cageMesh);

        // Orbiting 3D particle cloud
        const pointCount = 130;
        const pointPos = new Float32Array(pointCount * 3);
        const pointSeeds = new Float32Array(pointCount);
        for (let i = 0; i < pointCount; i++) {
          const r = 2.0 + Math.random() * 2.4;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          pointPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
          pointPos[i * 3 + 1] = (r * Math.cos(phi)) * 0.75;
          pointPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
          pointSeeds[i] = Math.random();
        }
        const pointsGeo = new three.BufferGeometry();
        pointsGeo.setAttribute("position", new three.BufferAttribute(pointPos, 3));
        pointsGeo.setAttribute("aSeed", new three.BufferAttribute(pointSeeds, 1));
        const pointsUniforms = {
          uTime: { value: 0 },
          uScrollProgress: { value: 0 },
          uScrollVel: { value: 0 },
          uPixelRatio: { value: 1 },
        };
        const pointsMat = new three.ShaderMaterial({
          uniforms: pointsUniforms,
          vertexShader: POINTS_VERT,
          fragmentShader: POINTS_FRAG,
          transparent: true,
          depthWrite: false,
        });
        const pointsMesh = new three.Points(pointsGeo, pointsMat);
        scene.add(pointsMesh);

        // Render target + post-process ASCII pass
        const renderTarget = new three.WebGLRenderTarget(512, 512, {
          minFilter: three.LinearFilter,
          magFilter: three.LinearFilter,
          depthBuffer: true,
        });

        const atlasTex = createGlyphAtlas(three);
        const initialPal = activePalette();

        const postScene = new three.Scene();
        const postCamera = new three.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        const postUniforms = {
          uSceneTex: { value: renderTarget.texture },
          uAtlasTex: { value: atlasTex },
          uResolution: { value: new three.Vector2(1, 1) },
          uCellSize: { value: new three.Vector2(12, 15) },
          uCharCount: { value: ASCII_CHARS.length },
          uTime: { value: 0 },
          uScrollY: { value: 0 },
          uScrollVel: { value: 0 },
          uMouse: { value: new three.Vector2(0.5, 0.5) },
          uMouseSpeed: { value: 0 },
          uBgColor: { value: new three.Color(initialPal.bg) },
          uInkColor: { value: new three.Color(initialPal.ink) },
          uStrength: { value: initialPal.strength },
          uActiveStrength: { value: initialPal.activeStrength },
        };

        const quadGeo = new three.PlaneGeometry(2, 2);
        const quadMat = new three.ShaderMaterial({
          uniforms: postUniforms,
          vertexShader: ASCII_VERT,
          fragmentShader: ASCII_FRAG,
          depthTest: false,
          depthWrite: false,
        });
        postScene.add(new three.Mesh(quadGeo, quadMat));

        // Pointer & scroll state (exponentially smoothed for inertia)
        let targetMouseX = 0.5;
        let targetMouseY = 0.5;
        let smoothMouseX = 0.5;
        let smoothMouseY = 0.5;
        let lastRawMouseX = 0.5;
        let lastRawMouseY = 0.5;
        let mouseSpeed = 0;

        let smoothScrollY = window.scrollY;
        let lastScrollY = window.scrollY;
        let smoothScrollVel = 0;

        const syncTheme = () => {
          const pal = activePalette();
          postUniforms.uBgColor.value.set(pal.bg);
          postUniforms.uInkColor.value.set(pal.ink);
          postUniforms.uStrength.value = pal.strength;
          postUniforms.uActiveStrength.value = pal.activeStrength;
        };

        const resize = () => {
          const w = window.innerWidth;
          const h = window.innerHeight;
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const aspect = w / Math.max(h, 1);

          renderer.setPixelRatio(dpr);
          renderer.setSize(w, h, false);

          const rtW = Math.max(256, Math.min(1280, Math.floor(w * 0.75)));
          const rtH = Math.max(256, Math.min(1280, Math.floor(h * 0.75)));
          renderTarget.setSize(rtW, rtH);

          camera.aspect = aspect;
          camera.position.z = w < 768 ? 6.8 : 5.3;
          camera.updateProjectionMatrix();

          const cellW = w < 640 ? 10 : 12;
          const cellH = w < 640 ? 13 : 15;
          postUniforms.uResolution.value.set(w, h);
          postUniforms.uCellSize.value.set(cellW, cellH);
          pointsUniforms.uPixelRatio.value = dpr;
        };

        const renderFrame = (elapsed: number, dt: number) => {
          const scrollMax = Math.max(
            1,
            document.documentElement.scrollHeight - window.innerHeight,
          );
          const curScrollY = window.scrollY;
          const rawScrollVel = (curScrollY - lastScrollY) / Math.max(dt * 1000, 1);
          lastScrollY = curScrollY;

          const ease = 1 - Math.exp(-8 * dt);
          smoothScrollY += (curScrollY - smoothScrollY) * ease;
          smoothScrollVel += (rawScrollVel * 0.65 - smoothScrollVel) * (1 - Math.exp(-6 * dt));

          smoothMouseX += (targetMouseX - smoothMouseX) * ease;
          smoothMouseY += (targetMouseY - smoothMouseY) * ease;
          mouseSpeed *= Math.exp(-7 * dt);

          const scrollProgress = Math.min(1, Math.max(0, smoothScrollY / scrollMax));
          const ndcMouseX = smoothMouseX * 2 - 1;
          const ndcMouseY = smoothMouseY * 2 - 1;

          // Update 3D sculpture transforms from time + scroll + pointer
          knotUniforms.uTime.value = elapsed;
          knotUniforms.uScrollProgress.value = scrollProgress;
          knotUniforms.uScrollVel.value = smoothScrollVel;
          knotUniforms.uMouse.value.set(ndcMouseX, ndcMouseY);
          knotUniforms.uLightPos.value.set(
            ndcMouseX * 3.6 + 1.2,
            ndcMouseY * 3.2 + 1.4,
            4.2,
          );

          pointsUniforms.uTime.value = elapsed;
          pointsUniforms.uScrollProgress.value = scrollProgress;
          pointsUniforms.uScrollVel.value = smoothScrollVel;

          group.rotation.y =
            elapsed * 0.22 + scrollProgress * Math.PI * 3.2 + ndcMouseX * 0.75;
          group.rotation.x =
            Math.sin(elapsed * 0.18) * 0.28 +
            scrollProgress * Math.PI * 1.4 -
            ndcMouseY * 0.55;
          group.rotation.z = elapsed * 0.08 + smoothScrollVel * 0.12;

          // Subtle lateral drift across sections so the sculpture frames content nicely
          group.position.x =
            Math.sin(scrollProgress * Math.PI * 2.0 + 0.6) * 0.85 + ndcMouseX * 0.28;
          group.position.y =
            Math.cos(scrollProgress * Math.PI * 1.5) * 0.25 + ndcMouseY * 0.22;

          cageMesh.rotation.y = -elapsed * 0.12 - scrollProgress * 1.8;
          cageMesh.rotation.x = elapsed * 0.09 + ndcMouseY * 0.35;
          const scalePulse = 1 + Math.min(0.14, Math.abs(smoothScrollVel) * 0.06);
          group.scale.setScalar(scalePulse);

          // Update ASCII post-process uniforms
          postUniforms.uTime.value = elapsed;
          postUniforms.uScrollY.value = smoothScrollY;
          postUniforms.uScrollVel.value = smoothScrollVel;
          postUniforms.uMouse.value.set(smoothMouseX, smoothMouseY);
          postUniforms.uMouseSpeed.value = mouseSpeed;

          // Pass 1: 3D scene -> offscreen target
          renderer.setRenderTarget(renderTarget);
          renderer.clear();
          renderer.render(scene, camera);

          // Pass 2: ASCII shader -> screen
          renderer.setRenderTarget(null);
          renderer.render(postScene, postCamera);
        };

        const onPointer = (e: PointerEvent) => {
          const nx = e.clientX / Math.max(window.innerWidth, 1);
          const ny = 1 - e.clientY / Math.max(window.innerHeight, 1);
          const dist = Math.hypot(nx - lastRawMouseX, ny - lastRawMouseY);
          lastRawMouseX = nx;
          lastRawMouseY = ny;
          targetMouseX = nx;
          targetMouseY = ny;
          mouseSpeed = Math.min(2.0, mouseSpeed + dist * 16);
        };

        const onTouch = (e: TouchEvent) => {
          const touch = e.touches[0];
          if (!touch) return;
          targetMouseX = touch.clientX / Math.max(window.innerWidth, 1);
          targetMouseY = 1 - touch.clientY / Math.max(window.innerHeight, 1);
          mouseSpeed = Math.min(1.4, mouseSpeed + 0.35);
        };

        let raf = 0;
        let running = true;
        let elapsed = 0;
        let lastTime = performance.now();

        const loop = (now: number) => {
          if (!running || disposed) return;
          const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
          lastTime = now;
          elapsed += dt;
          renderFrame(elapsed, dt);
          raf = requestAnimationFrame(loop);
        };

        const onVis = () => {
          if (document.hidden) {
            running = false;
            cancelAnimationFrame(raf);
          } else if (!reduced) {
            running = true;
            lastTime = performance.now();
            raf = requestAnimationFrame(loop);
          }
        };

        const onTheme = () => {
          syncTheme();
          if (reduced) renderFrame(elapsed, 0.016);
        };

        // Re-create atlas once webfonts finish loading so JetBrains Mono glyphs are guaranteed
        document.fonts?.ready.then(() => {
          if (disposed) return;
          const fresh = createGlyphAtlas(three);
          postUniforms.uAtlasTex.value = fresh;
          atlasTex.dispose();
          if (reduced) renderFrame(elapsed, 0.016);
        });

        resize();
        syncTheme();

        if (reduced) {
          renderFrame(0.6, 0.016);
        } else {
          raf = requestAnimationFrame(loop);
        }

        const ro = new ResizeObserver(() => {
          resize();
          if (reduced) renderFrame(elapsed, 0.016);
        });
        ro.observe(document.documentElement);

        const mo = new MutationObserver(() => onTheme());
        mo.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["data-theme"],
        });

        window.addEventListener("pointermove", onPointer, { passive: true });
        window.addEventListener("touchmove", onTouch, { passive: true });
        window.addEventListener("themechange", onTheme);
        document.addEventListener("visibilitychange", onVis);

        cleanup = () => {
          running = false;
          cancelAnimationFrame(raf);
          ro.disconnect();
          mo.disconnect();
          window.removeEventListener("pointermove", onPointer);
          window.removeEventListener("touchmove", onTouch);
          window.removeEventListener("themechange", onTheme);
          document.removeEventListener("visibilitychange", onVis);

          knotGeo.dispose();
          knotMat.dispose();
          cageGeo.dispose();
          cageMat.dispose();
          pointsGeo.dispose();
          pointsMat.dispose();
          quadGeo.dispose();
          quadMat.dispose();
          renderTarget.dispose();
          (postUniforms.uAtlasTex.value as THREE.Texture).dispose();
          renderer.dispose();
        };
      } catch {
        if (!disposed) {
          cleanup = startFallback2D(canvas, reduced);
        }
      }
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return <canvas ref={ref} className="px-canvas" aria-hidden="true" />;
}
