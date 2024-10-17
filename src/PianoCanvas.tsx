import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

type PianoKey = THREE.Mesh<
  THREE.BoxGeometry,
  THREE.MeshStandardMaterial,
  THREE.Object3DEventMap
>;

const pianoKey = (width: number = 1, offset: number = 0): PianoKey => {
  const geometry = new THREE.BoxGeometry(width, 0.5, 3);
  const material = new THREE.MeshStandardMaterial({ color: 0xcccccc });
  const cube = new THREE.Mesh(geometry, material);

  cube.castShadow = true; // Enable the cube to cast shadows
  cube.receiveShadow = true;

  geometry.translate(offset, 0, 0);

  return cube;
};

export default function PianoCanvas() {
  const refContainer = useRef<HTMLDivElement>(null);
  const renderer = useMemo(() => {
    const renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    return renderer;
  }, []);

  const camera = useMemo(() => {
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    return camera;
  }, []);

  const controls = useMemo(() => {
    const controls = new OrbitControls(camera, renderer.domElement);

    // Set the target to the center of your scene
    controls.target.set(0, 0, 0);

    controls.enableDamping = true;
    controls.dampingFactor = 0.1;

    return controls;
  }, [camera, renderer]);

  // Add raycaster and mouse variables
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  const mouse = useMemo(() => new THREE.Vector2(-1, -1), []); // Store the mouse position in normalized device coordinates (-1 to 1)
  // Variables to store hover state

  useEffect(() => {
    // === THREE.JS CODE START ===
    const scene = new THREE.Scene();

    // Add a light that casts shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true; // Enable shadow casting for the light

    // Configure the shadow properties (optional, for higher quality shadows)
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;

    scene.add(directionalLight);

    // Create a plane to receive shadows
    const planeGeometry = new THREE.PlaneGeometry(500, 500);
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2; // Rotate the plane to be horizontal
    plane.position.y = -1; // Move the plane down a bit
    plane.receiveShadow = true; // Enable the plane to receive shadows

    scene.add(plane);

    // document.body.appendChild( renderer.domElement );
    // use ref as a mount point of the Three.js scene instead of the document.body
    if (refContainer.current) {
      if (refContainer.current.childElementCount === 0) {
        refContainer.current.appendChild(renderer.domElement);
      } else {
        refContainer.current?.replaceChildren(renderer.domElement);
      }
    }

    renderer.render(scene, camera);
    const pianoKeys = [
      pianoKey(1, -2.2),
      pianoKey(1, -1.1),
      pianoKey(),
      pianoKey(1, 1.1),
      pianoKey(1, 2.2),
    ];

    pianoKeys.forEach((key) => {
      scene.add(key);
    });

    let hovered: PianoKey | null = null;
    let clicked: PianoKey | null = null;

    const animate = function () {
      requestAnimationFrame(animate);
      controls.update();

      // Update raycaster with the current camera and mouse position
      raycaster.setFromCamera(mouse, camera);

      // Calculate objects intersecting the raycaster
      const intersects = raycaster.intersectObjects(scene.children);

      if (intersects.length > 0) {
        intersects.sort((a, b) => a.distance - b.distance);
        const intersectedObject = intersects[0].object as PianoKey;
        pianoKeys.forEach((key) => {
          if (intersectedObject === key) {
            hovered = key;
            if (hovered === clicked) {
              key.material.color.set(0x99ff99); // Change color of the clicked object
            } else if (hovered) {
              key.material.color.set(0xaaaaaa); // Change color of the intersected object
            }
          } else {
            key.material.color.set(0xcccccc); // Reset to default color
          }
        });
      } else {
        pianoKeys.forEach((key) => {
          key.material.color.set(0xcccccc);
        });
        hovered = null;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle mouse movement for "hover"
    window.addEventListener('mousemove', (event) => {
      // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      // console.log(mouse)
    });

    // Handle window resizing
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Handle mouse click for "press"
    window.addEventListener('mousedown', () => {
      if (hovered) {
        // Perform action on click
        clicked = hovered; //.material.color.set(0x0000ff);  // Change color on click
        // console.log(hovered)
      }
    });

    // Handle mouse click for "press"
    window.addEventListener('mouseup', () => {
      clicked = null;
    });
  }, [renderer, camera, controls, raycaster, mouse]);

  return <div ref={refContainer} />;
}
