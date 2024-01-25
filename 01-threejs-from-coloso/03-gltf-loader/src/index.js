import { THREE, OrbitControls, GenerateCanvas } from "./study/settings";
import {
    GLTFLoader,
} from 'three/examples/jsm/loaders/GLTFLoader';

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

    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.radius = 8;

	scene.add(directionalLight);

	const sphere = new THREE.SphereGeometry();
	const material = new THREE.MeshStandardMaterial();
	const mesh = new THREE.Mesh(sphere, material);
	// scene.add(mesh);

    // const planeGeometry = new THREE.PlaneGeometry(5, 5);
    // const plane = new THREE.Mesh(planeGeometry, material);
    // plane.position.set(0, -1.5, 0);
    // plane.rotation.set(Math.PI * -0.5, 0, 0);
    // plane.receiveShadow = true;
    // scene.add(plane);

	// start gltf load (type below)
    const loader = new GLTFLoader();
    loader.load('/gltf/rocket.glb', gltf => {
        gltfModel = gltf.scene;

        console.log('gltf: ', gltf);

        scene.add(gltfModel);
        gltfModel.traverse(obj => {
            if (obj.isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
                obj.material.metalness = 0;
            }
        });

        mixer = new THREE.AnimationMixer(gltfModel);
        gltf.animations.forEach(clip => {
            mixer.clipAction(clip).play();
        })

        scene.add(gltfModel);
    });
	// end gltf load
	render();
}

function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
	controls.update();

    animate();
}

function animate() {
    // if (!gltfModel) {
    //     return;
    // }

    // gltfModel.rotation.y += 0.01;

    // ---

    if (!mixer) {
        return;
    }

    mixer.update(1 / 60);
}

init();
