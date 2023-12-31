/*
To refer to the lecture notes, please copy the contents below and paste them into index.js.
Once you save the file, you will be able to access and view the lecture notes.

강의 노트 파일입니다. 해당 노트 파일을 참조하시려면 아래 내용들을 복사한 뒤, 
 index.js 안에 붙여넣으신 후 저장하시면 확인하실 수 있습니다. 
*/
import { GenerateCanvas, GLTFLoader, THREE } from "../study/settings";

const canvas = GenerateCanvas();
let camera, scene, renderer, mixer, gltfObject;
let rocket;
let paintObject;
let hemiLight;
let actions = {};

function init() {
	camera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		1,
		2000
	);
	camera.position.set(100, 100, 100);
	camera.lookAt(-20, 0, -20);

	scene = new THREE.Scene();
	// scene.background = new THREE.Color( 0x86DB00 );

	renderer = new THREE.WebGLRenderer({
		antialias: true,
		canvas,
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;

	// tone mapping
	renderer.toneMapping = THREE.ACESFilmicToneMapping;

	window.addEventListener("resize", onWindowResize);

	// light
	const light = new THREE.DirectionalLight(0xffffff, 1);
	light.position.set(-1, 1, 0.5);
	light.castShadow = true;
	light.shadow.camera.top = 180;
	light.shadow.camera.bottom = -100;
	light.shadow.camera.left = -120;
	light.shadow.camera.right = 120;

	// soft shadow
	light.shadow.mapSize.width = 1024;
	light.shadow.mapSize.height = 1024;
	light.shadow.camera.near = 0.5;
	light.shadow.camera.far = 500;

	scene.add(light);

	// hemi light
	hemiLight = new THREE.HemisphereLight(0xffffff, 0x555555, 1);
	hemiLight.position.set(0, -1, 0);
	scene.add(hemiLight);

	// play gltf animation when click model
	const loader = new GLTFLoader();
	loader.load("/gltf/click.glb", function (gltf) {
		const model = gltf.scene;
		model.position.set(0, 0, 0);
		model.scale.set(0.1, 0.1, 0.1);
		scene.add(model);
		mixer = new THREE.AnimationMixer(model);

		rocket = model.getObjectByName("rocket");
		paintObject = model.getObjectByName("change");

		// change child material
		model.traverse(function (child) {
			if (child.isMesh) {
				child.material = new THREE.MeshStandardMaterial({
					color: child.material.color,
					roughness: 0.3,
				});
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});

		if (gltf.animations.length > 0) {
			let clips = [];

			console.log("original animation clips", gltf.animations);
			// split clips by names
			gltf.animations[0].tracks.forEach((track) => {
				const clip = clips.find(
					(clip) => clip.name == track.name.split(".")[0]
				);
				// if clip is exist
				if (clip) {
					clip.tracks.push(track);
				} else {
					//if not, make clip with their name
					const clip = new THREE.AnimationClip(track.name.split(".")[0], -1, [
						track,
					]);
					clips.push(clip);
				}
			});

			// split animation clips
			gltf.animations = clips;

			// link to actions
			clips.forEach((clip) => {
				actions[clip.name] = mixer.clipAction(clip);
				actions[clip.name].loop = THREE.LoopOnce;
			});

			// check animations
			console.log("Animations : ", actions);
		}

		gltfObject = gltf;

		render();
	});
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
	animate();
}

// type below
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("click", (event) => {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -1 * ((event.clientY / window.innerHeight) * 2 - 1);

	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(scene.children, true);

	if (intersects[0]) {
		const buttonColor = intersects[0].object.material.color;
		const rocketColor = scene.getObjectByName("change");

		const targetAction = actions[intersects[0].object.name];
		if (targetAction) {
			rocketColor.material.color = buttonColor;
			scene.background = buttonColor;
			targetAction.reset();
			targetAction.play();
		}
	}
});

const clock = new THREE.Clock();

function animate() {
	// 02. animate
	mixer.update(clock.getDelta());
	rocket.rotation.y += 0.01;
}

init();
