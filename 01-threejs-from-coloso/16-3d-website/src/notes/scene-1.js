/*
To refer to the lecture notes, please copy the contents below and paste them into index.js.
Once you save the file, you will be able to access and view the lecture notes.

강의 노트 파일입니다. 해당 노트 파일을 참조하시려면 아래 내용들을 복사한 뒤, 
 index.js 안에 붙여넣으신 후 저장하시면 확인하실 수 있습니다. 
*/
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let controls;
let mixer, action;

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 5;

const camera = new THREE.PerspectiveCamera(
	35,
	window.innerWidth / window.innerHeight
);
const scene = new THREE.Scene();
scene.background = new THREE.Color("hsl(255,70%,40%)");

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const loader = new GLTFLoader();
loader.load("/gltf/scene-1.glb", (gltf) => {
	scene.add(gltf.scene);

	console.log(gltf);
	camera.position.copy(gltf.cameras[0].position);
	camera.rotation.copy(gltf.cameras[0].rotation);

	controls = new OrbitControls(camera, canvas);

	gltf.scene.traverse((child) => {
		if (child.isMesh) {
			child.material.metalness = 0;
		}
	});

	cameraPosition = gltf.cameras[0].position;

	mixer = new THREE.AnimationMixer(gltf.scene);
	action = mixer.clipAction(gltf.animations[0]);
	action.loop = THREE.LoopOnce;
	action.play();
	action.time = 0;
	mixer.update(0);

	addEventListener("click", (event) => {
		const raycaster = new THREE.Raycaster();
		const mouse = new THREE.Vector2();

		// event.clientX event.clienY
		mouse.x = (event.clientX / window.innerWidth - 0.5) * 2; // -1 ~ 1
		mouse.y = (event.clientY / window.innerHeight - 0.5) * -2; // 1 ~ -1

		raycaster.setFromCamera(mouse, camera);
		const intersects = raycaster.intersectObjects(gltf.scene.children, true);

		// button name : play_171
		if (intersects.length > 0 && intersects[0].object.name === "play_171") {
			play = true;
			action.reset();
		}
	});

	addEventListener("resize", (event) => {
		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
	});

	render();
});

const clock = new THREE.Clock();
let play = false;

function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
	if (play) mixer.update(clock.getDelta());
}
