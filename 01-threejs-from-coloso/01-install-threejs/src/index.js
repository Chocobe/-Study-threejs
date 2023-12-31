import * as THREE from 'three';

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
        });

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }

    // 3. Camera 인스턴스 생성
    function initCamera() {
        camera = new THREE.PerspectiveCamera();
    }

    // 4. Light 인스턴스 생성
    function initLight() {
        return new THREE.DirectionalLight();
    }

    // 5. Scene 인스턴스 생성
    function initScene(light) {
        scene = new THREE.Scene();
        scene.add(light);
    }

    const $canvas = initCanvas();
    initRenderer($canvas);
    initCamera();

    const light = initLight();
    initScene(light);

    // 7. 렌더링 시작
    render();
}

function render() {
    renderer.render(scene, camera);

    requestAnimationFrame(render);
}

init();
