import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Sky } from 'three/addons/objects/Sky.js';
import { Timer } from 'three/addons/misc/Timer.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI()
gui.close();

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

// Floor
const floorAlphaTexture = textureLoader.load('floor/alpha.webp');
const floorColorTexture = textureLoader.load('floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.webp');
const floorARMTexture = textureLoader.load('floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_arm_1k.webp');
const floorNormalTexture = textureLoader.load('floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_nor_gl_1k.webp');
const floorDisplacementTexture = textureLoader.load('floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_disp_1k.webp');

floorColorTexture.colorSpace = THREE.SRGBColorSpace;

floorColorTexture.repeat.set(8, 8);
floorARMTexture.repeat.set(8, 8);
floorNormalTexture.repeat.set(8, 8);
floorDisplacementTexture.repeat.set(8, 8);

floorColorTexture.wrapS = THREE.RepeatWrapping;
floorARMTexture.wrapS = THREE.RepeatWrapping;
floorNormalTexture.wrapS = THREE.RepeatWrapping;
floorDisplacementTexture.wrapS = THREE.RepeatWrapping;

floorColorTexture.wrapT = THREE.RepeatWrapping;
floorARMTexture.wrapT = THREE.RepeatWrapping;
floorNormalTexture.wrapT = THREE.RepeatWrapping;
floorDisplacementTexture.wrapT = THREE.RepeatWrapping;

// Wall
const wallColorTexture = textureLoader.load('wall/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.webp');
const wallARMTexture = textureLoader.load('wall/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.webp');
const wallNormalTexture = textureLoader.load('wall/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.webp');

wallColorTexture.colorSpace = THREE.SRGBColorSpace;

// Roof
const roofColorTexture = textureLoader.load('roof/roof_slates_02_1k/roof_slates_02_diff_1k.webp');
const roofARMTexture = textureLoader.load('roof/roof_slates_02_1k/roof_slates_02_arm_1k.webp');
const roofNormalTexture = textureLoader.load('roof/roof_slates_02_1k/roof_slates_02_nor_gl_1k.webp');

roofColorTexture.colorSpace = THREE.SRGBColorSpace;

roofColorTexture.repeat.set(3, 1);
roofARMTexture.repeat.set(3, 1);
roofNormalTexture.repeat.set(3, 1);

roofColorTexture.wrapS = THREE.RepeatWrapping;
roofARMTexture.wrapS = THREE.RepeatWrapping;
roofNormalTexture.wrapS = THREE.RepeatWrapping;

// Bush
const bushColorTexture = textureLoader.load('bush/leaves_forest_ground_1k/leaves_forest_ground_diff_1k.webp');
const bushARMTexture = textureLoader.load('bush/leaves_forest_ground_1k/leaves_forest_ground_arm_1k.webp');
const bushNormalTexture = textureLoader.load('bush/leaves_forest_ground_1k/leaves_forest_ground_nor_gl_1k.webp');

bushColorTexture.colorSpace = THREE.SRGBColorSpace;

bushColorTexture.repeat.set(2, 1);
bushARMTexture.repeat.set(2, 1);
bushNormalTexture.repeat.set(2, 1);

bushColorTexture.wrapS = THREE.RepeatWrapping;
bushARMTexture.wrapS = THREE.RepeatWrapping;
bushNormalTexture.wrapS = THREE.RepeatWrapping;

// Grave
const graveColorTexture = textureLoader.load('grave/plastered_stone_wall_1k/plastered_stone_wall_diff_1k.webp');
const graveARMTexture = textureLoader.load('grave/plastered_stone_wall_1k/plastered_stone_wall_arm_1k.webp');
const graveNormalTexture = textureLoader.load('grave/plastered_stone_wall_1k/plastered_stone_wall_nor_gl_1k.webp');

graveColorTexture.colorSpace = THREE.SRGBColorSpace;

graveColorTexture.repeat.set(0.3, 0.4);
graveARMTexture.repeat.set(0.3, 0.4);
graveNormalTexture.repeat.set(0.3, 0.4);

// Door
const doorColorTexture = textureLoader.load('door/color.webp');
const doorAlphaTexture = textureLoader.load('door/alpha.webp');
const doorAmbientOcclusionTexture = textureLoader.load('door/ambientOcclusion.webp');
const doorHeightTexture = textureLoader.load('door/height.webp');
const doorNormalTexture = textureLoader.load('door/height.webp');
const doorRoughnessTexture = textureLoader.load('door/roughness.webp');
const doorMetalnessTexture = textureLoader.load('door/metalness.webp');

doorColorTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * House
 */
// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20, 100, 100),
    new THREE.MeshStandardMaterial({
        transparent: true,
        alphaMap: floorAlphaTexture,
        map: floorColorTexture,
        aoMap: floorARMTexture,
        roughnessMap: floorARMTexture,
        metalnessMap: floorARMTexture,
        normalMap: floorNormalTexture,
        displacementMap: floorDisplacementTexture,
        displacementScale: 0.3,
        displacementBias: -0.2,
    })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const floorMaterialGUI = gui.addFolder('Floor Material');
floorMaterialGUI.add(floor.material, 'displacementScale').min(0).max(1).step(0.001).name('displacementScale');
floorMaterialGUI.add(floor.material, 'displacementBias').min(-1).max(1).step(0.001).name('displacementBias');

// House Container
const house = new THREE.Group();
scene.add(house);

// `Wall`
const wall = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 4),
    new THREE.MeshStandardMaterial({
        map: wallColorTexture,
        aoMap: wallARMTexture,
        roughnessMap: wallARMTexture,
        metalnessMap: wallARMTexture,
        normalMap: wallNormalTexture,
    })
);
wall.position.y += 2.5 / 2;
house.add(wall);

// Roof
const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 1.5, 4),
    new THREE.MeshStandardMaterial({
        map: roofColorTexture,
        aoMap: roofARMTexture,
        roughnessMap: roofARMTexture,
        metalnessMap: roofARMTexture,
        normalMap: roofNormalTexture,
    })
);
roof.position.y = 2.5 + (1.5 / 2);
roof.rotation.y = Math.PI / 4;
house.add(roof);

// Door
const door = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
    new THREE.MeshStandardMaterial({
        transparent: true,
        map: doorColorTexture,
        alphaMap: doorAlphaTexture,
        aoMap: doorAmbientOcclusionTexture,
        displacementMap: doorHeightTexture,
        displacementScale: 0.15,
        displacementBias: -0.04,
        normalMap: doorNormalTexture,
        roughnessMap: doorRoughnessTexture,
        metalnessMap: doorMetalnessTexture,
    })
);
door.position.y = 1;
door.position.z = 2 + 0.01;
house.add(door);

const doorMaterialGUI = gui.addFolder('Door Material');
doorMaterialGUI.add(door.material, 'displacementScale').min(0).max(1).step(0.001).name('displacementScale');
doorMaterialGUI.add(door.material, 'displacementBias').min(-1).max(1).step(0.001).name('displacementBias');

// Bushes
const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({
    color:'#ccffcc',
    map: bushColorTexture,
    aoMap: bushARMTexture,
    roughnessMap: bushARMTexture,
    metalnessMap: bushARMTexture,
    normalMap: bushNormalTexture,
});

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
bush1.scale.setScalar(0.5);
bush1.position.set(0.8, 0.2, 2.2);
bush1.rotation.x = -0.75;

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
bush2.scale.setScalar(0.25);
bush2.position.set(1.4, 0.1, 2.1);
bush2.rotation.x = -0.75;

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
bush3.scale.setScalar(0.4);
bush3.position.set(-0.8, 0.1, 2.2);
bush3.rotation.x = -0.75;

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
bush4.scale.setScalar(0.15);
bush4.position.set(-1, 0.05, 2.6);
bush4.rotation.x = -0.75;

house.add(bush1, bush2, bush3, bush4);

// Graves
const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
const graveMaterial = new THREE.MeshStandardMaterial({
    map: graveColorTexture,
    aoMap: graveARMTexture,
    roughnessMap: graveARMTexture,
    metalnessMap: graveARMTexture,
    normalMap: graveNormalTexture,
});

const graves = new THREE.Group();
scene.add(graves);

for (let i = 0; i < 30; i++) {
    // Random angle
    const radius = 3 + Math.random() * 4;
    const angle = Math.random() * Math.PI * 2;
    const x = Math.sin(angle) * radius;
    const y = Math.random() * 0.4;
    const z = Math.cos(angle) * radius;

    // Mesh
    const grave = new THREE.Mesh(graveGeometry, graveMaterial);
    grave.position.x = x;
    grave.position.y = y;
    grave.position.z = z;
    grave.rotation.x = (Math.random() - 0.5) * 0.4;
    grave.rotation.y = (Math.random() - 0.5) * 0.4;
    grave.rotation.z = (Math.random() - 0.5) * 0.4;

    // Add to graves group
    graves.add(grave);
}

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#86cdff', 0.257);
scene.add(ambientLight);

const ambientLightGUI = gui.addFolder('Ambient Light');
ambientLightGUI.addColor(ambientLight, 'color');

// Directional light
const directionalLight = new THREE.DirectionalLight('#86cdff', 1);
directionalLight.position.set(3, 2, -8)
scene.add(directionalLight)

const directionalLightGUI = gui.addFolder('Directional Light');
directionalLightGUI.addColor(directionalLight, 'color');

// Door light
const doorLight = new THREE.PointLight('#ff7d46', 5);
doorLight.position.set(0, 2.2, 2.5);
house.add(doorLight);

/**
 * Ghosts
 */
const ghost1 = new THREE.PointLight('#8800ff', 6);
const ghost2 = new THREE.PointLight('#ff0088', 6);
const ghost3 = new THREE.PointLight('#ff0000', 6);
scene.add(ghost1, ghost2, ghost3);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 5
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Shadows
 */
renderer.shadowMap.enabled = true;
// PCF: Percentage-Closer Filtering
// => 그림자를 생성할 때 생기는 `aliasing (계단 현상)`을 부드럽게 보정해주는 방식을 말한다.
//
// `aliasing`은 `다른 이름` or `가명` 이라는 뜻을 가지는데,
// => `신호 처리 및 데이터 샘플링` 이론에서 유래된 용어다.
// => 고주파 신호를 디지털화 하기위해 샘플링 작업을 하는데, 이 주파수의 `최고 주파수 * 2` 속도로 샘플링해야 복원이 된다.
// => 이보다 느린 속도로 샘플링하게 되면, `왜곡된 신호`가 만들어지며 이를 `aliasing` 이라고 한다.
//
// 컴퓨터 그래픽스에서 `aliasing`은 `왜곡된 신호` 처럼 `왜곡 현상` or `계단 현상` 을 말한다.
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Cast and receive
directionalLight.castShadow = true;
ghost1.castShadow = true;
ghost2.castShadow = true;
ghost3.castShadow = true;

wall.castShadow = true;
wall.receiveShadow = true;
roof.castShadow = true;
floor.receiveShadow = true;

for (const grave of graves.children) {
    grave.castShadow = true;
    grave.receiveShadow = true;
}

// Mapping
// const directionalLightShadowCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(directionalLightShadowCameraHelper);

directionalLight.shadow.mapSize.width = 256;
directionalLight.shadow.mapSize.height = 256;
directionalLight.shadow.camera.top = 8;
directionalLight.shadow.camera.right = 8;
directionalLight.shadow.camera.bottom = -8;
directionalLight.shadow.camera.left = -8;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 20;

ghost1.shadow.mapSize.width = 256;
ghost1.shadow.mapSize.height = 256;
ghost1.shadow.camera.near = 1;
ghost1.shadow.camera.far = 10;

ghost2.shadow.mapSize.width = 256;
ghost2.shadow.mapSize.height = 256;
ghost2.shadow.camera.near = 1;
ghost2.shadow.camera.far = 10;

ghost3.shadow.mapSize.width = 256;
ghost3.shadow.mapSize.height = 256;
ghost3.shadow.camera.near = 1;
ghost3.shadow.camera.far = 10;

/**
 * Sky
 */
const sky = new Sky();
sky.scale.setScalar(100);
scene.add(sky);

sky.material.uniforms.turbidity.value = 10;
sky.material.uniforms.rayleigh.value = 3;
sky.material.uniforms.mieCoefficient.value = 0.1;
sky.material.uniforms.mieDirectionalG.value = 0.95;
sky.material.uniforms.sunPosition.value.set(0.3, -0.038, -0.95);

/**
 * Fog
 * => Three.js 에서 제공하는 빌트인 Fog 는 2가지가 있다.
 * => `class Fog`, `class FoxExp2`
 * 
 * `Fog`
 * => 비교적 비현실적인 안개
 * 
 * `FogExp2`
 * => 비교적 현실적인 한개
 * 
 * 안개의 `color`는 배경색과 동일하게 적용하면, 자연스럽게 연출할 수 있다.
 */
// scene.fog = new THREE.Fog('#22343f', 1, 13);
scene.fog = new THREE.FogExp2('#22343f', 0.1);

/**
 * Animate
 */
const timer = new Timer()

const tick = () =>
{
    // Timer
    timer.update()
    const elapsedTime = timer.getElapsed()

    // Ghost
    const ghost1Angle = elapsedTime * 0.5;
    ghost1.position.x = Math.cos(ghost1Angle) * 4;
    ghost1.position.z = Math.sin(ghost1Angle) * 4;
    ghost1.position.y = Math.sin(ghost1Angle)
        * Math.sin(ghost1Angle * 2.34)
        * Math.sin(ghost1Angle * 3.45);

    const ghost2Angle = -elapsedTime * 0.38;
    ghost2.position.x = Math.cos(ghost2Angle) * 5;
    ghost2.position.z = Math.sin(ghost2Angle) * 5;
    ghost2.position.y = Math.sin(ghost2Angle)
        * Math.sin(ghost2Angle * 2.34)
        * Math.sin(ghost2Angle * 3.45);

    const ghost3Angle = elapsedTime * 0.23;
    ghost3.position.x = Math.cos(ghost3Angle) * 6;
    ghost3.position.z = Math.sin(ghost3Angle) * 6;
    ghost3.position.y = Math.sin(ghost3Angle)
        * Math.sin(ghost3Angle * 2.34)
        * Math.sin(ghost3Angle * 3.45);

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()