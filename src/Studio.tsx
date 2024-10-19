import { OrbitControls } from '@react-three/drei';
import { PianoKey } from './PianoKey';

const Octave = ({ pitch, offset }: { pitch: number; offset: number }) => {
  return (
    <group position={[offset, 0, 0]}>
      <PianoKey isBlack={false} note={'C' + pitch} position={[0, 0, -1]} />
      <PianoKey
        isBlack={true}
        note={'C#' + pitch}
        position={[0.45, 0.3, -1.8]}
      />
      <PianoKey isBlack={false} note={'D' + pitch} position={[1.02, 0, -1]} />
      <PianoKey
        isBlack={true}
        note={'D#' + pitch}
        position={[1.6, 0.3, -1.8]}
      />
      <PianoKey isBlack={false} note={'E' + pitch} position={[2.04, 0, -1]} />

      <PianoKey isBlack={false} note={'F' + pitch} position={[3.06, 0, -1]} />
      <PianoKey
        isBlack={true}
        note={'F#' + pitch}
        position={[3.5, 0.3, -1.8]}
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
        position={[5.65, 0.3, -1.8]}
      />
      <PianoKey isBlack={false} note={'B' + pitch} position={[6.12, 0, -1]} />
    </group>
  );
};

export const Studio = () => {
  return (
    <>
      <OrbitControls />
      <ambientLight intensity={Math.PI / 3} />
      {/* <spotLight
        castShadow={true}
        receiveShadow={true}
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      /> */}
      <pointLight
        // shadow-bias={-0.005}
        position={[-3, 10, 5]}
        decay={0.4}
        intensity={10}
      />
      <pointLight
        // shadow-bias={-0.005}
        position={[3, 10, 5]}
        decay={0.4}
        intensity={10}
      />

      <Octave offset={-9.64} pitch={3} />
      <Octave offset={-2.5} pitch={4} />
      <Octave offset={4.64} pitch={5} />
    </>
  );
};
