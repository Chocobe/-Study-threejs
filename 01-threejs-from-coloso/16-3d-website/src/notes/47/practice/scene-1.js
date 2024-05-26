import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

let renderer, camera, controls;
let mixer, action;

let cameraPosition;

const scene = new THREE.Scene();

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const loader = new GLTFLoader();
function init() {
	loader.load("/gltf/scene-1.glb", (gltf) => {
		scene.add(gltf.scene);

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

		loading();
	});
}

const clock = new THREE.Clock();
let play = false;

function render() {
	controls.update();
	renderer.render(scene, camera);
	if (play) mixer.update(clock.getDelta());
}

export class Scene_1 {
	constructor(renderer_, camera_, controls_) {
		this.backgroundColor = "hsl(255, 70%, 40%)";
		this.title = "icon land";
		this.tooltip = "click play button";
		renderer = renderer_;
		camera = camera_;
		controls = controls_;
		this.setup();
	}

	setup() {
		init();
	}

	start() {
		renderer.outputEncoding = THREE.sRGBEncoding;
		renderer.toneMapping = THREE.ReinhardToneMapping;
		renderer.toneMappingExposure = 5;
		move(camera.position, cameraPosition);
		move(controls.target, scene.position);

		setTimeout(() => {
			renderer.setAnimationLoop(render);
		}, 1000); // gsap duration 2000ms
	}

	stop() {}
}
