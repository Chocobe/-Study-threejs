import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import GUI from 'lil-gui';

/**
 * Debug
 */
const gui = new GUI();

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
// const ambientLight = new THREE.AmbientLight(0xffffff, 1);
// scene.add(ambientLight);

// const pointLight = new THREE.PointLight(0xffffff, 30);
// pointLight.position.x = 2;
// pointLight.position.y = 3;
// pointLight.position.z = 4;
// scene.add(pointLight);

/**
 * Environment map
 */
const rgbeLoader = new RGBELoader();
rgbeLoader.load('textures/environmentMap/2k.hdr', environmentMap => {
    console.log('environmentMap: ', environmentMap);

    environmentMap.mapping = THREE.EquirectangularReflectionMapping;

    scene.background = environmentMap;
    scene.environment = environmentMap;
});

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
// const material = initMeshLambertMaterial();

/**
 * MeshPhongMaterial
 * 
 * `MeshLambertMaterial` 보다 좀 더 사실적으로 렌더링된다.
 * 
 * `MeshPhongMaterial` 도 `Light`에 영향을 받고, 빛 반사를 표현한다.
 */
function initMeshPhongMaterial() {
    const material = new THREE.MeshPhongMaterial();
    material.shininess = 100;
    material.specular = new THREE.Color('#1188ff');

    return material;
}
// const material = initMeshPhongMaterial();

/**
 * MeshToonMaterial
 * 
 * 만화 같은 렌더링
 * 
 * 만약 `마인크레프트` 같이 pixel 들의 색상에 그라데이션 없이 표현하고자 한다면, 아래와 같이 설정하면 된다.
 * => `gradientTexture.minFilter = THREE.NearestFilter;`
 * => `gradientTexture.magFilter = THREE.NearestFilter`
 * 
 * 이렇게 `minFilter` 와 `magFilter` 를 `THREE.NearestFilter` 로 설정했다면,
 * => `Texture.generateMipmaps` 설정을 `false` 로 추가 설정해주면 렌더링 성능을 향상시킬 수 있다.
 * =>
 * => `minFilter` 와 `magFilter` 를 `THREE.NearestFilter` 로 설정하는 순간, 
 * => `Mipmapping(1x1이 될 때까지 1/2 크기의 이미지를 생성하는 GPU동작)`이 사용되지 않기 때문이다.
 */
function initMeshToonMaterial() {
    const material = new THREE.MeshToonMaterial();

    gradientTexture.minFilter = THREE.NearestFilter;
    gradientTexture.magFilter = THREE.NearestFilter;
    gradientTexture.generateMipmaps = false;
    material.gradientMap = gradientTexture;

    return material;
}
// const material = initMeshToonMaterial();

/**
 * MeshStandardMaterial
 * 
 * `PBR(Physically Based Rendering)` 원칙을 사용하는 Material 이다.
 * => `metalness`, `roughness`와 같은 속성을 사용할 수 있다.
 * 
 * `Blender` 와 같은 `3D Software` 들이 사용하는 표준 Material 이므로,
 * => `Three.js` 뿐만 아니라 `Blender`, `C4D` 와 같은 소프트웨어와 유사함을 가진다.
 */
function initMeshStandardMaterial() {
    const material = new THREE.MeshStandardMaterial();
    // material.metalness = 0.7;
    material.metalness = 1;

    // material.roughness = 0.2;
    material.roughness = 1;

    material.map = doorColorTexture;

    /**
     * `aoMap`: Ambient Occlusion Map
     * => `aoMap` 에 설정한 `Texture` 는 `Ambient Light` 이외의 `Light` 에는 영향을 받지 않는다.
     * => 때문에, `scene.environment` 에 설정한 `HRD` 가 `aoMap`에는 영향을 주지 않는다.
     * 
     * => 결과적으로 `doorAmbientOcclusionTexture` 이미지에서 검은 색에 가까운 테두리 부분이 진하게 렌더링된다.
     * 
     */
    material.aoMap = doorAmbientOcclusionTexture;
    material.aoMapIntensity = 1;

    /**
     * `displacementMap`
     * => `Texture`의 밝은 부분은 좌표 고도가 높아지고
     * => 어두운 부분은 좌표 고도가 낮아진다.
     * => 결과적으로 `Texture`에 의해, `Mesh`가 변형된다.
     * 
     * `displacementMap` === `heightMap` 같은 용어다.
     * 
     * => `Mesh`를 변형하기 때문에,
     * => `Geometry`에 충분히 많은 `subdivision`이 있어야 한다.
     */
    material.displacementMap = doorHeightTexture;
    material.displacementScale = 1;

    /**
     * `metalnessMap`
     * => `Texture`의 밝은 부분은 금속 느낌으로 렌더링하고,
     * => 어두운 부분은 고무 느낌으로 렌더링 한다.
     * 
     * 만약 `MeshStandardMaterial.metalness`에 `1`이 아닌 다른 값이 함께 사용되었다면,
     * => `곱 연산`이 되면서 이상한 결과를 보게 된다.
     */
    material.metalnessMap = doorMetalnessTexture;

    /**
     * `roughnessMap`
     * => `Texture`의 밝은 부분은 부드러운 표면으로 렌더링하고,
     * => 어두운 부분은 거칠게 렌더링한다.
     * 
     * 만약 `MeshStandardMaterial.roughness`에 `1`이 아닌 다른 값이 함께 사용되었다면,
     * => `곱 연산`이 되면서 이상한 결과를 보게 된다.
     */
    material.roughnessMap = doorRoughnessTexture;

    /**
     * `normalMap`
     * => `displacementMap(=== heightMap)`처럼,
     * => `Texture`의 밝은 부분은 튀어나오고,
     * => 어두운 부분은 움푹 파인 느낌을 렌더링한다.
     * 
     * `displacementMap`과 차이점은
     * => `Geometry`의 좌표를 변형하지 않고,
     * => 입체감을 표현한다는 것이다.
     */
    material.normalMap = doorNormalTexture;
    // material.normalScale.set(1, 1);
    material.normalScale.set(0.5, 0.5);

    /**
     * `alphaMap`
     * => `Texture`의 밝은 부분은 `map`에 설정한 원본 `Texture`를 렌더링하고,
     * => 어두운 부분은 투명하게 렌더링한다.
     * 
     * `material.transparent = true` 설정이 있어야 투명효과가 렌더링된다.
     */
    material.alphaMap = doorAlphaTexture;
    material.transparent = true;

    gui.add(material, 'metalness').min(0).max(1).step(0.0001);
    gui.add(material, 'roughness').min(0).max(1).step(0.0001);

    return material;
}
// const material = initMeshStandardMaterial();

/**
 * MeshPhysicalMaterial
 * => `MeshStandardMaterial`을 확장한 class다.
 * => 그러므로, `MeshStandardMaterial`의 모든 속성을 동일하게 제공한다.
 */
function initMeshPhysicalMaterial() {
    const material = new THREE.MeshPhysicalMaterial();
    // material.metalness = 0.7;
    // material.metalness = 1;

    // material.roughness = 0.2;
    // material.roughness = 1;

    // material.map = doorColorTexture;

    // // `aoMap`: Ambient Occlusion Map
    // material.aoMap = doorAmbientOcclusionTexture;
    // material.aoMapIntensity = 1;

    // // `displacementMap`
    // // material.displacementMap = doorHeightTexture;
    // // material.displacementScale = 1;

    // // `metalnessMap`
    // material.metalnessMap = doorMetalnessTexture;

    // // `roughnessMap`
    // material.roughnessMap = doorRoughnessTexture;

    // // `normalMap`
    // material.normalMap = doorNormalTexture;
    // material.normalScale.set(0.5, 0.5);

    // // `alphaMap`
    // material.alphaMap = doorAlphaTexture;
    // material.transparent = true;

    // gui.add(material, 'metalness').min(0).max(1).step(0.0001);
    // gui.add(material, 'roughness').min(0).max(1).step(0.0001);

    /**
     * `clearcoat`
     * => `Light`에 대해여, 표면에 광택 효과를 준다.
     * => 마치 얇은 유리에 감싸여 있는 느낌이다.
     */
    // material.clearcoat = 1;
    // material.clearcoatRoughness = 0;
    // gui.add(material, 'clearcoat').min(0).max(1).step(0.0001);
    // gui.add(material, 'clearcoatRoughness').min(0).max(1).step(0.0001);

    /**
     * `sheen`
     * => 설정에 따라, `플라스틱` 또는 `옷감` 느낌으로 연출한다.
     * 
     * 이 효과를 `Fresnel effect(프레넬 효과)` 라고 한다.
     * => 렌더링 결과를 묘사하면, **테두리가 강조된 느낌** 이다.
     * => 마치 물체 뒤쪽에 밝은 빛이 있어서, 물체의 테두리가 밝게 반사광이 보이는 현상이다.
     */
    // material.sheen = 1;
    // material.sheenRoughness = 0.25;
    // material.sheenColor.set(1, 1, 1);
    // gui.add(material, 'sheen').min(0).max(1).step(0.0001);
    // gui.add(material, 'sheenRoughness').min(0).max(1).step(0.0001);
    // gui.addColor(material, 'sheenColor');

    /**
     * `iridescence`
     * => 표면에 무지개 효과를 만들어준다.
     * => CD-Rom 이나, 비눗방울에 빛이 비춰지는 효과이다.
     * 
     * ⭐️ `iridescenceIOR`은 현실적인 연출을 하기위한 **특별한 값의 범위** 를 갖는다.
     * => 최소값: `1`
     * => 최대값: `2.333`
     * => 이 범위를 벗어나면, 이상하다...
     */
    // material.iridescence = 1;
    // material.iridescenceIOR = 1;
    // material.iridescenceThicknessRange = [100, 800];
    // gui.add(material, 'iridescence').min(0).max(1).step(0.0001);
    // gui.add(material, 'iridescenceIOR').min(1).max(2.333).step(0.0001);
    // gui.add(material.iridescenceThicknessRange, '0').min(1).max(1000).step(1);
    // gui.add(material.iridescenceThicknessRange, '1').min(1).max(1000).step(1);

    /**
     * `transmission`
     * => 유리나 반투명 플라스틱 같은 `Mesh`에 가려진 뒷 부분이 투과되어 보이는 효과를 연출한다.
     * 
     * `material.ior`은 `transmission`에 대한 `IOR(index of refraction: 굴절률)`이다.
     * => `material.iridescenceIOR`과는 다르게, 최대값을 10까지 사용하는 듯 하다.
     */
    material.transmission = 1;
    material.ior = 1.5;
    material.thickness = 0.5;

    material.metalness = 0;
    material.roughness = 0;

    gui.add(material, 'transmission').min(0).max(1).step(0.0001);
    gui.add(material, 'ior').min(1).max(10).step(0.0001);
    gui.add(material, 'thickness').min(0).max(1).step(0.0001);

    gui.add(material, 'metalness').min(0).max(1).step(0.0001);
    gui.add(material, 'roughness').min(0).max(1).step(0.0001);

    return material;
}
const material = initMeshPhysicalMaterial();



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