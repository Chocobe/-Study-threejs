// three
import * as THREE from 'three';
// GUI
import GUI from 'lil-gui';
// style
import './style.css';

/**
 * Base
 */
const $main = document.querySelector('.main') as HTMLDivElement;
const $canvas = document.querySelector('#webgl') as HTMLCanvasElement;

const config = {
  viewport: (() => {
    const {
      width,
      height,
    } = $main.getBoundingClientRect();

    return {
      width,
      height,
    };
  })(),

  mesh: {
    offsetX: 5,
    distanceY: 13,
  },

  particle: {
    size: 0.05,
    count: 500,
  },

  interaction: {
    scrollTop: $main.scrollTop,
    mouseX: 0,
    mouseY: 0,
  },
};

/**
 * GUI
 */
const gui = new GUI();

gui
  .add(config.mesh, 'offsetX')
  .min(0)
  .max(10)
  .step(0.1)
  .onChange(() => {
    sceneMeshs.forEach((mesh, i) => {
      mesh.position.x = config.mesh.offsetX * Math.pow(-1, i + 2);
    });
  });

gui
  .add(config.mesh, 'distanceY')
  .min(0)
  .max(30)
  .step(0.1)
  .onChange(() => {
    sceneMeshs.forEach((mesh, i) => {
      mesh.position.y = -config.mesh.distanceY * i;
    });
  });

gui
  .add(config.particle, 'count')
  .min(500)
  .max(10_000)
  .step(100)
  .onFinishChange(generateParticle);

gui
  .add(config.particle, 'size')
  .min(0.01)
  .max(0.25)
  .step(0.01)
  .onFinishChange(generateParticle);

/**
 * Scene
 */
const scene = new THREE.Scene();

/**
 * Camera
 */
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

const camera = new THREE.PerspectiveCamera();
camera.fov = 75;
camera.aspect = config.viewport.width / config.viewport.height;
camera.near = 0.1;
camera.far = 100;
camera.position.set(0, 0, 10);
camera.lookAt(0, 0, 0);
camera.updateProjectionMatrix();
cameraGroup.add(camera);

/**
 * Helper
 */
const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#fff', 3);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

/**
 * Objects
 */
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load('/textures/gradients/3.jpg', texture => {
  texture.magFilter = THREE.NearestFilter;
});

const material = new THREE.MeshToonMaterial({
  color: '#ff88cc',
  gradientMap: gradientTexture,
});

const mesh1 = (function createTorus() {
  const geometry = new THREE.TorusGeometry(2, 1);

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = config.mesh.offsetX;

  return mesh;
}());

const mesh2 = (function createSphere() {
  const geometry = new THREE.TetrahedronGeometry(3.5);

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = -config.mesh.offsetX;
  mesh.position.y = -config.mesh.distanceY;

  return mesh;
}());

const mesh3 = (function createTorusKnot() {
  const geometry = new THREE.TorusKnotGeometry(1.6, 0.8);

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = config.mesh.offsetX;
  mesh.position.y = -config.mesh.distanceY * 2;

  return mesh;
}());

const sceneMeshs = [mesh1, mesh2, mesh3];
scene.add(...sceneMeshs);

/**
 * Particle
 */
let particle: THREE.Points;

function generateParticle() {
  if (particle) {
    particle.geometry.dispose();
    (particle.material as THREE.PointsMaterial).dispose();

    scene.remove(particle);
  }

  const {
    mesh: {
      distanceY,
    },
    particle: {
      count,
      size,
    },
  } = config;

  // particle geometry
  const positionBuffer = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    positionBuffer[i3] = (Math.random() - 0.5) * 10 * Math.sqrt(2);
    positionBuffer[i3 + 1] = -Math.random() * distanceY * sceneMeshs.length + 
      distanceY * 0.5;
    positionBuffer[i3 + 2] = (Math.random() - 0.5) * 10 * Math.sqrt(2);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(
    positionBuffer,
    3
  ));

  // particle material
  const material = new THREE.PointsMaterial({
    size,
    sizeAttenuation: true,
  });

  particle = new THREE.Points(geometry, material);
  scene.add(particle);
}
generateParticle();

/**
 * Interaction
 */
window.addEventListener('resize', () => {
  const {
    width,
    height,
  } = $main.getBoundingClientRect();

  config.viewport = {
    width,
    height,
  };

  renderer.pixelRatio = Math.min(window.devicePixelRatio, 2);
  renderer.setSize(width, height);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});

$main.addEventListener('scroll', () => {
  const scrollTop = $main.scrollTop;

  config.interaction.scrollTop = scrollTop;
});

$main.addEventListener('mousemove', e => {
  const {
    clientX,
    clientY,
  } = e;

  config.interaction.mouseX = clientX;
  config.interaction.mouseY = clientY;
});

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: $canvas,
});
renderer.pixelRatio = Math.min(window.devicePixelRatio, 2);
renderer.setSize(config.viewport.width, config.viewport.height);

/**
 * Animation
 */
const clock = new THREE.Clock();
let prevTime = 0;

(function tick() {
  const {
    viewport: {
      width,
      height,
    },
    mesh: {
      distanceY,
    },
    interaction: {
      scrollTop,
      mouseX,
      mouseY,
    },
  } = config;

  // delta time
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - prevTime;
  prevTime = elapsedTime;

  // Update objects
  sceneMeshs.forEach(mesh => {
    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.012;
  });

  // Update camera
  camera.position.y = -(scrollTop / height) * distanceY;

  const parallaxX = (mouseX / width) - 0.5;
  const parallaxY = -((mouseY / height) - 0.5);

  cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * deltaTime * 5;
  cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * deltaTime * 5;

  // Render
  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
}());
