import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Mesh } from 'three';

export const FlowingNote = ({
  grow,
  cleanup,
  black,
}: {
  grow: boolean;
  cleanup: () => void;
  black: boolean;
}) => {
  const meshRef = useRef<Mesh>(null!);
  const [height, setHeight] = useState(1);

  useFrame((_, delta) => {
    const speed = 10;

    if (grow) {
      console.log(delta);
      setHeight((height) => height + 1 * (delta * speed));
    }

    if (grow === false) {
      meshRef.current.position.z -= 1 * (delta * speed);
    }
  });

  // Should i remove it?
  useEffect(() => {
    meshRef.current.layers.enable(1);
  }, []);

  useEffect(() => {
    if (grow === false) {
      setTimeout(() => {
        if (meshRef.current) {
          meshRef.current.parent?.remove(meshRef.current);
        }
      }, 3000);
    }
    return () => {
      if (grow === false) {
        cleanup();
      }
    };
  }, [grow, cleanup]);

  return (
    <mesh ref={meshRef} position={[0, -0.5, -height / 2]}>
      <boxGeometry args={[black ? 0.5 : 0.6, 0.3, height]} />
      <meshStandardMaterial
        emissive={black ? 'aqua' : 'gold'}
        emissiveIntensity={2}
        color={black ? 'aqua' : 'gold'}
      />
    </mesh>
  );
};
