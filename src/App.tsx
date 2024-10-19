import { Canvas } from '@react-three/fiber';
import { useErrorBoundary } from 'use-error-boundary';
import { Studio } from './Studio';

export const App = () => {
  const { ErrorBoundary, didCatch, error } = useErrorBoundary();
  return didCatch ? (
    <div>{error.message}</div>
  ) : (
    <ErrorBoundary>
      <Canvas
        shadows={true}
        camera={{ position: [0, 5, 5] }}
        fallback={<div>Sorry no WebGL supported!</div>}
      >
        <Studio />
      </Canvas>
    </ErrorBoundary>
  );
};
