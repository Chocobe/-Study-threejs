import * as THREE from 'three';
import {
    OrbitControls,
} from 'three/examples/jsm/controls/OrbitControls';
import {
    GLTFLoader,
} from 'three/examples/jsm/loaders/GLTFLoader';

/** animation */
let animationMixer;
let animationAction;

/** controls */
let controls;

/** clock */
const clock = new THREE.Clock();

/** canvas */
const $canvas = document.createElement('canvas');
document.body.appendChild($canvas);

/** renderer */
const renderer = new THREE.WebGLRenderer({
    canvas: $canvas,
    antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 6;

/** camera */
const camera = new THREE.PerspectiveCamera();
camera.fov = 35;
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();

/** scene */
const scene = new THREE.Scene();
scene.background = new THREE.Color('hsl(255, 70%, 40%)');

/** light */
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

/** gltf */
new GLTFLoader().load('/scene/scene-1.glb', gltf => {
    console.log('gltf: ', gltf);
    scene.add(gltf.scene);

    camera.position.copy(gltf.cameras[0].position);
    camera.rotation.copy(gltf.cameras[0].rotation);

    controls = new OrbitControls(camera, $canvas);
    controls.enableDamping = true;

    gltf.scene.traverse(child => {
        if (!child.isMesh) {
            return;
        }

        // Mesh가 렌더링되지 않는 원인 2가지
        // 1. 조명이 없을 경우.
        // 
        // 2. Mesh 의 material.metalness 가 `1` 일 경우.
        // => metalness 가 1이면, `배경색` 을 반사하게 되는데, 배경색이 black 이기 때문에 검게 렌더링 된다.

        child.material.metalness = 0;
        initAnimation(gltf);
    });

    const raycaster = new THREE.Raycaster();
    window.addEventListener('click', e => {
        const {
            clientX,
            clientY,
        } = e;

        const mouseCoord = new THREE.Vector2(
            (clientX / window.innerWidth) * 2 - 1,
            -(clientY / window.innerHeight) * 2 + 1
        );
        console.log('mouseCoord: ', mouseCoord);

        raycaster.setFromCamera(mouseCoord, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        console.log('intersects: ', intersects);

        const buttonName = 'play_171';
        const buttonMesh = intersects.find(({ object }) => object.name === buttonName);

        if (!buttonMesh) {
            return;
        }

        console.log('buttonMesh: ', buttonMesh);
        isPlay = true;
        animationAction.reset();
    });
});

/** animation */
let isPlay = false;

function initAnimation(gltf) {
    animationMixer = new THREE.AnimationMixer(gltf.scene);
    animationAction = animationMixer.clipAction(gltf.animations[0]);
    animationAction.loop = THREE.LoopPingPong;

    // animation 을 play() 하되, time 을 `0` 으로 고정된 상태를 만든다.
    // => 0번 frame 이 계속 렌더링되게 된다.
    // => animation 의 특정 frame 을 렌더링하기 위해, `animationMixer.update(0)` 을 실행한다.
    animationAction.play();
    animationAction.time = 0;
    animationMixer.update(0);

    animationMixer.addEventListener('finished', e => {
        console.group('finished');
        console.log('e: ', e);
        console.groupEnd();
    });

    animationMixer.addEventListener('loop', e => {
        console.group('loop');
        console.log('e: ', e);
        console.groupEnd();
    });
}

(function initOnResize() {
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
    
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
}());

/** executor */
function render() {
    window.requestAnimationFrame(render);

    const deltaTime = clock.getDelta();

    renderer.render(scene, camera);
    controls?.update(deltaTime);

    if (isPlay) {
        animationMixer?.update(deltaTime);
    }
}
render();
