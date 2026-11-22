import type * as THREE_TYPE from 'three';
import type { ThreeModule, ThreeSceneHandle } from './types';

const PARTICLE_COUNT = 5000;
const AXON_COUNT = 44;
const SPARK_COUNT = 70;

const PARTICLE_VERTEX_SHADER = /* glsl */ `
  attribute vec3 aHelix;
  attribute vec3 aWave;
  attribute vec3 aTerrain;
  attribute float aRandom;
  attribute float aGyri;
  attribute float aRegion;

  uniform float uTime;
  uniform float uScroll;
  uniform float uBrainRotY;
  uniform vec2 uMouse;
  uniform float uPulse;
  uniform float uPixelRatio;

  varying float vBrainWeight;
  varying float vMix;
  varying float vRandom;
  varying float vGyri;
  varying float vRegion;
  varying float vThoughtWave;
  varying float vPulse;
  varying float vDepth;

  float bandWeight(float edge0, float edge1, float x) {
    return smoothstep(edge0, edge1, x);
  }

  void main() {
    vRandom = aRandom;
    vGyri = aGyri;
    vRegion = aRegion;

    // Synchronized 4-state smoothstep timeline
    float wHelix = bandWeight(0.05, 0.17, uScroll);
    float wWave = bandWeight(0.32, 0.48, uScroll);
    float wTerrain = bandWeight(0.56, 0.72, uScroll);
    float brainWeight = 1.0 - wHelix;
    vBrainWeight = brainWeight;

    // Shape 0: Rotate anatomical Neural Brain in exact lockstep with axonGroup around its center (+2.05, +0.06, 0)
    float ca = cos(uBrainRotY);
    float sa = sin(uBrainRotY);
    vec3 bRot = vec3(
      position.x * ca + position.z * sa,
      position.y,
      -position.x * sa + position.z * ca
    );
    vec3 p0 = bRot + vec3(2.05, 0.06, 0.0);

    // Shape 1: Double-Helix DNA aligned on the exact same axis (+2.05 X) so Hero->Vision uncoils seamlessly
    vec3 p1 = aHelix;
    float ha = uTime * 0.42;
    float hx = p1.x - 2.05;
    p1.x = hx * cos(ha) - p1.z * sin(ha) + 2.05;
    p1.z = hx * sin(ha) + p1.z * cos(ha);

    // Shape 2: Left-side 3D Neural/ECG bio-signal wave
    vec3 p2 = aWave;
    p2.y += sin(p2.x * 2.2 - uTime * 2.3) * 0.14;

    // Shape 3: Sweeping 71x71 Topological Horizon
    vec3 p3 = aTerrain;

    // Travelling frontal-to-occipital synaptic wave across the cortex
    float thoughtWave = pow(0.5 + 0.5 * sin(position.z * 2.4 - uTime * 2.0 + aRandom * 1.4), 3.0);
    vThoughtWave = thoughtWave;

    // Organic cellular breathing during Brain hero state
    p0 += normalize(bRot + vec3(0.001)) * (thoughtWave * 0.018 * brainWeight);

    vec3 morphed = mix(p0, p1, wHelix);
    morphed = mix(morphed, p2, wWave);
    morphed = mix(morphed, p3, wTerrain);

    // Fluid biological micro-drift across later scroll chapters
    float nonBrain = 1.0 - brainWeight;
    float drift = sin(uTime * 1.15 + aRandom * 6.2831) * 0.045 * nonBrain;
    morphed.x += cos(uTime * 0.7 + morphed.y * 0.9) * 0.03 * nonBrain;
    morphed.y += drift + sin(morphed.x * 1.2 + uTime * 1.4) * (0.08 * wWave + 0.13 * wTerrain);
    morphed.z += sin(uTime * 0.85 + morphed.x * 0.8) * 0.035 * nonBrain;

    // Tactile pulse ripple on click / hover
    float radialDist = length(morphed.xy - vec2(mix(0.0, 2.05, brainWeight), 0.0));
    float ripple = sin(radialDist * 2.5 - uTime * 7.5) * uPulse * 0.16;
    morphed += normalize(morphed + vec3(0.001)) * ripple;

    // Cursor wake parallax
    morphed.x += uMouse.x * (0.14 + aRandom * 0.1);
    morphed.y += uMouse.y * (0.11 + aRandom * 0.08);

    vec4 mvPosition = modelViewMatrix * vec4(morphed, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float brainSize = 1.65 + aGyri * 1.25 + aRandom * 0.85 + thoughtWave * 1.15 + uPulse * 1.6;
    float flowSize = 2.6 + aRandom * 2.3 + uPulse * 2.0;
    float ptSize = mix(flowSize, brainSize, brainWeight) * uPixelRatio * (6.2 / max(1.5, -mvPosition.z));
    gl_PointSize = clamp(ptSize, 1.4, mix(9.5, 5.4, brainWeight));

    vMix = clamp(wWave * 0.5 + wTerrain * 0.5 + aRandom * 0.45, 0.0, 1.0);
    vPulse = uPulse;
    vDepth = clamp((-mvPosition.z - 3.0) / 8.0, 0.0, 1.0);
  }
`;

const PARTICLE_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColorCyan;
  uniform vec3 uColorBlue;
  uniform vec3 uColorViolet;
  uniform float uLightMode;
  uniform float uHeroFadeMobile;

  varying float vBrainWeight;
  varying float vMix;
  varying float vRandom;
  varying float vGyri;
  varying float vRegion;
  varying float vThoughtWave;
  varying float vPulse;
  varying float vDepth;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;

    float core = smoothstep(0.5, 0.04, d);
    float crispCore = smoothstep(0.46, 0.08, d);
    float halo = mix(pow(core, 1.55), pow(crispCore, 1.05), uLightMode);

    vec3 highlightCol = mix(vec3(0.88, 0.99, 1.0), vec3(0.02, 0.32, 0.76), uLightMode);

    // Brain anatomical color map: sapphire sulci troughs -> aqua-cyan gyri ridges -> indigo cerebellum
    float sulciFactor = mix(0.72, 0.92, uLightMode);
    vec3 cortexCol = mix(uColorBlue * sulciFactor, uColorCyan, clamp(vGyri * 1.05, 0.0, 1.0));
    vec3 cerebCol = mix(uColorBlue, uColorViolet, mix(0.48, 0.62, uLightMode));
    vec3 brainCol = mix(cortexCol, cerebCol, smoothstep(0.25, 0.65, vRegion));
    brainCol = mix(brainCol, highlightCol, vThoughtWave * mix(0.42, 0.48, uLightMode) + vPulse * mix(0.35, 0.40, uLightMode));

    vec3 flowCol = mix(uColorCyan, uColorBlue, vMix);
    flowCol = mix(flowCol, highlightCol, vPulse * mix(0.45, 0.48, uLightMode));

    vec3 col = mix(flowCol, brainCol, vBrainWeight);

    float brainAlpha = halo * (0.24 + 0.42 * vGyri + 0.24 * vThoughtWave) * (1.0 - step(0.8, vRegion) * 0.35);
    float flowAlpha = halo * (0.52 + 0.34 * (1.0 - vDepth) + vPulse * 0.22);
    float alpha = mix(flowAlpha, brainAlpha, vBrainWeight) * uHeroFadeMobile;

    if (uLightMode > 0.5) {
      alpha = clamp(alpha * 1.24, 0.0, 0.92);
    }

    gl_FragColor = vec4(col, alpha);
  }
`;

const AXON_VERT = /* glsl */ `
  attribute float aProg;
  attribute float aPhase;

  uniform float uTime;

  varying float vPulse;

  void main() {
    float head = fract(uTime * 0.42 + aPhase);
    float dist = fract(aProg - head + 1.0);
    vPulse = exp(-pow(min(dist, 1.0 - dist) * 10.0, 2.0));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const AXON_FRAG = /* glsl */ `
  uniform vec3 uColorCyan;
  uniform vec3 uColorBlue;
  uniform float uOpacity;
  uniform float uLightMode;

  varying float vPulse;

  void main() {
    vec3 impulseCol = mix(vec3(0.92, 1.0, 1.0), vec3(0.03, 0.30, 0.75), uLightMode);
    vec3 baseCol = mix(uColorBlue * mix(0.52, 0.85, uLightMode), impulseCol, vPulse);
    vec3 col = mix(baseCol, uColorCyan, 0.35 * (1.0 - vPulse));
    float baseAlpha = mix(0.12, 0.22, uLightMode);
    float alpha = clamp((baseAlpha + 0.85 * vPulse) * uOpacity, 0.0, 1.0);
    gl_FragColor = vec4(col, alpha);
  }
`;

const SPARK_VERT = /* glsl */ `
  attribute float aSeed;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uPulse;

  varying float vTwinkle;

  void main() {
    vTwinkle = pow(0.5 + 0.5 * sin(uTime * 2.8 + aSeed * 6.2831), 2.0);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = clamp((3.2 + vTwinkle * 4.2 + uPulse * 2.5) * uPixelRatio * (5.5 / max(1.5, -mvPos.z)), 2.0, 10.0);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const SPARK_FRAG = /* glsl */ `
  uniform vec3 uColorCyan;
  uniform float uOpacity;
  uniform float uLightMode;

  varying float vTwinkle;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float glow = smoothstep(0.5, 0.04, d);
    vec3 tipCol = mix(vec3(0.92, 1.0, 1.0), vec3(0.11, 0.31, 0.85), uLightMode);
    vec3 col = mix(uColorCyan, tipCol, vTwinkle * 0.6);
    gl_FragColor = vec4(col, glow * (0.25 + 0.72 * vTwinkle) * uOpacity);
  }
`;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function createClinicalStoryScene(
  THREE: ThreeModule,
  container: HTMLElement,
): ThreeSceneHandle {
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;
  let isCompact = width < 1024;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
  camera.position.set(0, 0, 7.2);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(pixelRatio);
  container.appendChild(renderer.domElement);

  const stageGroup = new THREE.Group();
  scene.add(stageGroup);

  // Unified 5,000-particle buffer seamlessly morphing: Neural Brain -> DNA Helix -> ECG Wave -> Topological Horizon
  const particleGeo = new THREE.BufferGeometry();
  const posBrain = new Float32Array(PARTICLE_COUNT * 3);
  const posHelix = new Float32Array(PARTICLE_COUNT * 3);
  const posWave = new Float32Array(PARTICLE_COUNT * 3);
  const posTerrain = new Float32Array(PARTICLE_COUNT * 3);
  const randoms = new Float32Array(PARTICLE_COUNT);
  const gyriAttr = new Float32Array(PARTICLE_COUNT);
  const regionAttr = new Float32Array(PARTICLE_COUNT);

  const gridSide = Math.ceil(Math.sqrt(PARTICLE_COUNT));
  const leftSurfacePts: THREE_TYPE.Vector3[] = [];
  const rightSurfacePts: THREE_TYPE.Vector3[] = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const t = i / PARTICLE_COUNT;
    randoms[i] = Math.random();
    const mod = i % 20;

    // -----------------------------------------------------------------------
    // Shape 0: Anatomically Sculpted 3D Neural Brain (80% Cerebrum, 15% Cerebellum, 5% Brainstem)
    // Interleaved cleanly across indices so neurons uncoil evenly along later morph shapes.
    // -----------------------------------------------------------------------
    let bx = 0;
    let by = 0;
    let bz = 0;

    if (mod < 16) {
      // Folded Dual Cerebral Hemispheres
      const side = i % 2 === 0 ? 1 : -1;
      const theta = Math.random() * Math.PI * 2;
      const ny = Math.random() * 2 - 1;
      const rh = Math.sqrt(Math.max(0, 1 - ny * ny));
      const nx = Math.abs(Math.cos(theta) * rh);
      const nz = Math.sin(theta) * rh;

      const frontTaper = nz > 0.1 ? 1.0 - 0.18 * (nz - 0.1) : 1.0;
      const medialSplit = (0.065 + Math.pow(nx, 0.78) * 0.72) * frontTaper;
      let yShape = ny * 0.88 * (nz > 0.1 ? 1.0 - 0.1 * nz : 1.0);

      // Subtle downward temporal lobe curve + orbital undersides flattening
      if (ny < -0.18) {
        yShape = lerp(yShape, -0.38, 0.32);
      }
      if (nz > -0.35 && nz < 0.55 && ny < 0.08 && nx > 0.32) {
        yShape -= 0.14 * Math.sin(((nz + 0.35) / 0.9) * Math.PI);
      }

      const g1 =
        Math.sin(nx * 11.0 + Math.cos(nz * 8.5) * 1.6) *
        Math.cos(ny * 9.5 + Math.sin(nz * 7.5) * 1.5);
      const g2 = Math.sin(nz * 14.0 - ny * 9.0 + nx * 6.0) * 0.45;
      const gyriRaw = (g1 + g2) / 1.45;

      const isSurface = i % 5 !== 0;
      const shell = isSurface
        ? 0.95 + Math.random() * 0.07 + gyriRaw * 0.052
        : 0.42 + Math.random() * 0.44;

      bx = side * medialSplit * shell * 1.18;
      by = yShape * shell * 1.18;
      bz = nz * 1.46 * shell * 1.18;

      gyriAttr[i] = clamp(gyriRaw * 0.5 + 0.5, 0, 1);
      regionAttr[i] = 0.0;

      if (isSurface && (side > 0 ? rightSurfacePts : leftSurfacePts).length < 95) {
        (side > 0 ? rightSurfacePts : leftSurfacePts).push(new THREE.Vector3(bx, by, bz));
      }
    } else if (mod < 19) {
      // Lower-Back Folia-Ribbed Cerebellum
      const side = i % 2 === 0 ? 1 : -1;
      const theta = Math.random() * Math.PI * 2;
      const ny = Math.random() * 2 - 1;
      const rh = Math.sqrt(Math.max(0, 1 - ny * ny));
      const nx = Math.abs(Math.cos(theta) * rh);
      const nz = Math.sin(theta) * rh;
      const folia = Math.sin(ny * 26.0) * 0.024;
      const sh = 0.85 + Math.random() * 0.15 + folia;

      bx = side * (0.045 + nx * 0.42) * sh * 1.18;
      by = (-0.54 + ny * 0.3 * sh) * 1.18;
      bz = (-0.72 + nz * 0.4 * sh) * 1.18;
      gyriAttr[i] = clamp(folia * 20.0 * 0.5 + 0.5, 0, 1);
      regionAttr[i] = 0.5;
    } else {
      // Tapered Brainstem descending softly at base
      const s = Math.random();
      const ang = Math.random() * Math.PI * 2;
      const rStem = lerp(0.18, 0.085, s) * (0.7 + Math.random() * 0.3);
      bx = Math.cos(ang) * rStem * 1.18;
      by = lerp(-0.48, -1.18, s) * 1.18;
      bz = (lerp(-0.2, -0.35, s) + Math.sin(ang) * rStem) * 1.18;
      gyriAttr[i] = 0.4;
      regionAttr[i] = 1.0;
    }

    posBrain[i * 3] = bx;
    posBrain[i * 3 + 1] = by;
    posBrain[i * 3 + 2] = bz;

    // -----------------------------------------------------------------------
    // Shape 1: High-Density 3D DNA Double Helix centered on the same right spine (+2.05 X)
    // -----------------------------------------------------------------------
    const turns = 3.0;
    const helixAngle = t * Math.PI * 2 * turns;
    const helixY = (t - 0.5) * 5.6;
    const helixRadius = 1.24;
    let hx = 0;
    let hz = 0;
    if (i % 5 === 0) {
      const rungStep = ((i % 25) / 25 - 0.5) * 2;
      hx = Math.cos(helixAngle) * helixRadius * rungStep;
      hz = Math.sin(helixAngle) * helixRadius * rungStep;
    } else {
      const strandOffset = i % 2 === 0 ? 0 : Math.PI;
      hx = Math.cos(helixAngle + strandOffset) * helixRadius + (Math.random() - 0.5) * 0.035;
      hz = Math.sin(helixAngle + strandOffset) * helixRadius + (Math.random() - 0.5) * 0.035;
    }
    posHelix[i * 3] = hx + 2.05;
    posHelix[i * 3 + 1] = helixY;
    posHelix[i * 3 + 2] = hz;

    // -----------------------------------------------------------------------
    // Shape 2: Dense 11-Ribbon 3D Neural / ECG Bio-Signal Wave on LEFT (-1.75 X)
    // -----------------------------------------------------------------------
    const row = i % 11;
    const waveX = (t - 0.5) * 4.6 - 1.75;
    const waveFreq = waveX * 2.1 + row * 0.34;
    const ecgSpike = Math.exp(-Math.pow(Math.sin(waveX * 1.65 + 0.6), 2) * 14.0) * 1.45;
    const waveY =
      Math.sin(waveFreq) * 0.58 + ecgSpike * (row % 2 === 0 ? 1 : -0.45) + (row - 5) * 0.14;
    const waveZ = Math.cos(waveFreq * 0.75) * 0.75 + (row - 5) * 0.12;
    posWave[i * 3] = waveX;
    posWave[i * 3 + 1] = waveY;
    posWave[i * 3 + 2] = waveZ;

    // -----------------------------------------------------------------------
    // Shape 3: Dense 71x71 Sweeping Topological Clinical Horizon Grid
    // -----------------------------------------------------------------------
    const gx = (i % gridSide) / gridSide - 0.5;
    const gz = Math.floor(i / gridSide) / gridSide - 0.5;
    const tx = gx * 11.5;
    const tz = gz * 8.5;
    const ty = -1.58 + Math.sin(tx * 0.7) * 0.42 + Math.cos(tz * 0.85) * 0.32;
    posTerrain[i * 3] = tx;
    posTerrain[i * 3 + 1] = ty;
    posTerrain[i * 3 + 2] = tz;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(posBrain, 3));
  particleGeo.setAttribute('aHelix', new THREE.BufferAttribute(posHelix, 3));
  particleGeo.setAttribute('aWave', new THREE.BufferAttribute(posWave, 3));
  particleGeo.setAttribute('aTerrain', new THREE.BufferAttribute(posTerrain, 3));
  particleGeo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
  particleGeo.setAttribute('aGyri', new THREE.BufferAttribute(gyriAttr, 1));
  particleGeo.setAttribute('aRegion', new THREE.BufferAttribute(regionAttr, 1));

  const darkCyan = new THREE.Color(0x47f1e4);
  const darkBlue = new THREE.Color(0x38bdf8);
  const darkViolet = new THREE.Color(0x6366f1);
  const lightTeal = new THREE.Color(0x008b82);
  const lightNavy = new THREE.Color(0x0284c7);
  const lightViolet = new THREE.Color(0x4f46e5);

  const particleUniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uBrainRotY: { value: 1.08 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uPulse: { value: 0 },
    uPixelRatio: { value: pixelRatio },
    uColorCyan: { value: darkCyan.clone() },
    uColorBlue: { value: darkBlue.clone() },
    uColorViolet: { value: darkViolet.clone() },
    uLightMode: { value: 0 },
    uHeroFadeMobile: { value: 1 },
  };

  const particleMat = new THREE.ShaderMaterial({
    vertexShader: PARTICLE_VERTEX_SHADER,
    fragmentShader: PARTICLE_FRAGMENT_SHADER,
    uniforms: particleUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  stageGroup.add(particles);

  // 44 Graceful Curved Axonal Neural Pathways + Synaptic Sparks (lockstep rotated with Brain)
  const axonGroup = new THREE.Group();
  axonGroup.position.set(2.05, 0.06, 0);
  stageGroup.add(axonGroup);

  const axonUniforms = {
    uTime: { value: 0 },
    uColorCyan: { value: darkCyan.clone() },
    uColorBlue: { value: darkBlue.clone() },
    uOpacity: { value: 1.0 },
    uLightMode: { value: 0 },
  };
  const axonMat = new THREE.ShaderMaterial({
    vertexShader: AXON_VERT,
    fragmentShader: AXON_FRAG,
    uniforms: axonUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const disposableGeos: THREE_TYPE.BufferGeometry[] = [particleGeo];
  const sparkPositions = new Float32Array(SPARK_COUNT * 3);
  const sparkSeeds = new Float32Array(SPARK_COUNT);
  let sparkWrite = 0;

  for (let i = 0; i < AXON_COUNT; i++) {
    const isCross = i < 10;
    const arrA = isCross || i % 2 === 0 ? leftSurfacePts : rightSurfacePts;
    const arrB = isCross ? rightSurfacePts : arrA;
    const p1 = arrA[(i * 3) % arrA.length];
    const p2 = arrB[(i * 7 + 11) % arrB.length];
    if (!p1 || !p2) continue;

    // Curve gently beneath the folded cortex or arch gracefully across the corpus callosum
    const mid = p1.clone().add(p2).multiplyScalar(isCross ? 0.25 : 0.42);
    if (isCross) {
      mid.y += 0.22;
    }

    const curve = new THREE.CatmullRomCurve3([p1, mid, p2]);
    const pts = curve.getPoints(34);
    const linePos = new Float32Array(pts.length * 3);
    const lineProg = new Float32Array(pts.length);
    const linePhase = new Float32Array(pts.length);
    const phase = i / AXON_COUNT;

    for (let k = 0; k < pts.length; k++) {
      linePos[k * 3] = pts[k].x;
      linePos[k * 3 + 1] = pts[k].y;
      linePos[k * 3 + 2] = pts[k].z;
      lineProg[k] = k / (pts.length - 1);
      linePhase[k] = phase;
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    lineGeo.setAttribute('aProg', new THREE.BufferAttribute(lineProg, 1));
    lineGeo.setAttribute('aPhase', new THREE.BufferAttribute(linePhase, 1));
    axonGroup.add(new THREE.Line(lineGeo, axonMat));
    disposableGeos.push(lineGeo);

    if (sparkWrite < SPARK_COUNT) {
      sparkPositions[sparkWrite * 3] = p1.x;
      sparkPositions[sparkWrite * 3 + 1] = p1.y;
      sparkPositions[sparkWrite * 3 + 2] = p1.z;
      sparkSeeds[sparkWrite] = Math.random();
      sparkWrite++;
    }
    if (sparkWrite < SPARK_COUNT && i % 2 === 0) {
      sparkPositions[sparkWrite * 3] = p2.x;
      sparkPositions[sparkWrite * 3 + 1] = p2.y;
      sparkPositions[sparkWrite * 3 + 2] = p2.z;
      sparkSeeds[sparkWrite] = Math.random();
      sparkWrite++;
    }
  }

  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
  sparkGeo.setAttribute('aSeed', new THREE.BufferAttribute(sparkSeeds, 1));
  disposableGeos.push(sparkGeo);

  const sparkUniforms = {
    uTime: { value: 0 },
    uPixelRatio: { value: pixelRatio },
    uPulse: { value: 0 },
    uColorCyan: { value: darkCyan.clone() },
    uOpacity: { value: 1.0 },
    uLightMode: { value: 0 },
  };
  const sparkMat = new THREE.ShaderMaterial({
    vertexShader: SPARK_VERT,
    fragmentShader: SPARK_FRAG,
    uniforms: sparkUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  axonGroup.add(new THREE.Points(sparkGeo, sparkMat));

  let smoothMouseX = 0;
  let smoothMouseY = 0;

  return {
    update({ elapsedTime, smoothedScroll, mouseX, mouseY, isHovering, pulseEnergy, isLightTheme }) {
      const targetMX = isHovering ? mouseX : Math.sin(elapsedTime * 0.25) * 0.12;
      const targetMY = isHovering ? mouseY : Math.cos(elapsedTime * 0.2) * 0.08;
      smoothMouseX += (targetMX - smoothMouseX) * 0.05;
      smoothMouseY += (targetMY - smoothMouseY) * 0.05;

      // Theme-adaptive color lerping
      if (isLightTheme) {
        particleUniforms.uColorCyan.value.lerp(lightTeal, 0.1);
        particleUniforms.uColorBlue.value.lerp(lightNavy, 0.1);
        particleUniforms.uColorViolet.value.lerp(lightViolet, 0.1);
        particleUniforms.uLightMode.value = 1;
        particleMat.blending = THREE.NormalBlending;
        axonUniforms.uColorCyan.value.lerp(lightTeal, 0.1);
        axonUniforms.uColorBlue.value.lerp(lightNavy, 0.1);
        axonUniforms.uLightMode.value = 1;
        axonMat.blending = THREE.NormalBlending;
        sparkUniforms.uColorCyan.value.lerp(lightTeal, 0.1);
        sparkUniforms.uLightMode.value = 1;
        sparkMat.blending = THREE.NormalBlending;
      } else {
        particleUniforms.uColorCyan.value.lerp(darkCyan, 0.1);
        particleUniforms.uColorBlue.value.lerp(darkBlue, 0.1);
        particleUniforms.uColorViolet.value.lerp(darkViolet, 0.1);
        particleUniforms.uLightMode.value = 0;
        particleMat.blending = THREE.AdditiveBlending;
        axonUniforms.uColorCyan.value.lerp(darkCyan, 0.1);
        axonUniforms.uColorBlue.value.lerp(darkBlue, 0.1);
        axonUniforms.uLightMode.value = 0;
        axonMat.blending = THREE.AdditiveBlending;
        sparkUniforms.uColorCyan.value.lerp(darkCyan, 0.1);
        sparkUniforms.uLightMode.value = 0;
        sparkMat.blending = THREE.AdditiveBlending;
      }

      // Unified smoothstep chapter progression
      const s1 = smoothstep(0.05, 0.17, smoothedScroll);
      const s2 = smoothstep(0.32, 0.48, smoothedScroll);
      const s3 = smoothstep(0.56, 0.72, smoothedScroll);
      const s4 = smoothstep(0.76, 0.94, smoothedScroll);

      // Lockstep rotation angle shared identically between Brain point cloud & curved axons
      const brainRotY = 1.08 + Math.sin(elapsedTime * 0.25) * 0.22 + smoothMouseX * 0.32;

      particleUniforms.uTime.value = elapsedTime;
      particleUniforms.uScroll.value = smoothedScroll;
      particleUniforms.uBrainRotY.value = brainRotY;
      particleUniforms.uMouse.value.set(smoothMouseX, smoothMouseY);
      particleUniforms.uPulse.value = pulseEnergy;
      particleUniforms.uHeroFadeMobile.value = isCompact ? lerp(0.36, 0.78, s1) : 1.0;

      // Axons fade out gracefully just as Brain neurons uncoil into Vision DNA Helix
      const axonOpacity = (1.0 - smoothstep(0.04, 0.15, smoothedScroll)) * (isCompact ? 0.36 : 1.0);
      axonGroup.visible = axonOpacity > 0.01;
      axonGroup.rotation.y = brainRotY;
      axonGroup.position.set(
        2.05 + smoothMouseX * 0.19,
        0.06 + smoothMouseY * 0.15,
        0,
      );
      axonUniforms.uTime.value = elapsedTime;
      axonUniforms.uOpacity.value = axonOpacity;
      sparkUniforms.uTime.value = elapsedTime;
      sparkUniforms.uPulse.value = pulseEnergy;
      sparkUniforms.uOpacity.value = axonOpacity;

      // Responsive centering on compact viewports so Brain stays centered behind copy
      stageGroup.position.x = isCompact
        ? lerp(-2.05, 0, clamp(smoothedScroll * 3.5, 0, 1))
        : 0;

      stageGroup.rotation.y = smoothMouseX * 0.08 + Math.sin(smoothedScroll * Math.PI) * 0.06;
      stageGroup.rotation.x = -smoothMouseY * 0.05 + smoothedScroll * 0.06;

      // Synchronized gentle camera glide
      let camX = lerp(0, 0.14, s1);
      camX = lerp(camX, -0.14, s2);
      camX = lerp(camX, 0.0, s3);
      const camY = lerp(0, 0.26, s3);
      let camZ = lerp(7.2, 6.9, s1);
      camZ = lerp(camZ, 6.7, s2);
      camZ = lerp(camZ, 7.15, s3);
      camZ = lerp(camZ, 7.55, s4);

      camera.position.set(camX, camY, camZ);
      camera.lookAt(camX * 0.25, camY * -0.15, 0);

      renderer.render(scene, camera);
    },
    resize(newW, newH) {
      isCompact = newW < 1024;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    },
    dispose() {
      for (const g of disposableGeos) g.dispose();
      particleMat.dispose();
      axonMat.dispose();
      sparkMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    },
  };
}
