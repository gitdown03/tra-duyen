import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { TeaRoomEnvironment } from './TeaRoomEnvironment';
import { Character3D } from './Character3D';

interface PlayerState {
  sessionId: string;
  userId: string;
  nickname: string;
  pronoun: string;
  role: string;
  seatId?: string;
  isReady: boolean;
  isConnected: boolean;
  x: number;
  y: number;
  z: number;
  rotationY: number;
  animation: string;
  appearanceJson: string;
}

interface TeaRoomCanvasProps {
  mode: 'DUO_TABLE' | 'GROUP_GATHERING';
  theme: string;
  players: PlayerState[];
  currentUserId: string;
  onMoveIntent: (x: number, z: number) => void;
  onSitIntent: (seatId: string) => void;
  onSelectPlayer?: (userId: string) => void;
}

export const TeaRoomCanvas: React.FC<TeaRoomCanvasProps> = ({
  mode,
  theme,
  players,
  currentUserId,
  onMoveIntent,
  onSitIntent,
  onSelectPlayer
}) => {
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
      }
    } catch {
      setWebglSupported(false);
    }
  }, []);

  if (!webglSupported) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#2b1810] text-[#f7f2e7] p-6 text-center">
        <div className="max-w-md bg-[#381e13]/90 border border-amber-800/40 p-6 rounded-2xl shadow-xl">
          <h3 className="text-xl font-bold font-oriental text-amber-300 mb-2">Thông Báo Hiển Thị 3D</h3>
          <p className="text-sm opacity-80 mb-4 leading-relaxed">
            Trình duyệt của bạn hiện chưa kích hoạt WebGL hoặc tăng tốc phần cứng. Bạn vẫn có thể tham gia đàm đạo, chọn món
            và giao lưu qua giao diện tương tác bên dưới.
          </p>
          <div className="text-xs text-amber-500/80 bg-amber-950/40 p-3 rounded-lg border border-amber-900/30">
            Mẹo: Kích hoạt Hardware Acceleration trong cài đặt trình duyệt để thưởng thức trọn vẹn cảnh trà 3D cổ trang.
          </div>
        </div>
      </div>
    );
  }

  const occupiedSeats = new Map<string, string>();
  for (const p of players) {
    if (p.seatId) {
      occupiedSeats.set(p.seatId, p.userId);
    }
  }

  return (
    <div className="w-full h-full relative cursor-crosshair">
      <Canvas
        shadows
        camera={{ position: [0, 8, 11], fov: 42 }}
        className="w-full h-full"
      >
        <OrbitControls
          target={[0, 0.6, 0]}
          maxPolarAngle={Math.PI / 2.15}
          minPolarAngle={Math.PI / 6}
          minDistance={5}
          maxDistance={18}
          enablePan={true}
          makeDefault
        />

        <TeaRoomEnvironment
          mode={mode}
          theme={theme}
          occupiedSeats={occupiedSeats}
          onFloorClick={pt => onMoveIntent(pt.x, pt.z)}
          onSeatClick={seatId => onSitIntent(seatId)}
        />

        {players.map(player => (
          <Character3D
            key={player.sessionId}
            userId={player.userId}
            nickname={player.nickname}
            pronoun={player.pronoun}
            role={player.role}
            seatId={player.seatId}
            position={[player.x, player.y, player.z]}
            rotationY={player.rotationY}
            animation={player.animation}
            appearanceJson={player.appearanceJson}
            isSelf={player.userId === currentUserId}
            onPointerDown={e => {
              e.stopPropagation();
              if (onSelectPlayer) onSelectPlayer(player.userId);
            }}
          />
        ))}
      </Canvas>
    </div>
  );
};
