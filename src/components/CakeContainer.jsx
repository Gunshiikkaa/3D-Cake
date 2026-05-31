import React, { useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import Cake from './Cake';
import Polaroids from './Polaroids';

// Camera controller component to handle transitions between landing and interactive stage
function CameraController({ stage }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(2.6, 1.2, 3.8));
  const lookAtTarget = useRef(new THREE.Vector3(1.3, 0.5, 0));

  useEffect(() => {
    if (stage === 'landing') {
      targetPos.current.set(2.6, 1.2, 3.8);
      lookAtTarget.current.set(1.3, 0.5, 0);
    } else if (stage === 'transitioning') {
      targetPos.current.set(0, 1.8, 6.4);
      lookAtTarget.current.set(0, 0.8, 0);
    }
  }, [stage]);

  useFrame(() => {
    if (stage === 'interactive') return; // Let OrbitControls take full control
    
    // Smoothly interpolate camera position
    camera.position.lerp(targetPos.current, 0.05);
    
    // Smoothly interpolate camera target direction
    const currentTarget = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const cameraLook = camera.position.clone().add(currentTarget);
    cameraLook.lerp(lookAtTarget.current, 0.05);
    camera.lookAt(cameraLook);
  });

  return null;
}

// Cake positioning animation based on state
function CakeWrapper({ stage, primaryColor, secondaryColor, standColor, candleCount }) {
  const groupRef = useRef();
  const targetX = stage === 'landing' ? 1.3 : 0;

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x,
        targetX,
        0.05
      );
    }
  });

  return (
    <group ref={groupRef} position={[1.3, 0, 0]}>
      <Cake
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        standColor={standColor}
        candleCount={candleCount}
      />
    </group>
  );
}

export default function CakeContainer({
  stage,
  config,
  onSelectPhoto
}) {
  const orbitRef = useRef();
  const scrollRotation = useRef(0);

  // Wheel listener to spin the polaroids around the cake
  useEffect(() => {
    if (stage !== 'interactive') return;

    const handleWheel = (e) => {
      // deltaY is positive for scroll down, negative for scroll up
      scrollRotation.current += e.deltaY * 0.0015;
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [stage]);

  // Reset OrbitControls camera target when going back to landing
  useEffect(() => {
    if (stage === 'landing' && orbitRef.current) {
      orbitRef.current.target.set(1.3, 0.5, 0);
      scrollRotation.current = 0; // reset spin
    } else if (stage === 'interactive' && orbitRef.current) {
      orbitRef.current.target.set(0, 0.8, 0);
    }
  }, [stage]);

  return (
    <div className="canvas-container">
      <Canvas
        shadows
        camera={{ position: [2.6, 1.2, 3.8], fov: 45 }}
        gl={{ antialias: true }}
      >
        {/* Soft Ambient Light */}
        <ambientLight intensity={0.6} />

        {/* Dynamic lights for premium gloss and shadows */}
        <directionalLight
          castShadow
          position={[5, 8, 5]}
          intensity={1.2}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={25}
          shadow-camera-left={-4}
          shadow-camera-right={4}
          shadow-camera-top={4}
          shadow-camera-bottom={-4}
          shadow-bias={-0.0005}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#e8a8b8" />
        <pointLight position={[0, -2, 2]} intensity={0.3} />

        {/* Floor shadow projection */}
        <ContactShadows
          position={[0, -1.05, 0]}
          opacity={0.6}
          scale={10}
          blur={1.5}
          far={3.0}
        />

        {/* 3D Cake with procedural decorations */}
        <CakeWrapper
          stage={stage}
          primaryColor={config.primaryColor}
          secondaryColor={config.secondaryColor}
          standColor={config.standColor}
          candleCount={config.candleCount}
        />

        {/* 3D Polaroid Carousel (Rendered only on interactive stage) */}
        {stage !== 'landing' && (
          <Polaroids
            photos={config.photos}
            onSelect={onSelectPhoto}
            scrollRotationRef={scrollRotation}
          />
        )}

        {/* Smooth camera transition */}
        <CameraController stage={stage} />

        {/* Interactive orbital rotation controls */}
        <OrbitControls
          ref={orbitRef}
          enabled={stage === 'interactive'}
          enableDamping
          dampingFactor={0.05}
          enablePan={false}
          enableZoom={false} // Disable camera zoom so scroll spins polaroids instead!
          minDistance={3.5}
          maxDistance={9.0}
          minPolarAngle={Math.PI / 6} // don't look completely from underneath
          maxPolarAngle={Math.PI / 1.8} // don't go completely above / below
        />
      </Canvas>
    </div>
  );
}
