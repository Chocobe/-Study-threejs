import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';

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
/**
 * AmbientLight
 * 
 * 전경 조명
 * => 실세계의 조명은 물체에 반사되는 반사광이 있다.
 * => Three.js에서는 무거운 연산때문에 scene 전체에 대한 반사광을 지원하지 않는다.
 * => 때문에, `AmbientLight`를 사용하여, `scene` 전체에 대한 반사광이 있는 것 처럼 연출할 때 활용된다.
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const guiAmbientLight = gui.addFolder('AmbientLight');
guiAmbientLight.addColor(ambientLight, 'color');
guiAmbientLight.add(ambientLight, 'intensity').min(0).max(3).step(0.001);

/**
 * DirectionalLight
 * 
 * 단방향으로 비추는 조명
 * => `DirectionalLight`는 태양으로 생각할 수 있다.
 * => `Mesh`의 위치에 상관없이, `DirectionalLight`가 비추는 방향으로 모든 `Mesh`가 빛을 받는다.
 */
const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.9);
directionalLight.position.set(1, 0.25, 0);
scene.add(directionalLight);

const guiDirectionalLight = gui.addFolder('DirectionalLight');
guiDirectionalLight.addColor(directionalLight, 'color');
guiDirectionalLight.add(directionalLight.position, 'x').min(-1).max(1).step(0.001);
guiDirectionalLight.add(directionalLight.position, 'y').min(-1).max(1).step(0.001);
guiDirectionalLight.add(directionalLight.position, 'z').min(-1).max(1).step(0.001);

/**
 * HemisphereLight
 * 
 * `color(top부분)`와 `groundColor(bottom부분)`을 사용하는 그라데이션 조명이다.
 * => `AmbientLight` 처럼 전경으로 활용할 수 있다.
 */
const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 3);
scene.add(hemisphereLight);

const guiHemisphereLight = gui.addFolder('HemisphereLight');
guiHemisphereLight.addColor(hemisphereLight, 'color');
guiHemisphereLight.addColor(hemisphereLight, 'groundColor');
guiHemisphereLight.add(hemisphereLight, 'intensity').min(0).max(1).step(0.001);

/**
 * PointLight
 * 
 * 특점 지점에서 빛을 방사하는 조명이다.
 * => 전등으로 생각할 수 있다.
 */
const pointLight = new THREE.PointLight(0xff9000, 1.5, 2, 0);
pointLight.position.set(1, -0.5, 1);
scene.add(pointLight);

const guiPointLight = gui.addFolder('PointLight');
guiPointLight.addColor(pointLight, 'color');
guiPointLight.add(pointLight, 'intensity').min(0).max(1).step(0.001);
guiPointLight.add(pointLight, 'decay').min(0).max(100).step(0.001);

/**
 * RectAreaLight
 * 
 * 사각형 영역을 비추는 조명이다.
 * => 사진관의 사각형 모양의 스텐드 조명으로 생각할 수 있다. (Photo shoot)
 */
const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 6, 1, 1);
rectAreaLight.position.set(-1.5, 0, 1.5);
rectAreaLight.lookAt(new THREE.Vector3());
scene.add(rectAreaLight);

const guiRectAreaLight = gui.addFolder('RectAreaLight');
guiRectAreaLight.addColor(rectAreaLight, 'color');
guiRectAreaLight.add(rectAreaLight, 'intensity').min(0).max(10).step(0.001);
guiRectAreaLight.add(rectAreaLight, 'width').min(0).max(10).step(0.001);
guiRectAreaLight.add(rectAreaLight, 'height').min(0).max(10).step(0.001);

/**
 * SpotLight
 * 
 * 특정 지점에서 원형으로 비추는 조명이다.
 * => 손전등으로 볼 수 있다.
 * 
 * ⭐️ `SpotLight`의 `target` 특징
 * => 다른 `Light`들의 `target`은 `Vector3`이지만,
 * => `SpotLight`의 `target`은 `SpotLight_객체.target` 이다.
 * => `SpotLight_객체.target`의 `position`을 바꾸어서 `SpotLight`가 비추는 방향을 바꿀 수 있다.
 * 
 * ⭐️ `SpotLight.target.position`의 변경사항이 반영되지 않는 이유
 * => `SpotLight.target`은 `SpotLight` 객체가 생성될 때, 함께 생성된다.
 * => `SpotLight`를 `scene.add()`로 추가했더라도, `SpotLight_객체.target`은 `scene`에 없는 상태다.
 * => 때문에 `scene.add(spotLight_객체.target)`으로 `scene`에 추가해주면, 
 * => `SpotLight_객체.target.position`의 변경된 좌표로 조명을 비추게 된다.
 */
const spotLight = new THREE.SpotLight(0x78ff00, 4.5, 10, Math.PI * 1/10, 0.25, 1);
spotLight.position.set(0, 2, 3);
/** `SpotLigh.target`을 `scene`에 추가해야 비추는 방향을 변경할 수 있다. */
spotLight.target.position.x = 0;
scene.add(spotLight.target);
scene.add(spotLight);

const guiSpotLight = gui.addFolder('SpotLight');
guiSpotLight.addColor(spotLight, 'color');
guiSpotLight.add(spotLight, 'intensity').min(0).max(10).step(0.001);
guiSpotLight.add(spotLight, 'distance').min(0).max(20).step(0.001);
guiSpotLight.add(spotLight, 'angle').min(0).max(Math.PI).step(0.001);
guiSpotLight.add(spotLight, 'penumbra').min(0).max(1).step(0.001);
guiSpotLight.add(spotLight, 'decay').min(0).max(10).step(0.001);
guiSpotLight.add(spotLight.target.position, 'x').min(-1.5).max(1.5).step(0.1);

/**
 * Helper
 */
const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 0.2);
scene.add(hemisphereLightHelper);

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2);
scene.add(directionalLightHelper);

const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);
scene.add(pointLightHelper);

const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);

const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight);
scene.add(rectAreaLightHelper);

/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.4

// Objects
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
)
sphere.position.x = - 1.5

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.75, 0.75),
    material
)

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 32, 64),
    material
)
torus.position.x = 1.5

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.65

scene.add(sphere, cube, torus, plane)

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

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    sphere.rotation.y = 0.1 * elapsedTime
    cube.rotation.y = 0.1 * elapsedTime
    torus.rotation.y = 0.1 * elapsedTime

    sphere.rotation.x = 0.15 * elapsedTime
    cube.rotation.x = 0.15 * elapsedTime
    torus.rotation.x = 0.15 * elapsedTime

    // Update controls
    controls.update()

    // Update helper
    spotLightHelper.update();

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()