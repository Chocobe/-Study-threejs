// three.js
import {
    WebGLRenderer,
    ACESFilmicToneMapping,
    Scene,
    AxesHelper,
    PerspectiveCamera,

    Color,
    DirectionalLight,
    HemisphereLight,

    Mesh,
    BoxGeometry,
    MeshBasicMaterial,

    AnimationMixer,
    AnimationClip,
    VectorKeyframeTrack,
    AnimationAction,
    LoopOnce,
} from 'three';
import { 
    keyframes,
} from './config/keyframes';
// style
import './style.css';

//
// state
//
let renderer: WebGLRenderer;
let scene: Scene;
let camera: PerspectiveCamera;

let animationMixer: AnimationMixer;
let boxAnimationAction: AnimationAction;

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

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
}

function initScene() {
    scene = new Scene();
}

function initCamera() {
    camera = new PerspectiveCamera();

    camera.fov = 90;
    camera.aspect = window.innerWidth / window.innerHeight;

    camera.near = 0.5;
    camera.far = 2000;

    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    camera.updateProjectionMatrix();
}

function initAxesHelper() {
    const helper = new AxesHelper(3);

    scene.add(helper);
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

    light.position.set(-2, 2, 1);
    light.lookAt(0, 0, 0);

    scene.add(light);
}

function initHemisphereLight() {
    const skyColor = new Color('#fff');
    const groundColor = new Color('#000');

    const light = new HemisphereLight(
        skyColor,
        groundColor,
        Math.PI * 0.5
    );

    light.position.set(0, -2, 0);

    scene.add(light);
}

//
// mesh
//
function initBoxMesh() {
    const geometry = new BoxGeometry(3, 3, 3);
    const material = new MeshBasicMaterial({
        color: new Color('#03a9f4'),
    });

    const boxMesh = new Mesh(geometry, material);
    boxMesh.name = 'MilesBox';
    boxMesh.receiveShadow = true;
    boxMesh.position.set(0, 0, 0);

    scene.add(boxMesh);

    return boxMesh;
}

//
// animation
//
function initAnimation(boxMesh: Mesh) {
    const ORIGIN = 300;
    const FRAME_UNIT = 1 / 60;

    const {
        times,
        values,
    } = keyframes.reduce((acc, { width, height }, i) => {
        const time = FRAME_UNIT * i;
        const value = [
            width / ORIGIN,
            height / ORIGIN,
            1,
        ];
        
        return {
            times: [
                ...acc.times,
                time,
            ],
            values: [
                ...acc.values,
                ...value,
            ],
        };
    }, {
        times: [],
        values: [],
    } as {
        times: number[];
        values: number[];
    });

    const track = new VectorKeyframeTrack('.scale', times, values);
    const clip = new AnimationClip('MilesBox.scale', -1, [track]);

    animationMixer = new AnimationMixer(boxMesh);
    boxAnimationAction = animationMixer.clipAction(clip);
    boxAnimationAction.loop = LoopOnce;
}

//
// interaction
//
function initOnClick($canvas: HTMLCanvasElement) {
    $canvas.addEventListener('click', () => {
        boxAnimationAction.reset();
        boxAnimationAction.play();
    });
}

//
// executor
//
function render() {
    window.requestAnimationFrame(render);

    renderer.render(scene, camera);
    animationMixer.update(1 / 60);
}

(function init() {
    const $canvas = initCanvas();

    initRenderer($canvas);
    initScene();
    initCamera();
    initAxesHelper();

    initDirectionalLight();
    initHemisphereLight();

    const boxMesh = initBoxMesh();

    initAnimation(boxMesh);
    initOnClick($canvas);

    render();
}());
