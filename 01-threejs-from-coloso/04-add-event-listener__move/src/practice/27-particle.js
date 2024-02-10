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

function render() {
	requestAnimationFrame(render);
	controls.update();

	//02. move particles

	renderer.render(scene, camera);
}
