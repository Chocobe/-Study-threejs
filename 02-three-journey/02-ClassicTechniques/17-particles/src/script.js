import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

const particleTexture = textureLoader.load('/textures/particles/2.png');

/**
 * Particles
 */
// Geometry
// 내가 만든 `particleGeometry`
// const particlePositionBuffer = new Float32Array(Array.from(
//     { length: 500 * 3 },
//     () => {
//         return Math.random() * 100 - 50;
//     }
// ));
// const particlePositionAttribute = new THREE.BufferAttribute(particlePositionBuffer, 3);
// const particleGeometry = new THREE.BufferGeometry();
// particleGeometry.setAttribute('position', particlePositionAttribute);

// Bruno 선생님이 만든 `particleGeometry`
const particleGeometry = new THREE.BufferGeometry();
const count = 5_000;
const positions = new Float32Array(count * 3);

for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10;
}

particleGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
);

// Material
const particleMaterial = new THREE.PointsMaterial();
particleMaterial.color = new THREE.Color('#ff88cc');
particleMaterial.size = 0.1;
// 카메라(`PerspectiveCamera`만 가능)가 멀어지면, Particle의 크기가 작아지는 설정 (true: 원근법 활성화)
particleMaterial.sizeAttenuation = true;
// particleMaterial.map = particleTexture;
particleMaterial.transparent = true;
particleMaterial.alphaMap = particleTexture;

/**
 * 방법 1) `PNG` 이미지를 사용하여, particle 배경을 투명하게 하기
 * 
 * `alphaMap`을 단독으로 사용하면, 검은 부분에 잔상이 남는 현상이 있다.
 * => 잔상까지 지우기 위해, `alphaText` 를 사용할 수 있다. (완벽한 방법은 아니지만, 움직이는 particle에는 쓸만하다.)
 */
// particleMaterial.alphaTest = 0.1;

/**
 * 방법 2) `PNG` 이미지를 사용하여, particle 배경을 투명하게 하기
 * 
 * `depthTest: false`를 사용하면, particle이 가려지는 경우에도 렌더링하게 된다.
 * 
 * 하지만, `depthTest: false`인 particle은 `Scene`의 모든 Mesh에 대해서 가려짐을 무시하고 렌더링된다.
 * => (가려진 particle은 렌더링되지 않아야 현실적임)
 */
// particleMaterial.depthTest = false;

/**
 * 방법 3) ⭕️ `PNG` 이미지를 사용하여, particle 배경을 투명하게 하기
 * 
 * `depthWrite: false`를 설정하면, 위 2가지 방법이 문제가 해결된 결과를 볼 수 있다.
 * 
 * 대부분 이 방법으로 `PNG`의 배경을 투명하게 처리하는데 사용된다.
 */
particleMaterial.depthWrite = false;

// particleMaterial.transparent = true;
// particleMaterial.blending = THREE.AdditiveBlending;
// particleMaterial.depthWrite = false;

// Points
const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshBasicMaterial()
);
scene.add(cube);

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