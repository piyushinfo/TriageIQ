"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import * as THREE from "three";

/* ── DNA Helix ──────────────────────────────── */
function DNAHelix() {
  const groupRef = useRef<THREE.Group>(null);
  const count = 80;

  const { positions1, positions2, connections } = useMemo(() => {
    const p1: [number, number, number][] = [];
    const p2: [number, number, number][] = [];
    const conn: { from: [number, number, number]; to: [number, number, number] }[] = [];

    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 6;
      const y = (i / count) * 16 - 8;
      const r = 1.8;
      const x1 = Math.cos(t) * r;
      const z1 = Math.sin(t) * r;
      const x2 = Math.cos(t + Math.PI) * r;
      const z2 = Math.sin(t + Math.PI) * r;
      p1.push([x1, y, z1]);
      p2.push([x2, y, z2]);
      if (i % 4 === 0) {
        conn.push({ from: [x1, y, z1], to: [x2, y, z2] });
      }
    }
    return { positions1: p1, positions2: p2, connections: conn };
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={[5, 0, -5]}>
      {/* Strand 1 */}
      {positions1.map((pos, i) => (
        <mesh key={`s1-${i}`} position={pos}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial
            color="#14b8a6"
            emissive="#14b8a6"
            emissiveIntensity={0.5}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
      {/* Strand 2 */}
      {positions2.map((pos, i) => (
        <mesh key={`s2-${i}`} position={pos}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={0.5}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
      {/* Connections */}
      {connections.map((c, i) => {
        const mid: [number, number, number] = [
          (c.from[0] + c.to[0]) / 2,
          (c.from[1] + c.to[1]) / 2,
          (c.from[2] + c.to[2]) / 2,
        ];
        const len = Math.sqrt(
          (c.to[0] - c.from[0]) ** 2 + (c.to[1] - c.from[1]) ** 2 + (c.to[2] - c.from[2]) ** 2
        );
        const dir = new THREE.Vector3(
          c.to[0] - c.from[0],
          c.to[1] - c.from[1],
          c.to[2] - c.from[2]
        ).normalize();
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir
        );
        return (
          <mesh key={`conn-${i}`} position={mid} quaternion={quat}>
            <cylinderGeometry args={[0.02, 0.02, len, 4]} />
            <meshStandardMaterial
              color="#3b82f6"
              emissive="#3b82f6"
              emissiveIntensity={0.3}
              transparent
              opacity={0.4}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/* ── Pulsing Core Sphere ────────────────────── */
function CoreSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.15;
      meshRef.current.scale.set(s, s, s);
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[-4, 1, -3]}>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshStandardMaterial
          color="#0d9488"
          emissive="#14b8a6"
          emissiveIntensity={0.2}
          wireframe
          transparent
          opacity={0.25}
        />
      </mesh>
    </Float>
  );
}

/* ── Floating Particles ─────────────────────── */
function FloatingParticles({ count = 200 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        position: [
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
        ] as [number, number, number],
        speed: 0.1 + Math.random() * 0.3,
        offset: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    particles.forEach((p, i) => {
      const t = state.clock.elapsedTime;
      dummy.position.set(
        p.position[0] + Math.sin(t * p.speed + p.offset) * 0.5,
        p.position[1] + Math.cos(t * p.speed + p.offset) * 0.3,
        p.position[2]
      );
      dummy.scale.setScalar(0.02 + Math.sin(t * p.speed * 2 + p.offset) * 0.01);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#14b8a6" transparent opacity={0.6} />
    </instancedMesh>
  );
}

/* ── Main Scene ─────────────────────────────── */
interface Scene3DProps {
  variant?: "full" | "subtle";
}

export default function Scene3D({ variant = "full" }: Scene3DProps) {
  return (
    <div className="canvas-container">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.15} />
        <pointLight position={[10, 10, 10]} intensity={0.4} color="#14b8a6" />
        <pointLight position={[-10, -5, 5]} intensity={0.2} color="#22d3ee" />
        <pointLight position={[0, 5, -10]} intensity={0.15} color="#3b82f6" />

        {variant === "full" && (
          <>
            <DNAHelix />
            <CoreSphere />
          </>
        )}

        <FloatingParticles count={variant === "full" ? 200 : 100} />
        <Stars
          radius={50}
          depth={50}
          count={variant === "full" ? 2000 : 800}
          factor={3}
          saturation={0.2}
          fade
          speed={0.5}
        />

        <fog attach="fog" args={["#050a14", 10, 40]} />
      </Canvas>
    </div>
  );
}
