import { GenerateCanvas, GLTFLoader, THREE } from "./study/settings";

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

window.addEventListener('click', e => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    // if (intersects[0]) {
    //     const color = intersects[0].object.material.color;

    //     rocket.material.color = color;
    //     scene.background = color;

    //     console.log('intersects[0]: ', intersects[0]);
    // }
    if (intersects[0]) {
        const targetAction = actions[intersects[0].object.name]

		console.log('intersects[0]: ', intersects[0]);
		console.log('targetAction: ', targetAction);

		if (!targetAction) {
			return;
		}

		const buttonColor = intersects[0].object.material.color;

        const rocketModel = scene.getObjectByName('change');
        rocketModel.material.color = buttonColor;
		scene.background = buttonColor;

		targetAction.reset();
		targetAction.play();
    }

    // console.group('onClick()');
    // console.log('[e.clientX, e.clientY]: ', [e.clientX, e.clientY]);
    // console.log('[mouse.x, mouse.y]: ', mouse.x, mouse.y);
    // console.log('intersects: ', intersects);
    // console.groupEnd();
});

function animate() {
	// 02. animate

    rocket.rotation.y += 0.01;
	mixer.update(1 / 60);
}

init();
