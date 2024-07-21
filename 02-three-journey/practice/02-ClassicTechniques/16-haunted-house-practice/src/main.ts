// three.js
import * as THREE from 'three';
// three.js - addons
import { OrbitControls, Timer } from 'three/examples/jsm/Addons.js';
import { Sky } from 'three/examples/jsm/Addons.js';
// lil-gui
import GUI from 'lil-gui';
// config
import {
  wallConfig,
  roofConfig,
  bushConfig,
  doorConfig,
  floorConfig,
  graveConfig,
  ghost1Config,
  ghost2Config,
  ghost3Config,
  roofLightConfig,
} from './config';
// style
import './style.css';

const gui = new GUI();
gui.close();

const canvasSize = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/**
 * Scene
 */
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(new THREE.Color('#ab8c59'), 0.05);

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera();
camera.fov = 40;
camera.aspect = canvasSize.width / canvasSize.height;
camera.near = 1;
camera.far = 100;
camera.position.set(9, 5, 9);
camera.updateProjectionMatrix();

/**
 * AxesHelper
 */
const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

/**
 * Texture
 */
const textureLoader = new THREE.TextureLoader();

// floor
const floorAlphaTexture = textureLoader.load('/textures/floor/floor_alpha.jpg');
const floorColorTexture = textureLoader.load('/textures/floor/stony_dirt_path_1k/floor_diff_1k.jpg');
const floorARMTexture = textureLoader.load('/textures/floor/stony_dirt_path_1k/floor_arm_1k.jpg');
const floorNormalTexture = textureLoader.load('/textures/floor/stony_dirt_path_1k/floor_nor_gl_1k.jpg');
const floorDisplacementTexture = textureLoader.load('/textures/floor/stony_dirt_path_1k/floor_disp_1k.jpg');

floorColorTexture.colorSpace = THREE.SRGBColorSpace;

floorColorTexture.repeat.set(3, 3);
floorARMTexture.repeat.set(3, 3);
floorNormalTexture.repeat.set(3, 3);

floorColorTexture.wrapS = THREE.RepeatWrapping;
floorARMTexture.wrapS = THREE.RepeatWrapping;
floorNormalTexture.wrapS = THREE.RepeatWrapping;

floorColorTexture.wrapT = THREE.RepeatWrapping;
floorARMTexture.wrapT = THREE.RepeatWrapping;
floorNormalTexture.wrapT = THREE.RepeatWrapping;

// wall
const wallColorTexture = textureLoader.load('/textures/wall/rough_block_wall_1k/wall_diff_1k.jpg');
const wallARMTexture = textureLoader.load('/textures/wall/rough_block_wall_1k/wall_arm_1k.jpg');
const wallNormalTexture = textureLoader.load('/textures/wall/rough_block_wall_1k/wall_nor_gl_1k.jpg');

wallColorTexture.colorSpace = THREE.SRGBColorSpace;

wallColorTexture.repeat.set(2, 2);
wallARMTexture.repeat.set(2, 2);
wallNormalTexture.repeat.set(2, 2);

wallColorTexture.wrapS = THREE.RepeatWrapping;
wallARMTexture.wrapS = THREE.RepeatWrapping;
wallNormalTexture.wrapS = THREE.RepeatWrapping;

wallColorTexture.wrapT = THREE.RepeatWrapping;
wallARMTexture.wrapT = THREE.RepeatWrapping;
wallNormalTexture.wrapT = THREE.RepeatWrapping;

// roof
const roofColorTexture = textureLoader.load('/textures/roof/clay_roof_tiles_03_1k/roof_diff_1k.jpg');
const roofARMTexture = textureLoader.load('/textures/roof/clay_roof_tiles_03_1k/roof_arm_1k.jpg');
const roofNormalTexture = textureLoader.load('/textures/roof/clay_roof_tiles_03_1k/roof_nor_gl_1k.jpg');

roofColorTexture.colorSpace = THREE.SRGBColorSpace;

roofColorTexture.repeat.set(3, 3);
roofARMTexture.repeat.set(3, 3);
roofNormalTexture.repeat.set(3, 3);

roofColorTexture.wrapS = THREE.RepeatWrapping;
roofARMTexture.wrapS = THREE.RepeatWrapping;
roofNormalTexture.wrapS = THREE.RepeatWrapping;

roofColorTexture.wrapT = THREE.RepeatWrapping;
roofARMTexture.wrapT = THREE.RepeatWrapping;
roofNormalTexture.wrapT = THREE.RepeatWrapping;

// bush
const bushColorTexture = textureLoader.load('/textures/bush/aerial_rocks_02_1k/bush_diff_1k.jpg');
const bushARMTexture = textureLoader.load('/textures/bush/aerial_rocks_02_1k/bush_arm_1k.jpg');
const bushNormalTexture = textureLoader.load('/textures/bush/aerial_rocks_02_1k/bush_nor_gl_1k.jpg');
const bushDisplacementTexture = textureLoader.load('/textures/bush/aerial_rocks_02_1k/bush_disp_1k.jpg');

bushColorTexture.colorSpace = THREE.SRGBColorSpace;

// door
const doorAlphaTexture = textureLoader.load('/textures/door/door_alpha.jpg');
const doorColorTexture = textureLoader.load('/textures/door/door_color.jpg');
const doorAmbientOcclusionTexture = textureLoader.load('/textures/door/door_ambientOcclusion.jpg');
const doorRoughnessTexture = textureLoader.load('/textures/door/door_roughness.jpg');
const doorMetalnessTexture = textureLoader.load('/textures/door/door_metalness.jpg');
const doorNormalTexture = textureLoader.load('/textures/door/door_normal.jpg');
const doorDisplacementTexture = textureLoader.load('/textures/door/door_height.jpg');

doorColorTexture.colorSpace = THREE.SRGBColorSpace;

// grave
const graveColorTexture = textureLoader.load('/textures/grave/lichen_rock_1k/grave_diff_1k.jpg');
const graveARMTexture = textureLoader.load('/textures/grave/lichen_rock_1k/grave_arm_1k.jpg');
const graveNormalTexture = textureLoader.load('/textures/grave/lichen_rock_1k/grave_nor_gl_1k.jpg');

graveColorTexture.colorSpace = THREE.SRGBColorSpace;

graveColorTexture.repeat.set(0.5, 1);
graveARMTexture.repeat.set(0.5, 1);
graveNormalTexture.repeat.set(0.5, 1);

/**
 * Object
 */
// floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(floorConfig.width, floorConfig.height, floorConfig.segment.width, floorConfig.segment.height),
  new THREE.MeshStandardMaterial({
    transparent: true,
    alphaMap: floorAlphaTexture,
    map: floorColorTexture,
    aoMap: floorARMTexture,
    roughnessMap: floorARMTexture,
    metalnessMap: floorARMTexture,
    normalMap: floorNormalTexture,
    displacementMap: floorDisplacementTexture,
    displacementScale: 0.4,
    displacementBias: -0.2,
  })
);
floor.rotation.x = floorConfig.rotation.x;

const floorMaterialGUI = gui.addFolder('Floor Material');
floorMaterialGUI.add(floor.material, 'displacementScale').min(0).max(2).step(0.001);
floorMaterialGUI.add(floor.material, 'displacementBias').min(-1).max(1).step(0.001);

scene.add(floor);

// house
const house = new THREE.Group();
scene.add(house);

// wall
const wall = new THREE.Mesh(
  new THREE.BoxGeometry(
    wallConfig.width, wallConfig.height, wallConfig.depth,
    wallConfig.segment.width, wallConfig.segment.height, wallConfig.segment.depth
  ),
  new THREE.MeshStandardMaterial({
    map: wallColorTexture,
    aoMap: wallARMTexture,
    roughnessMap: wallARMTexture,
    metalnessMap: wallARMTexture,
    normalMap: wallNormalTexture,
  })
);
wall.position.y = wallConfig.height * 0.5;

house.add(wall);

const wallMaterialGUI = gui.addFolder('Wall Material');
wallMaterialGUI.add(wall.material, 'displacementScale').min(-1).max(1).step(0.001);
wallMaterialGUI.add(wall.material, 'displacementBias').min(-1).max(1).step(0.001);

// roof
const roof = new THREE.Mesh(
  new THREE.ConeGeometry(roofConfig.radius, roofConfig.height, roofConfig.radialSegment),
  new THREE.MeshStandardMaterial({
    map: roofColorTexture,
    aoMap: roofARMTexture,
    roughnessMap: roofARMTexture,
    metalnessMap: roofARMTexture,
    normalMap: roofNormalTexture,
  })
);
roof.rotation.y = roofConfig.rotation.y;
roof.position.y = roofConfig.position.y;

house.add(roof);

// bush
const bushGeometry = new THREE.SphereGeometry(0.4);
const bushMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#f0f4f0'),
  map: bushColorTexture,
  aoMap: bushARMTexture,
  roughnessMap: bushARMTexture,
  metalnessMap: bushARMTexture,
  normalMap: bushNormalTexture,
  displacementMap: bushDisplacementTexture,
  displacementScale: 0.3,
  displacementBias: -0.2,
});

const bush1 = new THREE.Mesh(
  bushGeometry,
  bushMaterial
);
bush1.position.x = bushConfig.bush1.position.x;
bush1.position.z = bushConfig.bush1.position.z;

const bush2 = new THREE.Mesh(
  bushGeometry,
  bushMaterial
);
bush2.position.x = bushConfig.bush2.position.x;
bush2.position.z = bushConfig.bush2.position.z;
bush2.scale.setScalar(bushConfig.bush2.scale);

const bush3 = new THREE.Mesh(
  bushGeometry,
  bushMaterial
);
bush3.position.x = bushConfig.bush3.position.x;
bush3.position.z = bushConfig.bush3.position.z;
bush3.scale.setScalar(bushConfig.bush3.scale);

const bush4 = new THREE.Mesh(
  bushGeometry,
  bushMaterial
);
bush4.position.x = bushConfig.bush4.position.x;
bush4.position.z = bushConfig.bush4.position.z;
bush4.scale.setScalar(bushConfig.bush4.scale);

house.add(bush1, bush2, bush3, bush4);

// door
const door = new THREE.Mesh(
  new THREE.PlaneGeometry(
    doorConfig.width, doorConfig.height,
    doorConfig.segment.width, doorConfig.segment.height
  ),
  new THREE.MeshStandardMaterial({
    transparent: true,
    alphaMap: doorAlphaTexture,
    map: doorColorTexture,
    aoMap: doorAmbientOcclusionTexture,
    roughnessMap: doorRoughnessTexture,
    metalnessMap: doorMetalnessTexture,
    normalMap: doorNormalTexture,
    displacementMap: doorDisplacementTexture,
    displacementScale: 0.15,
    displacementBias: -0.03,
  })
);

door.position.x = doorConfig.position.x;
door.position.y = doorConfig.position.y;
door.position.z = doorConfig.position.z;

house.add(door);

const doorMaterialGUI = gui.addFolder('Door Material');
doorMaterialGUI.add(door.material, 'displacementScale').min(-1).max(1).step(0.001);
doorMaterialGUI.add(door.material, 'displacementBias').min(-1).max(1).step(0.001);

// grave
const grave = new THREE.Group();
scene.add(grave);

const graveGeometry = new THREE.BoxGeometry(graveConfig.width, graveConfig.height, graveConfig.depth);
const graveMaterial = new THREE.MeshStandardMaterial({
  map: graveColorTexture,
  aoMap: graveARMTexture,
  roughnessMap: graveARMTexture,
  metalnessMap: graveARMTexture,
  normalMap: graveNormalTexture,
});

Array.from(
  { length: graveConfig.count },
  () => {
    const graveItem = new THREE.Mesh(
      graveGeometry,
      graveMaterial
    );

    const radian = Math.PI * 2 * Math.random();
    const radius = graveConfig.position.minRadius + (
      Math.random() * (graveConfig.position.maxRadius - graveConfig.position.minRadius)
    );

    graveItem.position.x = Math.cos(radian) * radius;
    graveItem.position.z = Math.sin(radian) * radius;
    graveItem.position.y = Math.random() * graveConfig.height * 0.5 - 0.1

    graveItem.rotation.x = Math.PI / 180 * (Math.random() * 30 - 15);

    grave.add(graveItem);
  }
);

/**
 * Lights
 */
const lightGUI = gui.addFolder('Lights');
lightGUI.close();

// AmbientLight
const ambientLight = new THREE.AmbientLight(
  new THREE.Color('#ffffff'),
  1,
);

scene.add(ambientLight);

const ambientLightGUI = lightGUI.addFolder('Ambient Light');
ambientLightGUI.addColor(ambientLight, 'color').name('color');

// DirectionalLight
const directionalLight = new THREE.DirectionalLight(
  new THREE.Color('#ffffff'),
  3
);
directionalLight.position.set(5, 3, -5);
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 15;

// const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);

const directionalLightGUi = lightGUI.addFolder('Directional Light');
directionalLightGUi.addColor(directionalLight, 'color').name('color');

scene.add(
  directionalLight, 
  // directionalLightHelper
);

/**
 * roofLight
 */
const roofLight = new THREE.PointLight(
  new THREE.Color('#ff1493'),
  6
)
roofLight.position.set(
  roofLightConfig.position.x,
  roofLightConfig.position.y,
  roofLightConfig.position.z
);

house.add(roofLight);

/**
 * ghost
 */
const ghost1 = new THREE.PointLight(new THREE.Color('#ff1493'), 12);

const ghost2 = new THREE.PointLight(new THREE.Color('#03a9f4'), 12);

const ghost3 = new THREE.PointLight(new THREE.Color('#f0f400'), 12);

scene.add(ghost1, ghost2, ghost3);

/**
 * Canvas
 */
const $canvas = document.createElement('canvas');
$canvas.id = 'webgl-canvas';
document.querySelector('#app')?.appendChild($canvas);

/**
 * Controller
 */
const controls = new OrbitControls(camera, $canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: $canvas,
});
renderer.pixelRatio = Math.min(window.devicePixelRatio, 2);
renderer.setSize(canvasSize.width, canvasSize.height);

/**
 * Shadow
 */
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

directionalLight.castShadow = true;
const directionalLightShadowCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(directionalLightShadowCameraHelper);

floor.receiveShadow = true;

wall.castShadow = true;
wall.receiveShadow = true;

roof.castShadow = true;

grave.children.forEach(graveItem => {
  const graveMesh = graveItem as THREE.Mesh;
  graveMesh.castShadow = true;
  graveMesh.receiveShadow = true;
})

ghost1.castShadow = true;
ghost2.castShadow = true;
ghost3.castShadow = true;

/**
 * Resize
 */
window.addEventListener('resize', () => {
  canvasSize.width = window.innerWidth;
  canvasSize.height = window.innerHeight;

  renderer.setSize(canvasSize.width, canvasSize.height);
  renderer.pixelRatio = Math.min(window.devicePixelRatio, 2);

  camera.aspect = canvasSize.width / canvasSize.height;
  camera.updateProjectionMatrix();
});

/**
 * Sky
 */
const sky = new Sky();
sky.scale.setScalar( 450000 );

const phi = THREE.MathUtils.degToRad( 90 );
const theta = THREE.MathUtils.degToRad( 180 );
const sunPosition = new THREE.Vector3().setFromSphericalCoords( 0.5, phi, theta );

sky.material.uniforms.sunPosition.value = sunPosition;

scene.add(sky);

/**
 * timer
 */
const timer = new Timer();

/**
 * Executor
 */
(function tick() {
  // timer
  timer.update();
  const elapsedTime = timer.getElapsed();

  // ghost
  const ghost1Radian = elapsedTime * 0.3;
  ghost1.position.x = Math.cos(ghost1Radian) * ghost1Config.radius;
  ghost1.position.z = Math.sin(ghost1Radian) * ghost1Config.radius;
  ghost1.position.y = Math.sin(ghost1Radian)
    * Math.sin(ghost1Radian * 2.34)
    * Math.sin(ghost1Radian * 3.45);

  const ghost2Radian = elapsedTime * -0.6;
  ghost2.position.x = Math.cos(ghost2Radian) * ghost2Config.radius;
  ghost2.position.z = Math.sin(ghost2Radian) * ghost2Config.radius;
  ghost2.position.y = Math.sin(ghost2Radian)
    * Math.sin(ghost2Radian * 2.34)
    * Math.sin(ghost2Radian * 3.45);

  const ghost3Radian = elapsedTime * 0.8;
  ghost3.position.x = Math.cos(ghost3Radian) * ghost3Config.radius;
  ghost3.position.z = Math.sin(ghost3Radian) * ghost3Config.radius;
  ghost3.position.y = Math.sin(ghost3Radian)
    * Math.sin(ghost3Radian * 2.34)
    * Math.sin(ghost3Radian * 3.45);

  // renderer
  renderer.render(scene, camera);
  controls.update();

  window.requestAnimationFrame(tick);
}());
