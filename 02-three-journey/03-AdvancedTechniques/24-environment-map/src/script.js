import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { GroundedSkybox } from 'three/examples/jsm/objects//GroundedSkybox.js';

/**
 * R: Red
 * G: Green
 * B: Blue
 * E: Exponent (단어 뜻은 `지수`, 여기서 의미는 `밝기`)
 */
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const rgbeLoader = new RGBELoader();
const exrLoader = new EXRLoader();
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
 * Environment map
 */
// 환경 밝기 설정
scene.environmentIntensity = 1;
// 배경 흐림 설정
scene.backgroundBlurriness = 0;
// 배경 밝기 설정
scene.backgroundIntensity = 1;

// 배경 x축 회전
// scene.backgroundRotation.x = 1;
// 환경 x축 회전
// scene.environmentRotation.x = 1;

gui.add(scene, 'environmentIntensity').min(0).max(10).step(0.001);
gui.add(scene, 'backgroundBlurriness').min(0).max(1).step(0.001);
gui.add(scene, 'backgroundIntensity').min(0).max(10).step(0.001);
gui.add(scene.backgroundRotation, 'y').min(0).max(Math.PI * 2).step(0.001).name('backgroundRotationY');
gui.add(scene.environmentRotation, 'y').min(0).max(Math.PI * 2).step(0.001).name('environmentRotationY');

// 1. LDR cube texture (LDR: Low dynamic Range)
// const environmentMap = cubeTextureLoader.load([
//     '/environmentMaps/0/px.png',
//     '/environmentMaps/0/nx.png',
//     '/environmentMaps/0/py.png',
//     '/environmentMaps/0/ny.png',
//     '/environmentMaps/0/pz.png',
//     '/environmentMaps/0/nz.png',
// ], () => {
//     console.log('success');
// });
// scene.environment = environmentMap;
// scene.background = environmentMap;

// 2. HDR (HDR: High Dynamic Range) - Equirectangular
// => `RGBELoader`를 사용하여 `HDR` 파일을 `DataTexture`로 불러올 수 있다.
// => `LDR`보다 풍부한 `발기` 데이터를 가지고 있어서, `CubeTextureLoader`보다 밝고 선명하게 렌더링 된다.
// => `HDR`를 사용한다면, `scene.backgroundIntensity` 나 `scene.environmentIntensity`를 굳이 사용하지 않아도 된다.
// rgbeLoader.load('/environmentMaps/0/2k.hdr', environmentMap => {
//     console.log('environmentMap: ', environmentMap);

//     environmentMap.mapping = THREE.EquirectangularReflectionMapping;
//     scene.background = environmentMap;
//     scene.environment = environmentMap;
// });

// 3. Blneder로 만든 HDR 사용하기
// rgbeLoader.load('/environmentMaps/blender-2k.hdr', environmentMap => {
//     environmentMap.mapping = THREE.EquirectangularReflectionMapping;

//     // 배경으로 렌더링은 하지 않고, `scene.environment` 에만 적용해서, Light 효과만 사용하기
//     // scene.background = environmentMap;
//     scene.environment = environmentMap;
// });

// `HDR`은 파일이 크고, 렌더링에 많은 비용이 든다.
// => `HDR` 이미지의 `해상도` 를 낮추거나, 약간의 `Blur`를 적용하면, 로딩과 렌더링 비용을 줄일 수 있다.

// 4. HDR (EXR)
// EXR 파일을 environmentMap 으로 사용하기
// => HDR 에 더 많은 데이터를 추가한 확장된 파일형식
// => alpha, layer 등 더 많은 정보를 표현할 수 있다.
//
// `EXRLoader`를 사용해서 파일을 로딩할 수 있다.
// exrLoader.load('/environmentMaps/nvidiaCanvas-4k.exr', environmentMap => {
//     console.log('environmentMap: ', environmentMap);

//     environmentMap.mapping = THREE.EquirectangularReflectionMapping;
//     scene.background = environmentMap;
//     scene.environment = environmentMap;
// });

// 5. JPEG 로 만들어진 LDR 이미지를 environmentMap 으로 사용하기
// => 일반적인 2D 이미지 확장자인 JPEG 파일이지만, HDR 처럼 360도를 표현한 이미지도 있다.
// => 이러한 LDR 을 environmentMap 으로 사용하기 위해서는, `TextureLoader`를 사용해서 불러올 수 있다.
// const environmentMap = textureLoader.load('/environmentMaps/blockadesLabsSkybox/anime_art_style_japan_streets_with_cherry_blossom_.jpg', environmentMap => {
//     console.log('environmentMap: ', environmentMap);

//     environmentMap.mapping = THREE.EquirectangularReflectionMapping;
//     environmentMap.colorSpace = THREE.SRGBColorSpace;
// });
// scene.background = environmentMap;
// scene.environment = environmentMap;

//
// --- --- --- --- --- --- --- --- --- ---
//

// Ground projected `GroundedSkybox`
// => EnvironmentMap을 사용할 때, Object 가 바닦에 위치하도록 하기
// rgbeLoader.load('environmentMaps/2/2k.hdr', environmentMap => {
//     environmentMap.mapping = THREE.EquirectangularReflectionMapping;
//     scene.environment = environmentMap;

//     // `scene.background`는 사용하지 않는다.
//     // => 대신 `GroundedSkybox` class를 사용하자.
//     // scene.background = environmentMap;

//     // GroundedSkybox
//     // => `scene.background`는 `구` 형태로 렌더링되는데, 이는 Object가 공중에 떠있는 것 처럼 렌더링된다.
//     // => `GroundedSkybox`는 `구`의 하부를 납짝하게 만들어서 마치 찐빵처럼 만들어 준다.
//     const skybox = new GroundedSkybox(
//         environmentMap,
//         15,
//         70
//     );
//     // skybox.material.wireframe = true;

//     // `GroundedSkybox`의 `height` 를 `15` 로 설정했으므로,
//     // => `position.y`를 15로 보정해주자.
//     skybox.position.y = 15;

//     scene.add(skybox);

//     // 모든 HDR 파일이 자연스럽게 렌더링되지는 않는다.
//     // `GroundedSkybox` 생성자 값을 변경하면서 테스트 해보자.
//     // => `GroundedSkybox`는 생성 시점에 렌더링 결과가 정해지므로,
//     // => `lil-gui` 처럼 실시간으로 값을 변경하는 것은 적용되지 않는다.
// });

//
// --- --- --- --- --- --- --- --- --- ---
//

/**
 * Real-time environment map
 */
// 1. `Texture`를 `scene.background`에 적용하기
const environmentMap = textureLoader.load('/environmentMaps/blockadesLabsSkybox/interior_views_cozy_wood_cabin_with_cauldron_and_p.jpg', environmentMap => {
    environmentMap.mapping = THREE.EquirectangularReflectionMapping;
    environmentMap.colorSpace = THREE.SRGBColorSpace;
});
scene.background = environmentMap;

// 2. HolyDonut 만들기 (움직이는 environmentMap 으로 활용)
const holyDonut = new THREE.Mesh(
    new THREE.TorusGeometry(8, 0.5),
    new THREE.MeshBasicMaterial({
        // color: '#fff',
        color: new THREE.Color(10, 4, 2),
    })
);

// 아래의 `CubeCamera`의 `Layer`를 `1`로 설정했으므로,
// => `CubeCamera`에는 비춰지도록 하기 위한 Layer 설정
holyDonut.layers.enable(1);

holyDonut.position.y = 3.5;
scene.add(holyDonut);

// 3. Cube Rendeer Target (Light 효과 구현하기 1)
// => Texture 의 일종이다.
// => 이 Texture 의 렌더링 방식을 내가 직접 구현할 수 있다.
// => 아래의 `CubeCamera`에 사용하게 된다.
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
    // (기본값) LDR 타입 설정
    // type: THREE.UnsignedByteType

    // HDR과 같은 environment map 으로 하용하고자 하므로, `THREE.HalfFloatType` 으로 설정
    // => `THREE.FloatType`은 `32bit`로 저장하는 대용량 타입 (너무 과함)
    // => `THREE.HalfFloatType`은 `16bit`로 저장하는 대용량 타입 (일반적인 HDR 설정)
    type: THREE.HalfFloatType,
});
scene.environment = cubeRenderTarget.texture;

// 4. CubeCamera (Light 효과 구현하기 2)
// => `CubeCamera`를 사용하면, `상/하/좌/우/전/후` 6개 면을 비추는 카메라를 만들 수 있다.
// => `tick()` 함수에서 `update()` 호출하기
const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);
// 모든 Object 는 `Layer`를 상속받고 있고, Camera도 Layer를 가지고 있다. (기본값: 0)
// => 자신의 `Layer`값보다 높은 Object만 볼 수 있으므로, `1`로 설정하면, `0` Layer는 cubeCamera에 비춰지지 않게 된다.
cubeCamera.layers.set(1);

/**
 * Torus Knot
 */
const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
    new THREE.MeshStandardMaterial({
        color: 0xAAAAAA,
        metalness: 1,
        // roughness: 0.3,
        roughness: 0,
        // envMap: environmentMap,
    })
);
torusKnot.position.x = -4
torusKnot.position.y = 4
scene.add(torusKnot)

/**
 * Models
 */
gltfLoader.load('/models/FlightHelmet/glTF/FlightHelmet.gltf', gltf => {
    console.log('gltf: ', gltf);

    gltf.scene.scale.setScalar(10);
    gltf.scene.position.set(1, 0, 0);

    scene.add(gltf.scene);
});

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
    // Time
    const elapsedTime = clock.getElapsedTime()

    // Real-time environment map
    if (holyDonut) {
        holyDonut.rotation.x = Math.sin(elapsedTime) * 2;

        // `cubeCamera`를 업데이트한다.
        // => `WebGLRenderer` 와 `Scene`에 업데이트 결과를 적용하는 과정이다.
        cubeCamera.update(renderer, scene);
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()