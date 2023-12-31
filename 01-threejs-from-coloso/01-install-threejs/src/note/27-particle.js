/*
To refer to the lecture notes, please copy the contents below and paste them into index.js.
Once you save the file, you will be able to access and view the lecture notes.

강의 노트 파일입니다. 해당 노트 파일을 참조하시려면 아래 내용들을 복사한 뒤, 
 index.js 안에 붙여넣으신 후 저장하시면 확인하실 수 있습니다. 
*/
import {
	GenerateCanvas,
	THREE,
	OrbitControls,
	GLTFLoader,
	CreateParticles,
} from "../study/settings";

const canvas = GenerateCanvas();
let camera, scene, renderer, controls;
let model;

//colors
const dark = new THREE.Color("hsl(280,100%,0%)");

init();

function init() {
	renderer = new THREE.WebGLRenderer({
		antialias: true,
		canvas,
	});
	camera = new THREE.PerspectiveCamera(
		30,
		window.innerWidth / window.innerHeight,
		1,
		3000
	);
	camera.position.set(30, 0, 30);
	scene = new THREE.Scene();
	scene.background = dark;
	scene.fog = new THREE.Fog(dark, 40, 80);

	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.outputEncoding = THREE.sRGBEncoding;

	// attach camera to orbit controls
	controls = new OrbitControls(camera, renderer.domElement);
	controls.target.set(0, 0, 0);
	controls.enableDamping = true;

	// controls distance is 50
	controls.minDistance = 50;
	controls.maxDistance = 50;

	// gltf load
	let loader = new GLTFLoader();

	loader.load("/gltf/particle.glb", function (gltf) {
		model = gltf.scene;
		const ratio = 0.15;
		model.scale.set(ratio, ratio, ratio);
		model.position.set(0, -40, 0);
		model.rotation.set(0, 0, 0);
		scene.add(model);

		// change material
		model.traverse(function (child) {
			if (child.isMesh) {
				// physical material with bump map
				let mat = new THREE.MeshPhysicalMaterial({
					color: 0xffffff,
					roughness: 0.8,
					bumpMap: child.material.normalMap,
					bumpScale: 0.1,
				});
				child.material = mat;
			}
		});

		render();
	});
	// add rim light
	let rimLight = new THREE.DirectionalLight(0xffffff, 1);
	rimLight.position.set(-0.1, 0, -1);
	scene.add(rimLight);

	// add point light
	let pointLight = new THREE.PointLight("hsl(180,50%,60%)", 5, 50);
	pointLight.position.set(0, 30, 0);
	scene.add(pointLight);

	// indirectional light
	let directionalLight = new THREE.DirectionalLight("hsl(200,50%,50%)", 0.1);
	directionalLight.position.set(-0.5, 1, 0);
	scene.add(directionalLight);
}

//01. create Particle
let positions = [];

for (let i = 0; i < 1000; i++) {
	positions.push((Math.random() * 2 - 1) * 30); // x // -1 ~ 1 -> -30 ~ 30
	positions.push((Math.random() * 2 - 1) * 30); // y
	positions.push((Math.random() * 2 - 1) * 30); // z
}

const particlePosition = new THREE.BufferGeometry();
particlePosition.setAttribute(
	"position",
	new THREE.BufferAttribute(new Float32Array(positions), 3)
);

const particleMaterial = new THREE.PointsMaterial({
	size: 0.5,
	map: new THREE.TextureLoader().load("/particle/circle.png"),
	color: new THREE.Color("hsl(200,50%,70%)"),
	transparent: true,
	blending: THREE.AdditiveBlending,
	depthWrite: false,
});
const particle = new THREE.Points(particlePosition, particleMaterial);
scene.add(particle);

let cloudPositions = [];

for (let i = 0; i < 300; i++) {
	cloudPositions.push((Math.random() * 2 - 1) * 50); // x // -1 ~ 1 -> -30 ~ 30
	cloudPositions.push((Math.random() * 2 - 1) * 10); // y
	cloudPositions.push((Math.random() * 2 - 1) * 50); // z
}

const cloudParticlePosition = new THREE.BufferGeometry();
cloudParticlePosition.setAttribute(
	"position",
	new THREE.BufferAttribute(new Float32Array(cloudPositions), 3)
);

const cloudParticleMaterial = new THREE.PointsMaterial({
	size: 80,
	map: new THREE.TextureLoader().load("/particle/cloud.png"),
	color: new THREE.Color("hsl(200,50%,50%)"),
	transparent: true,
	blending: THREE.AdditiveBlending,
	depthWrite: false,
	opacity: 0.02,
});
const cloudParticle = new THREE.Points(
	cloudParticlePosition,
	cloudParticleMaterial
);
scene.add(cloudParticle);

let time = 0;
console.log(particlePosition);

function render() {
	requestAnimationFrame(render);
	controls.update();

	time += 0.002;

	//02. move particles
	particle.rotation.y += 0.001;
	cloudParticle.rotation.y += 0.002;

	for (let i = 0; i < 1000; i++) {
		const yIndex = i * 3 + 1;
		particlePosition.attributes.position.array[yIndex] =
			positions[yIndex] + 10 * Math.sin(i + time);
	}
	particlePosition.attributes.position.needsUpdate = true;

	renderer.render(scene, camera);
}
