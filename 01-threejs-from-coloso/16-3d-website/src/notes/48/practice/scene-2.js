import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

let mixer;
let isDay = true;
let renderer, camera, controls;

let cameraPosition;

const colors = {
	white: 0xffffff,
	blue: 0x11ff,
	green: 0x13c200,
	brown: 0xff2d00,
};

const scene = new THREE.Scene();

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
scene.add(hemiLight);

const loader = new GLTFLoader();
function init() {
	loader.load("./gltf/scene-2.glb", (gltf) => {
		scene.position.set(300, 0, 0);
		const model = gltf.scene;
		scene.add(model);

		cameraPosition = gltf.cameras[0].position;
		cameraPosition.add(scene.position); // vector3

		model.traverse((child) => {
			if (child.isMesh) {
				child.material.metalness = 0;

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

		["click", "touchstart"].forEach((evt) => {
			addEventListener(evt, (event) => {
				const raycaster = new THREE.Raycaster();
				const mouse = new THREE.Vector2();

				let pointerEvent;
				if (event.clientX) {
					pointerEvent = event;
				} else {
					pointerEvent = event.touches[0];
				}

				mouse.x = (pointerEvent.clientX / window.innerWidth - 0.5) * 2;
				mouse.y = (pointerEvent.clientY / window.innerHeight - 0.5) * -2;

				raycaster.setFromCamera(mouse, camera);
				const intersects = raycaster.intersectObjects(
					gltf.scene.children,
					true
				);

				if (intersects.length > 0) {
					const name = intersects[0].object.name;

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
		loading();
	});
}

const clock = new THREE.Clock();

function render() {
	controls.update();
	renderer.render(scene, camera);
	mixer.update(clock.getDelta());
}

export class Scene_2 {
	constructor(renderer_, camera_, controls_) {
		this.backgroundColor = "#5ddad2";
		this.title = "my workspace";
		this.tooltip = "click color pallete, arrows and green space bar";
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
		renderer.toneMappingExposure = 3;
		move(camera.position, cameraPosition);
		move(
			controls.target,
			new THREE.Vector3(scene.position.x, cameraPosition.y, scene.position.z)
		);

		setTimeout(() => {
			renderer.setAnimationLoop(render);
		}, 1000); // gsap duration 2000ms
	}

	stop() {}
}
