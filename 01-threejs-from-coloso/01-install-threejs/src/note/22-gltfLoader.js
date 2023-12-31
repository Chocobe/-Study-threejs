/*
To refer to the lecture notes, please copy the contents below and paste them into index.js.
Once you save the file, you will be able to access and view the lecture notes.

강의 노트 파일입니다. 해당 노트 파일을 참조하시려면 아래 내용들을 복사한 뒤, 
 index.js 안에 붙여넣으신 후 저장하시면 확인하실 수 있습니다. 
*/
import {
	THREE,
	OrbitControls,
	RGBELoader,
	GenerateCanvas,
	GLTFLoader,
} from "./study/settings";

const canvas = GenerateCanvas();
let renderer, scene, camera, controls, gltfModel, mixer;

function init() {
	renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
	renderer.shadowMap.enabled = true;

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(
		32,
		window.innerWidth / window.innerHeight
	);
	camera.position.set(0, 0, 30);
	controls = new OrbitControls(camera, canvas);

	const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
	directionalLight.position.set(10, 10, 10);
	scene.add(directionalLight);

	directionalLight.castShadow = true;
	directionalLight.shadow.mapSize.width = 2048;
	directionalLight.shadow.mapSize.height = 2048;
	directionalLight.shadow.radius = 8;

	const sphere = new THREE.SphereGeometry();
	const material = new THREE.MeshStandardMaterial();
	const mesh = new THREE.Mesh(sphere, material);
	// scene.add(mesh);

	// start gltf load (type below)
	const loader = new GLTFLoader();
	loader.load("/gltf/rocket.glb", (gltf) => {
		const model = gltf.scene;
		console.log(gltf);
		model.traverse((obj) => {
			if (obj.isMesh) {
				obj.castShadow = true;
				obj.receiveShadow = true;
				obj.material.metalness = 0;
			}
		});

		gltfModel = model;
		scene.add(model);

		mixer = new THREE.AnimationMixer(model);
		gltf.animations.forEach((clip) => {
			mixer.clipAction(clip).play();
		});

		render();
	});
	// end gltf load
}

function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
	controls.update();

	animate();
}

function animate() {
	if (mixer) {
		mixer.update(1 / 60);
	}
	// gltfModel.rotation.y += 0.01; //gltfModel.rotation.y = gltfModel.rotation.y + 0.1
}

init();
