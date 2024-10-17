import { OrbitControls } from '@react-three/drei';
import { ThreeElements, useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Mesh } from 'three';
import { PolySynth } from 'tone';
import { useSpring, a } from '@react-spring/three';

type PianoKeyProps = ThreeElements['mesh'] & {
  note: string;
  isBlack?: boolean;
};

const synth = new PolySynth().toDestination();

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

function PianoKey({ position, ...props }: PianoKeyProps) {
  const meshRef = useRef<Mesh>(null!);
  const [hovered, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);

  const [spring, api] = useSpring(() => ({
    rotation: [0, 0, 0], // Starting with no rotation
    config: { tension: 200, friction: 10, clamp: true }, // Config for smoothness
  }));

  const color = props.isBlack ? 'black' : 'white';

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
      if (map[event.key] && props.note === map[event.key]) {
        // Only react if the object is selected
        setPressed(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (map[event.key] && props.note === map[event.key]) {
        setPressed(false);
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

  return (
    <a.group
      position={position}
      rotation={
        spring.rotation.to((x, y, z) => [x, y, z]) as unknown as [
          number,
          number,
          number,
        ]
      }
    >
      <mesh
        {...props}
        position={[0, 0, 1]}
        ref={meshRef}
        scale={props.isBlack ? [0.7, 1, 1] : 1}
        onPointerDown={(event) => {
          event.stopPropagation();
          setPressed(true);
        }}
        onPointerUp={(event) => {
          event.stopPropagation();
          setPressed(false);
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
        <boxGeometry args={[1, 0.8, 2.5]} />
        <meshStandardMaterial color={hovered || pressed ? 'hotpink' : color} />
      </mesh>
    </a.group>
  );
}

const Octave = ({ pitch, offset }: { pitch: number; offset: number }) => {
  return (
    <group position={[offset, 0, 0]}>
      <PianoKey isBlack={false} note={'C' + pitch} position={[0, 0, -1]} />
      <PianoKey
        isBlack={true}
        note={'C#' + pitch}
        position={[0.5, 0.3, -1.8]}
      />
      <PianoKey isBlack={false} note={'D' + pitch} position={[1.02, 0, -1]} />
      <PianoKey
        isBlack={true}
        note={'D#' + pitch}
        position={[1.54, 0.3, -1.8]}
      />
      <PianoKey isBlack={false} note={'E' + pitch} position={[2.04, 0, -1]} />

      <PianoKey isBlack={false} note={'F' + pitch} position={[3.06, 0, -1]} />
      <PianoKey
        isBlack={true}
        note={'F#' + pitch}
        position={[3.56, 0.3, -1.8]}
      />
      <PianoKey isBlack={false} note={'G' + pitch} position={[4.08, 0, -1]} />
      <PianoKey
        isBlack={true}
        note={'G#' + pitch}
        position={[4.58, 0.3, -1.8]}
      />
      <PianoKey isBlack={false} note={'A' + pitch} position={[5.1, 0, -1]} />
      <PianoKey
        isBlack={true}
        note={'A#' + pitch}
        position={[5.6, 0.3, -1.8]}
      />
      <PianoKey isBlack={false} note={'B' + pitch} position={[6.12, 0, -1]} />
    </group>
  );
};

export const Studio = () => {
  return (
    <>
      <OrbitControls />
      <ambientLight intensity={Math.PI / 2} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />

      <Octave offset={-9.64} pitch={3} />
      <Octave offset={-2.5} pitch={4} />
      <Octave offset={4.64} pitch={5} />
    </>
  );
};
