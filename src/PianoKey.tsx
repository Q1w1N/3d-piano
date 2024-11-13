import { ThreeElements, useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Mesh } from 'three';
import { useSpring, a } from '@react-spring/three';
import { PolySynth } from 'tone';
import { FlowingNote } from './FlowingNote';
import { bpmAtom } from './atoms/BpmAtom';
import { useAtom } from 'jotai';
import { midiAtom } from './atoms/MidiAtom';
import { Note } from 'tonal';

const synth = new PolySynth().toDestination();

type PianoKeyProps = ThreeElements['mesh'] & {
  note: string;
  octave: number;
};

export const PianoKey = ({
  position,
  note,
  octave,
  ...props
}: PianoKeyProps) => {
  const meshRef = useRef<Mesh>(null!);
  const [bpm] = useAtom(bpmAtom);
  const [hovered, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [isBlack] = useState(Note.accidentals(note) !== '');
  const fullNote = useMemo(() => {
    return `${note}${octave}`;
  }, [octave, note]);

  const color = isBlack ? '#222222' : '#CCCCCC';

  const midiNoteNumber = useMemo(() => {
    // console.log(fullNote, Number(Note.midi(fullNote)));
    return Number(Note.midi(fullNote));
  }, [fullNote]);

  const [midi] = useAtom(midiAtom);

  const [flowies, setFlowies] = useState<boolean[]>([]);

  useEffect(() => {
    const notePlaying = midi.has(midiNoteNumber);
    if (notePlaying && pressed === false) {
      setPressed(true);
      // synth.triggerAttack(props.note);
      // console.log(midiNoteNumber);
      return;
    }
    if (!notePlaying && pressed === true) {
      setPressed(false);
      // synth.triggerRelease(props.note);
    }
  }, [pressed, midi, midiNoteNumber]);

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

    synth.triggerRelease(note);
    setPressed(false);
  }, [note]);

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

  // useEffect(() => {
  //   console.log(pressed);
  // }, [pressed]);

  return (
    <group position={position}>
      <group>
        {flowies.map((x, index) => (
          <FlowingNote
            bpm={bpm}
            black={isBlack}
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
          console.log('LOL');
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
            position={isBlack ? [0, 0, 0.9] : [0, 0, 1.25]}
            ref={meshRef}
          >
            <boxGeometry args={isBlack ? [0.6, 0.3, 1.8] : [1, 0.3, 2.5]} />
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
