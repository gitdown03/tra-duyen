import React from 'react';
import { DUO_SEATS, GROUP_SEATS, SeatDefinition } from '@tra-duyen/game-domain';

interface TeaRoomEnvironmentProps {
  mode: 'DUO_TABLE' | 'GROUP_GATHERING';
  theme?: string;
  onFloorClick?: (point: { x: number; z: number }) => void;
  onSeatClick?: (seatId: string) => void;
  occupiedSeats?: Map<string, string>; // seatId -> userId
}

export const TeaRoomEnvironment: React.FC<TeaRoomEnvironmentProps> = ({
  mode,
  theme = 'LANTERN_FESTIVAL',
  onFloorClick,
  onSeatClick,
  occupiedSeats = new Map()
}) => {
  const seats: SeatDefinition[] = mode === 'DUO_TABLE' ? DUO_SEATS : GROUP_SEATS;

  // Theme colors
  const themeColors: Record<string, { lanternLight: string; ambientColor: string }> = {
    LANTERN_FESTIVAL: { lanternLight: '#ff7a45', ambientColor: '#fff1b8' },
    SPRING_TEA: { lanternLight: '#73d13d', ambientColor: '#f6ffed' },
    MOON_NIGHT: { lanternLight: '#4096ff', ambientColor: '#e6f7ff' }
  };

  const currentTheme = themeColors[theme] || themeColors.LANTERN_FESTIVAL;

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.65} color={currentTheme.ambientColor} />
      <directionalLight
        position={[6, 12, 8]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={25}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />

      {/* Main Wooden Floor (Clickable) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
        onPointerDown={e => {
          e.stopPropagation();
          if (onFloorClick) {
            onFloorClick({ x: e.point.x, z: e.point.z });
          }
        }}
      >
        <planeGeometry args={[13, 13]} />
        <meshStandardMaterial color="#381e13" roughness={0.35} metalness={0.1} />
      </mesh>

      {/* Floor Border / Outer Platform */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[13.4, 0.1, 13.4]} />
        <meshStandardMaterial color="#221109" roughness={0.7} />
      </mesh>

      {/* Back Wall with Lattice Screens */}
      <mesh position={[0, 2.5, -6.5]} receiveShadow>
        <boxGeometry args={[13, 5, 0.2]} />
        <meshStandardMaterial color="#4a2c1d" roughness={0.7} />
      </mesh>

      {/* Paper Screen Insets */}
      {[-4, -1.5, 1.5, 4].map((x, i) => (
        <mesh key={`screen_${i}`} position={[x, 2.5, -6.38]}>
          <boxGeometry args={[2, 3.8, 0.05]} />
          <meshStandardMaterial color="#f7f2e7" roughness={0.9} />
        </mesh>
      ))}

      {/* Side Walls */}
      <mesh position={[-6.5, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[13, 5, 0.2]} />
        <meshStandardMaterial color="#4a2c1d" roughness={0.7} />
      </mesh>
      <mesh position={[6.5, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[13, 5, 0.2]} />
        <meshStandardMaterial color="#4a2c1d" roughness={0.7} />
      </mesh>

      {/* Ceiling Wooden Beams */}
      {[-4, 0, 4].map((x, i) => (
        <mesh key={`beam_x_${i}`} position={[x, 4.8, 0]}>
          <boxGeometry args={[0.3, 0.3, 13]} />
          <meshStandardMaterial color="#26140b" roughness={0.8} />
        </mesh>
      ))}
      {[-4, 0, 4].map((z, i) => (
        <mesh key={`beam_z_${i}`} position={[0, 4.95, z]}>
          <boxGeometry args={[13, 0.3, 0.3]} />
          <meshStandardMaterial color="#26140b" roughness={0.8} />
        </mesh>
      ))}

      {/* Hanging Lanterns with Warm Lights */}
      {[
        [-3, 3.8, -3],
        [3, 3.8, -3],
        [-3, 3.8, 3],
        [3, 3.8, 3],
        [0, 3.8, 0]
      ].map(([lx, ly, lz], i) => (
        <group key={`lantern_${i}`} position={[lx, ly, lz]}>
          {/* Suspension cord */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 1, 6]} />
            <meshStandardMaterial color="#1a1412" />
          </mesh>
          {/* Lantern Body */}
          <mesh castShadow>
            <cylinderGeometry args={[0.25, 0.25, 0.6, 8]} />
            <meshStandardMaterial
              color="#b83b32"
              emissive={currentTheme.lanternLight}
              emissiveIntensity={0.6}
              roughness={0.3}
            />
          </mesh>
          {/* Gold Trim */}
          <mesh position={[0, 0.31, 0]}>
            <cylinderGeometry args={[0.27, 0.27, 0.05, 8]} />
            <meshStandardMaterial color="#d4af37" metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.31, 0]}>
            <cylinderGeometry args={[0.27, 0.27, 0.05, 8]} />
            <meshStandardMaterial color="#d4af37" metalness={0.5} roughness={0.3} />
          </mesh>
          {/* Point light */}
          <pointLight color={currentTheme.lanternLight} intensity={0.8} distance={8} decay={2} />
        </group>
      ))}

      {/* Quầy Chủ Quán (Host Counter at Back) */}
      <group position={[0, 0, -4.8]}>
        {/* Main Counter Table */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[5, 1, 1.2]} />
          <meshStandardMaterial color="#381e13" roughness={0.4} />
        </mesh>
        {/* Counter Top Board */}
        <mesh position={[0, 1.02, 0]}>
          <boxGeometry args={[5.2, 0.08, 1.3]} />
          <meshStandardMaterial color="#4a2c1d" roughness={0.3} />
        </mesh>
        {/* Brass Kettle with steam */}
        <mesh position={[-1.6, 1.15, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.18, 0.25, 12]} />
          <meshStandardMaterial color="#c59b27" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Teapots on Counter */}
        <mesh position={[-0.8, 1.12, 0]} castShadow>
          <sphereGeometry args={[0.12, 10, 10]} />
          <meshStandardMaterial color="#5a2a18" roughness={0.5} />
        </mesh>
        <mesh position={[1.2, 1.12, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.2, 8]} />
          <meshStandardMaterial color="#2d6a4f" roughness={0.3} />
        </mesh>
      </group>

      {/* Central Table (Duo or Banquet) */}
      {mode === 'DUO_TABLE' ? (
        <group position={[0, 0, 0]}>
          {/* Low Tea Table */}
          <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.8, 0.08, 1.2]} />
            <meshStandardMaterial color="#4a2c1d" roughness={0.3} />
          </mesh>
          {/* Table Legs */}
          {[-0.8, 0.8].map((tx, i) =>
            [-0.5, 0.5].map((tz, j) => (
              <mesh key={`tleg_${i}_${j}`} position={[tx, 0.17, tz]} castShadow>
                <cylinderGeometry args={[0.05, 0.05, 0.34, 6]} />
                <meshStandardMaterial color="#381e13" />
              </mesh>
            ))
          )}
          {/* Tea Set on Table */}
          <mesh position={[-0.2, 0.42, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.07, 0.12, 8]} />
            <meshStandardMaterial color="#7a3e26" roughness={0.4} />
          </mesh>
          <mesh position={[0.2, 0.41, 0.2]} castShadow>
            <cylinderGeometry args={[0.04, 0.03, 0.06, 8]} />
            <meshStandardMaterial color="#f7f2e7" roughness={0.2} />
          </mesh>
          <mesh position={[0.2, 0.41, -0.2]} castShadow>
            <cylinderGeometry args={[0.04, 0.03, 0.06, 8]} />
            <meshStandardMaterial color="#f7f2e7" roughness={0.2} />
          </mesh>
          {/* Pastry Plate */}
          <mesh position={[0.2, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.12, 0.02, 12]} />
            <meshStandardMaterial color="#d4af37" metalness={0.4} roughness={0.4} />
          </mesh>
        </group>
      ) : (
        <group position={[0, 0, 0]}>
          {/* Group Banquet Table (Octagonal / Round) */}
          <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.8, 1.8, 0.08, 12]} />
            <meshStandardMaterial color="#4a2c1d" roughness={0.3} />
          </mesh>
          {/* Central Pedestal */}
          <mesh position={[0, 0.17, 0]} castShadow>
            <cylinderGeometry args={[0.4, 0.5, 0.34, 8]} />
            <meshStandardMaterial color="#381e13" />
          </mesh>
          {/* Large Center Teapot and Pastry Trays */}
          <mesh position={[0, 0.43, 0]} castShadow>
            <sphereGeometry args={[0.15, 10, 10]} />
            <meshStandardMaterial color="#5a2a18" roughness={0.4} />
          </mesh>
        </group>
      )}

      {/* Seats (Interactive Chairs) */}
      {seats.map(seat => {
        const isOccupied = occupiedSeats.has(seat.seatId);
        return (
          <group
            key={seat.seatId}
            position={[seat.position.x, 0, seat.position.z]}
            onPointerDown={e => {
              e.stopPropagation();
              if (onSeatClick) {
                onSeatClick(seat.seatId);
              }
            }}
          >
            {/* Cushion / Seat Pad */}
            <mesh position={[0, 0.18, 0]} castShadow>
              <boxGeometry args={[0.55, 0.12, 0.55]} />
              <meshStandardMaterial
                color={isOccupied ? '#734c37' : '#b83b32'}
                roughness={0.5}
                emissive={isOccupied ? '#000000' : '#8b2622'}
                emissiveIntensity={0.2}
              />
            </mesh>
            {/* Chair Backrest */}
            <mesh position={[0, 0.45, -0.24]} castShadow>
              <boxGeometry args={[0.55, 0.45, 0.06]} />
              <meshStandardMaterial color="#4a2c1d" roughness={0.6} />
            </mesh>
            {/* Chair Legs */}
            {[-0.22, 0.22].map((cx, i) =>
              [-0.22, 0.22].map((cz, j) => (
                <mesh key={`cl_${i}_${j}`} position={[cx, 0.08, cz]} castShadow>
                  <cylinderGeometry args={[0.03, 0.03, 0.16, 6]} />
                  <meshStandardMaterial color="#26140b" />
                </mesh>
              ))
            )}
          </group>
        );
      })}

      {/* Bình Phong Phong Nhã (Decorative Folding Screen for Private Tables) */}
      <group position={[4.2, 0, 2.5]} rotation={[0, -Math.PI / 4, 0]}>
        {/* 3-Panel Folding Screen */}
        <mesh position={[-0.8, 1.4, 0]} rotation={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.8, 2.8, 0.06]} />
          <meshStandardMaterial color="#4a2c1d" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.4, 0.08]} castShadow>
          <boxGeometry args={[0.8, 2.8, 0.06]} />
          <meshStandardMaterial color="#4a2c1d" roughness={0.5} />
        </mesh>
        <mesh position={[0.8, 1.4, 0]} rotation={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.8, 2.8, 0.06]} />
          <meshStandardMaterial color="#4a2c1d" roughness={0.5} />
        </mesh>
        {/* Silk Paintings in Screen Panels */}
        {[-0.8, 0, 0.8].map((px, i) => (
          <mesh key={`art_${i}`} position={[px, 1.4, 0.04]}>
            <planeGeometry args={[0.68, 2.4]} />
            <meshStandardMaterial color="#f7f2e7" roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Decorative Potted Bamboo and Bonsai */}
      <group position={[-5.2, 0, -5.2]}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.22, 0.7, 8]} />
          <meshStandardMaterial color="#221109" roughness={0.5} />
        </mesh>
        {/* Bamboo Stalks */}
        {[-0.08, 0.08, 0].map((bx, i) => (
          <mesh key={`bamboo_${i}`} position={[bx, 1.4, (i % 2) * 0.08]} castShadow>
            <cylinderGeometry args={[0.03, 0.035, 1.6, 6]} />
            <meshStandardMaterial color="#2d6a4f" roughness={0.4} />
          </mesh>
        ))}
      </group>

      <group position={[5.2, 0, -5.2]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.6, 0.8, 0.6]} />
          <meshStandardMaterial color="#381e13" roughness={0.5} />
        </mesh>
        {/* Ceramic Bonsai Pot */}
        <mesh position={[0, 0.88, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.2, 0.16, 8]} />
          <meshStandardMaterial color="#1c3d45" roughness={0.3} />
        </mesh>
        {/* Pine foliage */}
        <mesh position={[0, 1.15, 0]} castShadow>
          <sphereGeometry args={[0.22, 8, 8]} />
          <meshStandardMaterial color="#1b4332" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
};
