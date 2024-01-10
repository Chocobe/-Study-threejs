import {
    WebGLRenderer,
    PerspectiveCamera,
    Scene,
    VSMShadowMap,

    // Mesh
    SphereGeometry,
    PlaneGeometry,
    MeshStandardMaterial,
    Mesh,

    // 0. 색상
    Color,

    // 1. DirectionalLight 테스트
    DirectionalLight,
    DirectionalLightHelper,

    // 2. PointLight 테스트
    PointLight,
    PointLightHelper,

    // 3. AmbientLight 테스트
    AmbientLight,

    // 4. HemisphereLight 테스트
    HemisphereLight,
    HemisphereLightHelper,

    // 5. 360도 이미지 파일인 .hdr 을 textture 로 읽은 결과의 Mapping 방식을 360도 로 사용되도록 설정하는 Map
    EquirectangularReflectionMapping,
} from 'three';
import {
    OrbitControls,
} from 'three/examples/jsm/controls/Orbitcontrols';
import {
    RGBELoader,
} from 'three/examples/jsm/loaders/RGBELoader';

/** @type { WebGLRenderer } */
let renderer;

/** @type { PerspectiveCamera } */
let camera;

/** @type { Scene } */
let scene;

/** @type { OrbitControls } */
let controls;

/** @type { HTMLCanvasElement } */
const $canvas = document.createElement('canvas');
$canvas.width = window.innerWidth;
$canvas.height = window.innerHeight;
document.body.appendChild($canvas);

function init() {
    renderer = new WebGLRenderer({
        canvas: $canvas,
        antialias: true,
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = VSMShadowMap;

    scene = new Scene();

    // scene 생성 후, loader 만들기
    const loader = new RGBELoader();
    loader.load('/hdr/sky.hdr', texture => {
        texture.mapping = EquirectangularReflectionMapping;
        scene.background = texture;
        scene.environment = texture;
    });

    camera = new PerspectiveCamera();
    camera.fov = 32;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.position.set(0, 0, 10);
    camera.updateProjectionMatrix();

    controls = new OrbitControls(camera, $canvas);
    controls.enableDamping = true;

    // 0. Mesh
    const material = new MeshStandardMaterial({
        color: new Color('#fff'),
        roughness: 0.1,
        metalness: 1,
    });

    const sphere_geometry = new SphereGeometry();
    const sphere = new Mesh(sphere_geometry, material);
    sphere.castShadow = true;
    scene.add(sphere);

    const plane_geometry = new PlaneGeometry(10, 10);
    const plane = new Mesh(plane_geometry, material);
    plane.position.set(0, -1, 0);
    plane.rotation.set(Math.PI * -0.5, 0, 0);
    plane.receiveShadow = true;
    scene.add(plane);

    // 1. DirectionalLight 테스트
    // initDirectionalLight();

    // 2. PointLight 테스트
    // initPointLight();

    // 3. AmbientLight 테스트
    // initAmbientLight();

    // 4. HemisphereLight 테스트
    // initHemisphereLight();

    render();
}

// 1. DirectionalLight 테스트
function initDirectionalLight() {
    const color = new Color('#fff');

    const light = new DirectionalLight(color, 0.75);
    light.position.set(2, 2, 2);
    light.castShadow = true;
    light.shadow.blurSamples = 30;
    light.shadow.radius = 12;
    scene.add(light);

    const helper = new DirectionalLightHelper(light);
    scene.add(helper);
}

// 2. PointLight 테스트
function initPointLight() {
    const color = new Color('#fff');

    const light = new PointLight(color, 0.3);
    light.position.set(2, 0, 2);
    scene.add(light);

    const helper = new PointLightHelper(light);
    scene.add(helper);
}

// 3. AmbientLight 테스트
function initAmbientLight() {
    const color = new Color('#fff');

    const light = new AmbientLight(color, 0.2);
    scene.add(light);
}

// 4. HemisphereLight 테스트
function initHemisphereLight() {
    const skyColor = new Color('#fff');
    const groundColor = new Color('#000');

    const light = new HemisphereLight(
        skyColor,
        groundColor,
        0.25
    );
    scene.add(light);

    const helper = new HemisphereLightHelper(light);
    scene.add(helper);
}

function render() {
    requestAnimationFrame(render);

    renderer.render(scene, camera);
    controls.update();
}

init();