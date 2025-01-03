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

const count = 20_000;
const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);

for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10;
    colors[i] = Math.random();
}

particleGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
);

particleGeometry.setAttribute(
    'color',
    new THREE.BufferAttribute(colors, 3)
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
 * `PointsMaterial.vertexColors`
 * => particle 각각의 color를 적용하기 위해 필요한 설정
 * 
 * `BufferGeometry`의 `setAttribute`로 설정한 `color`가 각각의 particle에 적용 된다.
 * => `PointMaterial.color`와 혼합된 색상이 렌더링된다.
 */
particleMaterial.vertexColors = true;

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

/**
 * `blending: THREE.additiveBlending`
 * => particle이 겹치는 부분은 color를 섞어서 표현하게 된다.
 * => 단순히 color가 아니라, color조명이 섞이는 방식이 되며, 결과적으로 중첩될수록 **흰색** 이 된다.
 * 
 * 더 화려한 연출이 되지만, 사용자 기기의 성능을 비교적 많이 사용하게 된다.
 */
particleMaterial.blending = THREE.AdditiveBlending;

// Points
const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

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

    // Update particles
    // particles.rotation.y = elapsedTime * 0.2;
    /**
     * 아래와 같이 `for()`문으로 particle animation을 구현하는 것은 안좋은 방법이다.
     * => 차후 배우게 될 `Custom Shader`를 사용하는 것이 좋은 방법이다.
     */
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const x = particleGeometry.attributes.position.array[i3]; 

        particleGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x);
    }

    particleGeometry.attributes.position.needsUpdate = true;

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()