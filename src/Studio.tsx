import {
  PerspectiveCamera as OC,
  // OrbitControls,
  Reflector,
} from '@react-three/drei';
import { PianoKey } from './PianoKey';
import { useEffect, useRef, useState } from 'react';
import { Box3, PerspectiveCamera, Vector3 } from 'three';
import { keyboardMidiMapAtom } from './atoms/KeyboardMidiMapAtom';
import { useAtom } from 'jotai';
import { midiNoteToName } from './atoms/MidiAtom';

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

export const Studio = () => {
  const cameraRef = useRef<PerspectiveCamera>(null);
  const pianoRef = useRef(null);
  const [addReflection, setAddReflection] = useState(false);
  const [keyboardMidiMap] = useAtom(keyboardMidiMapAtom);

  useEffect(() => {
    if (cameraRef.current && pianoRef.current) {
      const boundingBox = new Box3().setFromObject(pianoRef.current);
      const center = new Vector3();
      const size = new Vector3();

      boundingBox.getCenter(center);
      boundingBox.getSize(size);

      const maxDim = Math.max(size.x, size.y, size.z);
      const distance =
        maxDim / (3 * Math.tan((cameraRef.current.fov * Math.PI) / 360));

      cameraRef.current.position.set(center.x, 20, distance);

      const centerS = new Vector3(center.x, center.y, -distance);
      cameraRef.current.lookAt(centerS);

      cameraRef.current.updateProjectionMatrix();
      cameraRef.current?.layers.enable(1); // Enable bloom layer

      setAddReflection(true);
    }
  }, []);

  return (
    <>
      <OC makeDefault ref={cameraRef} />
      {/* <OrbitControls makeDefault={false} /> */}
      <ambientLight intensity={Math.PI / 3} />

      <pointLight position={[-3, 10, 5]} decay={0.4} intensity={10} />
      <pointLight position={[3, 10, 5]} decay={0.4} intensity={10} />
      <group ref={pianoRef}>
        {Object.values(keyboardMidiMap).map((value: number) => {
          const noteName = midiNoteToName(value);
          const isBlack = noteName.base.includes('#');
          return (
            <PianoKey
              isBlack={isBlack}
              note={noteName.full}
              position={keysLocations[noteName.base]}
            />
          );
        })}
      </group>

      {addReflection ? (
        <Reflector
          resolution={512}
          args={[40, 100]}
          position={[0, -2, -30]}
          rotation={[-Math.PI / 2, 0, 0]}
          mirror={0.1}
        >
          {(Material, props) => <Material color={'#111111'} {...props} />}
        </Reflector>
      ) : null}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, -200]}>
        <planeGeometry args={[400, 600]} />
        <meshStandardMaterial metalness={0.53} color={'#000000'} />
      </mesh>
    </>
  );
};
