import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
/**
 * R: Red
 * G: Green
 * B: Blue
 * E: Exponent (단어 뜻은 `지수`, 여기서 의미는 `밝기`)
 */
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const rgbeLoader = new RGBELoader();

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Environment map
 */
// 환경 밝기 설정
scene.environmentIntensity = 1;
// 배경 흐림 설정
scene.backgroundBlurriness = 0;
// 배경 밝기 설정
scene.backgroundIntensity = 1;

// 배경 x축 회전
// scene.backgroundRotation.x = 1;
// 환경 x축 회전
// scene.environmentRotation.x = 1;

gui.add(scene, 'environmentIntensity').min(0).max(10).step(0.001);
gui.add(scene, 'backgroundBlurriness').min(0).max(1).step(0.001);
gui.add(scene, 'backgroundIntensity').min(0).max(10).step(0.001);
gui.add(scene.backgroundRotation, 'y').min(0).max(Math.PI * 2).step(0.001).name('backgroundRotationY');
gui.add(scene.environmentRotation, 'y').min(0).max(Math.PI * 2).step(0.001).name('environmentRotationY');

// // LDR cube texture (LDR: Low dynamic Range)
// const environmentMap = cubeTextureLoader.load([
//     '/environmentMaps/0/px.png',
//     '/environmentMaps/0/nx.png',
//     '/environmentMaps/0/py.png',
//     '/environmentMaps/0/ny.png',
//     '/environmentMaps/0/pz.png',
//     '/environmentMaps/0/nz.png',
// ], () => {
//     console.log('success');
// });

// scene.environment = environmentMap;
// scene.background = environmentMap;

// HDR (HDR: High Dynamic Range) - Equirectangular
// => `RGBELoader`를 사용하여 `HDR` 파일을 `DataTexture`로 불러올 수 있다.
// => `LDR`보다 풍부한 `발기` 데이터를 가지고 있어서, `CubeTextureLoader`보다 밝고 선명하게 렌더링 된다.
// => `HDR`를 사용한다면, `scene.backgroundIntensity` 나 `scene.environmentIntensity`를 굳이 사용하지 않아도 된다.
// rgbeLoader.load('/environmentMaps/0/2k.hdr', environmentMap => {
//     console.log('environmentMap: ', environmentMap);

//     environmentMap.mapping = THREE.EquirectangularReflectionMapping;
//     scene.background = environmentMap;
//     scene.environment = environmentMap;
// });

// Blneder로 만든 HDR 사용하기
rgbeLoader.load('/environmentMaps/blender-2k.hdr', environmentMap => {
    environmentMap.mapping = THREE.EquirectangularReflectionMapping;

    // 배경으로 렌더링은 하지 않고, `scene.environment` 에만 적용해서, Light 효과만 사용하기
    // scene.background = environmentMap;
    scene.environment = environmentMap;
});

// `HDR`은 파일이 크고, 렌더링에 많은 비용이 든다.
// => `HDR` 이미지의 `해상도` 를 낮추거나, 약간의 `Blur`를 적용하면, 로딩과 렌더링 비용을 줄일 수 있다.

/**
 * Torus Knot
 */
const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
    new THREE.MeshStandardMaterial({
        color: 0xAAAAAA,
        metalness: 1,
        roughness: 0.3,
        // envMap: environmentMap,
    })
);
torusKnot.position.x = -4
torusKnot.position.y = 4
scene.add(torusKnot)

/**
 * Models
 */
gltfLoader.load('/models/FlightHelmet/glTF/FlightHelmet.gltf', gltf => {
    console.log('gltf: ', gltf);

    gltf.scene.scale.setScalar(10);
    gltf.scene.position.set(1, 0, 0);

    scene.add(gltf.scene);
});

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
camera.position.set(4, 5, 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.y = 3.5
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
 * Animate
 */
const clock = new THREE.Clock()
const tick = () =>
{
    // Time
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()