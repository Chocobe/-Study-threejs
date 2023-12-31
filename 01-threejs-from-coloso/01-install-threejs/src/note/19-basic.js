/*
To refer to the lecture notes, please copy the contents below and paste them into index.js.
Once you save the file, you will be able to access and view the lecture notes.

강의 노트 파일입니다. 해당 노트 파일을 참조하시려면 아래 내용들을 복사한 뒤, 
 index.js 안에 붙여넣으신 후 저장하시면 확인하실 수 있습니다. 
*/
import "./study/style.less";
import * as THREE from "three";

let renderer, scene, camera;

function init() {
	// create HTML canvas element
	const canvas = document.createElement("canvas");
	document.body.appendChild(canvas);

	// create renderer, scene, camera
	renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight
	);
	camera.position.set(0, 0, 10);

	// light
	const light = new THREE.DirectionalLight();
	light.position.set(1, 1, 1);
	scene.add(light);

	// sphere
	const sphere_geometry = new THREE.SphereGeometry();
	const material = new THREE.MeshPhongMaterial();
	const sphere = new THREE.Mesh(sphere_geometry, material);
	scene.add(sphere);

	render();
}

function render() {
	renderer.render(scene, camera);
	requestAnimationFrame(render);
}

init();
