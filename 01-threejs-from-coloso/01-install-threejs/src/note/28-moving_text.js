/*
To refer to the lecture notes, please copy the contents below and paste them into index.js.
Once you save the file, you will be able to access and view the lecture notes.

강의 노트 파일입니다. 해당 노트 파일을 참조하시려면 아래 내용들을 복사한 뒤, 
 index.js 안에 붙여넣으신 후 저장하시면 확인하실 수 있습니다. 
*/
import { GenerateCanvas, THREE, GLTFLoader } from "../study/settings";

const canvas = GenerateCanvas();
let camera, scene, renderer;
let materials = [];

init();

function init() {
	camera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight
	);
	camera.position.set(0, 0, 200);

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000);

	// add fog
	scene.fog = new THREE.Fog(0x000000, 80, 120);
	scene.add(camera);
	// set cam target
	camera.lookAt(0, 0, 0);

	renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;

	// load gltf
	const loader = new GLTFLoader();
	loader.load("/gltf/moving_text.glb", (gltf) => {
		const model = gltf.scene;
		model.position.set(0, 0, 0);
		model.scale.set(0.1, 0.1, 0.1);
		scene.add(model);

		// change child material
		model.traverse((child) => {
			if (child.isCamera) {
				camera.position.copy(child.position);
				camera.rotation.copy(child.rotation);
				camera.position.z *= 0.1;
			}
			if (child.isMesh) {
				// 01. search text material and bind to mats
				console.log(child);
				// 01-a. Array method : push()
				materials.push(child.material);
			}
		});

		console.log(materials);

		render();
	});
}

window.addEventListener("resize", onWindowResize);

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

//type below
function render() {
	requestAnimationFrame(render);
	// 02. animate UV in mats
	materials.forEach((material) => {
		material.emissiveMap.offset.y -= 0.0003;
	});

	renderer.render(scene, camera);
}
