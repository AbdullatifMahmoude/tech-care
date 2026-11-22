import type * as THREE from 'three';

export interface SceneFrameState {
  elapsedTime: number;
  smoothedScroll: number;
  mouseX: number;
  mouseY: number;
  isHovering: boolean;
  pulseEnergy: number;
  isLightTheme: boolean;
}

export interface ThreeSceneHandle {
  update: (state: SceneFrameState) => void;
  resize: (width: number, height: number) => void;
  dispose: () => void;
}

export type ThreeModule = typeof THREE;
