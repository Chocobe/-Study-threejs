/*
To refer to the lecture notes, please copy the contents below and paste them into index.js.
Once you save the file, you will be able to access and view the lecture notes.

강의 노트 파일입니다. 해당 노트 파일을 참조하시려면 아래 내용들을 복사한 뒤, 
 index.js 안에 붙여넣으신 후 저장하시면 확인하실 수 있습니다. 
*/
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Scene_1 } from "./practice/scene-1";
import { Scene_2 } from "./practice/scene-2";
import { Scene_3 } from "./practice/scene-3";

import { gsap } from "gsap";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	antialias: true,
	alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio * 2); // 4k -> 1920 x 1080
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;

const camera = new THREE.PerspectiveCamera(
	35,
	window.innerWidth / window.innerHeight
);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.update();

const scene_1 = new Scene_1(renderer, camera, controls);
const scene_2 = new Scene_2(renderer, camera, controls);
const scene_3 = new Scene_3(renderer, camera, controls);
window.scenes = [scene_1, scene_2, scene_3];

let currentScene;
function sceneMove(number_) {
	if (currentScene) currentScene.stop();
	scenes[number_ - 1].start();
	currentScene = scenes[number_ - 1];
}
window.sceneMove = sceneMove;

function move(target, position = new THREE.Vector3(0, 0, 0)) {
	gsap.to(target, {
		duration: 3,
		ease: "power3",
		x: position.x,
		y: position.y,
		z: position.z,
	});
}
window.move = move;
