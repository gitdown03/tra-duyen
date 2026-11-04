import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

export interface CharacterProps {
  userId: string;
  nickname: string;
  pronoun: string;
  role: string;
  seatId?: string;
  position: [number, number, number];
  rotationY: number;
  animation: string;
  appearanceJson?: string;
  isSelf?: boolean;
  onPointerDown?: (e: any) => void;
}

export const Character3D: React.FC<CharacterProps> = ({
  nickname,
  pronoun,
  role,
  seatId,
  position,
  rotationY,
  animation = 'idle',
  appearanceJson = '{}',
  isSelf = false,
  onPointerDown
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

  // Parse appearance customization
  let appearance = {
    hairStyle: 'hair_scholar_1',
    hairColor: '#2b201a',
    skinTone: '#f5deb3',
    outfitStyle: 'robe_hanfu_1',
    outfitPalette: 'palette_burgundy',
    accessory: 'none'
  };

  try {
    appearance = { ...appearance, ...JSON.parse(appearanceJson) };
  } catch {
    // fallback
  }

  // Palette color mapping
  const paletteMap: Record<string, { robe: string; trim: string; belt: string }> = {
    palette_burgundy: { robe: '#782823', trim: '#d4af37', belt: '#381e13' },
    palette_cyan: { robe: '#3a7d8c', trim: '#e8f4f8', belt: '#1c3d45' },
    palette_rose: { robe: '#b85c70', trim: '#fff0f3', belt: '#5e2330' },
    palette_charcoal: { robe: '#232528', trim: '#c8cbd0', belt: '#8b2622' },
    palette_jade: { robe: '#2d6a4f', trim: '#d8f3dc', belt: '#1b4332' },
    palette_gold: { robe: '#b5832a', trim: '#fff3b0', belt: '#583a0e' },
    palette_white: { robe: '#f4f4f6', trim: '#734c37', belt: '#2b201a' },
    palette_purple: { robe: '#5a3d6d', trim: '#e0c3fc', belt: '#2e183b' }
  };

  const colors = paletteMap[appearance.outfitPalette] || paletteMap.palette_burgundy;

  // Animation controller
  useFrame(state => {
    const t = state.clock.getElapsedTime();
    if (!groupRef.current) return;

    // Smooth movement interpolation
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, position[0], 0.2);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, position[1], 0.2);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, position[2], 0.2);

    let targetRot = rotationY;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRot, 0.2);

    const anim = animation.toLowerCase();

    // Reset base rotations
    if (leftArmRef.current && rightArmRef.current && leftLegRef.current && rightLegRef.current && headRef.current && torsoRef.current) {
      if (anim === 'walk') {
        // Walking stride
        const stride = Math.sin(t * 8);
        leftLegRef.current.rotation.x = stride * 0.6;
        rightLegRef.current.rotation.x = -stride * 0.6;
        leftArmRef.current.rotation.x = -stride * 0.4;
        rightArmRef.current.rotation.x = stride * 0.4;
        leftArmRef.current.rotation.z = 0.1;
        rightArmRef.current.rotation.z = -0.1;
        headRef.current.rotation.x = 0;
        torsoRef.current.rotation.x = 0.05;
      } else if (anim === 'sit_wait' || seatId) {
        // Sitting calmly with hands on lap
        leftLegRef.current.rotation.x = -Math.PI / 2;
        rightLegRef.current.rotation.x = -Math.PI / 2;
        leftArmRef.current.rotation.x = -0.4 + Math.sin(t * 2) * 0.02;
        rightArmRef.current.rotation.x = -0.4 + Math.sin(t * 2) * 0.02;
        leftArmRef.current.rotation.z = -0.2;
        rightArmRef.current.rotation.z = 0.2;
        headRef.current.rotation.x = 0;
        torsoRef.current.rotation.x = 0;
      } else if (anim === 'bow') {
        // Chắp tay cúi chào
        torsoRef.current.rotation.x = 0.4;
        headRef.current.rotation.x = 0.2;
        leftArmRef.current.rotation.x = -0.7;
        rightArmRef.current.rotation.x = -0.7;
        leftArmRef.current.rotation.z = -0.5;
        rightArmRef.current.rotation.z = 0.5;
      } else if (anim === 'sip_tea') {
        // Nâng chén uống trà
        rightArmRef.current.rotation.x = -1.2 + Math.sin(t * 3) * 0.1;
        rightArmRef.current.rotation.z = 0.4;
        leftArmRef.current.rotation.x = -0.3;
        headRef.current.rotation.x = 0.15;
      } else if (anim === 'offer_tea' || anim === 'offer_snack') {
        // Mời trà / mời điểm tâm
        leftArmRef.current.rotation.x = -0.8;
        rightArmRef.current.rotation.x = -0.8;
        leftArmRef.current.rotation.z = -0.3;
        rightArmRef.current.rotation.z = 0.3;
        torsoRef.current.rotation.x = 0.1;
      } else if (anim === 'give_card') {
        // Trao thiệp / Bỏ thiệp vào hộp (cùng 1 animation để giữ bí mật)
        leftArmRef.current.rotation.x = -0.6;
        rightArmRef.current.rotation.x = -0.9;
        rightArmRef.current.rotation.z = 0.1;
        torsoRef.current.rotation.x = 0.15;
      } else if (anim === 'clap') {
        // Vỗ tay
        const clap = Math.sin(t * 10);
        leftArmRef.current.rotation.x = -0.7;
        rightArmRef.current.rotation.x = -0.7;
        leftArmRef.current.rotation.z = -0.4 + clap * 0.15;
        rightArmRef.current.rotation.z = 0.4 - clap * 0.15;
      } else if (anim === 'nod') {
        // Gật đầu
        headRef.current.rotation.x = Math.sin(t * 6) * 0.2;
      } else if (anim === 'gentle_decline') {
        // Từ chối nhẹ nhàng: nâng 1 bàn tay, lắc đầu nhẹ
        rightArmRef.current.rotation.x = -0.8;
        rightArmRef.current.rotation.z = 0.4;
        headRef.current.rotation.y = Math.sin(t * 4) * 0.2;
      } else {
        // Idle breathing
        const breath = Math.sin(t * 2) * 0.03;
        torsoRef.current.position.y = 0.8 + breath;
        headRef.current.rotation.x = breath * 0.5;
        leftArmRef.current.rotation.x = breath;
        rightArmRef.current.rotation.x = -breath;
        leftArmRef.current.rotation.z = 0.05;
        rightArmRef.current.rotation.z = -0.05;
        leftLegRef.current.rotation.x = 0;
        rightLegRef.current.rotation.x = 0;
      }
    }
  });

  return (
    <group ref={groupRef} position={position} onPointerDown={onPointerDown}>
      {/* Floating Nametag */}
      <Html position={[0, 1.85, 0]} center distanceFactor={12}>
        <div className="flex flex-col items-center pointer-events-none select-none">
          <div
            className={`px-2 py-0.5 rounded-full text-xs font-medium shadow-md border backdrop-blur-sm flex items-center gap-1 ${
              isSelf
                ? 'bg-amber-100/90 text-amber-900 border-amber-400 font-bold'
                : 'bg-stone-900/80 text-stone-100 border-stone-700'
            }`}
          >
            <span>{nickname}</span>
            <span className="text-[10px] opacity-75">({pronoun})</span>
            {role === 'HOST' && <span className="text-[9px] bg-red-700 text-white px-1 rounded">Chủ quán</span>}
            {role === 'MATCHMAKER' && <span className="text-[9px] bg-amber-700 text-white px-1 rounded">Mai mối</span>}
          </div>
        </div>
      </Html>

      {/* Torso & Hanfu Robe */}
      <group ref={torsoRef} position={[0, 0.8, 0]}>
        {/* Upper Body */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.26, 0.48, 8]} />
          <meshStandardMaterial color={colors.robe} roughness={0.6} />
        </mesh>

        {/* Hanfu Collar & Sash */}
        <mesh position={[0, 0.05, 0.02]}>
          <cylinderGeometry args={[0.23, 0.27, 0.12, 8]} />
          <meshStandardMaterial color={colors.belt} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.05, 0.14]}>
          <boxGeometry args={[0.1, 0.1, 0.03]} />
          <meshStandardMaterial color={colors.trim} roughness={0.3} metalness={0.4} />
        </mesh>

        {/* Lower Robe Skirt */}
        <mesh position={[0, -0.32, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.38, 0.4, 8]} />
          <meshStandardMaterial color={colors.robe} roughness={0.6} />
        </mesh>

        {/* Accessory attachment (e.g. Jade pendant) */}
        {appearance.accessory === 'acc_jade_pendant' && (
          <mesh position={[0.2, -0.15, 0.12]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#52b788" roughness={0.2} />
          </mesh>
        )}
        {appearance.accessory === 'acc_tea_gourd' && (
          <group position={[0.22, -0.12, 0.08]}>
            <mesh position={[0, -0.04, 0]}>
              <sphereGeometry args={[0.045, 8, 8]} />
              <meshStandardMaterial color="#8b4513" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.02, 0]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial color="#8b4513" roughness={0.3} />
            </mesh>
          </group>
        )}

        {/* Head */}
        <group ref={headRef} position={[0, 0.38, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial color={appearance.skinTone} roughness={0.5} />
          </mesh>

          {/* Hair Styles */}
          {appearance.hairStyle === 'hair_scholar_1' && (
            <group>
              {/* Scholar topknot */}
              <mesh position={[0, 0.12, -0.04]}>
                <sphereGeometry args={[0.17, 12, 12]} />
                <meshStandardMaterial color={appearance.hairColor} roughness={0.7} />
              </mesh>
              <mesh position={[0, 0.22, -0.02]}>
                <cylinderGeometry args={[0.06, 0.06, 0.08, 8]} />
                <meshStandardMaterial color={appearance.hairColor} roughness={0.7} />
              </mesh>
              {/* Jade hairpin */}
              <mesh position={[0, 0.23, -0.02]} rotation={[0, 0, Math.PI / 4]}>
                <cylinderGeometry args={[0.015, 0.015, 0.24, 6]} />
                <meshStandardMaterial color="#52b788" roughness={0.2} metalness={0.2} />
              </mesh>
            </group>
          )}

          {appearance.hairStyle === 'hair_maiden_1' && (
            <group>
              {/* Twin buns */}
              <mesh position={[0, 0.1, -0.04]}>
                <sphereGeometry args={[0.17, 12, 12]} />
                <meshStandardMaterial color={appearance.hairColor} roughness={0.7} />
              </mesh>
              <mesh position={[-0.14, 0.18, -0.02]}>
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshStandardMaterial color={appearance.hairColor} roughness={0.7} />
              </mesh>
              <mesh position={[0.14, 0.18, -0.02]}>
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshStandardMaterial color={appearance.hairColor} roughness={0.7} />
              </mesh>
              {/* Flower ornament */}
              <mesh position={[0.15, 0.18, 0.04]}>
                <sphereGeometry args={[0.025, 6, 6]} />
                <meshStandardMaterial color="#ff758f" />
              </mesh>
            </group>
          )}

          {appearance.hairStyle === 'hair_flowing_1' && (
            <group>
              {/* Flowing long hair */}
              <mesh position={[0, 0.1, -0.05]}>
                <sphereGeometry args={[0.175, 12, 12]} />
                <meshStandardMaterial color={appearance.hairColor} roughness={0.7} />
              </mesh>
              <mesh position={[0, -0.12, -0.14]}>
                <boxGeometry args={[0.22, 0.36, 0.08]} />
                <meshStandardMaterial color={appearance.hairColor} roughness={0.7} />
              </mesh>
            </group>
          )}

          {appearance.hairStyle === 'hair_royal_1' && (
            <group>
              {/* Royal bun with golden crown */}
              <mesh position={[0, 0.12, -0.04]}>
                <sphereGeometry args={[0.17, 12, 12]} />
                <meshStandardMaterial color={appearance.hairColor} roughness={0.7} />
              </mesh>
              <mesh position={[0, 0.24, -0.02]}>
                <cylinderGeometry args={[0.08, 0.06, 0.1, 8]} />
                <meshStandardMaterial color="#d4af37" metalness={0.6} roughness={0.3} />
              </mesh>
            </group>
          )}

          {/* Gentle Eyes */}
          <mesh position={[-0.06, 0.02, 0.16]}>
            <sphereGeometry args={[0.02, 6, 6]} />
            <meshBasicMaterial color="#1a1412" />
          </mesh>
          <mesh position={[0.06, 0.02, 0.16]}>
            <sphereGeometry args={[0.02, 6, 6]} />
            <meshBasicMaterial color="#1a1412" />
          </mesh>
        </group>

        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.26, 0.16, 0]}>
          <mesh position={[0, -0.18, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.11, 0.38, 8]} />
            <meshStandardMaterial color={colors.robe} roughness={0.6} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.38, 0]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshStandardMaterial color={appearance.skinTone} roughness={0.5} />
          </mesh>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.26, 0.16, 0]}>
          <mesh position={[0, -0.18, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.11, 0.38, 8]} />
            <meshStandardMaterial color={colors.robe} roughness={0.6} />
          </mesh>
          {/* Hand with tea cup or card */}
          <mesh position={[0, -0.38, 0]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshStandardMaterial color={appearance.skinTone} roughness={0.5} />
          </mesh>
        </group>
      </group>

      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.12, 0.4, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.05, 0.4, 8]} />
          <meshStandardMaterial color={colors.belt} roughness={0.7} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.12, 0.4, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.05, 0.4, 8]} />
          <meshStandardMaterial color={colors.belt} roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
};
