import { Canvas } from '@react-three/fiber';
import { useErrorBoundary } from 'use-error-boundary';
import { Studio } from './Studio';
import { ACESFilmicToneMapping, Fog } from 'three';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
export const App = () => {
  const { ErrorBoundary, didCatch, error } = useErrorBoundary();

  return didCatch ? (
    <div>{error.message}</div>
  ) : (
    <ErrorBoundary>
      <Canvas
        fallback={<div>Sorry no WebGL supported!</div>}
        onCreated={({ gl, scene }) => {
          gl.setClearColor('#000000');
          scene.fog = new Fog('#000000', 15, 45);
          gl.toneMapping = ACESFilmicToneMapping;
          scene.traverse((obj) => obj.layers.enable(0));
        }}
      >
        {/* <OrbitControls /> */}
        <Studio />
        <EffectComposer>
          <Bloom
            intensity={3}
            luminanceThreshold={1.4}
            luminanceSmoothing={20}
          />
        </EffectComposer>
        <gridHelper position={[0, -0.5, 0]} args={[100, 100]} />
      </Canvas>
    </ErrorBoundary>
  );
};
