import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader()
const rgbeLoader = new RGBELoader()
const textureLoader = new THREE.TextureLoader();

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
 * Update all materials
 */
const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child.isMesh)
        {
            // Activate shadow here
            child.castShadow = true;
            child.receiveShadow = true;
        }
    })
}

/**
 * Environment map
 */
// Intensity
scene.environmentIntensity = 1
gui
    .add(scene, 'environmentIntensity')
    .min(0)
    .max(10)
    .step(0.001)

// HDR (RGBE) equirectangular
rgbeLoader.load('/environmentMaps/0/2k.hdr', (environmentMap) =>
{
    environmentMap.mapping = THREE.EquirectangularReflectionMapping

    scene.background = environmentMap
    scene.environment = environmentMap
})

/**
 * Directional light
 */
const directionalLight = new THREE.DirectionalLight(
    '#fff',
    6
);
directionalLight.position.set(-4, 6.5, 2.5);
scene.add(directionalLight);

gui
    .add(directionalLight, 'intensity')
    .min(0)
    .max(10)
    .step(0.001)
    .name('lightIntensity');

gui
    .add(directionalLight.position, 'x')
    .min(-10)
    .max(10)
    .step(0.001)
    .name('lightX');

gui
    .add(directionalLight.position, 'y')
    .min(-10)
    .max(10)
    .step(0.001)
    .name('lightY');

gui
    .add(directionalLight.position, 'z')
    .min(-10)
    .max(10)
    .step(0.001)
    .name('lightZ');

// Shadow
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 15;
// directionalLight.shadow.mapSize.set(1024, 1024);
/**
 * `shadow`가 만들어낼 `texture`의 크기 설정
 * => 값이 커질수록 날카로운 그림자가 연출되지만, 성능을 많이 사용하게 된다.
 * => 기본값인 `512, 512` 를 그대로 사용하는 것을 추천한다.
 * 
 * => 날카로운 그림자를 의도한다면, `1024, 1024` 정도로 사용하자
 * 
 * 렌더링되는 물체가 복잡할수록 그림자가 흐리게 나타나는 것을 발견하지 못하게 된다.
 * => 이러한 경우라면 `256, 256` 으로 낮추는 것으로 성능까지 향상시키는 방법이 있다.
 */
directionalLight.shadow.mapSize.set(512, 512);

gui.add(directionalLight, 'castShadow');

/**
 * `Shadow Acne` 현상 (=== `Self-Shadowing`)
 * => Object 자신이 생성한 그림자가 자신에게 비춰지는 원리에 의해,
 * => `주름`이 렌더링되는 현상이다.
 * 
 * 해결하기 위해서는 아래의 2가지 속성을 함께 사용하여 해결할 수 있다.
 * * `Light.shadow.bias`
 * * `Light.shadow.normalBias`
 */

/**
 * `Light.shadow.normalBias` 설정
 * => 이 Light 가 생성하는 shadow의 크기를 조정한다.
 */
directionalLight.shadow.normalBias = 0.027;
gui
    .add(directionalLight.shadow, 'normalBias')
    .min(-0.05)
    .max(0.05)
    .step(0.001);

/**
 * `Light.shadow.bias` 설정
 * => 이 Light 가 생성하는 shadow의 위치(offset)을 조정한다.
 */
directionalLight.shadow.bias = - 0.004;
gui
    .add(directionalLight.shadow, 'bias')
    .min(-0.05)
    .max(0.05)
    .step(0.001);

// Helper
// const directionalLightHelper = new THREE.CameraHelper(
//     directionalLight.shadow.camera
// );
// scene.add(directionalLightHelper);

// Target
directionalLight.target.position.set(0, 4, 0);
/**
 * `DirectionalLight.target.position`을 변경해도 화면에 반영되지 않는 현상
 * 
 * * `DirectionalLight.target` 은 `Object3D` 타입이지만, 더미이며, Scene 에 등록하지 않는다.
 * * `position`을 변경하는 것은 `Matrix`를 변경한다는 것인데, `Matrix`는 이 객체가 렌더링되기 직전에 생성된다.
 * * => `target`은 Scene 에 등록하지 않았으므로, 렌더링 자체를 하지 않으므로, `Matrix`를 만드는 시점은 오지 않는다.
 * 
 * 그래서 아래와 같이 직접 `Matrix`를 생성하도록 `directionalLight.target.updateWorldMatrix()`를 호출해야 렌더링에 반영된다.
 */
directionalLight.target.updateWorldMatrix();

/**
 * Models
 */
// // Helmet
// gltfLoader.load(
//     '/models/FlightHelmet/glTF/FlightHelmet.gltf',
//     (gltf) =>
//     {
//         gltf.scene.scale.set(10, 10, 10)
//         scene.add(gltf.scene)

//         updateAllMaterials()
//     }
// )

// Hamburger
gltfLoader.load('/models/hamburger.glb', gltf => {
    gltf.scene.scale.setScalar(0.4);
    gltf.scene.position.set(0, 2.5, 0);
    scene.add(gltf.scene);
    updateAllMaterials();
});

/**
 * Floor
 */
const floorColorTexture = textureLoader.load('/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_diff_1k.jpg');
const floorNormalTexture = textureLoader.load('textures/wood_cabinet_worn_long/wood_cabinet_worn_long_nor_gl_1k.png');
const floorAORoughnessMetalnessTexture = textureLoader.load('textures/wood_cabinet_worn_long/wood_cabinet_worn_long_arm_1k.jpg');

floorColorTexture.colorSpace = THREE.SRGBColorSpace;

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 8),
    new THREE.MeshStandardMaterial({
        map: floorColorTexture,
        normalMap: floorNormalTexture,
        aoMap: floorAORoughnessMetalnessTexture,
        roughnessMap: floorAORoughnessMetalnessTexture,
        metalnessMap: floorAORoughnessMetalnessTexture,
    })
);
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

/**
 * Wall
 */
const wallColorTexture = textureLoader.load('/textures/castle_brick_broken_06/castle_brick_broken_06_diff_1k.jpg');
const wallNormalTexture = textureLoader.load('/textures/castle_brick_broken_06/castle_brick_broken_06_nor_gl_1k.png');
const wallAORoughnessMetalnessTexture = textureLoader.load('/textures/castle_brick_broken_06/castle_brick_broken_06_arm_1k.jpg');

wallColorTexture.colorSpace = THREE.SRGBColorSpace;

const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 8),
    new THREE.MeshStandardMaterial({
        map: wallColorTexture,
        normalMap: wallNormalTexture,
        aoMap: wallAORoughnessMetalnessTexture,
        roughnessMap: wallAORoughnessMetalnessTexture,
        metalnessMap: wallAORoughnessMetalnessTexture,
    })
);
wall.position.y = 4;
wall.position.z = -4;
scene.add(wall);

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
camera.position.set(4, 5, 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.y = 3.5
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    // `antialias`는 Mesh들의 경계에 생기는 `계단효과(stair-like)`를 완화해준다.
    // => 만약 `pixelRatio` 가 `2이상` 이라면, 의미가 없어지므로, 성능만 더 사용하게 된다.
    antialias: window.devicePixelratio < 2,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Tone mapping
renderer.toneMapping = THREE.ACESFilmicToneMapping;

gui.add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping,
});
gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001);

// Shadow
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/**
 * Animate
 */
const tick = () =>
{
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()