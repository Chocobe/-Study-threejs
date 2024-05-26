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

window.scenes = [
    scene1,
    scene2,
    scene3,
];

let currentScene;

function sceneMove(pageNumber) {
    currentScene?.stop();
    currentScene = scenes[pageNumber - 1];
    currentScene?.start();
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
        ease: 'power3',
        x: position.x,
        y: position.y,
        z: position.z,
    });
}
window.move = move;
