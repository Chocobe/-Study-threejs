import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { GUI } from "three/examples/jsm/libs/dat.gui.module";

const gui = new GUI();

let mixer;
let renderer, camera, controls;
let cameraPosition;

const scene = new THREE.Scene();

function init() {
	const dirLight = new THREE.DirectionalLight(0xffffff, 0.55);
	dirLight.position.set(-5, 10, 10);
	const hemiLight = new THREE.HemisphereLight(0x000000, 0xffffff, 0.2);
	hemiLight.position.set(0, 1, 0);

	const backLight = new THREE.DirectionalLight(0xffffff, 2);
	backLight.position.set(0, 10, -10);
	backLight.target = camera;

	scene.add(dirLight);
	scene.add(hemiLight);
	scene.add(backLight);

	const particleGeo = new THREE.BufferGeometry();
	const particleMat = new THREE.PointsMaterial({
		size: 1,
		color: 0xffffff,
		blending: THREE.AdditiveBlending,
		transparent: true,
		depthWrite: false,
		map: new THREE.TextureLoader().load("/misc/sphere.png"),
	});

	const particlePoses = [];
	const particleRadius = 30;
	for (let i = 0; i < 300; i++) {
		particlePoses.push(2 * (Math.random() - 0.5) * particleRadius); // x
		particlePoses.push(2 * (Math.random() - 0.5) * particleRadius); // y
		particlePoses.push(2 * (Math.random() - 0.5) * particleRadius); // z
	}
	particleGeo.setAttribute(
		"position",
		new THREE.BufferAttribute(new Float32Array(particlePoses), 3)
	);
	const particle = new THREE.Points(particleGeo, particleMat);
	scene.add(particle);

	const loader = new GLTFLoader();
	loader.load("/gltf/scene-3.glb", (gltf) => {
		scene.position.set(300, 300, 0);
		const model = gltf.scene;
		scene.add(model);

		const gltfCamera = gltf.cameras[0];
		cameraPosition = gltfCamera.position;
		cameraPosition.add(scene.position);

		mixer = new THREE.AnimationMixer(gltf.scene);
		const action = mixer.clipAction(gltf.animations[0]);
		action.play();

		const materials = {};

		model.traverse((child) => {
			if (child.isMesh) {
				const material = child.material;
				materials[material.name] = {
					color: "#" + material.color.getHexString(),
					emissive: "#" + material.emissive.getHexString(),
					material: material,
				};

				child.castShadow = child.receiveShadow = true;

				if (material.name === "glass") {
					child.material = new THREE.MeshPhysicalMaterial({
						transparent: true,
						transmission: 1,
						roughness: 0.5,
					});
					child.castShadow = child.receiveShadow = false;
				}
			}
		});
		const guiColor = gui.addFolder("color");
		const guiEmissive = gui.addFolder("emissive");
		Object.entries(materials).forEach((material) => {
			guiColor
				.addColor(material[1], "color")
				.name(material[0])
				.onChange((color) => {
					material[1].material.color = new THREE.Color(color);
				});

			guiEmissive
				.addColor(material[1], "emissive")
				.name(material[0])
				.onChange((color) => {
					material[1].material.emissive = new THREE.Color(color);
				});
		});

		const pointLight = new THREE.PointLight(0xffffff, 0.3);
		scene.getObjectByName("ball").add(pointLight);
		pointLight.position.set(0, 2, 0);
		pointLight.castShadow = true;
		pointLight.shadow.radius = 5;
		pointLight.shadow.blurSamples = 25;
		pointLight.shadow.camera.zoom = 0.6;

		loading();
	});
}

const clock = new THREE.Clock();

function render() {
	renderer.render(scene, camera);
	controls.update();
	mixer.update(clock.getDelta() * 0.5);
}

export class Scene_3 {
	constructor(renderer_, camera_, controls_) {
		this.backgroundColor = "#080042";
		this.title = "space";
		this.tooltip = "click and customize stars with toolbar";
		renderer = renderer_;
		camera = camera_;
		controls = controls_;
		this.setup();
	}

	setup() {
		init();
		gui.hide();
	}

	start() {
		renderer.outputEncoding = THREE.LinearEncoding;
		renderer.toneMapping = THREE.NoToneMapping;
		renderer.toneMappingExposure = 1;
		move(camera.position, cameraPosition);
		move(controls.target, scene.position);
		gui.show();

		setTimeout(() => {
			renderer.setAnimationLoop(render);
		}, 1000); // gsap duration 2000ms
	}

	stop() {
		gui.hide();
	}
}
