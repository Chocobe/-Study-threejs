import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI({
    width: 360,
});

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */
const parameters = {};
parameters.count = 1_000;
parameters.size = 0.02;

/** @type { THREE.BufferGeometry } */
let geometry = null;
/** @type { THREE.PointsMaterial } */
let material = null;
/** @type { THREE.Points } */
let points = null;

const generateGalaxy = () => {
    /**
     * Destroy old galaxy
     * 
     * `Geometry`와 `Material`은 Memory에 할당하여 사용하게 된다.
     * => 사용하지 않는 경우, `dispse()` 메소드로 `메모리 해제`를 해주어야 `memory leak (메모리 누수)`를 막을 수 있다.
     * 
     * `Points`는 `Geometry`와 `Material`을 조합하는 역할을 하며, 별도의 메모리 관리가 필요없다.
     * => 그러므로, `scene.remove(points)`를 사용하여 `scene`에서 제거만 해주면 된다.
     */
    if (points !== null) {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
    }

    /**
     * Geometry
     */
    geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(parameters.count * 3);

    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;

        positions[i3] = (Math.random() - 0.5) * 3;
        positions[i3 + 1] = (Math.random() - 0.5) * 3;
        positions[i3 + 2] = (Math.random() - 0.5) * 3;
    }

    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
    );

    /**
     * Material
     */
    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    /**
     * Points
     */
    points = new THREE.Points(geometry, material);
    scene.add(points);
}

generateGalaxy();

/**
 * GUi를 사용한 `debug` 기능 추가는 사용할 변수가 생길때 마다 추가해주자
 * => 원하는 설정값을 찾기 좋다.
 * => 나중에 몰아서 하려고 하면, 지루한 작업 시간이 되고 빼먹는 실수를 할 수 있다.
 */
gui.add(parameters, 'count').min(100).max(1_000_000).step(100).onFinishChange(generateGalaxy);
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()