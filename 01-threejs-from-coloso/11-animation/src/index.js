import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

//
// state
//
let mixer;

//
// core
//
const $canvas = document.createElement('canvas');
document.body.appendChild($canvas);

const renderer = new THREE.WebGLRenderer({
    canvas: $canvas,
    antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
    30,
    window.innerWidth / window.innerHeight
);
camera.position.set(30, 20, 30);

const controls = new OrbitControls(camera, $canvas);
controls.enableDamping = true;

const clock = new THREE.Clock();

//
// light
//
const directionalLight = new THREE.DirectionalLight(
    0xffffff,
    1
);
directionalLight.position.set(-5, 10, 10);
directionalLight.castShadow = true;
/** light.shadow.camera.zoom 으로 shadow 가 적용되는 범위를 넓힘 */
directionalLight.shadow.camera.zoom = 0.5;
const helperOfDirectionalLight = new THREE.DirectionalLightHelper(
    directionalLight
);
/** light.shadowMap.camera 를 Helper 객체로 시각화 하기 */
const shadowCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(directionalLight);
// scene.add(helperOfDirectionalLight);
// scene.add(shadowCameraHelper);

const ambientLight = new THREE.AmbientLight(
    0xff1493, 0.3
);
scene.add(ambientLight);

//
// model
//
const loader = new GLTFLoader();
loader.load('/animations/34-animations.glb', gltf => {
    const model = gltf.scene;

    mixer = new THREE.AnimationMixer(model);

    /**
    const clip = gltf.animations[0];
    const action = mixer.clipAction(clip);

    // 2번 반복
    action.loop = THREE.LoopRepeat;
    action.repetitions = 2;

    // 애니메이션이 끝나면, 끝난 장면을 유지한다.
    action.clampWhenFinished = true;

    action.play();
    */

    const tracks = gltf.animations[0].tracks;
    const animations = {};

    tracks.forEach(track => {
        const [name, property] = track.name.split('.');

        if (animations[name]) {
            animations[name].tracks.push(track);
        } else {
            animations[name] = new THREE.AnimationClip(name, -1, [track]);
        }
    });
    gltf.animations = Object.values(animations);
    console.log('gltf.animations: ', gltf.animations);

    window.addEventListener('keydown', e => {
        const key = e.key.toLowerCase();
        let name = '';

        switch (key) {
            case 'q':
                name = 'Spline';
                break;
            case 'w':
                name = 'Track';
                break;
            case 'e':
                name = 'Vibrate';
                break;
        }

        if (name) {
            playAnimation(name);
        }
    });

    function playAnimation(name) {
        mixer.stopAllAction();
        const clip = gltf.animations.find((clip) => clip.name === name);
        const action = mixer.clipAction(clip);
        action.loop = THREE.LoopOnce;
        action.clampWhenFinished = true;
        action.play();
    }

    model.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            child.material.roughness = 0.6;
        }
    });

    scene.add(model);

    render();
});

//
// executor
//
function render() {
    window.requestAnimationFrame(render);

    const deltaTime = clock.getDelta();

    renderer.render(scene, camera);
    controls.update(deltaTime);
    mixer.update(deltaTime);
}
