import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const $canvas = document.createElement('canvas');
document.body.appendChild($canvas);

//
// core
//
const renderer = new THREE.WebGLRenderer({
    canvas: $canvas,
    antialias: true,
});

renderer.pixelRatio = window.devicePixelRatio;
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    30,
    window.innerWidth / window.innerHeight
);
camera.position.set(0, 0, 30);

const controls = new OrbitControls(camera, $canvas);
controls.enableDamping = true;

const clock = new THREE.Clock();

//
// model
//
const loader = new GLTFLoader();
loader.load('/bake/33-bake.glb', gltf => {
    const model = gltf.scene;

    scene.add(model);

    render();
});

//
// Model 의 렌더링 색상 조정
//
/**
 * 아래 설정은 Three.js 최신 버전에서는 
 * `renderer.outputColorSpace = THREE.SRGBColorSpace;` 로 설정한다.
 * 
 * 현재 버전에서는 outputColorSpace 설정이 적용되지 않는 것으로 확인됨
 */
renderer.outputColorSpace = "srgb";

/**
 * rendering toneMapping 설정 (ACESFilmicToneMapping 은 사진이나 영화처럼 부드러운 느낌의 색감으로 렌더링된다.)
 */
renderer.toneMapping = THREE.ACESFilmicToneMapping;

/**
 * rendering 시, 색상의 노출 정도를 설정한다. (높을수록 밝아짐)
 */
renderer.toneMappingExposure = 3;


//
// executor
//
function render() {
    window.requestAnimationFrame(render);

    renderer.render(scene, camera);
    controls.update(clock.getDelta());
}