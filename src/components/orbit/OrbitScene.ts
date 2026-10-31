import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CREST } from './crest';
import { readTimeline, SERVICE_COUNT, type TimelineState } from './orbitTimeline';

export interface OrbitSceneOptions {
  container: HTMLElement;
  /** One HTML label per service, positioned over its card every frame. */
  labels: HTMLElement[];
  /** White-stroked SVG markup for each service icon. */
  iconSvgs: string[];
  isDark: boolean;
  lowPower: boolean;
  onSelect: (index: number) => void;
}


const STEP = (Math.PI * 2) / SERVICE_COUNT;
const UP = new THREE.Vector3(0, 1, 0);

// Brand palette
const CYAN = new THREE.Color('#22d3ee');
const BLUE = new THREE.Color('#2563eb');
const TEAL_DEEP = new THREE.Color('#0e7490');

interface Layout {
  wide: boolean;
  radius: number;
  plaque: number;
  card: number;
  tilt: number;
  /** Ring angle where the focused card rests (radians, 0 = nearest the camera). */
  slot: number;
}

const layoutFor = (w: number): Layout =>
  w >= 1024
    ? { wide: true, radius: 3.35, plaque: 2.3, card: 1.02, tilt: 0.42, slot: 0.78 }
    : { wide: false, radius: 2.45, plaque: 1.75, card: 0.86, tilt: 0.5, slot: 0.75 };

const damp = THREE.MathUtils.damp;
const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

function roundedRectShape(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function radialTexture(stops: [number, string][]) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

/**
 * WebGL scene: the MuQore crest on a glass plaque at the centre, eight
 * service cards on a tilted orbit, light beams to each card, data pulses
 * and a sparse particle field. All motion is a function of the scroll
 * timeline plus damping, and the loop only runs while the stage is on screen.
 */
export class OrbitScene {
  private opts: OrbitSceneOptions;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  private root = new THREE.Group();
  private logo = new THREE.Group();
  private ring = new THREE.Group();
  private ringTilt = new THREE.Group();
  private cards: THREE.Group[] = [];
  private cardBodies: THREE.Mesh[] = [];
  private cardEdges: THREE.LineBasicMaterial[] = [];
  private iconMats: THREE.MeshBasicMaterial[] = [];
  private beamColors!: THREE.BufferAttribute;
  private beamMat!: THREE.LineBasicMaterial;
  private pulses!: THREE.Points;
  private pulseMat!: THREE.PointsMaterial;
  private particles!: THREE.Points;
  private particleMat!: THREE.PointsMaterial;
  private orbitLineMat!: THREE.LineBasicMaterial;
  private dotsRing!: THREE.Points;
  private dotsMat!: THREE.PointsMaterial;
  private plaqueMat!: THREE.MeshPhysicalMaterial;
  private plaqueEdgeMat!: THREE.LineBasicMaterial;
  private crestMat!: THREE.MeshBasicMaterial;
  private sheenMat!: THREE.MeshBasicMaterial;
  private glowMat!: THREE.SpriteMaterial;
  private cardMat!: THREE.MeshPhysicalMaterial;
  private ambient!: THREE.HemisphereLight;
  private key!: THREE.DirectionalLight;
  private disposables: { dispose: () => void }[] = [];
  private crestTextures: Partial<Record<'dark' | 'light', THREE.Texture>> = {};

  private layout: Layout;
  /** Layout the meshes were built with; later layouts scale relative to it. */
  private built: Layout;
  private beamGeo!: THREE.BufferGeometry;
  private width = 1;
  private height = 1;
  private isDark: boolean;
  private progress = 0;
  private tl: TimelineState = readTimeline(0);
  private clock = new THREE.Clock();
  private bornAt = performance.now();
  private running = false;
  private frame = 0;
  // The stage starts on screen; the observer stops the loop once it leaves
  private inView = true;
  private hovered = -1;
  private activeLabel = -2;

  // Damped values
  private ringAngle = 0;
  private idleAngle = 0;
  private dist = 14;
  private fx = 0.5;
  private fy = 0.5;
  private mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  private cardScale: number[] = new Array(SERVICE_COUNT).fill(1);
  private beamLevel: number[] = new Array(SERVICE_COUNT).fill(0);

  // Scratch objects (no per-frame allocation)
  private v = new THREE.Vector3();
  private v2 = new THREE.Vector3();
  private q = new THREE.Quaternion();
  private camUp = new THREE.Vector3();
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();

  private resizeObserver: ResizeObserver;
  private intersection: IntersectionObserver;

  constructor(opts: OrbitSceneOptions) {
    this.opts = opts;
    this.isDark = opts.isDark;
    const { container, lowPower } = opts;
    this.width = container.clientWidth || 1;
    this.height = container.clientHeight || 1;
    this.layout = layoutFor(this.width);
    this.built = this.layout;

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !lowPower, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1.25 : 2));
    this.renderer.setSize(this.width, this.height);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.domElement.style.display = 'block';
    container.appendChild(this.renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = envTex;
    pmrem.dispose();
    this.disposables.push(envTex);

    this.scene.add(this.root);
    this.buildLights();
    this.buildLogo();
    this.buildOrbit();
    this.buildParticles();
    this.applyTheme();
    this.loadCrest(this.isDark ? 'dark' : 'light');

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);

    this.intersection = new IntersectionObserver(([e]) => {
      this.inView = e.isIntersecting;
      this.syncLoop();
    });
    this.intersection.observe(container);
    document.addEventListener('visibilitychange', this.syncLoop);
    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    container.addEventListener('click', this.onClick);

    this.dist = this.targetDistance();
    this.renderer.compile(this.scene, this.camera);
    this.tick();
    this.syncLoop();
  }

  // ------------------------------------------------------------------ build

  private buildLights() {
    this.ambient = new THREE.HemisphereLight(0xbfe9ff, 0x0b1630, 0.9);
    this.key = new THREE.DirectionalLight(0xffffff, 2.2);
    this.key.position.set(4, 6, 8);
    const rim = new THREE.DirectionalLight(0x2563eb, 2.4);
    rim.position.set(-6, -2, -5);
    const fill = new THREE.PointLight(0x22d3ee, 18, 12, 2);
    fill.position.set(0, 0, 2.5);
    this.scene.add(this.ambient, this.key, rim, fill);
  }

  private buildLogo() {
    const { plaque } = this.layout;
    const depth = 0.16;
    const shape = roundedRectShape(plaque, plaque, plaque * 0.16);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 4,
      curveSegments: 10,
    });
    geo.translate(0, 0, -depth / 2);
    this.plaqueMat = new THREE.MeshPhysicalMaterial({
      color: '#060c1c',
      metalness: 0.65,
      roughness: 0.28,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.2,
    });
    const body = new THREE.Mesh(geo, this.plaqueMat);

    // Crest artwork: unlit and not tone-mapped so the brand colours stay exact
    const faceGeo = new THREE.PlaneGeometry(plaque, plaque);
    this.crestMat = new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false, opacity: 0 });
    const face = new THREE.Mesh(faceGeo, this.crestMat);
    face.position.z = depth / 2 + 0.051;

    // Glass sheen: a soft diagonal highlight that slides as the plaque tilts
    const sheenCanvas = document.createElement('canvas');
    sheenCanvas.width = 256;
    sheenCanvas.height = 256;
    const sctx = sheenCanvas.getContext('2d')!;
    roundedRectPath(sctx, 0, 0, 256, 256, 256 * 0.16);
    sctx.clip();
    const lg = sctx.createLinearGradient(0, 0, 256, 256);
    lg.addColorStop(0.0, 'rgba(255,255,255,0)');
    lg.addColorStop(0.42, 'rgba(255,255,255,0)');
    lg.addColorStop(0.5, 'rgba(255,255,255,0.16)');
    lg.addColorStop(0.58, 'rgba(255,255,255,0)');
    lg.addColorStop(1.0, 'rgba(255,255,255,0)');
    sctx.fillStyle = lg;
    sctx.fillRect(0, 0, 256, 256);
    const sheenTex = new THREE.CanvasTexture(sheenCanvas);
    sheenTex.wrapS = THREE.ClampToEdgeWrapping;
    this.sheenMat = new THREE.MeshBasicMaterial({
      map: sheenTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });
    const sheen = new THREE.Mesh(faceGeo, this.sheenMat);
    sheen.position.z = face.position.z + 0.004;

    // Thin luminous outline around the plaque
    const edgePts = shape.getPoints(24).map((p) => new THREE.Vector3(p.x * 1.035, p.y * 1.035, 0));
    const edgeGeo = new THREE.BufferGeometry().setFromPoints(edgePts);
    this.plaqueEdgeMat = new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.5 });
    const edge = new THREE.LineLoop(edgeGeo, this.plaqueEdgeMat);
    edge.position.z = depth / 2 + 0.055;

    // Soft halo behind the plaque
    const glowTex = radialTexture([
      [0, 'rgba(34,211,238,0.55)'],
      [0.35, 'rgba(37,99,235,0.22)'],
      [1, 'rgba(0,0,0,0)'],
    ]);
    this.glowMat = new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const glow = new THREE.Sprite(this.glowMat);
    glow.scale.setScalar(plaque * 3.2);
    glow.position.z = -0.6;

    this.logo.add(glow, body, face, sheen, edge);
    this.logo.scale.setScalar(0.001);
    this.root.add(this.logo);
    this.disposables.push(geo, faceGeo, edgeGeo, sheenTex, glowTex, this.plaqueMat, this.crestMat, this.sheenMat, this.plaqueEdgeMat, this.glowMat);
  }

  private buildOrbit() {
    const { radius, card } = this.layout;
    this.ringTilt.rotation.x = this.layout.tilt;
    this.ringTilt.add(this.ring);
    this.root.add(this.ringTilt);

    // Orbit path + a finer outer track of dots
    const pathPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 160; i++) {
      const a = (i / 160) * Math.PI * 2;
      pathPts.push(new THREE.Vector3(Math.sin(a) * radius, 0, Math.cos(a) * radius));
    }
    const pathGeo = new THREE.BufferGeometry().setFromPoints(pathPts);
    this.orbitLineMat = new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.3 });
    this.ringTilt.add(new THREE.Line(pathGeo, this.orbitLineMat));

    const dotCount = 90;
    const dotPos = new Float32Array(dotCount * 3);
    for (let i = 0; i < dotCount; i++) {
      const a = (i / dotCount) * Math.PI * 2;
      dotPos[i * 3] = Math.sin(a) * radius * 1.16;
      dotPos[i * 3 + 2] = Math.cos(a) * radius * 1.16;
    }
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPos, 3));
    const dotTex = radialTexture([
      [0, 'rgba(255,255,255,1)'],
      [0.4, 'rgba(255,255,255,0.5)'],
      [1, 'rgba(255,255,255,0)'],
    ]);
    this.dotsMat = new THREE.PointsMaterial({ map: dotTex, size: 0.07, transparent: true, depthWrite: false, opacity: 0.5, color: CYAN });
    this.dotsRing = new THREE.Points(dotGeo, this.dotsMat);
    this.ringTilt.add(this.dotsRing);

    // Cards
    const depth = 0.08;
    const cardShape = roundedRectShape(card, card, card * 0.22);
    const cardGeo = new THREE.ExtrudeGeometry(cardShape, {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 3,
      curveSegments: 8,
    });
    cardGeo.translate(0, 0, -depth / 2);
    this.cardMat = new THREE.MeshPhysicalMaterial({
      color: '#0b1426',
      metalness: 0.45,
      roughness: 0.22,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.1,
    });
    const iconGeo = new THREE.PlaneGeometry(card * 0.5, card * 0.5);
    const edgeGeo = new THREE.BufferGeometry().setFromPoints(
      cardShape.getPoints(10).map((p) => new THREE.Vector3(p.x * 1.05, p.y * 1.05, 0)),
    );

    // Beams: one segment from the centre to every card, in ring space
    const beamPos = new Float32Array(SERVICE_COUNT * 6);
    const beamCol = new Float32Array(SERVICE_COUNT * 8);

    for (let i = 0; i < SERVICE_COUNT; i++) {
      const a = i * STEP;
      const pivot = new THREE.Group();
      pivot.position.set(Math.sin(a) * radius, 0, Math.cos(a) * radius);

      const body = new THREE.Mesh(cardGeo, this.cardMat);
      body.userData.index = i;
      const iconMat = new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false, opacity: 0 });
      const icon = new THREE.Mesh(iconGeo, iconMat);
      icon.position.z = depth / 2 + 0.035;
      const edgeMat = new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.25 });
      const edge = new THREE.LineLoop(edgeGeo, edgeMat);
      edge.position.z = depth / 2 + 0.036;

      const inner = new THREE.Group();
      inner.add(body, icon, edge);
      inner.scale.setScalar(0.001);
      pivot.add(inner);
      this.ring.add(pivot);
      this.cards.push(inner);
      this.cardBodies.push(body);
      this.iconMats.push(iconMat);
      this.cardEdges.push(edgeMat);
      this.disposables.push(iconMat, edgeMat);

      beamPos.set([0, 0, 0, pivot.position.x, 0, pivot.position.z], i * 6);
    }
    this.disposables.push(pathGeo, this.orbitLineMat, dotGeo, dotTex, this.dotsMat, cardGeo, this.cardMat, iconGeo, edgeGeo);

    const beamGeo = new THREE.BufferGeometry();
    beamGeo.setAttribute('position', new THREE.BufferAttribute(beamPos, 3));
    this.beamColors = new THREE.BufferAttribute(beamCol, 4);
    beamGeo.setAttribute('color', this.beamColors);
    this.beamGeo = beamGeo;
    this.beamMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false });
    this.ring.add(new THREE.LineSegments(beamGeo, this.beamMat));

    // Data pulses travelling inward along the focused beam
    const pulseGeo = new THREE.BufferGeometry();
    pulseGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(5 * 3), 3));
    this.pulseMat = new THREE.PointsMaterial({ map: dotTex, size: 0.16, transparent: true, depthWrite: false, color: CYAN, opacity: 0 });
    this.pulses = new THREE.Points(pulseGeo, this.pulseMat);
    this.ring.add(this.pulses);
    this.disposables.push(beamGeo, this.beamMat, pulseGeo, this.pulseMat);

    this.loadIcons();
  }

  private buildParticles() {
    const count = this.opts.lowPower ? 110 : this.layout.wide ? 320 : 170;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 6;
      const t = Math.random() * Math.PI * 2;
      const ph = Math.acos(Math.random() * 2 - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(t);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(t) * 0.6;
      pos[i * 3 + 2] = r * Math.cos(ph) - 2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const tex = radialTexture([
      [0, 'rgba(255,255,255,1)'],
      [0.3, 'rgba(255,255,255,0.35)'],
      [1, 'rgba(255,255,255,0)'],
    ]);
    this.particleMat = new THREE.PointsMaterial({ map: tex, size: 0.06, transparent: true, depthWrite: false, color: CYAN });
    this.particles = new THREE.Points(geo, this.particleMat);
    this.scene.add(this.particles);
    this.disposables.push(geo, tex, this.particleMat);
  }

  // ---------------------------------------------------------------- assets

  private async loadCrest(mode: 'dark' | 'light') {
    if (this.crestTextures[mode]) {
      this.crestMat.map = this.crestTextures[mode]!;
      this.crestMat.needsUpdate = true;
      this.requestFrame();
      return;
    }
    const c = CREST[mode];
    try {
      const img = await loadImage(c.src);
      const px = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = px;
      const ctx = canvas.getContext('2d')!;
      // Clip to the plaque's rounded square; anything outside the source
      // image is filled with the artwork's own background colour.
      roundedRectPath(ctx, 0, 0, px, px, px * 0.16);
      ctx.clip();
      ctx.fillStyle = c.bg;
      ctx.fillRect(0, 0, px, px);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, c.cx - c.size / 2, c.cy - c.size / 2, c.size, c.size, 0, 0, px, px);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      this.crestTextures[mode] = tex;
      this.disposables.push(tex);
      if ((this.isDark ? 'dark' : 'light') === mode) {
        this.crestMat.map = tex;
        this.crestMat.opacity = 1;
        this.crestMat.needsUpdate = true;
        this.requestFrame();
      }
    } catch {
      // Leave the glass plaque without artwork if the image fails to load
    }
  }

  private async loadIcons() {
    await Promise.all(
      this.opts.iconSvgs.map(async (svg, i) => {
        try {
          const img = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
          const c = document.createElement('canvas');
          c.width = c.height = 256;
          c.getContext('2d')!.drawImage(img, 24, 24, 208, 208);
          const tex = new THREE.CanvasTexture(c);
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 4;
          this.iconMats[i].map = tex;
          this.iconMats[i].opacity = 1;
          this.iconMats[i].needsUpdate = true;
          this.disposables.push(tex);
        } catch {
          // Card still renders without its glyph
        }
      }),
    );
    this.requestFrame();
  }

  // ----------------------------------------------------------------- theme

  setTheme(isDark: boolean) {
    if (isDark === this.isDark) return;
    this.isDark = isDark;
    this.applyTheme();
    this.loadCrest(isDark ? 'dark' : 'light');
  }

  private applyTheme() {
    const d = this.isDark;
    const accent = d ? CYAN : TEAL_DEEP;
    const blend = d ? THREE.AdditiveBlending : THREE.NormalBlending;
    this.ambient.intensity = d ? 0.9 : 1.6;
    this.ambient.groundColor.set(d ? 0x0b1630 : 0xdbe7f5);
    this.key.intensity = d ? 2.2 : 2.6;
    this.plaqueMat.color.set(d ? '#060c1c' : '#f4f8fc');
    this.plaqueMat.metalness = d ? 0.65 : 0.25;
    this.cardMat.color.set(d ? '#0b1426' : '#ffffff');
    this.cardMat.metalness = d ? 0.45 : 0.1;
    this.cardMat.roughness = d ? 0.22 : 0.3;
    this.iconMats.forEach((m) => m.color.copy(d ? CYAN : TEAL_DEEP));
    this.cardEdges.forEach((m) => m.color.copy(accent));
    this.plaqueEdgeMat.color.copy(d ? CYAN : BLUE);
    this.orbitLineMat.color.copy(accent);
    this.orbitLineMat.opacity = d ? 0.3 : 0.35;
    for (const m of [this.dotsMat, this.particleMat, this.pulseMat, this.beamMat, this.glowMat] as THREE.Material[]) {
      m.blending = blend;
      m.needsUpdate = true;
    }
    this.dotsMat.color.copy(accent);
    this.particleMat.color.copy(d ? CYAN : BLUE);
    this.particleMat.opacity = d ? 0.7 : 0.35;
    this.pulseMat.color.copy(d ? new THREE.Color('#a5f3fc') : BLUE);
    this.glowMat.opacity = d ? 0.9 : 0.35;
    this.sheenMat.opacity = d ? 1 : 0;
    this.requestFrame();
  }

  // ---------------------------------------------------------------- inputs

  setProgress(p: number) {
    this.progress = p;
    this.tl = readTimeline(p);
    this.requestFrame();
  }

  private onPointerMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const r = this.opts.container.getBoundingClientRect();
    if (e.clientY < r.top || e.clientY > r.bottom) return;
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
    this.mouse.tx = nx;
    this.mouse.ty = ny;

    this.pointer.set(nx, ny);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObjects(this.cardBodies, false)[0];
    const idx = hit && this.cardVisibility() > 0.5 ? (hit.object.userData.index as number) : -1;
    if (idx !== this.hovered) {
      this.hovered = idx;
      this.opts.container.style.cursor = idx >= 0 ? 'pointer' : '';
    }
  };

  private onClick = () => {
    if (this.hovered >= 0) this.opts.onSelect(this.hovered);
  };

  // ---------------------------------------------------------------- layout

  private resize() {
    const { container } = this.opts;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    const wasWide = this.layout.wide;
    this.width = w;
    this.height = h;
    this.layout = layoutFor(w);
    this.renderer.setSize(w, h);
    if (wasWide !== this.layout.wide) this.relayoutGeometry();
    this.requestFrame();
  }

  /**
   * Repositions orbit geometry when crossing the desktop/mobile breakpoint.
   * Meshes keep the dimensions they were built with and are scaled instead.
   */
  private relayoutGeometry() {
    const { radius, plaque, card, tilt } = this.layout;
    const built = this.built;
    this.ringTilt.rotation.x = tilt;
    const pos = this.beamGeo.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < SERVICE_COUNT; i++) {
      const a = i * STEP;
      this.cards[i].parent!.position.set(Math.sin(a) * radius, 0, Math.cos(a) * radius);
      pos.setXYZ(i * 2 + 1, Math.sin(a) * radius, 0, Math.cos(a) * radius);
      this.cards[i].userData.base = card / built.card;
    }
    pos.needsUpdate = true;
    const s = radius / built.radius;
    this.ringTilt.children.forEach((c) => {
      if (c !== this.ring) c.scale.setScalar(s);
    });
    this.logo.userData.base = plaque / built.plaque;
  }

  /** Camera distance that fits the composition into its share of the viewport. */
  private targetDistance() {
    const { radius, card, plaque, tilt, wide } = this.layout;
    const t = this.tl;
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const halfW = radius + card * 0.75;
    const halfH = Math.max(plaque * 0.62, radius * Math.sin(tilt) + card * 0.85);
    let availW: number;
    let availH: number;
    if (wide) {
      availW = this.width * (t.stage === 'intro' ? 0.5 : 0.52);
      availH = this.height * 0.86;
    } else {
      availW = this.width * 0.96;
      availH = this.height * (t.stage === 'intro' ? 0.62 : 0.58);
    }
    const d = Math.max((halfW * this.height) / (availW * tanHalf), (halfH * this.height) / (availH * tanHalf));
    // Gentle dolly-in through the intro, pull back on the way out
    const introPush = 1.08 - 0.08 * easeOut(t.intro);
    return d * introPush * (1 + 0.55 * t.outro);
  }

  /** Where the composition's centre sits in the viewport (0..1 fractions). */
  private targetFocal(): [number, number] {
    const t = this.tl;
    if (this.layout.wide) {
      if (t.stage === 'intro') return [0.73, 0.52];
      if (t.stage === 'outro') return [0.5, 0.64];
      return [0.38, 0.52];
    }
    if (t.stage === 'intro') return [0.5, 0.6];
    if (t.stage === 'outro') return [0.5, 0.62];
    return [0.5, 0.36];
  }

  /** Cards shrink away as the outro hands over to the page. */
  private cardVisibility() {
    return 1 - this.tl.outro * 0.9;
  }

  // ------------------------------------------------------------------ loop

  /** Draws a single frame when the loop is paused (texture loaded, theme changed, scrolled). */
  private requestFrame() {
    if (!this.running) {
      cancelAnimationFrame(this.frame);
      this.frame = requestAnimationFrame(() => this.tick());
    }
  }

  private syncLoop = () => {
    const shouldRun = this.inView && !document.hidden;
    if (shouldRun && !this.running) {
      this.running = true;
      this.clock.getDelta();
      this.frame = requestAnimationFrame(this.loop);
    } else if (!shouldRun && this.running) {
      this.running = false;
      cancelAnimationFrame(this.frame);
    }
  };

  private loop = () => {
    if (!this.running) return;
    this.tick();
    this.frame = requestAnimationFrame(this.loop);
  };

  private tick() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const time = this.clock.elapsedTime;
    const born = (performance.now() - this.bornAt) / 1000;
    const t = this.tl;
    const L = this.layout;

    // ----- camera framing
    this.dist = damp(this.dist, this.targetDistance(), 3.2, dt);
    const [tfx, tfy] = this.targetFocal();
    this.fx = damp(this.fx, tfx, 3.2, dt);
    this.fy = damp(this.fy, tfy, 3.2, dt);
    this.mouse.x = damp(this.mouse.x, this.mouse.tx, 2.5, dt);
    this.mouse.y = damp(this.mouse.y, this.mouse.ty, 2.5, dt);

    // Subtle perspective shift per focused service, plus pointer parallax
    const yaw = Math.sin(t.focus * 0.9) * 0.07 * (t.stage === 'services' ? 1 : 0) + this.mouse.x * 0.05;
    const pitch = 0.05 + this.mouse.y * 0.03;
    this.camera.position.set(
      Math.sin(yaw) * this.dist,
      Math.sin(pitch) * this.dist,
      Math.cos(yaw) * Math.cos(pitch) * this.dist,
    );
    this.camera.lookAt(0, 0, 0);
    this.camera.aspect = this.width / this.height;
    this.camera.setViewOffset(
      this.width,
      this.height,
      -(this.fx - 0.5) * this.width,
      -(this.fy - 0.5) * this.height,
      this.width,
      this.height,
    );
    this.camera.updateProjectionMatrix();

    // ----- logo: entrance, restrained tilt that never hides the artwork
    const logoIn = easeOut(born / 1.4);
    const logoBase = (this.logo.userData.base as number) ?? 1;
    this.logo.scale.setScalar(Math.max(0.001, (0.82 + 0.18 * logoIn) * logoBase * (1 - 0.12 * t.outro)));
    const tiltY = this.mouse.x * 0.16 + Math.sin(time * 0.35) * 0.05 + (t.stage === 'services' ? Math.sin(t.focus * 0.9) * 0.08 : 0);
    const tiltX = -this.mouse.y * 0.1 + Math.sin(time * 0.27) * 0.03;
    this.logo.rotation.y = damp(this.logo.rotation.y, tiltY, 3, dt);
    this.logo.rotation.x = damp(this.logo.rotation.x, tiltX, 3, dt);
    this.logo.position.y = Math.sin(time * 0.8) * 0.04;
    this.sheenMat.map!.offset.set(-this.logo.rotation.y * 1.4, this.logo.rotation.x * 1.4);
    this.crestMat.opacity = this.crestMat.map ? Math.min(1, logoIn * 1.4) : 0;

    // ----- orbit: idle drift in the intro, scroll-scrubbed focus afterwards
    if (t.stage === 'intro') this.idleAngle += dt * 0.12;
    const focusTarget = L.slot - t.focus * STEP;
    const blend = easeOut(t.intro);
    let target = focusTarget * blend + (this.idleAngle + L.slot) * (1 - blend);
    // Take the shortest way round
    target += Math.PI * 2 * Math.round((this.ringAngle - target) / (Math.PI * 2));
    this.ringAngle = damp(this.ringAngle, target, 4, dt);
    this.ring.rotation.y = this.ringAngle;
    this.dotsRing.rotation.y = -time * 0.03;

    // Cards face the camera (billboard in ring space)
    this.ring.getWorldQuaternion(this.q).invert().multiply(this.camera.quaternion);
    const visible = this.cardVisibility();
    for (let i = 0; i < SERVICE_COUNT; i++) {
      const card = this.cards[i];
      const appear = easeOut((born - 0.55 - i * 0.08) / 0.7);
      const isActive = i === t.active;
      const goal = (isActive ? 1.34 : i === this.hovered ? 1.14 : 1) * appear * visible;
      this.cardScale[i] = damp(this.cardScale[i], goal, 6, dt);
      const base = (card.userData.base as number) ?? 1;
      card.scale.setScalar(Math.max(0.001, this.cardScale[i] * base));
      card.quaternion.copy(this.q);
      card.position.y = isActive ? Math.sin(time * 1.4) * 0.05 : 0;
      this.cardEdges[i].opacity = damp(this.cardEdges[i].opacity, isActive ? 0.95 : i === this.hovered ? 0.6 : 0.22, 6, dt);

      // Beams: faint for all, bright for the focused service
      const lvl = isActive ? 1 : i === this.hovered ? 0.55 : 0;
      this.beamLevel[i] = damp(this.beamLevel[i], lvl, 5, dt);
      const baseA = (this.isDark ? 0.12 : 0.18) * appear * visible;
      const a = baseA + this.beamLevel[i] * 0.75 * visible;
      const c = this.isDark ? CYAN : BLUE;
      this.beamColors.setXYZW(i * 2, c.r, c.g, c.b, a * 0.15);
      this.beamColors.setXYZW(i * 2 + 1, c.r, c.g, c.b, a);
    }
    this.beamColors.needsUpdate = true;

    // Pulses flow from the focused card into the logo
    const pulsePos = this.pulses.geometry.getAttribute('position') as THREE.BufferAttribute;
    if (t.active >= 0) {
      const a = t.active * STEP;
      const ex = Math.sin(a) * L.radius;
      const ez = Math.cos(a) * L.radius;
      for (let k = 0; k < pulsePos.count; k++) {
        const u = 1 - ((time * 0.45 + k / pulsePos.count) % 1);
        const s = 0.18 + u * 0.72; // stay outside the plaque
        pulsePos.setXYZ(k, ex * s, 0, ez * s);
      }
      pulsePos.needsUpdate = true;
    }
    this.pulseMat.opacity = damp(this.pulseMat.opacity, t.active >= 0 ? 0.95 : 0, 5, dt);

    // Ambient particles
    this.particles.rotation.y += dt * 0.015;
    this.particles.position.y = -t.focus * 0.06;
    this.particleMat.size = this.layout.wide ? 0.06 : 0.05;

    this.renderer.render(this.scene, this.camera);
    this.updateLabels(visible);
  }

  private updateLabels(visible: number) {
    const { labels } = this.opts;
    const t = this.tl;
    const born = (performance.now() - this.bornAt) / 1000;
    this.camUp.copy(UP).applyQuaternion(this.camera.quaternion);
    const camDir = this.v2.copy(this.camera.position).normalize();

    for (let i = 0; i < labels.length; i++) {
      const el = labels[i];
      const card = this.cards[i];
      card.getWorldPosition(this.v);
      const front = this.v.lengthSq() > 0 ? this.v.dot(camDir) / this.v.length() : 0; // -1 behind .. 1 front
      const half = (this.layout.card / 2) * card.scale.x + 0.14;
      this.v.addScaledVector(this.camUp, -half).project(this.camera);
      const x = (this.v.x * 0.5 + 0.5) * this.width;
      const y = (-this.v.y * 0.5 + 0.5) * this.height;

      // Only cards on the near half of the orbit carry a label, so labels never float over the plaque
      const depthFade = THREE.MathUtils.smoothstep(front, 0.05, 0.5);
      const appear = easeOut((born - 0.9 - i * 0.08) / 0.6);
      let o = depthFade * appear * visible;
      // While a service is in focus only its label (and a hovered one) stays up
      if (!this.layout.wide) o = 0; // phones: the focus panel names the service
      else if (t.stage === 'services') o = i === t.active || i === this.hovered ? o : 0;
      if (t.stage === 'outro') o = 0;

      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translateX(-50%)`;
      el.style.opacity = o.toFixed(3);
      el.style.visibility = o < 0.02 ? 'hidden' : 'visible';
      el.style.zIndex = String(Math.round((front + 1) * 10));
    }
    if (this.activeLabel !== t.active) {
      labels.forEach((el, i) => (el.dataset.active = String(i === t.active)));
      this.activeLabel = t.active;
    }
  }

  // ---------------------------------------------------------------- dispose

  dispose() {
    this.running = false;
    cancelAnimationFrame(this.frame);
    this.resizeObserver.disconnect();
    this.intersection.disconnect();
    document.removeEventListener('visibilitychange', this.syncLoop);
    window.removeEventListener('pointermove', this.onPointerMove);
    this.opts.container.removeEventListener('click', this.onClick);
    this.disposables.forEach((d) => d.dispose());
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
