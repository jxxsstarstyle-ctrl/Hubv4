export type PlayerId = string;

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface PlayerSnapshot {
  id: PlayerId;
  position: Vector3;
  rotationY: number;
}
