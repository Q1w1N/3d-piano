import { useFrame } from '@react-three/fiber';
import { useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { BoxGeometry, Group } from 'three';
import { noteColorsAtom } from './atoms/NoteColorsAtom';
import { noteSpeedAtom } from './atoms/NoteSpeedAtom';

export const FlowingNote = ({
  grow,
  cleanup,
  black,
  bpm,
}: {
  grow: boolean;
  cleanup: () => void;
  black: boolean;
  bpm: number;
}) => {
  const meshRef = useRef<Group>(null!);
  const removingRef = useRef<boolean>(false);
  const [height, setHeight] = useState(0);
  const [noteSpeed] = useAtom(noteSpeedAtom);
  const [speed, setSpeed] = useState(bpm * noteSpeed);
  const [noteColor] = useAtom(noteColorsAtom);

  useEffect(() => {
    setSpeed(bpm * noteSpeed);
  }, [bpm, noteSpeed]);

  useFrame((_, delta) => {
    if (grow) {
      setHeight((height) => height + delta * speed);
      if (meshRef.current) {
        meshRef.current.position.z = -height / 2;
      }
    }

    if (
      grow === false &&
      meshRef.current.position.z + height / 2 < -30 &&
      !removingRef.current
    ) {
      meshRef.current.parent?.remove(meshRef.current);
    }

    if (grow === false) {
      meshRef.current.position.z -= delta * speed;
    }
  });

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      <mesh>
        <boxGeometry args={[black ? 0.5 : 0.8, 0.3, height]} />
        <meshStandardMaterial
          wireframe
          wireframeLinewidth={10}
          wireframeLinejoin="round"
          wireframeLinecap="round"
          emissive={black ? noteColor.black : noteColor.white}
          emissiveIntensity={2}
          color={black ? noteColor.black : noteColor.white}
        />
        <meshStandardMaterial
          emissive={black ? noteColor.black : noteColor.white}
          emissiveIntensity={2}
          color={black ? noteColor.black : noteColor.white}
        />
      </mesh>
      {/* Outline */}
      <lineSegments>
        <edgesGeometry
          attach="geometry"
          args={[new BoxGeometry(black ? 0.51 : 0.81, 0.31, height)]}
        />
        <lineBasicMaterial color="black" />
      </lineSegments>
    </group>
  );
};
