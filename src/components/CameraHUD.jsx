import React, { useState } from "react";
import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function CameraHUD() {
  const { camera } = useThree();
  const [info, setInfo] = useState({
    pos: { x: 0, y: 0, z: 0 },
    rot: { x: 0, y: 0, z: 0 },
    fov: 75,
    near: 0.1,
    far: 1000,
    distance: 0,
  });

  useFrame(() => {
    const target = new THREE.Vector3(0, 10, 0);
    setInfo({
      pos: {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
      },
      rot: {
        x: camera.rotation.x,
        y: camera.rotation.y,
        z: camera.rotation.z,
      },
      fov: camera.fov,
      near: camera.near,
      far: camera.far,
      distance: camera.position.distanceTo(target),
    });
  });

  return (
    <Html prepend style={{ pointerEvents: "none" }}>
      <div className="camera-hud">
        <div className="camera-hud__title">Camera</div>
        <div className="camera-hud__line">
          Pos: {info.pos.x.toFixed(2)}, {info.pos.y.toFixed(2)}, {info.pos.z.toFixed(2)}
        </div>
        <div className="camera-hud__line">
          Rot: {(info.rot.x * 180 / Math.PI).toFixed(1)}°,
          {(info.rot.y * 180 / Math.PI).toFixed(1)}°,
          {(info.rot.z * 180 / Math.PI).toFixed(1)}°
        </div>
        <div className="camera-hud__line">FOV: {info.fov.toFixed(1)}°</div>
        <div className="camera-hud__line">Near/Far: {info.near.toFixed(3)} / {info.far.toFixed(1)}</div>
        <div className="camera-hud__line">Distance: {info.distance.toFixed(2)}</div>
      </div>
    </Html>
  );
}
