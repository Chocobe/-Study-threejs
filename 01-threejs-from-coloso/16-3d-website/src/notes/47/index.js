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

// arrows
const arrow_l = document.querySelector(".arrow_left");
const arrow_r = document.querySelector(".arrow_right");

// navigators
const btn_scene_1 = document.querySelector(".scene_1");
const btn_scene_2 = document.querySelector(".scene_2");
const btn_scene_3 = document.querySelector(".scene_3");

// right container
const btn_tooltip = document.querySelector(".btn_tooltip");
const btn_sound = document.querySelector(".btn_sound");
const page_tooltip = document.querySelector(".page_tooltip");

// title
const page_title = document.querySelector(".page_title");

// audio
const audio = document.querySelector("audio");

let currentScene;
let sceneIndex = 1;
function sceneMove(number_) {
	if (currentScene) currentScene.stop();
	scenes[number_ - 1].start();
	currentScene = scenes[number_ - 1];
	sceneIndex = number_;

	page_title.textContent = currentScene.title;
	page_tooltip.querySelector("p").textContent = currentScene.tooltip;

	document.querySelectorAll(".item").forEach((el) => {
		el.classList.remove("active");
	});
	if (number_ == 1) document.querySelector(".scene_1").classList.add("active");
	if (number_ == 2) document.querySelector(".scene_2").classList.add("active");
	if (number_ == 3) document.querySelector(".scene_3").classList.add("active");

	gsap.to(document.body, {
		duration: 1,
		backgroundColor: currentScene.backgroundColor,
	});
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

arrow_l.addEventListener("click", (e) => {
	let targetIndex = sceneIndex - 1;
	if (targetIndex < 1) targetIndex = 1;
	sceneMove(targetIndex);
});
arrow_r.addEventListener("click", (e) => {
	let targetIndex = sceneIndex + 1;
	if (targetIndex > 3) targetIndex = 3;
	sceneMove(targetIndex);
});
btn_scene_1.addEventListener("click", (e) => {
	sceneMove(1);
});
btn_scene_2.addEventListener("click", (e) => {
	sceneMove(2);
});
btn_scene_3.addEventListener("click", (e) => {
	sceneMove(3);
});
btn_tooltip.addEventListener("click", (e) => {
	page_tooltip.classList.toggle("active");
});
let audio_play = false;
btn_sound.addEventListener("click", (e) => {
	btn_sound.classList.toggle("active");
	audio_play = !audio_play; // true
	if (audio_play) audio.muted = false;
	else audio.muted = true;
});
