// three.js
import {
    WebGLRenderer,
    ACESFilmicToneMapping,
    Scene,
    PerspectiveCamera,
    AxesHelper,
    Clock,

    Color,
    DirectionalLight,
    HemisphereLight,

    Mesh,
    MeshStandardMaterial,

    AnimationMixer,
    AnimationClip,
    AnimationAction,
    QuaternionKeyframeTrack,
    Vector3,
    LoopOnce,
    Quaternion,
    VectorKeyframeTrack,

    Raycaster,
    Vector2,
} from 'three';
// three.js - addon
import {
    RoundedBoxGeometry,
    OrbitControls,
} from 'three/addons';
// style
import './style.css';
import { boxScaleKeyframeRawData } from './keyframeRawData/boxScaleKeyframeRawData';

//
// state
//
let renderer: WebGLRenderer;
let scene: Scene;
let camera: PerspectiveCamera;
let clock: Clock;
let controls: OrbitControls;

let boxMesh: Mesh;

let animationMixer: AnimationMixer;
let animationAction: AnimationAction;

//
// core
//
function initCanvas() {
    const $canvas = document.createElement('canvas');

    const $app = document.querySelector('#app');
    $app?.appendChild($canvas);

    return $canvas;
}

function initRenderer($canvas: HTMLCanvasElement) {
    renderer = new WebGLRenderer({
        canvas: $canvas,
        antialias: true,
    });

    renderer.pixelRatio = window.devicePixelRatio;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function initScene() {
    scene = new Scene();
}

function initCamera() {
    camera = new PerspectiveCamera();

    camera.fov = 100;
    camera.aspect = window.innerWidth / window.innerHeight;

    camera.near = 0.5;
    camera.far = 2_000;

    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    camera.updateProjectionMatrix();
}

function initAxesHelper() {
    const helper = new AxesHelper(3);

    scene.add(helper);
}

function initClock() {
    clock = new Clock();
}

function initControls($canvas: HTMLCanvasElement) {
    controls = new OrbitControls(camera, $canvas);
    controls.enableDamping = true;
}

//
// light
//
function initDirectionalLight() {
    const color = new Color('#fff');

    const light = new DirectionalLight(
        color,
        Math.PI * 1
    );

    light.castShadow = true;

    light.position.set(-1, 1, 1);
    light.lookAt(0, 0, 0);

    scene.add(light);
}

function initHemisphereLight() {
    const skyColor = new Color('#fff');
    const groundColor = new Color('#000');

    const light = new HemisphereLight(
        skyColor,
        groundColor,
        Math.PI * 0.25
    );

    scene.add(light);
}

//
// mesh
//
function initBoxMesh() {
    const geometry = new RoundedBoxGeometry(5, 5, 5, 6, 1);
    const material = new MeshStandardMaterial({
        color: new Color('#ff1493'),
    });

    boxMesh = new Mesh(geometry, material);
    boxMesh.name = 'Box';

    scene.add(boxMesh);
}

//
// animation
//
function generateBoxQuaternionKF() {
    const originQuaternion = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 8);
    const quaternion0 = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), 0);
    const quaternion1 = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI * 1);
    const quaternion2 = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI * 2);

    const quaternionKF0 = new Quaternion().multiplyQuaternions(originQuaternion, quaternion0);
    const quaternionKF1 = new Quaternion().multiplyQuaternions(originQuaternion, quaternion1);
    const quaternionKF2 = new Quaternion().multiplyQuaternions(originQuaternion, quaternion2);

    return new QuaternionKeyframeTrack(
        '.quaternion',
        [0, 1, 2],
        [
            ...quaternionKF0.toArray(),
            ...quaternionKF1.toArray(),
            ...quaternionKF2.toArray(),
        ]
    );
}

function generateBoxScaleKF() {
    const {
        times,
        values,
    } = boxScaleKeyframeRawData.reduce((acc, { time, values }) => {
        return {
            times: [
                ...acc.times,
                time,
            ],
            values: [
                ...acc.values,
                ...values,
            ],
        };
    }, {
        times: [],
        values: [],
    } as {
        times: number[];
        values: number[];
    });

    return new VectorKeyframeTrack('.scale', times, values);
}

function initBoxAnimation() {
    animationMixer = new AnimationMixer(boxMesh);

    const rotationKF = generateBoxQuaternionKF();
    const rotationClip = new AnimationClip('BoxRotation', -1, [
        rotationKF,
    ]);

    animationMixer.clipAction(rotationClip).play();

    const scaleKF = generateBoxScaleKF();
    const scaleClip = new AnimationClip('BoxScale', -1, [
        scaleKF,
    ]);
    animationAction = animationMixer.clipAction(scaleClip);
    animationAction.loop = LoopOnce;
}

//
// interaction
//
function initResize() {
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
}

function initOnClick($canvas: HTMLCanvasElement) {
    const raycaster = new Raycaster();

    $canvas.addEventListener('click', e => {
        const {
            clientX,
            clientY,
        } = e;

        const mouseCoord = new Vector2(
            (clientX / window.innerWidth * 2) - 1,
            -(clientY / window.innerHeight * 2) + 1
        );

        raycaster.setFromCamera(mouseCoord, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        const target = intersects.find(({ object }) => object.name === boxMesh.name);

        if (!target) {
            return;
        }

        animationAction.reset();
        animationAction.play();
    });
}

//
// executor
//
function render() {
    window.requestAnimationFrame(render);

    const deltaTime = clock.getDelta();

    renderer.render(scene, camera);
    animationMixer?.update(deltaTime);
    controls.update(deltaTime);
}

(function init() {
    const $canvas = initCanvas();

    initRenderer($canvas);
    initScene();
    initCamera();
    initAxesHelper();
    initClock();
    initControls($canvas);

    initDirectionalLight();
    initHemisphereLight();

    initBoxMesh();

    initBoxAnimation();

    initResize();
    initOnClick($canvas);

    render();
}());
