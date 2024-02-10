import {
	THREE,
	GLTFLoader,
	GenerateCanvas,
	MakeScrollArea,
} from "./study/settings";

const canvas = GenerateCanvas();
canvas.style.position = "fixed";
canvas.style.top = "0px";
canvas.style.left = "0px";

// scene variables
let camera, scene, renderer, mixer, anitime, action;

init();
render();

function init() {
	camera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		1,
		2000
	);
	camera.position.set(0, 0, 200);

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000);

	renderer = new THREE.WebGLRenderer({
		antialias: true,
		canvas,
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.shadowMap.enabled = true;

	// tone mapping
	renderer.toneMapping = THREE.ACESFilmicToneMapping;

	window.addEventListener("resize", onWindowResize);

	// dim hemisphere light
	const hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000, 0.01);
	hemiLight.position.set(0, 1, 0);
	scene.add(hemiLight);

	// play gltf model animation relative with scroll position 0 to 100 percent
	const loader = new GLTFLoader();
	// set path of gltf model "scroll/model.glb". after build, it will be "assets/scroll/model.glb"
	loader.load("/gltf/scroll.glb", function (gltf) {
        console.log('gltf: ', gltf);

		const model = gltf.scene;
		model.position.set(0, 0, 0);

		const ratio = 0.1;
		model.scale.set(ratio, ratio, ratio);
		mixer = new THREE.AnimationMixer(model);
		scene.add(model);

		action = mixer.clipAction(gltf.animations[0]);
		action.play();

		// set camera position, rotation, fov to gltf camera
		const cam = gltf.cameras[0];
		if (cam) {
			// multiply by ratio
			camera.position.set(
				cam.position.x * ratio,
				cam.position.y * ratio,
				cam.position.z * ratio
			);
			camera.rotation.set(cam.rotation.x, cam.rotation.y, cam.rotation.z);
			camera.fov = cam.fov;

            console.log('camera.position: ', camera.position);
		}

		// change children material
		gltf.scene.traverse(function (child) {
			if (child.isMesh) {
				child.material = new THREE.MeshPhysicalMaterial({
					color: child.material.color,
					emissive: child.material.emissive,
					roughness: 1,
				});
				// cast shadow
				child.castShadow = true;
				child.receiveShadow = true;
			}
			// add point light to gltf model named "noshadow"
			if (child.name.toLowerCase().includes("light")) {
				const light = new THREE.PointLight(0xffffff, 1, 200);
				light.position.set(
					child.position.x,
					child.position.y,
					child.position.z
				);
				child.add(light);

				const lightColor = new THREE.Color("hsl(40,100%,100%)");

				// change light color
				light.color = lightColor;

				// shadow
				light.castShadow = true;
				light.shadow.mapSize.width = 512;
				light.shadow.mapSize.height = 512;
				light.shadow.camera.near = 0.5;
				light.shadow.camera.far = 500;

				// soft
				light.shadow.radius = 10;

				// change material emission to 1
				child.material.emissive = lightColor;
			}

			if (child.name.toLowerCase().includes("noshadow")) {
				child.castShadow = false;
				child.receiveShadow = false;
			}
			if (child.name.toLowerCase().includes("glass")) {
				child.material = new THREE.MeshPhysicalMaterial({
					color: child.material.color,
					transmission: 1,
					roughness: 0.5,
					ior: 1.8,
					emissive: child.material.emissive,
				});

				// double sided
				child.material.side = THREE.DoubleSide;
			}
		});
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
}

// type below
// 01. get Scroll Wrapper
document.body.style.height = '3000px';

// 02. add EventListener to Scroll Wrapper HTML DOM Element
window.addEventListener('scroll', () => {
    if (!action) {
        return;
    }

    const currentScroll = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    const maxScroll = scrollHeight - windowHeight;

    let scrollPercent = currentScroll / maxScroll;
    scrollPercent = Math.max(0, Math.min(1, scrollPercent));

    const duration = action?.getClip().duration;
    action.time = duration * scrollPercent;
    mixer.update(0);
});
