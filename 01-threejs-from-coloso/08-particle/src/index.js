import {
	GenerateCanvas,
	THREE,
	OrbitControls,
	GLTFLoader,
	CreateParticles,
} from "./study/settings";

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
	scene.add(new THREE.PointLightHelper(pointLight))

	// indirectional light
	let directionalLight = new THREE.DirectionalLight("hsl(200,50%,50%)", 0.1);
	directionalLight.position.set(-0.5, 1, 0);
	scene.add(directionalLight);
}

//01. create Particle

//
// circle particle
//
function initCircleParticle() {
    let positions = Array.from(
        { length: 1000 * 3 },
        () => (Math.random() * 2 - 1) * 30
    );

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(
        new Float32Array(positions),
        3
    ));

    const particleMaterial = new THREE.PointsMaterial({
		map: new THREE.TextureLoader().load('/particle/circle.png'),
        size: 0.5,
        // color: new THREE.Color('#03a9f4'),
		color: new THREE.Color('hsl(200, 50%, 70%)'),

        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    const particle = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particle);

	return particle;
}
const circleParticle = initCircleParticle();

//
// cloud particle
//
let originCirclePositions = [];

function initCloudParticle() {
    originCirclePositions = Array.from(
        { length: 300 },
        (_, i) => {
            const multiple = i % 3 === 1
                ? 10
                : 50;

            return (Math.random() * 2 - 1) * multiple;
        }
    );

    const positionAttribute = new THREE.BufferAttribute(
        new Float32Array(originCirclePositions),
        3
    );

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', positionAttribute);

    const particleMaterial = new THREE.PointsMaterial({
		map: new THREE.TextureLoader().load('/particle/cloud.png'),
        // size: 160,
		size: 80,
        // color: new THREE.Color('#03a9f4'),
        color: new THREE.Color('hsl(200, 50%, 50%)'),
        // opacity: 0.5,
		opacity: 0.1,

        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    const particle = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particle);

	return particle
}
const cloudParticle = initCloudParticle();

// 삼각함수 SIN 그래프의 값을 Particle 의 Y축으로 사용하는 애니메이션 구현하기
console.log('circleParticle: ', circleParticle);

let time = 0;

function render() {
	requestAnimationFrame(render);
	controls.update();

	//02. move particles

	renderer.render(scene, camera);

	// 삼각함수 SIN 그래프의 값을 Particle 의 Y축으로 사용하는 애니메이션 구현하기
	time += 0.02;

	for (let i = 0; i < 1000; i++) {
		const yIndex = i * 3 + 1;
		circleParticle.geometry.attributes.position.array[yIndex] =
			originCirclePositions[yIndex] + Math.sin(i + time) * 1;

		circleParticle.geometry.attributes.position.needsUpdate = true;
	}

	circleParticle.rotation.y += 0.001;
	cloudParticle.rotation.y += 0.002;
}
