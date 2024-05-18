/*
To refer to the lecture notes, please copy the contents below and paste them into index.js.
Once you save the file, you will be able to access and view the lecture notes.

강의 노트 파일입니다. 해당 노트 파일을 참조하시려면 아래 내용들을 복사한 뒤, 
    index.js 안에 붙여넣으신 후 저장하시면 확인하실 수 있습니다. 
*/
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { EffectComposer } from 'three/examples/jsm/postProcessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass';

import { CreateParticles } from './study/settings';

// Post-Processing
/** @type { EffectComposer } */
let composer;
// Post-Processing

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 3;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	30,
	window.innerWidth / window.innerHeight
);
camera.position.set(15, 7, 15);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const particles = new CreateParticles(scene, 100);
console.log('particles: ', particles);

const loader = new GLTFLoader();
loader.load("/bake/33-bake.glb", (gltf) => {
	scene.add(gltf.scene);

    composer = new EffectComposer(renderer);

    // 현재 frame 의 화면을 이미지 형태로 추출(?)한 결과를 가진다.
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // 빛 번짐 효과
    const bloomPass = new UnrealBloomPass(
        // resolution: Bloom 효과를 적용한 결과물의 해상도 설정
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        // strenth: 빛의 세기
        1,
        // 빛 번짐의 반지름
        1,
        // threshold: 원본 화면에서 threshold 보다 밝은 부분에만 Bloom 이 적용된다.
        0.3
    );
    // composer.addPass(bloomPass);

    // 흐림 효과
    const bokehPass = new BokehPass(scene, camera, {
        // 카메라로 부터 초점 거리를 지정한다.
        // 지정한 초점을 기준으로 주변을 흐림 처리 한다.
        focus: 21.25,
        // aperture 란, `조리개` 라는 뜻이며, 노출(빛)의 정도를 조절할 수 있다.
        // aperture 값이 커질수록 번짐효과가 커진다.
        aperture: 0.001,
        // blur 의 최대값
        maxblur: 0.01,
        // aspect: blur 효과를 적용한 결과물의 화면 비율
        aspect: window.innerWidth / window.innerHeight,
    });

    // Post-Processing 은 각 Pass 를 추가한 순서대로 쌓아가는 Layer 방식으로 동작한다.
    // 때문에, Pass 를 추가한 순서에 따라 결과가 달라질 수 있다.
    composer.addPass(bloomPass);
    // Bokeh (Blur) 효과는 일반적으로 가장 마지막에 적용한다고 한다.
    composer.addPass(bokehPass);

	render();
});

const clock = new THREE.Clock();
function render() {
	requestAnimationFrame(render);

    const deltaTime = clock.getDelta();

	// renderer.render(scene, camera);
	controls.update(deltaTime);
    composer.render(deltaTime);
    particles.update();
}
