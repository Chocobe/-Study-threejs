/*
To refer to the lecture notes, please copy the contents below and paste them into index.js.
Once you save the file, you will be able to access and view the lecture notes.

강의 노트 파일입니다. 해당 노트 파일을 참조하시려면 아래 내용들을 복사한 뒤, 
 index.js 안에 붙여넣으신 후 저장하시면 확인하실 수 있습니다. 
*/
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { GUI } from "three/examples/jsm/libs/dat.gui.module";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";

const gui = new GUI();

let controls, mixer, composer;

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;

const camera = new THREE.PerspectiveCamera(
	35,
	window.innerWidth / window.innerHeight
);
const scene = new THREE.Scene();
let backgroundColor = new THREE.Color(0x080042);
scene.background = backgroundColor;

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
	size: 3,
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
	const model = gltf.scene;
	scene.add(model);

	const gltfCamera = gltf.cameras[0];
	camera.position.copy(gltfCamera.position);
	camera.rotation.copy(gltfCamera.rotation);

	controls = new OrbitControls(camera, canvas);
	controls.enableDamping = true;
	controls.update();

	mixer = new THREE.AnimationMixer(gltf.scene);
	const action = mixer.clipAction(gltf.animations[0]);
	action.play();

	const materials = {};
	/*
	materials = {
		"purple" : {
			color:0xdddddd,
			emissivie:0xdddddd
		},
	}
	*/
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
	console.log(materials);
	console.log(Object.entries(materials));
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

	gui
		.addColor(
			{ backgroundColor: "#" + scene.background.getHexString() },
			"backgroundColor"
		)
		.name("background-color")
		.onChange((color) => {
			scene.background = new THREE.Color(color);
		});

	const pointLight = new THREE.PointLight(0xffffff, 0.3);
	scene.getObjectByName("ball").add(pointLight);
	pointLight.position.set(0, 2, 0);
	pointLight.castShadow = true;
	pointLight.shadow.radius = 5;
	pointLight.shadow.blurSamples = 25;
	pointLight.shadow.camera.zoom = 0.6;

	postprocessing();
	render();
});

const clock = new THREE.Clock();

function postprocessing() {
	composer = new EffectComposer(renderer);
	composer.addPass(new RenderPass(scene, camera));
	const bloomPass = new UnrealBloomPass(
		new THREE.Vector2(window.innerWidth, window.innerHeight),
		0.8,
		1.3,
		0.9
	);
	composer.addPass(bloomPass);

	const ratio = window.devicePixelRatio * 2;
	composer.setSize(window.innerWidth * ratio, window.innerHeight * ratio);
	composer.setPixelRatio(ratio);

	composer.antialias = true;
}

function render() {
	requestAnimationFrame(render);
	composer.render();
	controls.update();
	mixer.update(clock.getDelta() * 0.5);
}
