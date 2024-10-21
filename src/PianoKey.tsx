import { ThreeElements, useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Mesh } from 'three';
import { useSpring, a } from '@react-spring/three';
import { PolySynth } from 'tone';
import { FlowingNote } from './FlowingNote';

const map: Record<string, string> = {
  a: 'C4',
  w: 'C#4',
  s: 'D4',
  e: 'D#4',
  d: 'E4',
  f: 'F4',
  t: 'F#4',
  g: 'G4',
  y: 'G#4',
  h: 'A4',
  u: 'A#4',
  j: 'B4',
};

const synth = new PolySynth().toDestination();

type PianoKeyProps = ThreeElements['mesh'] & {
  note: string;
  isBlack?: boolean;
};

export const PianoKey = ({ position, ...props }: PianoKeyProps) => {
  const meshRef = useRef<Mesh>(null!);
  const [hovered, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);

  const [flowies, setFlowies] = useState<boolean[]>([]);

  const cleanup = useCallback(() => {
    setFlowies((flowies) => {
      flowies.shift();
      return [...flowies];
    });
  }, []);

  const [spring, api] = useSpring(() => ({
    rotation: [0, 0, 0], // Starting with no rotation
    config: { tension: 200, friction: 10, clamp: true }, // Config for smoothness
  }));

  const color = props.isBlack ? '#222222' : '#CCCCCC';

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.layers.set(0);
    }
  }, []);

  useFrame(() => {
    if (pressed && meshRef.current) {
      // Apply a small rotation when pressed
      api.start({ rotation: [Math.PI / 28, 0, 0] });
    } else if (meshRef.current) {
      // Reset rotation when not pressed
      api.start({ rotation: [0, 0, 0] });
    }
  });

  useEffect(() => {
    if (pressed) {
      synth.triggerAttack(props.note);
    } else {
      synth.triggerRelease(props.note);
    }
  }, [pressed, props.note]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        map[event.key] &&
        props.note === map[event.key] &&
        pressed === false
      ) {
        // Only react if the object is selected

        setFlowies((oldFlowies) => [...oldFlowies, true]);
        setPressed(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (map[event.key] && props.note === map[event.key]) {
        setPressed(false);
        setFlowies((oldFlowies) => oldFlowies.map(() => false));
      }
    };

    // Attach event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Cleanup event listeners when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [props.note, pressed]);

  return (
    <group
      onPointerDown={(event) => {
        event.stopPropagation();
        setPressed(true);
        setFlowies((oldFlowies) => [...oldFlowies, true]);
      }}
      onPointerUp={(event) => {
        event.stopPropagation();
        setPressed(false);
        setFlowies((oldFlowies) => oldFlowies.map(() => false));
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => {
        setHover(false);
        setPressed(false);
      }}
      position={position}
    >
      <group>
        {flowies.map((x, index) => (
          <FlowingNote
            black={Boolean(props.isBlack)}
            cleanup={cleanup}
            key={index}
            grow={x}
          />
        ))}
      </group>

      <a.group
        rotation={
          spring.rotation.to((x, y, z) => [x, y, z]) as unknown as [
            number,
            number,
            number,
          ]
        }
      >
        <mesh
          castShadow={true}
          receiveShadow={true}
          {...props}
          position={[0, 0, 1]}
          ref={meshRef}
          scale={props.isBlack ? [0.7, 1, 1] : 1}
        >
          <boxGeometry args={[1, 0.3, 2.5]} />
          <meshStandardMaterial
            emissive={0}
            color={hovered || pressed ? 'MediumSpringGreen' : color}
          />
        </mesh>
      </a.group>
    </group>
  );
};
