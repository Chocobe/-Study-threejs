/*
To refer to the lecture notes, please copy the contents below and paste them into index.js.
Once you save the file, you will be able to access and view the lecture notes.

강의 노트 파일입니다. 해당 노트 파일을 참조하시려면 아래 내용들을 복사한 뒤, 
 index.js 안에 붙여넣으신 후 저장하시면 확인하실 수 있습니다. 
*/
import { THREE, GLTFLoader, GenerateCanvas } from "../study/settings";

const canvas = GenerateCanvas();

let camera, scene, renderer, mesh;
let originPosition;

function init() {
	renderer = new THREE.WebGLRenderer({
		antialias: true,
		canvas,
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	camera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		0.1,
		3000
	);
	camera.position.set(0, 0, 0);

	// gamma
	renderer.gammaFactor = 2.2;

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000);

	// add new group
	const group = new THREE.Group();
	group.position.copy(camera.position);
	group.rotation.copy(camera.rotation);
	scene.add(group);

	group.add(camera);

	// add gltf model
	const loader = new GLTFLoader();

	loader.load("/gltf/move.glb", function (gltf) {
		mesh = gltf.scene;
		mesh.position.set(0, 0, 0);

		const ratio = 0.1;
		mesh.scale.set(ratio, ratio, ratio);
		scene.add(mesh);

		// set default camera position to gltf camera
		const cam = gltf.cameras[0];
		// multiply by ratio
		camera.position.set(
			cam.position.x * ratio,
			cam.position.y * ratio,
			cam.position.z * ratio
		);
		camera.rotation.set(cam.rotation.x, cam.rotation.y, cam.rotation.z);
		originPosition = camera.position.clone();

		// change child material
		mesh.traverse((child) => {
			if (child.isMesh) {
				if (child.name == "light") {
					child.material = new THREE.MeshBasicMaterial({
						color: 0xffffff,
					});
					// double sided
					child.material.side = THREE.DoubleSide;
				} else {
					child.material = new THREE.MeshStandardMaterial({
						color: 0xffffff,
						roughness: 0.5,
					});
				}
			}
		});

		render();
	});

	// add point light
	const pointLight = new THREE.PointLight(0xffffff, 1);
	pointLight.position.set(0, 0, 0);
	scene.add(pointLight);

	// hemi light
	const hemiLight = new THREE.HemisphereLight(0x000000, 0xffffff, 0.3);
	hemiLight.position.set(1, 0, 1);
	scene.add(hemiLight);
}

function render() {
	animate();
	renderer.render(scene, camera);
	requestAnimationFrame(render);
}

// window resize event
window.addEventListener("resize", onWindowResize);
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

// ** type below

// 01. make variables
const keyPressed = {
	forward: false,
	backward: false,
};

// 02. add events
window.addEventListener("keydown", (event) => {
	if (event.code == "KeyW") keyPressed.forward = true;
	if (event.code == "KeyS") keyPressed.backward = true;
});

window.addEventListener("keyup", (event) => {
	if (event.code == "KeyW") keyPressed.forward = false;
	if (event.code == "KeyS") keyPressed.backward = false;
});

// 03. make movement
function animate() {
	// a. checking key pressed
	if (keyPressed.forward == true) {
		camera.position.z -= 4;
	}
	if (keyPressed.backward == true) {
		camera.position.z += 4;
	}

	// b. check current position
	if (camera.position.z < -45) {
		camera.position.z = 1934;
	}

	if (camera.position.z > 1966) {
		camera.position.z = 1966;
	}
}

// ** end
init();
