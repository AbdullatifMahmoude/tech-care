import type * as THREE_TYPE from 'three';
import type { ThreeModule, ThreeSceneHandle } from './types';

const PARTICLE_COUNT = 9000;
const AXON_COUNT = 72;
const SEGMENTS_PER_TRACT = 34;
const SPARK_COUNT = 120;
const BRAIN_SCALE = 1.24;

const SHELL_VERT = /* glsl */ `
  attribute float aGyri;
  attribute float aRegion;
  attribute float aEdgeFade;

  uniform float uTime;
  uniform float uPulse;

  varying vec3 vNormalView;
  varying vec3 vViewDir;
  varying vec3 vObjPos;
  varying float vGyri;
  varying float vRegion;
  varying float vEdgeFade;
  varying float vThought;

  void main() {
    vGyri = aGyri;
    vRegion = aRegion;
    vEdgeFade = aEdgeFade;
    vObjPos = position;

    // Travelling frontal-to-occipital & cross-hemispheric living thought waves
    float wave1 = pow(0.5 + 0.5 * sin(position.z * 2.5 - uTime * 2.1 + position.x * 0.8), 3.0);
    float wave2 = pow(0.5 + 0.5 * sin(position.x * 3.1 + uTime * 1.4 - position.y * 1.6), 4.0);
    vThought = clamp(wave1 * 0.72 + wave2 * 0.48, 0.0, 1.0);

    vec3 displaced = position + normal * (vThought * 0.01 + uPulse * 0.025);
    vec4 mvPos = modelViewMatrix * vec4(displaced, 1.0);

    vNormalView = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPos.xyz);

    gl_Position = projectionMatrix * mvPos;
  }
`;

const SHELL_FRAG = /* glsl */ `
  uniform vec3 uColorCyan;
  uniform vec3 uColorBlue;
  uniform vec3 uColorViolet;
  uniform float uOpacity;
  uniform float uPulse;
  uniform float uLightMode;

  varying vec3 vNormalView;
  varying vec3 vViewDir;
  varying vec3 vObjPos;
  varying float vGyri;
  varying float vRegion;
  varying float vEdgeFade;
  varying float vThought;

  float evalPixelGyri(vec3 p) {
    vec3 wp = vec3(abs(p.x), p.y, p.z) * 0.92;
    vec3 warp = vec3(
      sin(wp.z * 5.0 + wp.y * 3.6),
      cos(wp.x * 5.4 - wp.z * 3.2),
      sin(wp.y * 4.8 + wp.x * 4.0)
    ) * 0.17;
    vec3 q = wp + warp;
    float w1 = 1.0 - abs(sin(q.x * 9.8 + q.y * 6.8 + cos(q.z * 6.2) * 1.35));
    float w2 = 1.0 - abs(sin(q.z * 12.5 - q.y * 8.0 + q.x * 5.2));
    float w3 = 0.5 + 0.5 * cos(q.x * 16.5 + q.z * 14.0 - q.y * 9.5);
    return clamp(w1 * 0.52 + w2 * 0.34 + w3 * 0.14, 0.0, 1.0);
  }

  void main() {
    vec3 N = normalize(vNormalView);
    vec3 V = normalize(vViewDir);
    float ndv = clamp(abs(dot(N, V)), 0.0, 1.0);
    float fresnel = pow(1.0 - ndv, 2.15);

    // Sub-pixel anatomical gyri & sulci folding detail
    float isCortex = 1.0 - smoothstep(0.1, 0.4, vRegion);
    float pixelFolds = evalPixelGyri(vObjPos);
    float pixelGyri = mix(vGyri, mix(vGyri, pixelFolds, 0.78), isCortex);
    float gyriCrest = smoothstep(0.34, 0.88, pixelGyri);
    float sulcusCrease = pow(clamp(1.0 - pixelGyri, 0.0, 1.0), 2.1);

    // Directional studio key light tracing every ridge
    vec3 L = normalize(vec3(-0.38, 0.68, 0.82));
    float ridgeLight = pow(max(dot(N, L), 0.0), 1.45) * (0.45 + 0.85 * gyriCrest);

    // Anatomical palette: deep sapphire sulci grooves -> luminous aqua gyri ridges -> violet cerebellum
    vec3 sulciCol = mix(uColorBlue * 0.34, uColorBlue * 0.62, uLightMode);
    vec3 gyriCol = mix(sulciCol, uColorCyan, clamp(gyriCrest * 1.08, 0.0, 1.0));
    vec3 cerebCol = mix(uColorBlue, uColorViolet, 0.6);
    vec3 baseCol = mix(gyriCol, cerebCol, smoothstep(0.25, 0.7, vRegion));

    vec3 rimCol = mix(vec3(0.76, 0.99, 1.0), uColorBlue * 0.95, uLightMode);
    vec3 col = mix(baseCol, rimCol, clamp(fresnel * 0.72 + ridgeLight * 0.38, 0.0, 1.0));
    vec3 pulseHighlight = mix(vec3(0.92, 1.0, 1.0), vec3(0.02, 0.32, 0.82), uLightMode);
    col = mix(col, pulseHighlight, vThought * 0.34 + uPulse * 0.36);

    // Crystal clear glassy center (low center opacity) so internal 72 neural tracts glow visibly
    float ridgeOpacity = gyriCrest * (0.045 + 0.095 * ridgeLight) + sulcusCrease * 0.032 * isCortex;
    float darkAlpha = 0.018 + fresnel * 0.44 + ridgeOpacity + vThought * (0.08 * gyriCrest + 0.03) + uPulse * 0.12;
    float lightAlpha = 0.012 + fresnel * 0.25 + ridgeOpacity * 0.95 + vThought * (0.06 * gyriCrest + 0.02) + uPulse * 0.09;
    float alpha = mix(darkAlpha, lightAlpha, uLightMode) * vEdgeFade * uOpacity;

    gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.68));
  }
`;

const CORE_VERT = /* glsl */ `
  varying vec3 vNormalView;
  varying vec3 vViewDir;

  void main() {
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vNormalView = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const CORE_FRAG = /* glsl */ `
  uniform vec3 uColorCyan;
  uniform vec3 uColorBlue;
  uniform float uTime;
  uniform float uPulse;
  uniform float uOpacity;
  uniform float uLightMode;

  varying vec3 vNormalView;
  varying vec3 vViewDir;

  void main() {
    float ndv = clamp(abs(dot(normalize(vNormalView), normalize(vViewDir))), 0.0, 1.0);
    float coreGlow = pow(ndv, 2.0);
    float breath = 0.78 + 0.22 * sin(uTime * 2.2);
    vec3 col = mix(uColorBlue, uColorCyan, coreGlow);
    col = mix(col, mix(vec3(0.9, 1.0, 1.0), vec3(0.05, 0.35, 0.82), uLightMode), uPulse * 0.5);
    float baseAlpha = mix(0.22, 0.08, uLightMode);
    gl_FragColor = vec4(col, coreGlow * breath * (baseAlpha + uPulse * 0.22) * uOpacity);
  }
`;

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
  uniform float uBrainRotX;
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
  varying float vFrontFactor;

  float bandWeight(float edge0, float edge1, float x) {
    return smoothstep(edge0, edge1, x);
  }

  void main() {
    vRandom = aRandom;
    vGyri = aGyri;
    vRegion = aRegion;

    // Synchronized 4-state smoothstep timeline
    float wHelix = bandWeight(0.06, 0.20, uScroll);
    float wWave = bandWeight(0.36, 0.52, uScroll);
    float wTerrain = bandWeight(0.62, 0.78, uScroll);
    float brainWeight = 1.0 - wHelix;
    vBrainWeight = brainWeight;

    // Shape 0: Rotate anatomical Neural Brain around Y then X in exact lockstep with brainRig
    float ca = cos(uBrainRotY);
    float sa = sin(uBrainRotY);
    vec3 bRot = vec3(
      position.x * ca + position.z * sa,
      position.y,
      -position.x * sa + position.z * ca
    );
    float cx = cos(uBrainRotX);
    float sx = sin(uBrainRotX);
    bRot = vec3(
      bRot.x,
      bRot.y * cx - bRot.z * sx,
      bRot.y * sx + bRot.z * cx
    );
    vFrontFactor = clamp((bRot.z + 1.6) / 3.2, 0.0, 1.0);
    vec3 p0 = bRot + vec3(2.05, 0.06, 0.0);

    // Shape 1: Double-Helix DNA aligned on the exact same axis (+2.05 X) so Hero->Pillars uncoils seamlessly
    vec3 p1 = aHelix;
    float ha = uTime * 0.42;
    float hx = p1.x - 2.05;
    p1.x = hx * cos(ha) - p1.z * sin(ha) + 2.05;
    p1.z = hx * sin(ha) + p1.z * cos(ha);

    // Shape 2: Left-side 3D Neural/ECG bio-signal wave
    vec3 p2 = aWave;
    p2.y += sin(p2.x * 2.2 - uTime * 2.3) * 0.14;

    // Shape 3: Sweeping 95x95 Topological Horizon
    vec3 p3 = aTerrain;

    // Travelling frontal-to-occipital synaptic wave across the cortex
    float thoughtWave = pow(0.5 + 0.5 * sin(position.z * 2.5 - uTime * 2.1 + aRandom * 1.3), 3.0);
    vThoughtWave = thoughtWave;

    // Organic cellular breathing during Brain hero state
    p0 += normalize(bRot + vec3(0.001)) * (thoughtWave * 0.015 * brainWeight);

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
    float ripple = sin(radialDist * 2.5 - uTime * 7.5) * uPulse * 0.15;
    morphed += normalize(morphed + vec3(0.001)) * ripple;

    // Cursor wake parallax
    morphed.x += uMouse.x * (0.08 + 0.10 * nonBrain + aRandom * 0.05);
    morphed.y += uMouse.y * (0.06 + 0.08 * nonBrain + aRandom * 0.04);

    vec4 mvPosition = modelViewMatrix * vec4(morphed, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float brainSize = 1.28 + aGyri * 1.12 + aRandom * 0.62 + thoughtWave * 0.95 + uPulse * 1.4;
    float flowSize = 2.4 + aRandom * 2.1 + uPulse * 1.8;
    float ptSize = mix(flowSize, brainSize, brainWeight) * uPixelRatio * (6.2 / max(1.5, -mvPosition.z));
    gl_PointSize = clamp(ptSize, 1.2, mix(9.2, 4.5, brainWeight));

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
  varying float vFrontFactor;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;

    float core = smoothstep(0.5, 0.04, d);
    float crispCore = smoothstep(0.46, 0.08, d);
    float halo = mix(pow(core, 1.55), pow(crispCore, 1.05), uLightMode);

    vec3 highlightCol = mix(vec3(0.88, 0.99, 1.0), vec3(0.02, 0.32, 0.76), uLightMode);

    float sulciFactor = mix(0.68, 0.88, uLightMode);
    vec3 cortexCol = mix(uColorBlue * sulciFactor, uColorCyan, clamp(vGyri * 1.12, 0.0, 1.0));
    vec3 cerebCol = mix(uColorBlue, uColorViolet, mix(0.52, 0.65, uLightMode));
    vec3 brainCol = mix(cortexCol, cerebCol, smoothstep(0.25, 0.65, vRegion));
    brainCol = mix(brainCol, highlightCol, vThoughtWave * mix(0.45, 0.50, uLightMode) + vPulse * mix(0.35, 0.40, uLightMode));

    vec3 flowCol = mix(uColorCyan, uColorBlue, vMix);
    flowCol = mix(flowCol, highlightCol, vPulse * mix(0.45, 0.48, uLightMode));

    vec3 col = mix(flowCol, brainCol, vBrainWeight);

    float depthAtten = mix(0.42, 1.0, vFrontFactor);
    float brainAlpha =
      halo *
      (0.18 + 0.42 * vGyri + 0.24 * vThoughtWave) *
      depthAtten *
      (1.0 - step(0.8, vRegion) * 0.25);
    float flowAlpha = halo * (0.48 + 0.32 * (1.0 - vDepth) + vPulse * 0.22);
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
  attribute float aSpeed;

  uniform float uTime;

  varying float vPulse;

  void main() {
    float head = fract(uTime * aSpeed + aPhase);
    float delta = fract(head - aProg + 1.0);
    float trail = exp(-delta * 8.0) * step(delta, 0.5);
    float tip = exp(-pow(delta * 16.0, 2.0));
    vPulse = clamp(trail * 0.72 + tip * 0.92, 0.0, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const AXON_FRAG = /* glsl */ `
  uniform vec3 uColorCyan;
  uniform vec3 uColorBlue;
  uniform float uOpacity;
  uniform float uPulse;
  uniform float uLightMode;

  varying float vPulse;

  void main() {
    vec3 impulseCol = mix(vec3(0.92, 1.0, 1.0), vec3(0.03, 0.30, 0.78), uLightMode);
    vec3 baseCol = mix(uColorBlue * mix(0.55, 0.85, uLightMode), impulseCol, vPulse);
    vec3 col = mix(baseCol, uColorCyan, 0.38 * (1.0 - vPulse));
    float baseAlpha = mix(0.10, 0.16, uLightMode);
    float surge = clamp(vPulse + uPulse * 0.28, 0.0, 1.0);
    float alpha = clamp((baseAlpha + 0.84 * surge) * uOpacity, 0.0, 1.0);
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
    vTwinkle = pow(0.5 + 0.5 * sin(uTime * 2.9 + aSeed * 6.2831), 2.0);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = clamp((2.8 + vTwinkle * 3.8 + uPulse * 2.2) * uPixelRatio * (5.5 / max(1.5, -mvPos.z)), 2.0, 8.5);
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
    vec3 tipCol = mix(vec3(0.92, 1.0, 1.0), vec3(0.08, 0.28, 0.84), uLightMode);
    vec3 col = mix(uColorCyan, tipCol, vTwinkle * 0.65);
    gl_FragColor = vec4(col, glow * (0.28 + 0.70 * vTwinkle) * uOpacity);
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

function evalGyri(nx: number, ny: number, nz: number): number {
  const wx = nx + 0.17 * Math.sin(nz * 5.0 + ny * 3.6);
  const wy = ny + 0.17 * Math.cos(nx * 5.4 - nz * 3.2);
  const wz = nz + 0.17 * Math.sin(ny * 4.8 + nx * 4.0);

  const w1 = 1.0 - Math.abs(Math.sin(wx * 9.8 + wy * 6.8 + Math.cos(wz * 6.2) * 1.35));
  const w2 = 1.0 - Math.abs(Math.sin(wz * 12.5 - wy * 8.0 + wx * 5.2));
  const w3 = 0.5 + 0.5 * Math.cos(wx * 16.5 + wz * 14.0 - wy * 9.5);

  let g = w1 * 0.52 + w2 * 0.34 + w3 * 0.14;

  // Lateral Sylvian fissure indentation dividing temporal lobe from frontal/parietal cortex
  if (nx > 0.35 && nz > -0.35 && nz < 0.55) {
    const targetY = -0.08 + nz * 0.25;
    const distSylv = Math.abs(ny - targetY);
    const sylvMask =
      smoothstep(0.35, 0.52, nx) *
      smoothstep(-0.35, -0.1, nz) *
      (1.0 - smoothstep(0.32, 0.55, nz));
    const fissureCut = Math.exp(-(distSylv * distSylv) / 0.0085) * 0.58 * sylvMask;
    g = clamp(g - fissureCut, 0, 1);
  }

  return clamp(g, 0, 1);
}

function sculptCerebrum(
  side: 1 | -1,
  ux: number,
  uy: number,
  uz: number,
  shellScale = 1.0,
) {
  const hemiLat = ux * side;
  const nx = Math.abs(ux);
  const ny = uy;
  const nz = uz;

  const frontTaper = nz > 0.1 ? 1.0 - 0.18 * (nz - 0.1) : 1.0 - 0.04 * Math.max(0, -nz - 0.2);
  let yShape = ny * 0.88 * (nz > 0.1 ? 1.0 - 0.1 * nz : 1.0);

  if (ny < -0.22) {
    yShape = lerp(yShape, -0.38, 0.34);
  }
  if (nz > -0.38 && nz < 0.42 && ny < 0.08 && nx > 0.32) {
    const tLobe =
      Math.sin(((nz + 0.38) / 0.8) * Math.PI) *
      smoothstep(0.32, 0.58, nx) *
      smoothstep(0.08, -0.22, ny);
    yShape -= 0.16 * tLobe;
  }

  const medialSplit =
    hemiLat >= 0
      ? (0.052 + Math.pow(hemiLat, 0.76) * 0.72) * frontTaper
      : (0.052 + Math.abs(hemiLat) * 0.032) * frontTaper;

  const gyri = evalGyri(nx, ny, nz);
  const lateralMask = hemiLat >= 0 ? smoothstep(0.04, 0.24, hemiLat) : 0.0;
  const foldOffset = (gyri - 0.5) * 0.082 * lateralMask;
  const radialExpand = (1.0 + foldOffset) * shellScale;

  return {
    x: side * medialSplit * radialExpand * BRAIN_SCALE,
    y: yShape * radialExpand * BRAIN_SCALE,
    z: nz * 1.46 * radialExpand * BRAIN_SCALE,
    gyri: hemiLat >= 0 ? gyri : 0.35,
  };
}

function sculptCerebellum(
  side: 1 | -1,
  ux: number,
  uy: number,
  uz: number,
  shellScale = 1.0,
) {
  const folia = 0.5 + 0.5 * Math.sin(uy * 34.0 + Math.abs(ux) * 4.0);
  const fold = 1.0 + (folia - 0.5) * 0.045 * shellScale;
  return {
    x: (side * 0.27 + ux * 0.25 * shellScale * fold) * BRAIN_SCALE,
    y: (-0.54 + uy * 0.21 * shellScale * fold) * BRAIN_SCALE,
    z: (-0.72 + uz * 0.27 * shellScale * fold) * BRAIN_SCALE,
    folia,
  };
}

function sculptBrainstem(s: number, cosA: number, sinA: number, radialScale = 1.0) {
  const pons = 0.058 * Math.exp(-Math.pow((s - 0.34) / 0.17, 2));
  const topTaper = lerp(0.55, 1.0, smoothstep(0.0, 0.22, s));
  const rStem = (lerp(0.17, 0.082, s) + pons) * topTaper * radialScale;
  return {
    x: cosA * rStem * BRAIN_SCALE,
    y: lerp(-0.34, -1.16, s) * BRAIN_SCALE,
    z: (lerp(-0.18, -0.38, s) + sinA * rStem) * BRAIN_SCALE,
  };
}

function deformSphereMesh(
  geo: THREE_TYPE.BufferGeometry,
  THREE: ThreeModule,
  sculptFn: (ux: number, uy: number, uz: number) => { x: number; y: number; z: number; value: number },
  regionCode: number,
) {
  const posAttr = geo.attributes.position as THREE_TYPE.BufferAttribute;
  const count = posAttr.count;
  const gyriArr = new Float32Array(count);
  const regionArr = new Float32Array(count);
  const fadeArr = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const ux = posAttr.getX(i);
    const uy = posAttr.getY(i);
    const uz = posAttr.getZ(i);
    const len = Math.hypot(ux, uy, uz) || 1;
    const p = sculptFn(ux / len, uy / len, uz / len);
    posAttr.setXYZ(i, p.x, p.y, p.z);
    gyriArr[i] = p.value;
    regionArr[i] = regionCode;
    fadeArr[i] = 1.0;
  }

  posAttr.needsUpdate = true;
  geo.setAttribute('aGyri', new THREE.BufferAttribute(gyriArr, 1));
  geo.setAttribute('aRegion', new THREE.BufferAttribute(regionArr, 1));
  geo.setAttribute('aEdgeFade', new THREE.BufferAttribute(fadeArr, 1));
  geo.computeVertexNormals();
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

  const disposableGeos: THREE_TYPE.BufferGeometry[] = [];
  const disposableMats: THREE_TYPE.Material[] = [];

  const darkCyan = new THREE.Color(0x38b8ac);
  const darkBlue = new THREE.Color(0x5288b8);
  const darkViolet = new THREE.Color(0x6c74b8);
  const lightTeal = new THREE.Color(0x147a72);
  const lightNavy = new THREE.Color(0x2c5aa0);
  const lightViolet = new THREE.Color(0x52589e);

  // =========================================================================
  // LAYER 1: Holographic Fresnel Anatomical Cortical Shell + Inner Core
  // =========================================================================
  const brainRig = new THREE.Group();
  brainRig.position.set(2.05, 0.06, 0);
  stageGroup.add(brainRig);

  const shellUniforms = {
    uTime: { value: 0 },
    uPulse: { value: 0 },
    uOpacity: { value: 1.0 },
    uLightMode: { value: 0 },
    uColorCyan: { value: darkCyan.clone() },
    uColorBlue: { value: darkBlue.clone() },
    uColorViolet: { value: darkViolet.clone() },
  };
  const shellMat = new THREE.ShaderMaterial({
    vertexShader: SHELL_VERT,
    fragmentShader: SHELL_FRAG,
    uniforms: shellUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    side: THREE.FrontSide,
  });
  disposableMats.push(shellMat);

  for (const side of [-1, 1] as const) {
    const hemiGeo = new THREE.IcosahedronGeometry(1, 5);
    deformSphereMesh(
      hemiGeo,
      THREE,
      (ux, uy, uz) => {
        const res = sculptCerebrum(side, ux, uy, uz, 1.0);
        return { x: res.x, y: res.y, z: res.z, value: res.gyri };
      },
      0.0,
    );
    disposableGeos.push(hemiGeo);
    brainRig.add(new THREE.Mesh(hemiGeo, shellMat));

    const cerebGeo = new THREE.IcosahedronGeometry(1, 4);
    deformSphereMesh(
      cerebGeo,
      THREE,
      (ux, uy, uz) => {
        const res = sculptCerebellum(side, ux, uy, uz, 1.0);
        return { x: res.x, y: res.y, z: res.z, value: res.folia };
      },
      0.5,
    );
    disposableGeos.push(cerebGeo);
    brainRig.add(new THREE.Mesh(cerebGeo, shellMat));
  }

  // Softly Feathered Tapered Brainstem Shell (fades seamlessly top & bottom so no cup rim shows)
  const stemGeo = new THREE.CylinderGeometry(1, 1, 1, 24, 16, true);
  const stemPos = stemGeo.attributes.position as THREE_TYPE.BufferAttribute;
  const stemGyri = new Float32Array(stemPos.count);
  const stemRegion = new Float32Array(stemPos.count);
  const stemFade = new Float32Array(stemPos.count);
  for (let i = 0; i < stemPos.count; i++) {
    const x = stemPos.getX(i);
    const y = stemPos.getY(i);
    const z = stemPos.getZ(i);
    const s = clamp(0.5 - y, 0, 1);
    const rLen = Math.hypot(x, z) || 1;
    const pt = sculptBrainstem(s, x / rLen, z / rLen, 1.0);
    stemPos.setXYZ(i, pt.x, pt.y, pt.z);
    stemGyri[i] = 0.45;
    stemRegion[i] = 1.0;
    stemFade[i] = smoothstep(0.02, 0.34, s) * (1.0 - smoothstep(0.76, 1.0, s));
  }
  stemPos.needsUpdate = true;
  stemGeo.setAttribute('aGyri', new THREE.BufferAttribute(stemGyri, 1));
  stemGeo.setAttribute('aRegion', new THREE.BufferAttribute(stemRegion, 1));
  stemGeo.setAttribute('aEdgeFade', new THREE.BufferAttribute(stemFade, 1));
  stemGeo.computeVertexNormals();
  disposableGeos.push(stemGeo);
  brainRig.add(new THREE.Mesh(stemGeo, shellMat));

  // Inner Thalamus Bioluminescent Core
  const coreUniforms = {
    uColorCyan: { value: darkCyan.clone() },
    uColorBlue: { value: darkBlue.clone() },
    uTime: { value: 0 },
    uPulse: { value: 0 },
    uOpacity: { value: 1.0 },
    uLightMode: { value: 0 },
  };
  const coreMat = new THREE.ShaderMaterial({
    vertexShader: CORE_VERT,
    fragmentShader: CORE_FRAG,
    uniforms: coreUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
  const coreGeo = new THREE.IcosahedronGeometry(0.4, 3);
  disposableGeos.push(coreGeo);
  disposableMats.push(coreMat);
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  coreMesh.position.set(0, -0.05, -0.04);
  brainRig.add(coreMesh);

  // =========================================================================
  // LAYER 2: 9,000-Neuron Fibonacci-Sampled Morphing Buffer (Brain -> DNA -> ECG -> Horizon)
  // =========================================================================
  const particleGeo = new THREE.BufferGeometry();
  const posBrain = new Float32Array(PARTICLE_COUNT * 3);
  const posHelix = new Float32Array(PARTICLE_COUNT * 3);
  const posWave = new Float32Array(PARTICLE_COUNT * 3);
  const posTerrain = new Float32Array(PARTICLE_COUNT * 3);
  const randoms = new Float32Array(PARTICLE_COUNT);
  const gyriAttr = new Float32Array(PARTICLE_COUNT);
  const regionAttr = new Float32Array(PARTICLE_COUNT);

  const gridSide = Math.ceil(Math.sqrt(PARTICLE_COUNT));
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const leftSurfaceAll: THREE_TYPE.Vector3[] = [];
  const rightSurfaceAll: THREE_TYPE.Vector3[] = [];
  const posteriorOccipitalAll: THREE_TYPE.Vector3[] = [];

  let cerebrumIdx = 0;
  let cerebellumIdx = 0;
  const totalCerebrum = Math.floor(PARTICLE_COUNT * 0.8);
  const totalCerebellum = Math.floor(PARTICLE_COUNT * 0.15);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const t = i / PARTICLE_COUNT;
    randoms[i] = Math.random();
    const mod = i % 20;

    let bx = 0;
    let by = 0;
    let bz = 0;

    if (mod < 16) {
      const side: 1 | -1 = cerebrumIdx % 2 === 0 ? 1 : -1;
      const k = cerebrumIdx / totalCerebrum;
      cerebrumIdx++;

      const uy = 1 - 2 * ((k + 0.0005) % 1);
      const rad = Math.sqrt(Math.max(0, 1 - uy * uy));
      const theta = (i * goldenAngle) % (Math.PI * 2);
      const rawUx = Math.cos(theta) * rad;
      const ux = side * Math.abs(rawUx);
      const uz = Math.sin(theta) * rad;

      const isSurface = i % 6 !== 0;
      const shellScale = isSurface ? 0.995 + Math.random() * 0.02 : 0.45 + Math.random() * 0.45;
      const p = sculptCerebrum(side, ux, uy, uz, shellScale);

      bx = p.x;
      by = p.y;
      bz = p.z;
      gyriAttr[i] = p.gyri;
      regionAttr[i] = 0.0;

      // Collect across the entire brain volume (stratified down the full Y axis!)
      if (isSurface && p.gyri > 0.34) {
        const pt = new THREE.Vector3(bx, by, bz);
        if (side > 0) {
          rightSurfaceAll.push(pt);
        } else {
          leftSurfaceAll.push(pt);
        }
        if (pt.z < -0.55 && pt.y < 0.35) {
          posteriorOccipitalAll.push(pt);
        }
      }
    } else if (mod < 19) {
      const side: 1 | -1 = cerebellumIdx % 2 === 0 ? 1 : -1;
      const k = cerebellumIdx / totalCerebellum;
      cerebellumIdx++;

      const uy = 1 - 2 * ((k + 0.001) % 1);
      const rad = Math.sqrt(Math.max(0, 1 - uy * uy));
      const theta = i * goldenAngle;
      const ux = Math.cos(theta) * rad;
      const uz = Math.sin(theta) * rad;

      const p = sculptCerebellum(side, ux, uy, uz, 0.94 + Math.random() * 0.08);
      bx = p.x;
      by = p.y;
      bz = p.z;
      gyriAttr[i] = p.folia;
      regionAttr[i] = 0.5;
    } else {
      const s = Math.random();
      const ang = Math.random() * Math.PI * 2;
      const pt = sculptBrainstem(s, Math.cos(ang), Math.sin(ang), 0.72 + Math.random() * 0.28);
      bx = pt.x;
      by = pt.y;
      bz = pt.z;
      gyriAttr[i] = 0.42;
      regionAttr[i] = 1.0;
    }

    posBrain[i * 3] = bx;
    posBrain[i * 3 + 1] = by;
    posBrain[i * 3 + 2] = bz;

    // Shape 1: High-Density 3D DNA Double Helix (+2.05 X)
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
      hx = Math.cos(helixAngle + strandOffset) * helixRadius + (Math.random() - 0.5) * 0.032;
      hz = Math.sin(helixAngle + strandOffset) * helixRadius + (Math.random() - 0.5) * 0.032;
    }
    posHelix[i * 3] = hx + 2.05;
    posHelix[i * 3 + 1] = helixY;
    posHelix[i * 3 + 2] = hz;

    // Shape 2: Dense 11-Ribbon 3D Neural / ECG Bio-Signal Wave on LEFT (-1.75 X)
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

    // Shape 3: Dense 95x95 Sweeping Topological Horizon Grid
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
  disposableGeos.push(particleGeo);

  const particleUniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uBrainRotY: { value: 1.08 },
    uBrainRotX: { value: 0 },
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
  disposableMats.push(particleMat);

  const particles = new THREE.Points(particleGeo, particleMat);
  stageGroup.add(particles);

  // =========================================================================
  // LAYER 3: 72 Stratified Anatomically Routed Fiber Tracts + 120 Synaptic Hubs
  // =========================================================================
  const totalVerts = AXON_COUNT * SEGMENTS_PER_TRACT * 2;
  const axonPositions = new Float32Array(totalVerts * 3);
  const axonProg = new Float32Array(totalVerts);
  const axonPhase = new Float32Array(totalVerts);
  const axonSpeed = new Float32Array(totalVerts);

  const sparkPositions = new Float32Array(SPARK_COUNT * 3);
  const sparkSeeds = new Float32Array(SPARK_COUNT);
  let vertWrite = 0;
  let sparkWrite = 0;

  const pushCurveSegments = (
    p1: THREE_TYPE.Vector3,
    mid: THREE_TYPE.Vector3,
    p2: THREE_TYPE.Vector3,
    tractIdx: number,
  ) => {
    const curve = new THREE.CatmullRomCurve3([p1, mid, p2]);
    const pts = curve.getPoints(SEGMENTS_PER_TRACT);
    const phase = tractIdx / AXON_COUNT;
    const speed = 0.34 + (tractIdx % 5) * 0.065;

    for (let k = 0; k < SEGMENTS_PER_TRACT; k++) {
      const a = pts[k];
      const b = pts[k + 1];
      if (!a || !b) continue;

      axonPositions[vertWrite * 3] = a.x;
      axonPositions[vertWrite * 3 + 1] = a.y;
      axonPositions[vertWrite * 3 + 2] = a.z;
      axonProg[vertWrite] = k / SEGMENTS_PER_TRACT;
      axonPhase[vertWrite] = phase;
      axonSpeed[vertWrite] = speed;
      vertWrite++;

      axonPositions[vertWrite * 3] = b.x;
      axonPositions[vertWrite * 3 + 1] = b.y;
      axonPositions[vertWrite * 3 + 2] = b.z;
      axonProg[vertWrite] = (k + 1) / SEGMENTS_PER_TRACT;
      axonPhase[vertWrite] = phase;
      axonSpeed[vertWrite] = speed;
      vertWrite++;
    }

    if (sparkWrite < SPARK_COUNT) {
      sparkPositions[sparkWrite * 3] = p1.x;
      sparkPositions[sparkWrite * 3 + 1] = p1.y;
      sparkPositions[sparkWrite * 3 + 2] = p1.z;
      sparkSeeds[sparkWrite] = Math.random();
      sparkWrite++;
    }
    if (sparkWrite < SPARK_COUNT && tractIdx % 3 !== 2) {
      sparkPositions[sparkWrite * 3] = p2.x;
      sparkPositions[sparkWrite * 3 + 1] = p2.y;
      sparkPositions[sparkWrite * 3 + 2] = p2.z;
      sparkSeeds[sparkWrite] = Math.random();
      sparkWrite++;
    }
  };

  // Sample across entire hemisphere height/lobes uniformly using golden ratio offset
  const sampleAt = (arr: THREE_TYPE.Vector3[], frac: number) =>
    arr[Math.floor((frac % 1) * arr.length) % arr.length];

  // Family 1: 18 Corpus Callosum Arch Bundles distributed across frontal, central & occipital lobes
  let tractIndex = 0;
  for (let i = 0; i < 18 && leftSurfaceAll.length > 0 && rightSurfaceAll.length > 0; i++) {
    const f1 = (i / 18 + 0.08) % 0.78;
    const p1 = sampleAt(leftSurfaceAll, f1);
    let p2 = sampleAt(rightSurfaceAll, f1);
    let bestDist = Infinity;
    for (let j = 0; j < 40; j++) {
      const cand = sampleAt(rightSurfaceAll, (f1 + (j * 0.6180339)) % 0.82);
      const d = Math.abs(cand.z - p1.z) + Math.abs(cand.y - p1.y);
      if (d < bestDist && cand.y > -0.3) {
        bestDist = d;
        p2 = cand;
      }
    }
    const mid = new THREE.Vector3(
      0,
      Math.max(0.14, (p1.y + p2.y) * 0.42 + 0.22),
      (p1.z + p2.z) * 0.48,
    );
    pushCurveSegments(p1, mid, p2, tractIndex++);
  }

  // Family 2: 42 Cortical Association Arcs weaving through frontal, parietal, temporal & occipital lobes
  for (let i = 0; i < 42; i++) {
    const arr = i % 2 === 0 ? leftSurfaceAll : rightSurfaceAll;
    if (arr.length < 4) continue;
    const f1 = ((i * 0.6180339887) % 1) * 0.88;
    const p1 = sampleAt(arr, f1);
    let p2 = sampleAt(arr, (f1 + 0.19) % 0.92);
    for (let step = 1; step <= 32; step++) {
      const cand = sampleAt(arr, (f1 + step * 0.097) % 0.92);
      const dist = p1.distanceTo(cand);
      if (dist > 0.55 && dist < 1.32) {
        p2 = cand;
        break;
      }
    }
    // Arch midpoint slightly inward along white-matter sub-cortical curvature
    const mid = p1.clone().add(p2).multiplyScalar(0.41);
    pushCurveSegments(p1, mid, p2, tractIndex++);
  }

  // Family 3: 12 Gentle Occipital -> Cerebellar Projection Arcs (curving inside posterior lobes)
  for (let i = 0; i < 12; i++) {
    const arr = posteriorOccipitalAll.length > 0 ? posteriorOccipitalAll : leftSurfaceAll;
    if (arr.length === 0) break;
    const p1 = sampleAt(arr, (i / 12 + 0.05) % 1);
    const sideSign = p1.x >= 0 ? 1 : -1;
    const mid = new THREE.Vector3(sideSign * 0.24, -0.32, -0.58);
    const cerebTarget = new THREE.Vector3(sideSign * 0.16, -0.78, -0.56);
    pushCurveSegments(p1, mid, cerebTarget, tractIndex++);
  }

  const axonGeo = new THREE.BufferGeometry();
  axonGeo.setAttribute('position', new THREE.BufferAttribute(axonPositions, 3));
  axonGeo.setAttribute('aProg', new THREE.BufferAttribute(axonProg, 1));
  axonGeo.setAttribute('aPhase', new THREE.BufferAttribute(axonPhase, 1));
  axonGeo.setAttribute('aSpeed', new THREE.BufferAttribute(axonSpeed, 1));
  axonGeo.setDrawRange(0, vertWrite);
  disposableGeos.push(axonGeo);

  const axonUniforms = {
    uTime: { value: 0 },
    uColorCyan: { value: darkCyan.clone() },
    uColorBlue: { value: darkBlue.clone() },
    uOpacity: { value: 1.0 },
    uPulse: { value: 0 },
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
  disposableMats.push(axonMat);
  brainRig.add(new THREE.LineSegments(axonGeo, axonMat));

  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
  sparkGeo.setAttribute('aSeed', new THREE.BufferAttribute(sparkSeeds, 1));
  sparkGeo.setDrawRange(0, sparkWrite);
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
  disposableMats.push(sparkMat);
  brainRig.add(new THREE.Points(sparkGeo, sparkMat));

  let smoothMouseX = 0;
  let smoothMouseY = 0;

  return {
    update({ elapsedTime, smoothedScroll, mouseX, mouseY, isHovering, pulseEnergy, isLightTheme }) {
      const targetMX = isHovering ? mouseX : Math.sin(elapsedTime * 0.25) * 0.12;
      const targetMY = isHovering ? mouseY : Math.cos(elapsedTime * 0.2) * 0.08;
      smoothMouseX += (targetMX - smoothMouseX) * 0.05;
      smoothMouseY += (targetMY - smoothMouseY) * 0.05;

      const targetCyan = isLightTheme ? lightTeal : darkCyan;
      const targetBlue = isLightTheme ? lightNavy : darkBlue;
      const targetViolet = isLightTheme ? lightViolet : darkViolet;
      const lightVal = isLightTheme ? 1 : 0;
      const blendMode = isLightTheme ? THREE.NormalBlending : THREE.AdditiveBlending;

      particleUniforms.uColorCyan.value.lerp(targetCyan, 0.1);
      particleUniforms.uColorBlue.value.lerp(targetBlue, 0.1);
      particleUniforms.uColorViolet.value.lerp(targetViolet, 0.1);
      particleUniforms.uLightMode.value = lightVal;
      particleMat.blending = blendMode;

      shellUniforms.uColorCyan.value.lerp(targetCyan, 0.1);
      shellUniforms.uColorBlue.value.lerp(targetBlue, 0.1);
      shellUniforms.uColorViolet.value.lerp(targetViolet, 0.1);
      shellUniforms.uLightMode.value = lightVal;

      coreUniforms.uColorCyan.value.lerp(targetCyan, 0.1);
      coreUniforms.uColorBlue.value.lerp(targetBlue, 0.1);
      coreUniforms.uLightMode.value = lightVal;

      axonUniforms.uColorCyan.value.lerp(targetCyan, 0.1);
      axonUniforms.uColorBlue.value.lerp(targetBlue, 0.1);
      axonUniforms.uLightMode.value = lightVal;
      axonMat.blending = blendMode;

      sparkUniforms.uColorCyan.value.lerp(targetCyan, 0.1);
      sparkUniforms.uLightMode.value = lightVal;
      sparkMat.blending = blendMode;

      const s1 = smoothstep(0.06, 0.20, smoothedScroll);
      const s2 = smoothstep(0.36, 0.52, smoothedScroll);
      const s3 = smoothstep(0.62, 0.78, smoothedScroll);
      const s4 = smoothstep(0.80, 0.96, smoothedScroll);

      const brainRotY = 1.08 + Math.sin(elapsedTime * 0.24) * 0.24 + smoothMouseX * 0.34;
      const brainRotX = smoothMouseY * 0.14;

      particleUniforms.uTime.value = elapsedTime;
      particleUniforms.uScroll.value = smoothedScroll;
      particleUniforms.uBrainRotY.value = brainRotY;
      particleUniforms.uBrainRotX.value = brainRotX;
      particleUniforms.uMouse.value.set(smoothMouseX, smoothMouseY);
      particleUniforms.uPulse.value = pulseEnergy;
      particleUniforms.uHeroFadeMobile.value = isCompact ? 0.24 : 1.0;

      const shellOpacity = (1.0 - smoothstep(0.02, 0.14, smoothedScroll)) * (isCompact ? 0.34 : 1.0);
      const axonOpacity = (1.0 - smoothstep(0.05, 0.18, smoothedScroll)) * (isCompact ? 0.28 : 1.0);

      brainRig.visible = shellOpacity > 0.01 || axonOpacity > 0.01;
      brainRig.rotation.set(brainRotX, brainRotY, 0, 'YXZ');
      brainRig.scale.setScalar(1.0 + smoothstep(0.02, 0.15, smoothedScroll) * 0.06);
      brainRig.position.set(
        2.05 + smoothMouseX * 0.105,
        0.06 + smoothMouseY * 0.08,
        0,
      );

      shellUniforms.uTime.value = elapsedTime;
      shellUniforms.uPulse.value = pulseEnergy;
      shellUniforms.uOpacity.value = shellOpacity;

      coreUniforms.uTime.value = elapsedTime;
      coreUniforms.uPulse.value = pulseEnergy;
      coreUniforms.uOpacity.value = shellOpacity;

      axonUniforms.uTime.value = elapsedTime;
      axonUniforms.uPulse.value = pulseEnergy;
      axonUniforms.uOpacity.value = axonOpacity;

      sparkUniforms.uTime.value = elapsedTime;
      sparkUniforms.uPulse.value = pulseEnergy;
      sparkUniforms.uOpacity.value = axonOpacity;

      stageGroup.position.x = isCompact
        ? lerp(-2.05, 0, clamp(smoothedScroll * 3.5, 0, 1))
        : 0;

      stageGroup.rotation.y = smoothMouseX * 0.08 + Math.sin(smoothedScroll * Math.PI) * 0.06;
      stageGroup.rotation.x = -smoothMouseY * 0.05 + smoothedScroll * 0.06;

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
      for (const m of disposableMats) m.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    },
  };
}
