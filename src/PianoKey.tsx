import { ThreeElements, useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Mesh } from 'three';
import { useSpring, a } from '@react-spring/three';
import { PolySynth } from 'tone';
import { FlowingNote } from './FlowingNote';
import { bpmAtom } from './atoms/BpmAtom';
import { useAtom } from 'jotai';

const map: Record<string, string> = {
  'a': 'C3',
  'w': 'C#3',
  's': 'D3',
  'e': 'D#3',
  'd': 'E3',
  'f': 'F3',
  't': 'F#3',
  'g': 'G3',
  'y': 'G#3',
  'h': 'A3',
  'u': 'A#3',
  'j': 'B3',
  'k': 'C4',
  'o': 'C#4',
  'l': 'D4',
  'p': 'D#4',
  ';': 'E4',
};

const synth = new PolySynth().toDestination();

type PianoKeyProps = ThreeElements['mesh'] & {
  note: string;
  isBlack?: boolean;
};

export const PianoKey = ({ position, ...props }: PianoKeyProps) => {
  const meshRef = useRef<Mesh>(null!);
  const [bpm] = useAtom(bpmAtom);
  const [hovered, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);
  const pressRef = useRef(pressed);

  const [flowies, setFlowies] = useState<boolean[]>([]);

  // Update refs on every render to keep the latest values
  useEffect(() => {
    pressRef.current = pressed;
  }, [pressed]);

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
        !pressRef.current
      ) {
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
  }, [props.note]);

  return Object.values(map).find((val) => val === props.note) ? (
    <group position={position}>
      <group>
        {flowies.map((x, index) => (
          <FlowingNote
            bpm={bpm}
            black={Boolean(props.isBlack)}
            cleanup={cleanup}
            key={index}
            grow={x}
          />
        ))}
      </group>
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
      >
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
            position={props.isBlack ? [0, 0, 0.9] : [0, 0, 1.25]}
            ref={meshRef}
          >
            <boxGeometry
              args={props.isBlack ? [0.6, 0.3, 1.8] : [1, 0.3, 2.5]}
            />
            <meshStandardMaterial
              emissive={0}
              color={hovered || pressed ? 'MediumSpringGreen' : color}
            />
          </mesh>
        </a.group>
      </group>
    </group>
  ) : null;
};
