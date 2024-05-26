// three.js
import {
    WebGLRenderer,
    PerspectiveCamera,
    Vector3,
} from 'three';
// three.js - addons
import {
    OrbitControls,
} from 'three/examples/jsm/controls/OrbitControls';
// scene
import { Scene1 } from './practice/scene-1';
import { Scene2 } from './practice/scene-2';
import { Scene3 } from './practice/scene-3';
// gsap
import { gsap } from 'gsap';

/**
 * $canvas
 */
const $canvas = document.createElement('canvas');
document.body.appendChild($canvas);

/**
 * renderer
 */
const renderer = new WebGLRenderer({
    canvas: $canvas,
    antialias: true,
    alpha: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

/**
 * camera
 */
const camera = new PerspectiveCamera();
camera.fov = 35;
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();

/**
 * controls
 */
const controls = new OrbitControls(camera, $canvas);
controls.enableDamping = true;

/**
 * scene
 */
const scene1 = new Scene1(renderer, camera, controls);
const scene2 = new Scene2(renderer, camera, controls);
const scene3 = new Scene3(renderer, camera, controls);
const scenes = [
    scene1,
    scene2,
    scene3,
];
window.scenes = scenes;

let sceneIndex = 0;

function sceneMove(pageNumber) {
    const currentScene = scenes[sceneIndex] ?? scene1;
    currentScene?.stop();

    sceneIndex = pageNumber - 1;
    scenes[sceneIndex]?.start();

    $title.textContent = scenes[sceneIndex]?.title ?? 'N/A';
    $tooltipContent.textContent = scenes[sceneIndex]?.tooltip ?? 'N/A';
}
window.sceneMove = sceneMove;

/**
 * (GSAP) animate camera
 */
function move(
    target, 
    position = new Vector3(0, 0, 0)
) {
    gsap.to(target, {
        duration: 3,
        // ease: 'power3',
        x: position.x,
        y: position.y,
        z: position.z,
    });
    console.log({
        duration: 3,
        // ease: 'power3',
        x: position.x,
        y: position.y,
        z: position.z,
    })
    console.log('target: ', target);
}
window.move = move;

// FIXME: Navigator 개발 후, 지우기
setTimeout(() => {
    // window.scenes[2].start();
    sceneMove(1);
}, 1_000);

//
// button interaction
//
const $title = document.querySelector('.title');
const $tooltipContent = document.querySelector('#tooltip-content');

const $arrowLeft = document.querySelector('#arrow-left');
$arrowLeft.addEventListener('click', () => {
    console.log('onClick() - sceneIndex: ', sceneIndex);
    if (sceneIndex < 1) {
        return;
    }

    sceneMove(sceneIndex);
});

const $arrowRight = document.querySelector('#arrow-right');
$arrowRight.addEventListener('click', () => {
    if (sceneIndex >= scenes.length - 1) {
        return;
    }

    sceneMove(sceneIndex + 2);
});

const $play = document.querySelector('#play');
$play.addEventListener('click', () => {
    $play.classList.add('play');
    $rocket.classList.remove('play');
    $star.classList.remove('play');

    sceneMove(1);
});

const $rocket = document.querySelector('#rocket');
$rocket.addEventListener('click', () => {
    $play.classList.remove('play');
    $rocket.classList.add('play');
    $star.classList.remove('play');

    sceneMove(2);
});

const $star = document.querySelector('#star');
$star.addEventListener('click', () => {
    $play.classList.remove('play');
    $rocket.classList.remove('play');
    $star.classList.add('play');

    sceneMove(3);
});

let isMute = true;
const $volume = document.querySelector('#volume');
const $soundIcon = $volume.querySelector('.sound');
const $muteIcon = $volume.querySelector('.mute');
const $audio = $volume.querySelector('.audio');
$volume.addEventListener('click', () => {
    isMute = !isMute;

    if (isMute) {
        $volume.classList.remove('active');
        $soundIcon.classList.remove('active');
        $muteIcon.classList.add('active');
    } else {
        $volume.classList.add('active');
        $soundIcon.classList.add('active');
        $muteIcon.classList.remove('active');
    }

    $audio.muted = isMute;
});

const $question = document.querySelector('#question');
const $tooltip = document.querySelector('#tooltip');
$question.addEventListener('click', () => {
    $tooltip.classList.toggle('active');
});
