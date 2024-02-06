// three
import {
    WebGLRenderer,
    Scene,
    PerspectiveCamera,
    ACESFilmicToneMapping,
    Clock,

    Color,
    DirectionalLight,
    HemisphereLight,

    Group,
    Object3DEventMap,

    Mesh,
    MeshStandardMaterial,

    Raycaster,
    Vector2,

    AnimationMixer,
    AnimationClip,
    AnimationAction,
    LoopOnce,
} from 'three';
// three.js - addons
import {
    GLTFLoader,
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

let mainModel: Group<Object3DEventMap>;
let rocketModel: Group<Object3DEventMap>;

let animationMixer: AnimationMixer;
const animationActionMapper: Record<string, AnimationAction> = {};

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

    camera.fov = 45;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.near = 0.5;
    camera.far = 2000;

    camera.position.set(100, 100, 100);
    camera.lookAt(-20, 0, -20);

    camera.updateProjectionMatrix();
}

function initClock() {
    clock = new Clock();
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

    light.position.set(-1, 1, 0.5);
    light.lookAt(0, 0, 0);

    light.castShadow = true;
    light.shadow.mapSize.set(1024, 1024);

    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500;
    light.shadow.camera.top = 180;
    light.shadow.camera.bottom = -120;
    light.shadow.camera.left = -100;
    light.shadow.camera.right = 100;

    scene.add(light);
}

function initHemisphereLight() {
    const skyColor = new Color('#fff');
    const groundColor = new Color('#555');

    const light = new HemisphereLight(
        skyColor,
        groundColor,
        Math.PI * 0.3
    );

    light.position.set(0, -1, 0);

    scene.add(light);
}

//
// model
//
function initMainModel() {
    const loader = new GLTFLoader();

    loader.load('/gltf/click.glb', gltf => {
        mainModel = gltf.scene;
        rocketModel = mainModel.getObjectByName('rocket') as Group<Object3DEventMap>;

        const ratio = 0.1;
        mainModel.scale.set(ratio, ratio, ratio);
        mainModel.position.set(0, 0, 0);

        mainModel.traverse(child => {
            if (
                !(child instanceof Mesh) ||
                !(child.material instanceof MeshStandardMaterial)
            ) {
                return;
            }

            child.castShadow = true;
            child.receiveShadow = true;

            child.material = new MeshStandardMaterial({
                color: child.material.color,
                roughness: 0.3,
            });
        });

        animationMixer = new AnimationMixer(mainModel);

        const clipMapper: Record<string, AnimationClip> = {};
        gltf.animations[0].tracks.forEach(track => {
            const name = track.name.split('.')[0];

            if (clipMapper[name]) {
                clipMapper[name].tracks.push(track);
            } else {
                const newClip = new AnimationClip(name, -1, [
                    track,
                ]);

                clipMapper[name] = newClip;
            }
        });

        Object
            .entries(clipMapper)
            .forEach(([name, clip]) => {
                const animationAction = animationMixer.clipAction(clip);
                animationAction.loop = LoopOnce;

                animationActionMapper[name] = animationAction;
            });

        scene.add(mainModel);
    });
}

//
// animation
//
function animateRocketModel() {
    if (!rocketModel) {
        return;
    }

    rocketModel.rotation.y -= 0.01;
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

function initClickInteraction($target: HTMLElement) {
    const raycaster = new Raycaster();

    $target.addEventListener('click', e => {
        const {
            clientX,
            clientY,
        } = e;

        const mouseCoord = new Vector2(
            (clientX / window.innerWidth) * 2 - 1,
            -(clientY / window.innerHeight) * 2 + 1
        );

        raycaster.setFromCamera(mouseCoord, camera);

        const intersects = raycaster.intersectObjects(scene.children, true);

        const firstModel = intersects[0]?.object;
        const firstModelName = firstModel?.name;

        if (
            !(firstModel instanceof Mesh) ||
            !(firstModel.material instanceof MeshStandardMaterial) ||
            !firstModelName.match(/^button.*/)
        ) {
            return;
        }

        const buttonColor = firstModel.material.color;

        const rocketChangingModel = rocketModel.getObjectByName('change') as Mesh;

        (rocketChangingModel.material as MeshStandardMaterial).color = buttonColor;
        scene.background = buttonColor;

        const animationAction = animationActionMapper[firstModelName];
        animationAction?.reset();
        animationAction?.play();
    });
}

//
// executor
//
function render() {
    window.requestAnimationFrame(render);

    renderer.render(scene, camera);

    animateRocketModel();
    animationMixer?.update(clock.getDelta());
}

(function init() {
    const $canvas = initCanvas();

    initRenderer($canvas);
    initScene();
    initCamera();
    initClock();

    initDirectionalLight();
    initHemisphereLight();

    initMainModel();

    initResize();
    initClickInteraction($canvas);

    render();
}());
