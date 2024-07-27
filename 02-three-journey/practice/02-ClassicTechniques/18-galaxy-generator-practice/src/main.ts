// threejs
import * as THREE from 'three';
import * as ADDONS from 'three/addons';
// GUI
import GUI from 'lil-gui';
// style
import './style.css';

// --- --- --- --- --- --- --- --- --- ---
//
// #Config
//
// --- --- --- --- --- --- --- --- --- ---
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const particleConfig = {
  count: 100_000,
  radius: 10,
  branches: 3,
  spin: 0.5,
  randomness: 0.2,
  randomnessPower: 5,
  innerColor: '#fff',
  outerColor: '#ff88cc',
};

// --- --- --- --- --- --- --- --- --- ---
//
// #Base
//
// --- --- --- --- --- --- --- --- --- ---
/**
 * Scene
 */
const scene = new THREE.Scene();

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera();
camera.fov = 75;
camera.aspect = sizes.width / sizes.height;
camera.position.set(0, 7, 10);
camera.updateProjectionMatrix();

/**
 * Canvas
*/
const $app = document.querySelector('#app');
const $canvas = document.createElement('canvas');
$canvas.classList.add('webgl');
$app?.appendChild($canvas);

/**
 * Controls
 */
const controls = new ADDONS.OrbitControls(camera, $canvas);
controls.enableDamping = true;

/**
 * GUI
 */
const gui = new GUI();

/**
 * Timer
 */
const timer = new ADDONS.Timer();

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: $canvas,
});
renderer.pixelRatio = Math.min(window.devicePixelRatio, 2);
renderer.setSize(sizes.width, sizes.height);

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  renderer.pixelRatio = Math.min(window.devicePixelRatio, 2);
  renderer.setSize(sizes.width, sizes.height);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});

// --- --- --- --- --- --- --- --- --- ---
//
// #Object
//
// --- --- --- --- --- --- --- --- --- ---
/**
 * Particle
 */
let particleGeometry: THREE.BufferGeometry | null = null;
let particleMaterial: THREE.PointsMaterial | null = null;
let particle: THREE.Points | null = null;

function generateGalaxy() {
  if (particle) {
    particleGeometry?.dispose();
    particleMaterial?.dispose();
    scene.remove(particle);
  }

  particleGeometry = (function initParticleGeometry() {
    const positionBuffer = new Float32Array(particleConfig.count * 3);
    const colorBuffer = new Float32Array(particleConfig.count * 3);

    const innerColor = new THREE.Color(particleConfig.innerColor);
    const outerColor = new THREE.Color(particleConfig.outerColor);

    Array
      .from(
        { length: particleConfig.count },
        (_, i) => i
      ).forEach(i => {
        const i3 = i * 3;

        // position
        const radius = Math.random() * particleConfig.radius;
        const branchAngle = (Math.PI * 2) * (i % particleConfig.branches) / particleConfig.branches;
        const spinAngle = radius * particleConfig.spin;

        const randomX = Math.pow(Math.random(), particleConfig.randomnessPower)
          * (Math.random() > 0.5 ? 1 : -1)
          * particleConfig.randomness
          * radius;

        const randomY = Math.pow(Math.random(), particleConfig.randomnessPower)
          * (Math.random() > 0.5 ? 1 : -1)
          * particleConfig.randomness
          * radius;

        const randomZ = Math.pow(Math.random(), particleConfig.randomnessPower)
          * (Math.random() > 0.5 ? 1 : -1)
          * particleConfig.randomness
          * radius;

        positionBuffer[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
        positionBuffer[i3 + 1] = randomY;
        positionBuffer[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

        // color
        const radiusRadio = radius / particleConfig.radius;

        const mixedColor = innerColor.clone();
        mixedColor.lerp(outerColor, radiusRadio);

        colorBuffer[i3] = mixedColor.r;
        colorBuffer[i3 + 1] = mixedColor.g;
        colorBuffer[i3 + 2] = mixedColor.b;
      });

      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(
        positionBuffer,
        3
      ));
      particleGeometry.setAttribute('color', new THREE.BufferAttribute(
        colorBuffer,
        3
      ));

      return particleGeometry;
  }());

  particleMaterial = new THREE.PointsMaterial({
    size: 0.05,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  particle = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particle);
}
generateGalaxy();


// --- --- --- --- --- --- --- --- --- ---
//
// #Debug
//
// --- --- --- --- --- --- --- --- --- ---
const particleGUI = gui.addFolder('Particle');
particleGUI.add(particleConfig, 'count').min(100).max(200_000).step(100).onFinishChange(generateGalaxy);
particleGUI.add(particleConfig, 'radius').min(1).max(20).step(0.1).onFinishChange(generateGalaxy);
particleGUI.add(particleConfig, 'branches').min(2).max(10).step(1).onFinishChange(generateGalaxy);
particleGUI.add(particleConfig, 'spin').min(0.01).max(5).step(0.01).onFinishChange(generateGalaxy);
particleGUI.add(particleConfig, 'randomness').min(0).max(2).step(0.01).onFinishChange(generateGalaxy);
particleGUI.add(particleConfig, 'randomnessPower').min(0.1).max(10).step(0.01).onFinishChange(generateGalaxy);
particleGUI.addColor(particleConfig, 'innerColor').onFinishChange(generateGalaxy);
particleGUI.addColor(particleConfig, 'outerColor').onFinishChange(generateGalaxy);

// --- --- --- --- --- --- --- --- --- ---
//
// #Executor
//
// --- --- --- --- --- --- --- --- --- ---
(function tick() {
  // timer
  timer.update();
  const elapsedTime = timer.getElapsed();

  // controls
  controls.update(elapsedTime);
  controls.update();

  // render
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
}());
