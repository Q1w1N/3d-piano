import { ThreeElements, useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Mesh } from 'three';
import { useSpring, a } from '@react-spring/three';
import { PolySynth } from 'tone';
import { FlowingNote } from './FlowingNote';
import { bpmAtom } from './atoms/BpmAtom';
import { useAtom } from 'jotai';
import { midiAtom, noteToMIDINumber } from './atoms/MidiAtom';

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
  const color = props.isBlack ? '#222222' : '#CCCCCC';

  const midiNoteNumber = useMemo(() => {
    return noteToMIDINumber(props.note);
  }, [props.note]);
  const [midi] = useAtom(midiAtom);

  const [flowies, setFlowies] = useState<boolean[]>([]);

  useEffect(() => {
    const notePlaying = midi.has(midiNoteNumber);
    if (notePlaying && pressed === false) {
      setPressed(true);
      synth.triggerAttack(props.note);
      return;
    }
    if (!notePlaying && pressed === true) {
      setPressed(false);
      synth.triggerRelease(props.note);
    }
  }, [pressed, midi, midiNoteNumber, props.note]);

  useEffect(() => {
    if (pressed) {
      setFlowies((oldFlowies) => [...oldFlowies, true]);
    } else {
      setFlowies((oldFlowies) => oldFlowies.map(() => false));
    }
  }, [pressed]);

  const cleanup = useCallback(() => {
    setFlowies((flowies) => {
      flowies.shift();
      return [...flowies];
    });

    synth.triggerRelease(props.note);
    setPressed(false);
  }, [props.note]);

  const [spring, api] = useSpring(() => ({
    rotation: [0, 0, 0], // Starting with no rotation
    config: { tension: 200, friction: 10, clamp: true }, // Config for smoothness
  }));

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

  return (
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
  );
};
