// three.js
import {
    WebGLRenderer,
    ACESFilmicToneMapping,
    Scene,
    PerspectiveCamera,
    Clock,
    AxesHelper,

    Color,
    DirectionalLight,
    HemisphereLight,

    Mesh,
    TorusGeometry,
    MeshStandardMaterial,
    TextureLoader,
    RepeatWrapping,
} from 'three';
// three.js - addons
import {
    OrbitControls,
} from 'three/addons';
// style
import './style.css';

//
// state
//
let renderer: WebGLRenderer;
let scene: Scene;
let camera: PerspectiveCamera;
let clock: Clock;
let controls: OrbitControls;

let mesh: Mesh;

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

    camera.fov = 45;
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
        Math.PI * 0
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
function initMesh() {
    const geometry = new TorusGeometry(2, 1);
    const material = new MeshStandardMaterial({
        emissiveMap: new TextureLoader().load('/texture/react-text.png', texture => {
            texture.wrapS = RepeatWrapping;
            texture.wrapT = RepeatWrapping;
            texture.repeat.set(2, 4);
        }),
    });
    material.emissive = new Color('#ff1493');

    mesh = new Mesh(geometry, material);
    mesh.position.set(0, 0, 0);
    mesh.rotation.x -= Math.PI / 180 * 30;
    mesh.rotation.y += Math.PI / 180 * 35;

    scene.add(mesh);
}

//
// animation
//
function animateMaterial() {
    const material = mesh.material as MeshStandardMaterial;

    material.emissiveMap!.offset.y += 0.01;
    material.emissiveMap!.offset.x -= 0.01;
}

//
// executor
//
function render() {
    window.requestAnimationFrame(render);

    renderer.render(scene, camera);
    controls.update(clock.getDelta());
    animateMaterial();
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

    initMesh();

    render();
}());
