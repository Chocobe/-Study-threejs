// three.js
import * as THREE from 'three';
import {
  OrbitControls,
} from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Timer,
} from 'three/examples/jsm/misc/Timer.js';
// lil-gui
import GUI from 'lil-gui';
// type
import { 
  createAddFloorMessage,
  createAddSphereMessage,
  createUpdateMessage,
} from './physicsWorker/physicsWorkerMessageFactory';
// style
import './style.css';

//
// Config
//
type TConfig = {
  viewport: {
    width: number;
    height: number;
  };

  sphere: {
    color: string;
    material: THREE.MeshStandardMaterial | null;
  };

  factory: {
    createSphere: () => void;
  };
};

const config: TConfig = {
  viewport: {
    width: window.innerWidth,
    height: window.innerHeight,
  },

  sphere: {
    color: '#fff',
    material: null,
  },

  factory: {
    createSphere: () => {
      const radius = Math.random() * 0.8 + 0.2;
      const position: THREE.Vector3Like = {
        x: (Math.random() - 0.5) * 4,
        y: 3,
        z: (Math.random() - 0.5) * 4,
      };

      createSphere(radius, position);
    },
  },
};

//
// Debug
//
const gui = new GUI();

const sphereGUI = gui.addFolder('Sphere');
sphereGUI
  .addColor(config.sphere, 'color')
  .onChange((color: string) => {
    const material = config.sphere.material;

    if (!material) {
      return;
    }

    config.sphere.color = color;
    material.color = new THREE.Color(color);
  });

const factoryGUI = gui.addFolder('Factory');
factoryGUI.add(config.factory, 'createSphere');

//
// DOM
//
const $canvas = document.createElement('canvas') as HTMLCanvasElement;
$canvas.classList.add('webgl');

const $app = document.querySelector('#app') as HTMLDivElement;
$app.appendChild($canvas);

//
// Worker
//
const physicsWorker = new Worker(
  new URL(
    './physicsWorker/physicsWorker',
    import.meta.url
  ),
  {
    type: 'module',
  }
);

physicsWorker.onmessage = (e: any) => {
  const type = e.data.type;

  switch(type) {
    case 'update': {
      const spheres = e.data.data.spheres;

      spheres.forEach((sphere: any, index: number) => {
        const {
          position,
          quaternion,
        } = sphere;;

        objectsToUpdate.spheres[index].position.copy(position);
        objectsToUpdate.spheres[index].quaternion.copy(quaternion);
      });

      break;
    }
  }
}

//
// Base
//
/** Scene */
const scene = new THREE.Scene();

/** Camera */
const camera = new THREE.PerspectiveCamera();
camera.fov = 45;
camera.aspect = config.viewport.width / config.viewport.height;
camera.near = 0.1;
camera.far = 500;
camera.position.set(10, 10, 10);
camera.lookAt(0, 0, 0);
camera.updateProjectionMatrix();

/** Controls */
const controls = new OrbitControls(camera, $canvas);
controls.enableDamping = true;

/** Helper */
const axesHelper = new THREE.AxesHelper(2.5);
scene.add(axesHelper);

/** Renderer */
const renderer = new THREE.WebGLRenderer({
  canvas: $canvas,
});
renderer.setSize(config.viewport.width, config.viewport.height);
renderer.pixelRatio = Math.min(window.devicePixelRatio, 2);
renderer.shadowMap.enabled = true;

/** Timer */
const timer = new Timer();

//
// Light
//
/** AmbientLight */
const ambientLight = new THREE.AmbientLight('#fff', Math.PI * 0.3);
scene.add(ambientLight);

/** DirectionalLight */
const directionalLight = new THREE.DirectionalLight('#fff', Math.PI * 2);
directionalLight.position.set(1, 1, -1);
directionalLight.lookAt(0, 0, 0);
scene.add(directionalLight);

//
// Mesh
//
const objectsToUpdate: {
  spheres: THREE.Mesh[];
} = {
  spheres: [],
};

/** Floor */
(function createFloor() {
  // three.js
  const floorMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
      color: '#383841',
    })
  );
  floorMesh.receiveShadow = true;
  floorMesh.quaternion.setFromAxisAngle({
    x: -1,
    y: 0,
    z: 0,
  }, Math.PI * 0.5);
  scene.add(floorMesh);

  // cannon.js
  const message = createAddFloorMessage();
  physicsWorker.postMessage(message);
}());

/** Sphere */
const createSphere = (() => {
  const geometry = new THREE.SphereGeometry(1, 20, 20);
  const material = new THREE.MeshStandardMaterial({
    color: config.sphere.color,
  });

  config.sphere.material = material;

  return (
    radius: number,
    position: THREE.Vector3Like
  ) => {
    // three.js
    const mesh = new THREE.Mesh(
      geometry,
      material,
    );
    mesh.scale.set(radius, radius, radius);
    mesh.position.copy(position);

    objectsToUpdate.spheres.push(mesh);
    scene.add(mesh);

    // cannon.js
    const message = createAddSphereMessage({
      position,
      radius,
    });
    physicsWorker.postMessage(message);
  };
})();

//
// Executor
//
(function tick() {
  // Update timer
  timer.update();
  const deltaTime = timer.getDelta();

  // Update controls
  controls.update(deltaTime);

  // Update physicsWorker
  const message = createUpdateMessage({
    deltaTime,
  });
  physicsWorker.postMessage(message);

  // Render
  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
}());
