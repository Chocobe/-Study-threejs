/*
To refer to the lecture notes, please copy the contents below and paste them into index.js.
Once you save the file, you will be able to access and view the lecture notes.

강의 노트 파일입니다. 해당 노트 파일을 참조하시려면 아래 내용들을 복사한 뒤, 
 index.js 안에 붙여넣으신 후 저장하시면 확인하실 수 있습니다. 
*/
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// add gui
import { GUI } from "three/examples/jsm/libs/dat.gui.module";

// const gui = new GUI();
let mixer;
let isDay = true;

const colors = {
	white: 0xffffff,
	blue: 0x11ff,
	green: 0x13c200,
	brown: 0xff2d00,
};

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const renderer = new THREE.WebGLRenderer({
	antialias: true,
	canvas,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 3;

const camera = new THREE.PerspectiveCamera(
	35,
	window.innerWidth / window.innerHeight
);
const scene = new THREE.Scene();
scene.background = new THREE.Color("#5ddad2");

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
scene.add(hemiLight);

const loader = new GLTFLoader();
loader.load("/gltf/scene-2.glb", (gltf) => {
	console.log("gltf", gltf);
	const model = gltf.scene;
	scene.add(model);

	camera.position.copy(gltf.cameras[0].position);
	const controls = new OrbitControls(camera, canvas);
	controls.enableDamping = true;
	controls.target.set(0, camera.position.y, 0);
	controls.update();

	model.traverse((child) => {
		if (child.isMesh) {
			child.material.metalness = 0;
			console.log(child.name);

			if (child.name == "colorize" || child.name == "theme") {
			} else {
				child.material = new THREE.MeshBasicMaterial({
					map: child.material.map,
				});
			}
		}
	});

	scene.getObjectByName("night").visible = false;
	scene.getObjectByName("colorize").material.color.set(colors.brown);
	scene.getObjectByName("theme").material.color.set(colors.green);

	// const color = {
	// 	colorA: 0xffffff,
	// };
	// gui.addColor(color, "colorA").onChange((color) => {
	// 	scene.getObjectByName("colorize").material.color.set(color);
	// });

	// animation
	mixer = new THREE.AnimationMixer(gltf.scene);
	const tracks = gltf.animations[0].tracks;
	const animations = {};

	tracks.forEach((track) => {
		const name = track.name.split(".")[0];

		if (!animations[name]) {
			animations[name] = [];
		}

		animations[name].push(track);
	});

	const clips = [];
	Object.entries(animations).forEach((animation) => {
		const name = animation[0];
		const track = animation[1];
		const clip = new THREE.AnimationClip(name, -1, track);
		clips.push(clip);
	});

	gltf.animations = clips;

	addEventListener("click", (event) => {
		const raycaster = new THREE.Raycaster();
		const mouse = new THREE.Vector2();

		mouse.x = (event.clientX / window.innerWidth - 0.5) * 2;
		mouse.y = (event.clientY / window.innerHeight - 0.5) * -2;

		raycaster.setFromCamera(mouse, camera);
		const intersects = raycaster.intersectObjects(gltf.scene.children, true);

		if (intersects.length > 0) {
			const name = intersects[0].object.name;
			console.log(name);

			playAnimation(name);

			if (name === "color_2") {
				scene.getObjectByName("colorize").material.color.set(colors.white);
			}
			if (name === "color_3") {
				scene.getObjectByName("colorize").material.color.set(colors.brown);
			}
			if (name === "color") {
				scene.getObjectByName("colorize").material.color.set(colors.green);
			}
			if (name === "color_1") {
				scene.getObjectByName("colorize").material.color.set(colors.blue);
			}
			if (name === "button_left" || name === "button_right") {
				isDay = !isDay;

				if (isDay) {
					scene.getObjectByName("day").visible = true;
					scene.getObjectByName("night").visible = false;
					scene.getObjectByName("theme").material.color.set(colors.green);
				} else {
					scene.getObjectByName("day").visible = false;
					scene.getObjectByName("night").visible = true;
					scene.getObjectByName("theme").material.color.set(colors.blue);
				}
			}
			if (name === "button") {
				playAnimation("rocket");
			}
		}
	});

	function playAnimation(name) {
		const clip = gltf.animations.find((animation) => {
			return animation.name === name;
		});

		if (clip) {
			const action = mixer.clipAction(clip);
			action.stop();
			action.loop = THREE.LoopOnce;
			action.clampWhenFinished = true;
			action.play();
		}
	}

	render();
});

const clock = new THREE.Clock();

function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
	mixer.update(clock.getDelta());
}
