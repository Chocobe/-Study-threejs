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
 * Lights
 */
// Ambient light
// const ambientLight = new THREE.AmbientLight(0xffffff, 1)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
gui.add(ambientLight, 'intensity').min(0).max(3).step(0.001)
scene.add(ambientLight)

// Directional light
// const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(2, 2, - 1);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.x = 1024;
directionalLight.shadow.mapSize.y = 1024;
// directionalLight.shadow.mapSize.x = 256;
// directionalLight.shadow.mapSize.y = 256;
/**
 * `DirectionalLight.shadow.camera`는 `OrthographicCamera` 이므로
 * => `top`, `right`, `bottom`, `left`를 사용하여 비추는 영역을 설정할 수 있다.
 */
directionalLight.shadow.camera.top = 2;
directionalLight.shadow.camera.right = 2;
directionalLight.shadow.camera.bottom = -2;
directionalLight.shadow.camera.left = -2;
directionalLight.shadow.camera.bottom = -1;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 6;
/**
 * `WebGLRenderer.shadowMap.type`을 `THREE.PCFSoftShadowMap`으로 설정할 경우,
 * => `조명.shadow.radius`는 적용되지 않는다.
 */
directionalLight.shadow.radius = 10;

const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
directionalLightCameraHelper.visible = false;
scene.add(directionalLightCameraHelper);

gui.add(directionalLight, 'intensity').min(0).max(3).step(0.001)
gui.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001)
gui.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001)
gui.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001)
scene.add(directionalLight)

// SpotLight
// const spotLight = new THREE.SpotLight(0xffffff, 3.6, 10, Math.PI * 0.3);
const spotLight = new THREE.SpotLight(0xffffff, 3.2, 10, Math.PI * 0.3);
spotLight.position.set(0, 2, 2);
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
/** 
 * `SpotLight.shadow.camera`는 `PerspectiveCamera` 이다.
 * => `OrthographicCamera`에서 사용할 수 있는 `top`, `bottom`, `left`, 'right`는 사용할 수 없다.
 * 
 * `SpotLight.shadow.camera.fov`는 최신 버전의 Three.js에서는 `SpotLight.angle` 설정값을 따르도록 바뀌었다. 
 * 
 * `SpotLight.shadow.camera`는 `PerspectiveCamera`이므로, `fov`를 설정할 수는 있고, `CameraHelper`에도 적용은 된다.
 * => 다만, `SpotLight.shadow`가 실제 렌더링되는 것에는 영향을 주지 않는다.
 * 
 * `SpotLight.shadow.camera.fov`는 손대지 말자!
 */
spotLight.shadow.camera.fov = 30;
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 6;

const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);
spotLightCameraHelper.visible = false;
scene.add(spotLight, spotLight.target, spotLightCameraHelper);

// PointLight
const pointLight = new THREE.PointLight(0xffffff, 2.7);
pointLight.castShadow = true;
pointLight.position.set(-1, 1, 0);
/**
 * `PointLight`는 모든 방향으로 빛을 비춘다.
 * => 때문에 그림자가 생성되는 것도 모든 방향을 생성하게 된다.
 * 
 * `PointLight`의 그림자를 생성할 때도 `shadowMap`을 생성하는데,
 * => 모든 방향으로 빛을 비추고 그림자를 생성하므로, `Cube(6면체)` 형태의 `shadowMap`을 생성한다.
 * 
 * `PointLight.shadow.camera`는 `PerspectiveCamera` 이다.
 * => `PointLight.shadow.camera.fov` 를 설정할 수는 있지만,
 * => `fov`값을 변경하면 의도치 않은 결과를 얻게 된다.
 * => 이유는 모든 방향을 비추는 카메라이기 때문이다.
 * 
 * `PointLight.shadow.camera.fov`는 손대지 말자!
 */
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;
pointLight.shadow.camera.near = 0.1;
pointLight.shadow.camera.far = 5;
const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera);
pointLightCameraHelper.visible = false;
scene.add(pointLight, pointLightCameraHelper);

/**
 * Materials
 */
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.7
gui.add(material, 'metalness').min(0).max(1).step(0.001)
gui.add(material, 'roughness').min(0).max(1).step(0.001)

/**
 * Objects
 */
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
)
sphere.castShadow = true;

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.5
plane.receiveShadow = true;

scene.add(sphere, plane)

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
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
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

renderer.shadowMap.enabled = true;
/**
 * `WebGLRenderer.shadowMap.type`을 `THREE.PCFSoftShadowMap`으로 설정하면,
 * => `조명.shadow.radius`가 적용되지 않기 때문에 `Blur`효과를 사용할 수 없다.
 * => shadow가 또렷하게 연출된다.
 * 
 * 만약 `THREE.PCFSoftShadow`를 사용하여 `Blur` 효과를 만들고 싶다면,
 * => `조명.shadow.mapSize`를 작게 만들면 `Blur` 효과처럼 연출된다.
 */
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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