import {
  PerspectiveCamera as OC,
  // OrbitControls,
} from '@react-three/drei';
import { PianoKey } from './PianoKey';
import { useEffect, useMemo, useRef } from 'react';
import { Box3, PerspectiveCamera, Vector3 } from 'three';
import { useAtom } from 'jotai';
import { highestMidiKeyAtom, lowestMidiKeyAtom } from './atoms/MidiAtom';
import { Interval, Note } from 'tonal';

const keysLocations: Record<string, [x: number, y: number, z: number]> = {
  'C': [0, 0, 0],
  'C#': [0.45, 0.3, 0],
  'D': [1.02, 0, 0],
  'D#': [1.6, 0.3, 0],
  'E': [2.04, 0, 0],

  'F': [3.06, 0, 0],
  'F#': [3.5, 0.3, 0],
  'G': [4.08, 0, 0],
  'G#': [4.58, 0.3, 0],
  'A': [5.1, 0, 0],
  'A#': [5.65, 0.3, 0],
  'B': [6.12, 0, 0],
};

function map_range(
  value: number,
  low1: number,
  high1: number,
  low2: number,
  high2: number,
) {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

export const Studio = () => {
  const cameraRef = useRef<PerspectiveCamera>(null);
  const pianoRef = useRef(null);

  const [lowestMidiKey] = useAtom(lowestMidiKeyAtom);
  const [highestMidiKey] = useAtom(highestMidiKeyAtom);

  const keys = useMemo(() => {
    const keys: JSX.Element[] = [];
    for (let i = 0; i <= 8; i++) {
      Object.entries(keysLocations).map(([key, value]) => {
        const midiKey = Number(Note.midi(`${key}${i}`));

        if (midiKey < lowestMidiKey || midiKey > highestMidiKey) {
          return;
        }

        const [x, y, z] = value;
        keys.push(
          <PianoKey
            key={midiKey}
            octave={i}
            note={key}
            position={[-(4 * 7.14) + x + 7.14 * i, y, z]}
          />,
        );
      });
    }

    return keys;
  }, [lowestMidiKey, highestMidiKey]);

  useEffect(() => {
    if (cameraRef.current && pianoRef.current) {
      const boundingBox = new Box3().setFromObject(pianoRef.current);
      const center = new Vector3();

      boundingBox.getCenter(center);

      const semitones = Interval.semitones(
        Note.distance(
          Note.fromMidi(lowestMidiKey),
          Note.fromMidi(highestMidiKey),
        ),
      );
      const octaves = semitones / 12;

      const height = map_range(octaves, 1, 10, 6, 45);
      const dist = map_range(octaves, 1, 10, 6, 20);
      const look = -map_range(octaves, 1, 10, 2, 20);
      console.log(octaves);

      cameraRef.current.position.set(center.x, height, dist);

      const centerS = new Vector3(center.x, center.y, look);
      cameraRef.current.lookAt(centerS);

      cameraRef.current.updateProjectionMatrix();
      cameraRef.current?.layers.enable(1); // Enable bloom layer
    }
  }, [lowestMidiKey, highestMidiKey]);

  return (
    <>
      <OC makeDefault ref={cameraRef} />
      {/* <OrbitControls makeDefault={false} /> */}
      <ambientLight intensity={Math.PI / 3} />

      <pointLight position={[-3, 10, 5]} decay={0.4} intensity={10} />
      <pointLight position={[3, 10, 5]} decay={0.4} intensity={10} />
      <group ref={pianoRef}>{keys}</group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, -200]}>
        <planeGeometry args={[400, 600]} />
        <meshStandardMaterial metalness={0.53} color={'#000000'} />
      </mesh>
    </>
  );
};
