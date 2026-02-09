'use client';

import { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { CareerRecommendation } from '@/types';

interface Universe3DProps {
  recommendations: CareerRecommendation[];
  selectedCareerIds: string[];
  onCareerClick?: (careerId: string) => void;
  nickname?: string;
}

// ─── 태양 (사용자) ────────────────────────────────
function Sun({ nickname }: { nickname?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
    if (glowRef.current) {
      const scale = 1.8 + Math.sin(clock.getElapsedTime() * 2) * 0.15;
      glowRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group>
      {/* 외부 글로우 */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#FDB813"
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* 태양 코어 */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.8, 64, 64]} />
        <meshStandardMaterial
          emissive="#FDB813"
          emissiveIntensity={2}
          color="#FFD700"
          toneMapped={false}
        />
      </mesh>

      {/* 닉네임 라벨 */}
      {nickname && (
        <Html position={[0, 1.4, 0]} center distanceFactor={8}>
          <div
            style={{
              color: '#FDB813',
              fontSize: '13px',
              fontWeight: 700,
              textShadow: '0 0 12px rgba(253, 184, 19, 0.8)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              letterSpacing: '-0.02em',
            }}
          >
            {nickname}
          </div>
        </Html>
      )}

      {/* 포인트 라이트 */}
      <pointLight color="#FDB813" intensity={30} distance={25} />
    </group>
  );
}

// ─── 궤도 링 ──────────────────────────────────────
function OrbitRing({ radius }: { radius: number }) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return pts;
  }, [radius]);

  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }, [points]);

  return (
    <line>
      <bufferGeometry attach="geometry" {...lineGeometry} />
      <lineBasicMaterial color="#ffffff" transparent opacity={0.08} />
    </line>
  );
}

// ─── 행성 (진로) ──────────────────────────────────
function Planet({
  career,
  orbitRadius,
  baseAngle,
  speed,
  isSelected,
  onClick,
  color,
}: {
  career: CareerRecommendation;
  orbitRadius: number;
  baseAngle: number;
  speed: number;
  isSelected: boolean;
  onClick: () => void;
  color: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(t + baseAngle) * orbitRadius;
      groupRef.current.position.z = Math.sin(t + baseAngle) * orbitRadius;
      // 살짝 위아래 움직임
      groupRef.current.position.y = Math.sin(t * 2 + baseAngle) * 0.3;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.005;
    }
  });

  const planetScale = hovered ? 1.25 : 1;

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <group scale={planetScale}>
          {/* 행성 */}
          <mesh
            ref={meshRef}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(true);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              setHovered(false);
              document.body.style.cursor = 'default';
            }}
          >
            <sphereGeometry args={[0.45, 32, 32]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={hovered ? 0.6 : 0.25}
              roughness={0.4}
              metalness={0.3}
            />
          </mesh>

          {/* 선택 링 */}
          {isSelected && (
            <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
              <torusGeometry args={[0.65, 0.03, 16, 64]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={1}
                toneMapped={false}
              />
            </mesh>
          )}

          {/* 행성 글로우 */}
          <mesh>
            <sphereGeometry args={[0.55, 32, 32]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={hovered ? 0.2 : 0.08}
            />
          </mesh>

          {/* 포인트 라이트 */}
          <pointLight color={color} intensity={hovered ? 3 : 1} distance={5} />
        </group>
      </Float>

      {/* 라벨 (항상 표시, 호버 시 강조) */}
      <Html position={[0, 1, 0]} center distanceFactor={8}>
        <div
          style={{
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: hovered || isSelected ? 700 : 500,
            textShadow: `0 0 8px ${color}`,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            opacity: hovered || isSelected ? 1 : 0.7,
            transition: 'all 0.3s ease',
            letterSpacing: '-0.02em',
          }}
        >
          {career.career_name}
        </div>
      </Html>

      {/* 선택 시 위성(직업들) 표시 */}
      {isSelected &&
        career.example_jobs.slice(0, 4).map((job, idx) => (
          <Satellite
            key={job}
            job={job}
            index={idx}
            total={Math.min(career.example_jobs.length, 4)}
            color={color}
          />
        ))}
    </group>
  );
}

// ─── 위성 (구체적 직업) ──────────────────────────
function Satellite({
  job,
  index,
  total,
  color,
}: {
  job: string;
  index: number;
  total: number;
  color: string;
}) {
  const ref = useRef<THREE.Group>(null);
  const angle = (index / total) * Math.PI * 2;
  const radius = 1.2;

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime() * 0.5;
      ref.current.position.x = Math.cos(t + angle) * radius;
      ref.current.position.z = Math.sin(t + angle) * radius;
      ref.current.position.y = Math.sin(t * 2 + angle) * 0.15;
    }
  });

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>
      <Html position={[0, 0.2, 0]} center distanceFactor={8}>
        <div
          style={{
            color: '#ffffff',
            fontSize: '9px',
            fontWeight: 500,
            textShadow: `0 0 6px ${color}`,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            opacity: 0.8,
          }}
        >
          {job}
        </div>
      </Html>
    </group>
  );
}

// ─── 파티클 배경 ──────────────────────────────────
function CosmicDust() {
  const count = 200;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return arr;
  }, []);

  const ref = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.005;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#6366f1"
        size={0.05}
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

// ─── 3D 씬 ──────────────────────────────────────
function Scene({
  recommendations,
  selectedCareerIds,
  onCareerClick,
  nickname,
}: Universe3DProps) {
  const planetColors = ['#4285F4', '#34A853', '#EA4335', '#FBBC04', '#8B5CF6', '#EC4899'];

  return (
    <>
      {/* 배경 별들 */}
      <Stars
        radius={80}
        depth={60}
        count={3000}
        factor={4}
        saturation={0.3}
        fade
        speed={0.5}
      />

      {/* 우주 먼지 */}
      <CosmicDust />

      {/* 환경 조명 */}
      <ambientLight intensity={0.15} />

      {/* 태양 (사용자) */}
      <Sun nickname={nickname} />

      {/* 궤도 및 행성 */}
      {recommendations.map((career, index) => {
        const orbitRadius = 3.5 + index * 2;
        const angle = (index * Math.PI * 2) / recommendations.length;
        const color = career.is_custom
          ? '#FBBC04'
          : planetColors[index % planetColors.length];

        return (
          <group key={career.recommendation_id}>
            <OrbitRing radius={orbitRadius} />
            <Planet
              career={career}
              orbitRadius={orbitRadius}
              baseAngle={angle}
              speed={0.08 - index * 0.01}
              isSelected={selectedCareerIds.includes(career.recommendation_id)}
              onClick={() => onCareerClick?.(career.recommendation_id)}
              color={color}
            />
          </group>
        );
      })}

      {/* 카메라 컨트롤 */}
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={4}
        maxDistance={25}
        autoRotate
        autoRotateSpeed={0.3}
        maxPolarAngle={Math.PI * 0.85}
        minPolarAngle={Math.PI * 0.15}
      />
    </>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────
export default function Universe3D(props: Universe3DProps) {
  return (
    <div className="w-full h-full" style={{ background: '#050816' }}>
      <Canvas
        camera={{ position: [0, 6, 12], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
}

