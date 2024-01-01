import * as THREE from 'three';
import {
    OrbitControls,
} from 'three/examples/jsm/controls/OrbitControls';

/** 
 * Threejs 렌더러 인스턴스
 * @type { THREE.WebGLRenderer }
 */
let renderer;

/**
 * Light, Mesh 등으로 구성한 무대
 * @type { THREE.Scene }
 */
let scene;

/**
 * Scene(무대) 를 실제 화면에 렌더링하기 위한 카메라
 * 
 * @type { THREE.PerspectiveCamera }
 */
let camera;

/**
 * 카메라 컨트롤러
 * @type { OrbitControls }
 */
let controls;

function init() {
    // 1. `<canvas />` 생성
    function initCanvas() {
        const $canvas = document.createElement('canvas');
        document.body.appendChild($canvas);

        return $canvas;
    }

    // 2. renderer 인스턴스 생성
    function initRenderer($canvas) {
        renderer = new THREE.WebGLRenderer({
            canvas: $canvas,
            antialias: true,
        });

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }

    // 3. Camera 인스턴스 생성
    function initCamera() {
        // camera = new THREE.PerspectiveCamera(
        //     45,
        //     window.innerWidth / window.innerHeight
        // )
        // camera.position.set(0, 0, 10);

        camera = new THREE.PerspectiveCamera();
        camera.aspect = window.innerWidth / window.innerHeight;

        // FIXME: 포스팅하기
        // => fov, position 관계
        // camera.fov = 150;
        // camera.position.set(0.75, 0.75, 0.75);

        // camera.fov = 70;
        // camera.position.set(1.5, 1.5, 1.5);

        // camera.fov = 40;
        // camera.position.set(3, 3, 3);

        // FIXME: 포스팅하기
        // => near, far clipping 
        // camera.near = 1.9;
        // camera.far = 2.5;

        camera.fov = 45;
        camera.position.set(5, 5, 5);

        camera.lookAt(0, 0, 0);

        camera.updateProjectionMatrix();
    }

    // 3-1. OrbitControls 인스턴스 생성
    function initControls() {
        controls = new OrbitControls(camera, $canvas);

        // 회전 사용 여부
        // controls.enableRotate = false;

        // 확대/축소 사용 여부
        // controls.enableZoom = false;

        // 이동 사용 여부
        // controls.enablePan = false;

        // 부드러운 움직임(감속도) 사용 여부
        // controls.enableDamping = true;
    }

    // 4. Light 인스턴스 생성
    function initLight() {
        const light = new THREE.DirectionalLight();
        light.position.set(1, 2, 3);

        return light;
    }

    // 5. Scene 인스턴스 생성
    function initScene(light) {
        scene = new THREE.Scene();
        scene.add(light);
    }

    const $canvas = initCanvas();
    initRenderer($canvas);
    initCamera();
    initControls();

    const light = initLight();
    initScene(light);

    // // 6. Sphere Mesh 생성
    // const sphere = createSphereMesh();
    // scene.add(sphere);

    // 6. Box Mesh 생성
    const box = createBoxMesh();
    scene.add(box);

    // 7. 렌더링 시작
    render();
}

function render() {
    renderer.render(scene, camera);
    controls.update();

    requestAnimationFrame(render);
}

init();

function createSphereMesh() {
    const sphere_geometry = new THREE.SphereGeometry();
    const material = new THREE.MeshPhongMaterial();

    const sphere_mesh = new THREE.Mesh(
        sphere_geometry,
        material
    );

    return sphere_mesh;
}

function createBoxMesh() {
    const box_geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshPhongMaterial();

    const box_mesh = new THREE.Mesh(
        box_geometry, 
        material
    );

    return box_mesh;
}
