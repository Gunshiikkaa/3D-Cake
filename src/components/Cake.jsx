import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Subcomponent: A Single Animated Candle
function Candle({ position, color = '#f39c12', flameColor = '#ff5f1f' }) {
  const flameRef = useRef();
  const lightRef = useRef();

  useFrame((state) => {
    if (flameRef.current) {
      // Pulse scale of the flame
      const pulse = Math.sin(state.clock.elapsedTime * 18 + position[0] * 10) * 0.12 + 1.0;
      flameRef.current.scale.set(pulse * 0.15, pulse * 0.35, pulse * 0.15);
      
      // Slight flicker position
      flameRef.current.position.y = 0.55 + Math.sin(state.clock.elapsedTime * 30) * 0.01;
    }
    if (lightRef.current) {
      // Flicker intensity
      lightRef.current.intensity = 0.8 + Math.sin(state.clock.elapsedTime * 25) * 0.2;
    }
  });

  return (
    <group position={position}>
      {/* Candle Body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
      </mesh>
      
      {/* Candle Wick */}
      <mesh position={[0, 0.37, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.06, 4]} />
        <meshBasicMaterial color="#333" />
      </mesh>

      {/* Flame */}
      <mesh ref={flameRef} position={[0, 0.55, 0]}>
        <coneGeometry args={[1, 1, 8]} />
        <meshBasicMaterial color={flameColor} />
      </mesh>

      {/* Soft flame light source */}
      <pointLight 
        ref={lightRef}
        position={[0, 0.6, 0]} 
        color={flameColor} 
        intensity={1} 
        distance={2.5} 
        decay={2}
        castShadow
        shadow-mapSize-width={128}
        shadow-mapSize-height={128}
      />
    </group>
  );
}

// Subcomponent: Strawberry topping
function Strawberry({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation} scale={0.22}>
      {/* Berry body */}
      <mesh castShadow>
        <coneGeometry args={[0.7, 1.2, 12]} />
        <meshStandardMaterial 
          color="#d01c1c" 
          roughness={0.2} 
          clearcoat={0.8}
          clearcoatRoughness={0.1}
        />
      </mesh>
      {/* Strawberry green stem */}
      <mesh position={[0, 0.6, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.4, 0.25, 6]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.9} />
      </mesh>
    </group>
  );
}

// Subcomponent: Blueberry topping
function Blueberry({ position }) {
  return (
    <mesh position={position} scale={0.09} castShadow>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial 
        color="#22316c" 
        roughness={0.4} 
        metalness={0.1} 
        bumpScale={0.05}
      />
    </mesh>
  );
}

export default function Cake({ 
  primaryColor = '#d15f7c', // main frosting
  secondaryColor = '#ffffff', // cream layers/drippings
  standColor = '#e2e8f0', // stand plate
  hasLollipop = true,
  candleCount = 5
}) {
  const cakeGroupRef = useRef();

  // Rotate cake slowly
  useFrame((state) => {
    if (cakeGroupRef.current) {
      cakeGroupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  // Procedural Lollipop Swirl texture
  const lollipopTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Clear white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);
    
    // Draw spiral
    ctx.strokeStyle = '#e91e63';
    ctx.lineWidth = 14;
    ctx.translate(128, 128);
    ctx.beginPath();
    for (let i = 0; i < 300; i++) {
      const angle = 0.08 * i;
      const r = (5 + 0.35 * angle);
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, []);

  // Cream dollops position coordinates
  const creamT1 = useMemo(() => {
    const count = 18;
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const r = 1.7;
      return [Math.cos(angle) * r, 0.95, Math.sin(angle) * r];
    });
  }, []);

  const creamT2 = useMemo(() => {
    const count = 12;
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const r = 1.2;
      return [Math.cos(angle) * r, 1.75, Math.sin(angle) * r];
    });
  }, []);

  const toppingsT1 = useMemo(() => {
    // Alternate strawberry and blueberry on step 1
    const count = 8;
    return Array.from({ length: count }).map((_, i) => {
      const angle = ((i + 0.5) / count) * Math.PI * 2;
      const r = 1.5;
      return {
        type: i % 2 === 0 ? 'strawberry' : 'blueberry',
        pos: [Math.cos(angle) * r, 1.05, Math.sin(angle) * r],
        rot: [0.15, angle, 0.1]
      };
    });
  }, []);

  // Sprinkles list
  const sprinkles = useMemo(() => {
    const colors = ['#f1c40f', '#2ecc71', '#9b59b6', '#3498db', '#e74c3c', '#e84393'];
    return Array.from({ length: 30 }).map((_, i) => {
      const r = 0.2 + Math.random() * 0.5;
      const angle = Math.random() * Math.PI * 2;
      return {
        pos: [Math.cos(angle) * r, 2.41, Math.sin(angle) * r],
        rot: [Math.random() * 0.3, Math.random() * Math.PI, Math.random() * 0.3],
        color: colors[i % colors.length]
      };
    });
  }, []);

  // Calculate candle positions based on count
  const candlePositions = useMemo(() => {
    return Array.from({ length: candleCount }).map((_, i) => {
      const angle = (i / candleCount) * Math.PI * 2;
      const r = 0.5;
      return [Math.cos(angle) * r, 2.4, Math.sin(angle) * r];
    });
  }, [candleCount]);

  return (
    <group ref={cakeGroupRef} position={[0, -1, 0]}>
      {/* 1. CAKE STAND */}
      {/* Pedestal Base */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[1.2, 1.3, 0.1, 32]} />
        <meshStandardMaterial color={standColor} roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Pedestal Column */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.3, 16]} />
        <meshStandardMaterial color={standColor} roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Pedestal Plate */}
      <mesh position={[0, 0.45, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.0, 2.0, 0.1, 32]} />
        <meshStandardMaterial color={standColor} roughness={0.1} metalness={0.9} />
      </mesh>

      {/* 2. BOTTOM TIER */}
      <group position={[0, 0.5, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.8, 1.85, 0.9, 32]} />
          <meshStandardMaterial color={primaryColor} roughness={0.4} />
        </mesh>
        {/* Frosting filling line */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[1.81, 1.86, 0.12, 32]} />
          <meshStandardMaterial color={secondaryColor} roughness={0.5} />
        </mesh>
      </group>

      {/* Bottom tier cream dollops */}
      {creamT1.map((pos, idx) => (
        <mesh key={`cream1-${idx}`} position={pos} scale={0.14} castShadow>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial color={secondaryColor} roughness={0.3} />
        </mesh>
      ))}

      {/* 3. MIDDLE TIER */}
      <group position={[0, 1.35, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.3, 1.35, 0.8, 32]} />
          <meshStandardMaterial color={primaryColor} roughness={0.4} />
        </mesh>
        {/* Frosting filling line */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[1.31, 1.36, 0.1, 32]} />
          <meshStandardMaterial color={secondaryColor} roughness={0.5} />
        </mesh>
      </group>

      {/* Middle tier cream dollops */}
      {creamT2.map((pos, idx) => (
        <mesh key={`cream2-${idx}`} position={pos} scale={0.12} castShadow>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial color={secondaryColor} roughness={0.3} />
        </mesh>
      ))}

      {/* Toppings on bottom step */}
      {toppingsT1.map((item, idx) => {
        if (item.type === 'strawberry') {
          return <Strawberry key={`top-${idx}`} position={item.pos} rotation={item.rot} />;
        } else {
          return <Blueberry key={`top-${idx}`} position={item.pos} />;
        }
      })}

      {/* 4. TOP TIER */}
      <group position={[0, 2.1, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.8, 0.85, 0.6, 32]} />
          <meshStandardMaterial color={primaryColor} roughness={0.4} />
        </mesh>
        {/* Dripping top icing */}
        <mesh position={[0, 0.28, 0]} castShadow>
          <cylinderGeometry args={[0.82, 0.82, 0.08, 32]} />
          <meshStandardMaterial color={secondaryColor} roughness={0.2} metalness={0.1} />
        </mesh>
      </group>

      {/* Top cream dollops along edge */}
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        const r = 0.76;
        return (
          <mesh key={`cream3-${i}`} position={[Math.cos(angle) * r, 2.38, Math.sin(angle) * r]} scale={0.1} castShadow>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial color={secondaryColor} roughness={0.3} />
          </mesh>
        );
      })}

      {/* Blueberries on top of top tier */}
      <Blueberry position={[0.2, 2.42, 0.35]} />
      <Blueberry position={[-0.3, 2.42, 0.2]} />
      <Blueberry position={[0.1, 2.42, -0.45]} />

      {/* Sprinkles on top tier */}
      {sprinkles.map((sp, idx) => (
        <mesh key={`sp-${idx}`} position={sp.pos} rotation={sp.rot} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.06, 6]} />
          <meshStandardMaterial color={sp.color} roughness={0.4} />
        </mesh>
      ))}

      {/* 5. LOLLIPOP TOPPING */}
      {hasLollipop && (
        <group position={[-0.35, 2.4, -0.25]} rotation={[0.2, 0.5, -0.2]}>
          {/* Stick */}
          <mesh castShadow>
            <cylinderGeometry args={[0.018, 0.018, 1.1, 8]} />
            <meshStandardMaterial color="#e5c158" roughness={0.8} />
          </mesh>
          {/* Swirl Disc */}
          <mesh position={[0, 0.6, 0]} rotation={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.26, 0.26, 0.04, 32]} />
            <meshStandardMaterial map={lollipopTexture} roughness={0.3} />
          </mesh>
        </group>
      )}

      {/* 6. CANDLES */}
      {candlePositions.map((pos, idx) => (
        <Candle 
          key={`candle-${idx}`} 
          position={pos} 
          color={idx % 2 === 0 ? '#3498db' : '#f1c40f'} 
          flameColor="#ff7f27" 
        />
      ))}
    </group>
  );
}
