/*
To refer to the lecture notes, please copy the contents below and paste them into index.js.
Once you save the file, you will be able to access and view the lecture notes.

강의 노트 파일입니다. 해당 노트 파일을 참조하시려면 아래 내용들을 복사한 뒤, 
 index.js 안에 붙여넣으신 후 저장하시면 확인하실 수 있습니다. 
*/
import "./study/style.less";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let renderer, scene, camera, controls;

function init() {
	const canvas = document.createElement("canvas");
	document.body.appendChild(canvas);

	renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera();
	camera.fov = 45;
	camera.aspect = window.innerWidth / window.innerHeight;
	// camera.near = 16.8;
	// camera.far = 17;
	camera.updateProjectionMatrix();

	camera.position.set(5, 5, 5);

	controls = new OrbitControls(camera, canvas);
	// controls.enableRotate = false;
	// controls.enableZoom = false;
	controls.enablePan = false;
	controls.enableDamping = true;

	const light = new THREE.DirectionalLight();
	light.position.set(1, 1, 1);
	scene.add(light);

	// sphere
	// const geometry = new THREE.SphereGeometry();
	const geometry = new THREE.BoxGeometry();
	const material = new THREE.MeshPhongMaterial();
	const mesh = new THREE.Mesh(sphere_geometry, material);
	scene.add(mesh);

	render();
}

function render() {
	renderer.render(scene, camera);
	controls.update();
	requestAnimationFrame(render);
}

init();
