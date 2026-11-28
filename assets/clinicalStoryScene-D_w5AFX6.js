const it=`
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
`,nt=`
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
`,rt=`
  varying vec3 vNormalView;
  varying vec3 vViewDir;

  void main() {
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vNormalView = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`,lt=`
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
`,st=`
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
`,ut=`
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
`,ct=`
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
`,vt=`
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
`,ht=`
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
`,ft=`
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
`;function ve(e,n,l){return Math.max(n,Math.min(l,e))}function S(e,n,l){return e+(n-e)*l}function w(e,n,l){const p=ve((l-e)/(n-e),0,1);return p*p*(3-2*p)}function pt(e,n,l){const p=e+.17*Math.sin(l*5+n*3.6),c=n+.17*Math.cos(e*5.4-l*3.2),v=l+.17*Math.sin(n*4.8+e*4),m=1-Math.abs(Math.sin(p*9.8+c*6.8+Math.cos(v*6.2)*1.35)),g=1-Math.abs(Math.sin(v*12.5-c*8+p*5.2)),h=.5+.5*Math.cos(p*16.5+v*14-c*9.5);let f=m*.52+g*.34+h*.14;if(e>.35&&l>-.35&&l<.55){const d=-.08+l*.25,A=Math.abs(n-d),P=w(.35,.52,e)*w(-.35,-.1,l)*(1-w(.32,.55,l)),z=Math.exp(-(A*A)/.0085)*.58*P;f=ve(f-z,0,1)}return ve(f,0,1)}function Je(e,n,l,p,c=1){const v=n*e,m=Math.abs(n),g=l,h=p,f=h>.1?1-.18*(h-.1):1-.04*Math.max(0,-h-.2);let d=g*.88*(h>.1?1-.1*h:1);if(g<-.22&&(d=S(d,-.38,.34)),h>-.38&&h<.42&&g<.08&&m>.32){const Ae=Math.sin((h+.38)/.8*Math.PI)*w(.32,.58,m)*w(.08,-.22,g);d-=.16*Ae}const A=v>=0?(.052+Math.pow(v,.76)*.72)*f:(.052+Math.abs(v)*.032)*f,P=pt(m,g,h),z=v>=0?w(.04,.24,v):0,te=(1+(P-.5)*.082*z)*c;return{x:e*A*te*1.24,y:d*te*1.24,z:h*1.46*te*1.24,gyri:v>=0?P:.35}}function Qe(e,n,l,p,c=1){const v=.5+.5*Math.sin(l*34+Math.abs(n)*4),m=1+(v-.5)*.045*c;return{x:(e*.27+n*.25*c*m)*1.24,y:(-.54+l*.21*c*m)*1.24,z:(-.72+p*.27*c*m)*1.24,folia:v}}function $e(e,n,l,p=1){const c=.058*Math.exp(-Math.pow((e-.34)/.17,2)),v=S(.55,1,w(0,.22,e)),m=(S(.17,.082,e)+c)*v*p;return{x:n*m*1.24,y:S(-.34,-1.16,e)*1.24,z:(S(-.18,-.38,e)+l*m)*1.24}}function He(e,n,l,p){const c=e.attributes.position,v=c.count,m=new Float32Array(v),g=new Float32Array(v),h=new Float32Array(v);for(let f=0;f<v;f++){const d=c.getX(f),A=c.getY(f),P=c.getZ(f),z=Math.hypot(d,A,P)||1,F=l(d/z,A/z,P/z);c.setXYZ(f,F.x,F.y,F.z),m[f]=F.value,g[f]=p,h[f]=1}c.needsUpdate=!0,e.setAttribute("aGyri",new n.BufferAttribute(m,1)),e.setAttribute("aRegion",new n.BufferAttribute(g,1)),e.setAttribute("aEdgeFade",new n.BufferAttribute(h,1)),e.computeVertexNormals()}function mt(e,n){const l=n.clientWidth||window.innerWidth,p=n.clientHeight||window.innerHeight;let c=l<1024;const v=Math.min(window.devicePixelRatio||1,2),m=new e.Scene,g=new e.PerspectiveCamera(44,l/p,.1,100);g.position.set(0,0,7.2);const h=new e.WebGLRenderer({alpha:!0,antialias:!0,powerPreference:"high-performance"});h.setSize(l,p),h.setPixelRatio(v),n.appendChild(h.domElement);const f=new e.Group;m.add(f);const d=[],A=[],P=new e.Color(3717292),z=new e.Color(5408952),F=new e.Color(7107768),te=new e.Color(1342066),Ae=new e.Color(2906784),Ee=new e.Color(5396638),R=new e.Group;R.position.set(2.05,.06,0),f.add(R);const W={uTime:{value:0},uPulse:{value:0},uOpacity:{value:1},uLightMode:{value:0},uColorCyan:{value:P.clone()},uColorBlue:{value:z.clone()},uColorViolet:{value:F.clone()}},he=new e.ShaderMaterial({vertexShader:it,fragmentShader:nt,uniforms:W,transparent:!0,depthWrite:!1,blending:e.NormalBlending,side:e.FrontSide});A.push(he);for(const t of[-1,1]){const o=new e.IcosahedronGeometry(1,5);He(o,e,(i,u,s)=>{const a=Je(t,i,u,s,1);return{x:a.x,y:a.y,z:a.z,value:a.gyri}},0),d.push(o),R.add(new e.Mesh(o,he));const r=new e.IcosahedronGeometry(1,4);He(r,e,(i,u,s)=>{const a=Qe(t,i,u,s,1);return{x:a.x,y:a.y,z:a.z,value:a.folia}},.5),d.push(r),R.add(new e.Mesh(r,he))}const k=new e.CylinderGeometry(1,1,1,24,16,!0),T=k.attributes.position,ke=new Float32Array(T.count),Ue=new Float32Array(T.count),De=new Float32Array(T.count);for(let t=0;t<T.count;t++){const o=T.getX(t),r=T.getY(t),i=T.getZ(t),u=ve(.5-r,0,1),s=Math.hypot(o,i)||1,a=$e(u,o/s,i/s,1);T.setXYZ(t,a.x,a.y,a.z),ke[t]=.45,Ue[t]=1,De[t]=w(.02,.34,u)*(1-w(.76,1,u))}T.needsUpdate=!0,k.setAttribute("aGyri",new e.BufferAttribute(ke,1)),k.setAttribute("aRegion",new e.BufferAttribute(Ue,1)),k.setAttribute("aEdgeFade",new e.BufferAttribute(De,1)),k.computeVertexNormals(),d.push(k),R.add(new e.Mesh(k,he));const U={uColorCyan:{value:P.clone()},uColorBlue:{value:z.clone()},uTime:{value:0},uPulse:{value:0},uOpacity:{value:1},uLightMode:{value:0}},Xe=new e.ShaderMaterial({vertexShader:rt,fragmentShader:lt,uniforms:U,transparent:!0,depthWrite:!1,blending:e.NormalBlending}),Ye=new e.IcosahedronGeometry(.4,3);d.push(Ye),A.push(Xe);const qe=new e.Mesh(Ye,Xe);qe.position.set(0,-.05,-.04),R.add(qe);const V=new e.BufferGeometry,fe=new Float32Array(9e3*3),pe=new Float32Array(9e3*3),me=new Float32Array(9e3*3),de=new Float32Array(9e3*3),je=new Float32Array(9e3),ge=new Float32Array(9e3),ye=new Float32Array(9e3),Ce=Math.ceil(Math.sqrt(9e3)),Ke=Math.PI*(3-Math.sqrt(5)),oe=[],ae=[],Pe=[];let Be=0,Se=0;const et=Math.floor(9e3*.8),tt=Math.floor(9e3*.15);for(let t=0;t<9e3;t++){const o=t/9e3;je[t]=Math.random();const r=t%20;let i=0,u=0,s=0;if(r<16){const x=Be%2===0?1:-1,B=Be/et;Be++;const G=1-2*((B+5e-4)%1),le=Math.sqrt(Math.max(0,1-G*G)),se=t*Ke%(Math.PI*2),We=Math.cos(se)*le,Ie=x*Math.abs(We),ee=Math.sin(se)*le,Ze=t%6!==0,at=Ze?.995+Math.random()*.02:.45+Math.random()*.45,ue=Je(x,Ie,G,ee,at);if(i=ue.x,u=ue.y,s=ue.z,ge[t]=ue.gyri,ye[t]=0,Ze&&ue.gyri>.34){const ce=new e.Vector3(i,u,s);x>0?ae.push(ce):oe.push(ce),ce.z<-.55&&ce.y<.35&&Pe.push(ce)}}else if(r<19){const x=Se%2===0?1:-1,B=Se/tt;Se++;const G=1-2*((B+.001)%1),le=Math.sqrt(Math.max(0,1-G*G)),se=t*Ke,We=Math.cos(se)*le,Ie=Math.sin(se)*le,ee=Qe(x,We,G,Ie,.94+Math.random()*.08);i=ee.x,u=ee.y,s=ee.z,ge[t]=ee.folia,ye[t]=.5}else{const x=Math.random(),B=Math.random()*Math.PI*2,G=$e(x,Math.cos(B),Math.sin(B),.72+Math.random()*.28);i=G.x,u=G.y,s=G.z,ge[t]=.42,ye[t]=1}fe[t*3]=i,fe[t*3+1]=u,fe[t*3+2]=s;const y=o*Math.PI*2*3,C=(o-.5)*5.6,b=1.24;let _=0,$=0;if(t%5===0){const x=(t%25/25-.5)*2;_=Math.cos(y)*b*x,$=Math.sin(y)*b*x}else{const x=t%2===0?0:Math.PI;_=Math.cos(y+x)*b+(Math.random()-.5)*.032,$=Math.sin(y+x)*b+(Math.random()-.5)*.032}pe[t*3]=_+2.05,pe[t*3+1]=C,pe[t*3+2]=$;const O=t%11,K=(o-.5)*4.6-1.75,ne=K*2.1+O*.34,we=Math.exp(-Math.pow(Math.sin(K*1.65+.6),2)*14)*1.45,re=Math.sin(ne)*.58+we*(O%2===0?1:-.45)+(O-5)*.14,Ve=Math.cos(ne*.75)*.75+(O-5)*.12;me[t*3]=K,me[t*3+1]=re,me[t*3+2]=Ve;const Me=t%Ce/Ce-.5,be=Math.floor(t/Ce)/Ce-.5,H=Me*11.5,E=be*8.5,I=-1.58+Math.sin(H*.7)*.42+Math.cos(E*.85)*.32;de[t*3]=H,de[t*3+1]=I,de[t*3+2]=E}V.setAttribute("position",new e.BufferAttribute(fe,3)),V.setAttribute("aHelix",new e.BufferAttribute(pe,3)),V.setAttribute("aWave",new e.BufferAttribute(me,3)),V.setAttribute("aTerrain",new e.BufferAttribute(de,3)),V.setAttribute("aRandom",new e.BufferAttribute(je,1)),V.setAttribute("aGyri",new e.BufferAttribute(ge,1)),V.setAttribute("aRegion",new e.BufferAttribute(ye,1)),d.push(V);const N={uTime:{value:0},uScroll:{value:0},uBrainRotY:{value:1.08},uBrainRotX:{value:0},uMouse:{value:new e.Vector2(0,0)},uPulse:{value:0},uPixelRatio:{value:v},uColorCyan:{value:P.clone()},uColorBlue:{value:z.clone()},uColorViolet:{value:F.clone()},uLightMode:{value:0},uHeroFadeMobile:{value:1}},ze=new e.ShaderMaterial({vertexShader:st,fragmentShader:ut,uniforms:N,transparent:!0,depthWrite:!1,blending:e.AdditiveBlending});A.push(ze);const ot=new e.Points(V,ze);f.add(ot);const xe=2448*2,D=new Float32Array(xe*3),Le=new Float32Array(xe),_e=new Float32Array(xe),Re=new Float32Array(xe),X=new Float32Array(360),Ne=new Float32Array(120);let M=0,L=0;const Ge=(t,o,r,i)=>{const s=new e.CatmullRomCurve3([t,o,r]).getPoints(34),a=i/72,y=.34+i%5*.065;for(let C=0;C<34;C++){const b=s[C],_=s[C+1];!b||!_||(D[M*3]=b.x,D[M*3+1]=b.y,D[M*3+2]=b.z,Le[M]=C/34,_e[M]=a,Re[M]=y,M++,D[M*3]=_.x,D[M*3+1]=_.y,D[M*3+2]=_.z,Le[M]=(C+1)/34,_e[M]=a,Re[M]=y,M++)}L<120&&(X[L*3]=t.x,X[L*3+1]=t.y,X[L*3+2]=t.z,Ne[L]=Math.random(),L++),L<120&&i%3!==2&&(X[L*3]=r.x,X[L*3+1]=r.y,X[L*3+2]=r.z,Ne[L]=Math.random(),L++)},Y=(t,o)=>t[Math.floor(o%1*t.length)%t.length];let Oe=0;for(let t=0;t<18&&oe.length>0&&ae.length>0;t++){const o=(t/18+.08)%.78,r=Y(oe,o);let i=Y(ae,o),u=1/0;for(let a=0;a<40;a++){const y=Y(ae,(o+a*.6180339)%.82),C=Math.abs(y.z-r.z)+Math.abs(y.y-r.y);C<u&&y.y>-.3&&(u=C,i=y)}const s=new e.Vector3(0,Math.max(.14,(r.y+i.y)*.42+.22),(r.z+i.z)*.48);Ge(r,s,i,Oe++)}for(let t=0;t<42;t++){const o=t%2===0?oe:ae;if(o.length<4)continue;const r=t*.6180339887%1*.88,i=Y(o,r);let u=Y(o,(r+.19)%.92);for(let a=1;a<=32;a++){const y=Y(o,(r+a*.097)%.92),C=i.distanceTo(y);if(C>.55&&C<1.32){u=y;break}}const s=i.clone().add(u).multiplyScalar(.41);Ge(i,s,u,Oe++)}for(let t=0;t<12;t++){const o=Pe.length>0?Pe:oe;if(o.length===0)break;const r=Y(o,(t/12+.05)%1),i=r.x>=0?1:-1,u=new e.Vector3(i*.24,-.32,-.58),s=new e.Vector3(i*.16,-.78,-.56);Ge(r,u,s,Oe++)}const q=new e.BufferGeometry;q.setAttribute("position",new e.BufferAttribute(D,3)),q.setAttribute("aProg",new e.BufferAttribute(Le,1)),q.setAttribute("aPhase",new e.BufferAttribute(_e,1)),q.setAttribute("aSpeed",new e.BufferAttribute(Re,1)),q.setDrawRange(0,M),d.push(q);const j={uTime:{value:0},uColorCyan:{value:P.clone()},uColorBlue:{value:z.clone()},uOpacity:{value:1},uPulse:{value:0},uLightMode:{value:0}},Fe=new e.ShaderMaterial({vertexShader:ct,fragmentShader:vt,uniforms:j,transparent:!0,depthWrite:!1,blending:e.AdditiveBlending});A.push(Fe),R.add(new e.LineSegments(q,Fe));const ie=new e.BufferGeometry;ie.setAttribute("position",new e.BufferAttribute(X,3)),ie.setAttribute("aSeed",new e.BufferAttribute(Ne,1)),ie.setDrawRange(0,L),d.push(ie);const Z={uTime:{value:0},uPixelRatio:{value:v},uPulse:{value:0},uColorCyan:{value:P.clone()},uOpacity:{value:1},uLightMode:{value:0}},Te=new e.ShaderMaterial({vertexShader:ht,fragmentShader:ft,uniforms:Z,transparent:!0,depthWrite:!1,blending:e.AdditiveBlending});A.push(Te),R.add(new e.Points(ie,Te));let J=0,Q=0;return{update({elapsedTime:t,smoothedScroll:o,mouseX:r,mouseY:i,isHovering:u,pulseEnergy:s,isLightTheme:a}){const y=u?r:Math.sin(t*.25)*.12,C=u?i:Math.cos(t*.2)*.08;J+=(y-J)*.05,Q+=(C-Q)*.05;const b=a?te:P,_=a?Ae:z,$=a?Ee:F,O=a?1:0,K=a?e.NormalBlending:e.AdditiveBlending;N.uColorCyan.value.lerp(b,.1),N.uColorBlue.value.lerp(_,.1),N.uColorViolet.value.lerp($,.1),N.uLightMode.value=O,ze.blending=K,W.uColorCyan.value.lerp(b,.1),W.uColorBlue.value.lerp(_,.1),W.uColorViolet.value.lerp($,.1),W.uLightMode.value=O,U.uColorCyan.value.lerp(b,.1),U.uColorBlue.value.lerp(_,.1),U.uLightMode.value=O,j.uColorCyan.value.lerp(b,.1),j.uColorBlue.value.lerp(_,.1),j.uLightMode.value=O,Fe.blending=K,Z.uColorCyan.value.lerp(b,.1),Z.uLightMode.value=O,Te.blending=K;const ne=w(.06,.2,o),we=w(.36,.52,o),re=w(.62,.78,o),Ve=w(.8,.96,o),Me=1.08+Math.sin(t*.24)*.24+J*.34,be=Q*.14;N.uTime.value=t,N.uScroll.value=o,N.uBrainRotY.value=Me,N.uBrainRotX.value=be,N.uMouse.value.set(J,Q),N.uPulse.value=s,N.uHeroFadeMobile.value=c?.24:1;const H=(1-w(.02,.14,o))*(c?.34:1),E=(1-w(.05,.18,o))*(c?.28:1);R.visible=H>.01||E>.01,R.rotation.set(be,Me,0,"YXZ"),R.scale.setScalar(1+w(.02,.15,o)*.06),R.position.set(2.05+J*.105,.06+Q*.08,0),W.uTime.value=t,W.uPulse.value=s,W.uOpacity.value=H,U.uTime.value=t,U.uPulse.value=s,U.uOpacity.value=H,j.uTime.value=t,j.uPulse.value=s,j.uOpacity.value=E,Z.uTime.value=t,Z.uPulse.value=s,Z.uOpacity.value=E,f.position.x=c?S(-2.05,0,ve(o*3.5,0,1)):0,f.rotation.y=J*.08+Math.sin(o*Math.PI)*.06,f.rotation.x=-Q*.05+o*.06;let I=S(0,.14,ne);I=S(I,-.14,we),I=S(I,0,re);const x=S(0,.26,re);let B=S(7.2,6.9,ne);B=S(B,6.7,we),B=S(B,7.15,re),B=S(B,7.55,Ve),g.position.set(I,x,B),g.lookAt(I*.25,x*-.15,0),h.render(m,g)},resize(t,o){c=t<1024,g.aspect=t/o,g.updateProjectionMatrix(),h.setSize(t,o)},dispose(){for(const t of d)t.dispose();for(const t of A)t.dispose();h.dispose(),h.domElement.parentNode===n&&n.removeChild(h.domElement)}}}export{mt as createClinicalStoryScene};
