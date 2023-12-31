/*
To refer to the lecture notes, please copy the contents below and paste them into index.js.
Once you save the file, you will be able to access and view the lecture notes.

강의 노트 파일입니다. 해당 노트 파일을 참조하시려면 아래 내용들을 복사한 뒤, 
 index.js 안에 붙여넣으신 후 저장하시면 확인하실 수 있습니다. 
*/
import {
	GenerateCanvas,
	THREE,
	GLTFLoader,
	OrbitControls,
} from "../study/settings";

let camera, scene, renderer, controls;
let hemiLight, dirLight;
const canvas = GenerateCanvas();

let models = {};

function init() {
	camera = new THREE.PerspectiveCamera(
		30,
		window.innerWidth / window.innerHeight,
		1,
		2000
	);
	camera.position.set(0, 0, 100);
	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer({
		antialias: true,
		canvas,
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.shadowMap.enabled = true;

	// large contrast renderer
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1;

	controls = new OrbitControls(camera, canvas);
	controls.enableRotate = false;

	window.addEventListener("resize", onWindowResize);

	// load gltf
	const loader = new GLTFLoader();
	loader.load("/gltf/clock.glb", function (gltf) {
		const model = gltf.scene;
		const ratio = 0.1;
		model.position.set(0, 0, 0);
		model.scale.set(ratio, ratio, ratio);
		scene.add(model);

		// add hemisphere light

		hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000, 0.5);
		hemiLight.position.set(0, 1, 0);
		scene.add(hemiLight);

		// add directional light
		dirLight = new THREE.DirectionalLight(0xffffff, 1);
		dirLight.position.set(0, 1, 1);

		// shadow
		dirLight.castShadow = true;
		dirLight.shadow.mapSize.width = 2048;
		dirLight.shadow.mapSize.height = 2048;
		dirLight.shadow.camera.left = -100;
		dirLight.shadow.camera.right = 100;
		dirLight.shadow.camera.top = 100;
		dirLight.shadow.camera.bottom = -100;
		dirLight.shadow.radius = 2;

		scene.add(dirLight);

		// change child material
		model.traverse(function (child) {
			// model names
			const modelNames = ["hour", "min", "sec", "orbit", "right", "left"];
			// match model name
			modelNames.forEach((name) => {
				if (child.name.toLowerCase().includes(name)) {
					models[name] = child;
				}
			});

			if (child.isMesh) {
				const originalMat = child.material;
				child.material = new THREE.MeshPhysicalMaterial({
					color: originalMat.color,
					roughness: originalMat.roughness,
				});
				// cast shadow
				child.castShadow = true;
				child.receiveShadow = true;
			}

			// set default camera position and angle to gltf camera
			if (child.name.toLowerCase().includes("camera")) {
				// set camera position and multiply by ratio
				camera.position.set(
					child.position.x * ratio,
					child.position.y * ratio,
					child.position.z * ratio
				);
				camera.rotation.set(
					child.rotation.x,
					child.rotation.y,
					child.rotation.z
				);
			}
		});

		setTime();
		render();
	});
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

// type below
// Adobe Color : https://color.adobe.com/ko/create/color-wheel

const colors = {
	day: {
		sky: "hsl(45,100%,60%)",
		ground: "hsl(10,100%,50%)",
		background: "hsl(20,80%,10%)",
	},
	night: {
		sky: "#ffffff",
		ground: "hsl(180,80%,25%)",
		background: "hsl(200,80%,15%)",
	},
};

function setTime() {
	const hour = scene.getObjectByName("hour");
	const min = scene.getObjectByName("min");
	const sec = scene.getObjectByName("sec");
	const orbit = scene.getObjectByName("orbit");

	const date = new Date();
	const hourRate = date.getHours() / 24;
	const minRate = date.getMinutes() / 60;
	const secRate = date.getSeconds() / 60;

	hour.rotation.z = -(Math.PI * 2) * 2 * hourRate;
	min.rotation.z = -(Math.PI * 2) * minRate;
	sec.rotation.z = -(Math.PI * 2) * secRate;
	orbit.rotation.y = -(Math.PI * 2) * hourRate;

	let currentSky, currentGround, currentBackground;

	if (date.getHours() > 6 && date.getHours() < 18) {
		//day
		currentSky = colors.day.sky;
		currentGround = colors.day.ground;
		currentBackground = colors.day.background;
	} else {
		// night
		currentSky = colors.night.sky;
		currentGround = colors.night.ground;
		currentBackground = colors.night.background;
	}

	scene.background = new THREE.Color(currentBackground);
	hemiLight.color = new THREE.Color(currentSky);
	hemiLight.groundColor = new THREE.Color(currentGround);
}

function render() {
	setTime();
	requestAnimationFrame(render);
	controls.update();
	renderer.render(scene, camera);
}

init();
