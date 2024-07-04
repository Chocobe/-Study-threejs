import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 30);
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;
scene.add(pointLight);

/**
 * Texture
 */
const textureLoader = new THREE.TextureLoader();

const doorColorTexture = textureLoader.load('/textures/door/color.jpg');
const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg');
const doorAmbientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg');
const doorHeightTexture = textureLoader.load('/textures/door/height.jpg');
const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg');
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg');
const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.jpg');
const matcapTexture = textureLoader.load('/textures/matcaps/1.png');
const gradientTexture = textureLoader.load('/textures/gradients/3.jpg');

doorColorTexture.colorSpace = THREE.SRGBColorSpace;
matcapTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * Objects
 */
/**
 * MeshBasicMaterial
 * 
 * 기본 Material
 */
function initMeshBasicMaterial() {
    // const material = new THREE.MeshBasicMaterial({
    //     map: doorColorTexture,
    // });
    // const material = new THREE.MeshBasicMaterial();
    // material.map = doorColorTexture;
    
    // const material = new THREE.MeshBasicMaterial({
    //     color: 'green',
    // });

    const material = new THREE.MeshBasicMaterial();
    // material.color = new THREE.Color('green');
    material.color = new THREE.Color(0xff0000);
    
    // material.wireframe = true;
    
    // material.transparent = true;
    // material.opacity = 0.2;
    // material.alphaMap = doorAlphaTexture;
    
    // material.side = THREE.DoubleSide;
    // material.side = THREE.FrontSide;
    // material.side = THREE.BackSide;
    return material;
}
// const material = initMeshBasicMaterial();

/**
 * MeshNormalMaterial
 * 
 * 각 `vertex(점)`은 카메라를 기준으로 색상이 렌더링된다.
 * => 그래서 `Sphere` 를 대상으로 카메라를 회전시켜 보면, `Sphere` 를 보는 방향이 바뀌어도 렌더링되는 색상은 변하지 않는다.
 * => `shadow`를 생성하는 `Light`가 있더라도, 오직 카메라를 기준으로만 렌더링된다.
 */
function initMeshNormalMaterial() {
    const material = new THREE.MeshNormalMaterial();
    material.wireframe = true;

    return material;
}
// const material = initMeshNormalMaterial();

/**
 * MeshMapcapMaterial
 * 
 * 카메라를 기준으로 Mesh의 좌표를 `Texture`에서 동일한 좌표에 위치한 색상을 렌더링하는 방식이다.
 * => 성능을 적게 쓰므로, 퍼포먼스가 좋다고 한다.
 * 
 * `Texture`에 사용한 이미지에 명암이 표현되어 있다면,
 * => `Light` 객체를 사용하지 않아도 **마치 그림자가 생기는 것 처럼(카메라 기준 고정된 위치에 생김)**,
 * => 낮은 성능을 사용하여 그림자를 연출할 수 있다.
 */
function initMeshMatcapMaterial() {
    const material = new THREE.MeshMatcapMaterial();
    material.matcap = matcapTexture;

    return material;
}
// const material = initMeshMatcapMaterial();

/**
 * MeshDepthMaterial
 * 
 * 카메라와 거리가 가까우면 `흰색`, 멀면 `검은색`에 가까운 색상이 렌더링된다.
 * 
 * 일반적으로 `MeshDepthMaterial` 을 직접 사용하지는 않는다.
 * => Three.js 내부에서 사용되고 있는 Material 이다.
 * => `post-processing`
 */
function initMeshDepthMaterial() {
    const material = new THREE.MeshDepthMaterial();

    return material;
}
// const material = initMeshDepthMaterial();

/**
 * MeshLambertMaterial
 * 
 * `Light`가 꼭 필요하다.
 * => `Light`가 없으면 렌더링되지 않는다.
 * 
 * `Light`를 사용한 명암 연출에 낮은 성능을 사용하므로, 퍼포먼스가 좋다.
 * => 하지만, 현식적이지 못한 이상한 결과가 나와서, 이 현상을 해소하기는 어렵다고 한다.
 */
function initMeshLambertMaterial() {
    const material = new THREE.MeshLambertMaterial();

    return material;
}
const material = initMeshLambertMaterial();



const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    material
);
sphere.position.x = -1.5;

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    material
);

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 16, 32),
    material
);
torus.position.x = 1.5;

scene.add(sphere, plane, torus);

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
    sphere.rotation.y = 0.1 * elapsedTime;
    plane.rotation.y = 0.1 * elapsedTime;
    torus.rotation.y = 0.1 * elapsedTime;

    sphere.rotation.x = -0.1 * elapsedTime;
    plane.rotation.x = 0.1 * elapsedTime;
    torus.rotation.x = -0.1 * elapsedTime;

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()