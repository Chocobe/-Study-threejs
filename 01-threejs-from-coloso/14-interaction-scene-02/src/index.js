import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Three.js 디버거
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'

//
// 디버거 생성
//
const gui = new GUI();

//
// 색상 팔레트
//
const colors = {
    // 흰색
    white: 0xffffff, 
    // 파랑색
    blue: 0x0011ff,
    // 초록
    green: 0x13c200,
    // 주황색
    brown: 0xff2d00, 
};

//
// 테마
//
let isDay = true;

let animationMixer;

const $canvas = document.createElement('canvas');
document.body.appendChild($canvas);

//
// renderer
//
const renderer = new THREE.WebGLRenderer({
    canvas: $canvas,
    antialias: true,
});

renderer.pixelRatio = window.devicePixelRatio;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 3;

//
// scene
//
const scene = new THREE.Scene();
scene.background = new THREE.Color('#5ddad2');

//
// camera
//
const camera = new THREE.PerspectiveCamera();
camera.fov = 35;
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();

//
// light
//
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
scene.add(hemisphereLight);

//
// model
//
const loader = new GLTFLoader();
loader.load('/scene/scene-2.glb', gltf => {
    console.log('gltf: ', gltf);

    camera.position.copy(gltf.cameras[0].position);

    controls = new OrbitControls(camera, $canvas);
    controls.enableDamping = true;
    controls.target.set(0, camera.position.y, 0);
    controls.update();

    const model = gltf.scene;
    scene.add(model);

    model.traverse(child => {
        if (!child.isMesh) {
            return;
        }

        child.material.metalness = 0;

        console.log('child.name: ', child.name);
        if (child.name === 'colorize' || child.name === 'theme') {
            //
        } else {
            child.material = new THREE.MeshBasicMaterial({
                map: child.material.map,
            });
        }
    });

    scene.getObjectByName('night').visible = false;
    scene.getObjectByName('colorize').material.color.set(colors.brown);
    scene.getObjectByName('theme').material.color.set(colors.green);

    // color 디버거
    // initColorGUI();

    initAnimation(gltf);

    // 브라우저 콘솔에서 animation 실행 테스트를 위한 window 메서드 추가
    window.playRocket = () => playAnimation(gltf, 'rocket');

    render();
});

/**
 * 화면에서 color 값을 실시간으로 변경하기 위한, 디버거 초기화
 * 
 * 상단의 colors 변수의 값을 결정한 후, 사용 해제함
 */
function initColorGUI() {
    const guiState = {
        milesColor: 0xffffff,
    };

    const colorizeMesh = scene.getObjectByName('colorize');
    colorizeMesh.material.color.set(colors.brown);

    const themeMesh = scene.getObjectByName('theme');
    themeMesh.material.color.set(colors.green);

    gui
        .addColor(guiState, 'milesColor')
        .onChange(color => {
            themeMesh.material.color.set(color);
        });
}

//
// animation
//
function initAnimation(gltf) {
    animationMixer = new THREE.AnimationMixer(gltf.scene);

    const tracks = gltf.animations[0].tracks;
    const animations = {};

    tracks.forEach(track => {
        const name = track.name.split('.')[0];

        if (!animations[name]) {
            animations[name] = [];
        }

        animations[name].push(track);
    });

    const clips = [];
    console.log('animations: ', animations);

    Object
        .entries(animations)
        .forEach(([name, tracks]) => {
            const clip = new THREE.AnimationClip(name, -1, tracks);
            clips.push(clip);
        });

    gltf.animations = clips;

    addEventListener('click', e => {
        const raycaster = new THREE.Raycaster();

        const {
            clientX,
            clientY,
        } = e;

        const mouseCoord = new THREE.Vector2(
            (clientX / window.innerWidth) * 2 - 1,
            -(clientY / window.innerHeight) * 2 + 1
        );

        raycaster.setFromCamera(mouseCoord, camera);

        const intersects = raycaster.intersectObjects(gltf.scene.children, true);

        if (!intersects?.length) {
            return;
        }

        const name = intersects[0].object.name;
        playAnimation(gltf, name);

        switch (name) {
            case 'color':
                scene.getObjectByName('colorize').material.color.set(colors.green);
                break;
            case 'color_1':
                scene.getObjectByName('colorize').material.color.set(colors.blue);
                break;
            case 'color_2':
                scene.getObjectByName('colorize').material.color.set(colors.white);
                break;
            case 'color_3':
                scene.getObjectByName('colorize').material.color.set(colors.brown);
                break;
            case 'button_left':
            case 'button_right':
                isDay = !isDay;
                scene.getObjectByName('day').visible = isDay;
                scene.getObjectByName('night').visible = !isDay;
                scene.getObjectByName('theme').material.color.set(
                    colors[isDay ? 'green' : 'blue']
                );
                break;
            case 'button':
                playAnimation(gltf, 'rocket');
                break;
            case 'button_white':
                const clip = gltf.animations.find(clip => clip.name === 'rocket');
                const action = animationMixer.clipAction(clip);
                action.stop();
                break;
        }
    });
}

function playAnimation(gltf, name) {
    const clip = gltf.animations.find(clip => clip.name === name);

    if (!clip) {
        return;
    }

    const action = animationMixer.clipAction(clip);
    action.reset();
    action.loop = THREE.LoopOnce;
    action.clampWhenFinished = true;
    action.play();
}

let controls;
const clock = new THREE.Clock();

//
// executor
//
function render() {
    window.requestAnimationFrame(render);

    const deltaTime = clock.getDelta();

    renderer.render(scene, camera);
    controls?.update(deltaTime);
    animationMixer.update(deltaTime);
}
