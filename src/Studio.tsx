import {
  PerspectiveCamera as OC,
  // OrbitControls,
  Reflector,
} from '@react-three/drei';
import { PianoKey } from './PianoKey';
import { useEffect, useRef, useState } from 'react';
import { Box3, PerspectiveCamera, Vector3 } from 'three';

const Octave = ({ pitch, offset }: { pitch: number; offset: number }) => {
  return (
    <group position={[offset, 0, 0]}>
      <PianoKey isBlack={false} note={'C' + pitch} position={[0, 0, 0]} />
      <PianoKey isBlack={true} note={'C#' + pitch} position={[0.45, 0.3, 0]} />
      <PianoKey isBlack={false} note={'D' + pitch} position={[1.02, 0, 0]} />
      <PianoKey isBlack={true} note={'D#' + pitch} position={[1.6, 0.3, 0]} />
      <PianoKey isBlack={false} note={'E' + pitch} position={[2.04, 0, 0]} />

      <PianoKey isBlack={false} note={'F' + pitch} position={[3.06, 0, 0]} />
      <PianoKey isBlack={true} note={'F#' + pitch} position={[3.5, 0.3, 0]} />
      <PianoKey isBlack={false} note={'G' + pitch} position={[4.08, 0, 0]} />
      <PianoKey isBlack={true} note={'G#' + pitch} position={[4.58, 0.3, 0]} />
      <PianoKey isBlack={false} note={'A' + pitch} position={[5.1, 0, 0]} />
      <PianoKey isBlack={true} note={'A#' + pitch} position={[5.65, 0.3, 0]} />
      <PianoKey isBlack={false} note={'B' + pitch} position={[6.12, 0, 0]} />
    </group>
  );
};

export const Studio = () => {
  const cameraRef = useRef<PerspectiveCamera>(null);
  const pianoRef = useRef(null);
  const [addReflection, setAddReflection] = useState(false);

  useEffect(() => {
    if (cameraRef.current && pianoRef.current) {
      const boundingBox = new Box3().setFromObject(pianoRef.current);
      const center = new Vector3();
      const size = new Vector3();

      console.log(center);
      boundingBox.getCenter(center);
      boundingBox.getSize(size);
      console.log(center);

      const maxDim = Math.max(size.x, size.y, size.z);
      const distance =
        maxDim / (2 * Math.tan((cameraRef.current.fov * Math.PI) / 360));

      cameraRef.current.position.set(center.x, 30, distance - 20);

      const centerS = new Vector3(center.x, center.y, -10);
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
        <Octave offset={-9.64} pitch={3} />
        <Octave offset={-2.5} pitch={4} />
        <Octave offset={4.64} pitch={5} />
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
