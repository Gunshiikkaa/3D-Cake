import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';

// Individual Polaroid photo frame component
function PolaroidFrame({ 
  url, 
  index, 
  totalCount, 
  caption, 
  description, 
  onSelect,
  scrollRotationRef
}) {
  const groupRef = useRef();
  const innerRef = useRef();
  const isInitialized = useRef(false);
  const [texture, setTexture] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Load texture dynamically
  useEffect(() => {
    if (!url) return;
    setLoadError(false);
    
    try {
      const loader = new THREE.TextureLoader();
      loader.crossOrigin = 'anonymous';
      
      loader.load(
        url,
        (tex) => {
          setTexture(tex);
        },
        undefined,
        (err) => {
          console.warn(`Failed to load photo ${index}: ${url}`, err);
          setLoadError(true);
        }
      );
    } catch (e) {
      console.error(`Error loader initialization for photo ${index}:`, e);
      setLoadError(true);
    }
  }, [url, index]);

  // Position in a circular orbit around the cake
  const orbitRadius = 4.2;
  const angle = (index / totalCount) * Math.PI * 2;

  // Animate floating and scaling
  useFrame((state) => {
    if (!groupRef.current || !innerRef.current) return;

    // Calculate current target position based on accumulated scroll rotation
    const scrollAngle = scrollRotationRef ? scrollRotationRef.current : 0;
    const currentAngle = angle + scrollAngle;

    const targetX = Math.cos(currentAngle) * orbitRadius;
    const targetZ = Math.sin(currentAngle) * orbitRadius;
    const targetY = Math.sin(currentAngle * 2) * 0.25 + 1.1; // slightly flatter wavy pattern for neatness

    // Initialize position on first render to prevent starting at center [0,0,0]
    if (!isInitialized.current) {
      groupRef.current.position.set(targetX, targetY, targetZ);
      isInitialized.current = true;
    } else {
      // Lerp positions with a small delay for a gorgeous inertia physics feel!
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.08);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.08);
      
      const floatOffset = Math.sin(state.clock.elapsedTime * 1.3 + index * 0.7) * 0.06;
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY + floatOffset, 0.08);
    }

    // Smooth hover scale
    const targetScale = hovered ? 1.2 : 1.0;
    const currentScale = innerRef.current.scale.x;
    const step = 0.15; // interpolation speed
    
    innerRef.current.scale.setScalar(
      THREE.MathUtils.lerp(currentScale, targetScale, step)
    );

    // Dynamic rotation tilt on hover
    const targetRotationZ = hovered ? Math.sin(state.clock.elapsedTime * 3) * 0.04 : 0;
    innerRef.current.rotation.z = THREE.MathUtils.lerp(innerRef.current.rotation.z, targetRotationZ, step);
  });

  // Placeholder textures in case of load error or loading state
  const fallbackTexture = useMemo(() => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      
      // Draw cute pastel background
      const grad = ctx.createLinearGradient(0, 0, 128, 128);
      grad.addColorStop(0, '#f08da5');
      grad.addColorStop(1, '#ffc0cb');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
      
      // Draw white heart in the center
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(64, 48);
      ctx.bezierCurveTo(64, 42, 54, 30, 40, 30);
      ctx.bezierCurveTo(24, 30, 24, 52, 24, 52);
      ctx.bezierCurveTo(24, 68, 48, 88, 64, 98);
      ctx.bezierCurveTo(80, 88, 104, 68, 104, 52);
      ctx.bezierCurveTo(104, 52, 104, 30, 88, 30);
      ctx.bezierCurveTo(74, 30, 64, 42, 64, 48);
      ctx.fill();

      return new THREE.CanvasTexture(canvas);
    } catch (e) {
      console.error("Error creating fallback texture canvas:", e);
      return null;
    }
  }, []);

  return (
    <group 
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect({ url, caption, description, index });
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'default';
        setHovered(false);
      }}
    >
      <Billboard ref={innerRef}>
        {/* White Polaroid Border (Shrunk from [1.3, 1.6] to [0.8, 1.0]) */}
        <mesh castShadow receiveShadow>
          <planeGeometry args={[0.8, 1.0]} />
          <meshStandardMaterial 
            color="#ffffff" 
            roughness={0.9} 
            side={THREE.DoubleSide} 
          />
        </mesh>
        
        {/* Photo Image Plane (Shrunk from [1.15, 1.15] to [0.7, 0.7], positioned higher at y=0.1) */}
        <mesh position={[0, 0.1, 0.005]}>
          <planeGeometry args={[0.7, 0.7]} />
          <meshBasicMaterial 
            map={loadError ? fallbackTexture : (texture || fallbackTexture)} 
            side={THREE.DoubleSide} 
          />
        </mesh>

        {/* Small pin/dot on top (Repositioned for the smaller size) */}
        <mesh position={[0, 0.46, 0.01]} scale={0.025}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#d15f7c" roughness={0.5} />
        </mesh>
      </Billboard>
    </group>
  );
}

export default function Polaroids({ photos = [], onSelect, scrollRotationRef }) {
  return (
    <group>
      {photos.map((photo, idx) => (
        <PolaroidFrame
          key={`polaroid-${idx}`}
          url={photo.url}
          index={idx}
          totalCount={photos.length}
          caption={photo.caption}
          description={photo.description}
          onSelect={onSelect}
          scrollRotationRef={scrollRotationRef}
        />
      ))}
    </group>
  );
}
