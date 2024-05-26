import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GUI } from 'dat.gui';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'; 

let renderer;
let camera;
let cameraPosition;
let controls;

/**
 * GUI - 사용자 인터렉션으로 Three.js 설정을 할 수 있게 된다.
 */
const gui = new GUI();

/**
 * scene
 */
const scene = new THREE.Scene();

/**
 * clock
 */
const clock = new THREE.Clock();

/**
 * light
 */
function initLight() {
    const directionalLight = new THREE.DirectionalLight(
        0xFFFFFF,
        0.55
    );
    directionalLight.position.set(-5, 10, 10);
    
    const hemisphereLight = new THREE.HemisphereLight(
        0x000000,
        0xFFFFFF,
        0.2
    );
    hemisphereLight.position.set(0, -1, 0);
    
    // `Rim Light`: 물체의 뒤에서 비추는 강한 빛을 말한다.
    // Rim Light 에 의해 물체의 가장자리를 흰색으로 칠하는 느낌이 연출된다.
    const rimLight = new THREE.DirectionalLight(
        0xFFFFFF,
        2
    );
    rimLight.position.set(0, 10, -10);
    // `Rim Light` 가 비추는 방향을 `camera` 로 설정하는 것이며,
    // camera 의 위치를 바꾸어도 `반사광` 이 연출된다.
    // (핵심 설정) target 설정을 camera 로 하지 않으면, camera 의 위치에 따라 반사광이 아닌 단순 조명처럼 연출된다.
    rimLight.target = camera;
    
    scene.add(directionalLight);
    scene.add(hemisphereLight);
    scene.add(rimLight);
}

/**
 * particle
 */
function initParticle() {
	const particleGeometry = new THREE.BufferGeometry();
	const particleMaterial = new THREE.PointsMaterial({
		size: 1,
		color: 0xFFFFFF,
		map: new THREE.TextureLoader().load('/misc/sphere.png'),

		blending: THREE.AdditiveBlending,
		transparent: true,
		depthWrite: false,
	});
	const particleRadius = 30;
	const particlePositions = Array
		.from({ length: 300 }, (_, i) => {
			const x = ((Math.random() * 2) - 1) * particleRadius;
			const y = ((Math.random() * 2) - 1) * particleRadius;
			const z = ((Math.random() * 2) - 1) * particleRadius;

			return [x, y, z];
		})
		.flat();
	particleGeometry.setAttribute('position', new THREE.BufferAttribute(
		new Float32Array(particlePositions), 
		3
	));

	const particle = new THREE.Points(particleGeometry, particleMaterial);
	scene.add(particle);
}

/**
 * model
 */
function init() {
    const loader = new GLTFLoader();
    loader.load('/scene/scene-3.glb', gltf => {
        // model 초기화
        const model = gltf.scene;
        scene.add(model);

        // camera 초기화
        scene.position.set(300, 300, 0);
        cameraPosition = gltf.cameras[0].position;
        cameraPosition.add(scene.position);

        // material 조정
        const materials = {};
        model.traverse(child => {
            if (!child.isMesh) {
                return;
            }

            child.castShadow = true;
            child.receiveShadow = true;

            // 각 material 의 `color` 와 `emissive` 를 `Hex` 값으로 추출
            const material = child.material;
            materials[material.name] = {
                color: `#${material.color.getHexString()}`,
                emissive: `#${material.emissive.getHexString()}`,
                material,
            };

            // 중앙의 `공(glass)` Mesh 를 투명한 Material 로 변경하기
            if (material.name === 'glass') {
                child.material = new THREE.MeshPhysicalMaterial({
                    // 투명도 사용 여부 설정
                    transparent: true,
                    // 전송(투과) 정도 설정 (0 ~ 1)
                    transmission: 1,
                    // roughness 가 1에 가까울수록 거친 재질이 되므로, 투과정도가 탁해진다.
                    roughness: 0.5,
                });

                // console.log('glass 를 가진 child: ', child);
                child.castShadow = false;
                child.receiveShadow = false;
            }
        });

        // GUI 에 materials 를 사용자 인터렉션으로 제공하기
        // 1. Color GUI 추가
        const colorFolder = gui.addFolder('Color');
        Object
            .entries(materials)
            .forEach(([name, data]) => {
                colorFolder
                    .addColor(data, 'color')
                    .name(name)
                    .onChange(newColor => {
                        data.material.color = new THREE.Color(newColor);
                    });
            });
        // 2. Emissive GUI 추가
        const emissiveFolder = gui.addFolder('Emissive');
        Object
            .entries(materials)
            .forEach(([name, data]) => {
                emissiveFolder
                    .addColor(data, 'color')
                    .name(name)
                    .onChange(newColor => {
                        data.material.emissive = new THREE.Color(newColor);
                    });
            });
        // 3. Scene 의 배경 색상 GUI 추가
        // gui
        //     .addColor({
        //         backgroundColor: `#${scene.background.getHexString()}`,
        //     }, 'backgroundColor')
        //     .name('background-color')
        //     .onChange(newColor => {
        //         scene.background = new THREE.Color(newColor);
        //     });

        // `ball` Mesh 에서 빛이 나오도록 `PointLight` 추가하기
        const pointLight = new THREE.PointLight(0xFFFFFF, 0.5);
        pointLight.position.set(0, 2, 0);
        pointLight.castShadow = true;
        pointLight.shadow.radius = 5;
        pointLight.shadow.blurSamples = 25;
        pointLight.shadow.camera.zoom = 0.6;
        model.getObjectByName('ball')?.add(pointLight);

        initAnimation(gltf);
        // initPostProcessing();
        initParticle();
    });
}

/**
 * animation
 */
let animationMixer;

function initAnimation(gltf) {
    animationMixer = new THREE.AnimationMixer(gltf.scene);

    const clip = gltf.animations[0];
    const action = animationMixer.clipAction(clip);
    action.loop = THREE.LoopRepeat;
    action.play();
}

/**
 * effect composer
 */
function initPostProcessing() {
    effectComposer = new EffectComposer(renderer);
    // effectComposer.antialias = true;
    effectComposer.setPixelRatio(window.devicePixelRatio);
    // effectComposer.setSize(window.innerWidth * 2, window.innerHeight * 2);
    effectComposer.setSize(window.innerWidth, window.innerHeight);

    const renderPass = new RenderPass(scene, camera);
    effectComposer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5,
        1,
        0.9
    );
    effectComposer.addPass(bloomPass);
}

/**
 * executor
 */
function render() {
    const deltaTime = clock.getDelta();

    renderer.render(scene, camera);
    // effectComposer.render();

    controls.update(deltaTime);
    animationMixer?.update(deltaTime);
}

export class Scene3 {
	constructor(renderer_, camera_, controls_) {
		this.backgroundColor = '#080042';
        this.title = 'Space';
		this.tooltip = 'Click and customize stars with toolbar';

		renderer = renderer_;
		camera = camera_;
		controls = controls_;

        this.setup();
	}

	setup() {
        initLight();
        init();
        gui.hide();
	}

	start() {
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.VSMShadowMap;
        renderer.outputEncoding = THREE.LinearEncoding;
        renderer.toneMapping = THREE.NoToneMapping;;
        renderer.toneMappingExposure = 1;

        move(camera.position, cameraPosition);
        move(controls.target, scene.position);

        gui.show();

        setTimeout(() => {
			renderer.setAnimationLoop(render);
		}, 1_000);
	}

	stop() {
		gui.hide();
	}
}