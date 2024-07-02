import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'



/**
 * Texture
 * 방법 1) `class Texture` 를 사용하여 `Material`에 적용하기
 */
// const image = new Image();
// const texture = new THREE.Texture(image);
// // 현재 Three.js 버전 `0.164` 에서는 colorSpace 를 `SRGBColorSpace` 로 설정해야, 원본 이미지와 유사한 색상이 렌더링된다.
// texture.colorSpace = THREE.SRGBColorSpace;

// image.onload = () => {
//     // 이미지가 로드되면 `Texture` 에 업데이트가 되도록 `needsUpdate = true` 를 적용한다.
//     texture.needsUpdate = true;
// };
// image.src = '/textures/door/color.jpg';



/**
 * Texture
 * 방법 2) `class TextureLoader` 를 사용하여 `Material`에 적용하기
 */
// const textureLoader = new THREE.TextureLoader();
// const texture = textureLoader.load(
//     '/textures/door/color.jpg',
//     // 이미지 로딩 완료 callback
//     texture => {
//         texture.colorSpace = THREE.SRGBColorSpace;
//     },
//     // 진행 과정 callback
//     () => {
//         // `0` 또는 `100%`만 동작해서 실제로는 **사용하지 않는다고 함**
//     },
//     // 에러 callback
//     error => {
//         console.log('이미지 로딩 실패 - error: ', error);
//     }
// );



/**
 * Texture
 * 방법 3) LoadingManager 를 사용하여 로딩 event를 함께 사용하기
 * => 다양한 모델, 폰트, 텍스쳐를 로딩할 때 발생하는 많은 이벤트를 관리할 수 있다.
 */
const loadingManager = new THREE.LoadingManager();
// loadingManager.onStart = () => {
//     console.log('onStart()');
// };
// loadingManager.onLoad = () => {
//     console.log('onLoad()');
// };
// loadingManager.onProgress = () => {
//     console.log('onProgress()');
// };
// loadingManager.onError = () => {
//     console.log('onError()');
// };

const textureLoader = new THREE.TextureLoader(loadingManager);
// const colorTexture = textureLoader.load('/textures/door/color.jpg', texture => {
//     texture.colorSpace = THREE.SRGBColorSpace;
// });
// const colorTexture = textureLoader.load('/textures/checkerboard-1024x1024.png', texture => {
//     texture.colorSpace = THREE.SRGBColorSpace;
// });
// const colorTexture = textureLoader.load('/textures/checkerboard-8x8.png', texture => {
//     texture.colorSpace = THREE.SRGBColorSpace;
// });
const colorTexture = textureLoader.load('/textures/minecraft.png', texture => {
    texture.colorSpace = THREE.SRGBColorSpace;
});
const alphaTexture = textureLoader.load('/textures/door/alpha.jpg', texture => {
    texture.colorSpace = THREE.SRGBColorSpace;
});
const heightTexture = textureLoader.load('/textures/door/height.jpg', texture => {
    texture.colorSpace = THREE.SRGBColorSpace;
});
const normalTexture = textureLoader.load('/textures/door/normal.jpg', texture => {
    texture.colorSpace = THREE.SRGBColorSpace;
});
const ambientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg', texture => {
    texture.colorSpace = THREE.SRGBColorSpace;
});
const metalnessTexture = textureLoader.load('/textures/door/metalness.jpg', texture => {
    texture.colorSpace = THREE.SRGBColorSpace;
});
const roughnessTexture = textureLoader.load('/textures/door/roughness.jpg', texture => {
    texture.colorSpace = THREE.SRGBColorSpace;
});

/**
 * `Texture.repeat`
 * => `UV coordinator` 에서 축 방향으로 반복할 횟수를 지정한다.
 */
// colorTexture.repeat.x = 2;
// colorTexture.repeat.y = 3;

/**
 * `Texture.wrapS`, `Texture.wrapT`
 * => 반복 방식을 설정한다.
 */
/**
 * `THREE.RepeatWrapping`
 * `Texture.repeat.축` 에 설정한 횟수만큼 반복해서 렌더링한다.
 */
// colorTexture.wrapS = THREE.RepeatWrapping;
// colorTexture.wrapT = THREE.RepeatWrapping;

/**
 * `THREE.MirroredRepeatWrapping`
 * => 데칼코마니 처럼 [원본, 반전, 원본, 반전, ...] 패턴으로 반복해서 렌더링한다.
 */
// colorTexture.wrapS = THREE.MirroredRepeatWrapping;
// colorTexture.wrapT = THREE.MirroredRepeatWrapping;

/**
 * `Texture.offset.축`
 * => 설정한 값만큼 Texture 의 렌더링 시작점을 옮긴다.
 */
// colorTexture.offset.x = 0.5;
// colorTexture.offset.y = 0.5;

/**
 * `Texture.rotation`
 * => Texture를 회전시켜서 렌더링한다.
 * => `UV coordinator`의 원점(0, 0)은 좌측 하단 점이다.
 * => 그러므로 좌측 하단의 원전(0, 0)에서 지정한 각도(radian) 만큼 회전한다. 
 */
// colorTexture.rotation = Math.PI / 4;

/**
 * `Texture.center.축`
 * => Texture 의 `transform(변형)`의 원점을 지정한다.
 * => 지정하지 않으면, 위 주석과 같이 원점(0, 0)이 기본값이다.
 * 
 * => 아래의 (0.5, 0.5) 설정은, `Geometry`의 크기가 `width: 1`, `height: 1` 이기 때문에, 중심점 좌표값을 지정한 것이다.
 */
// colorTexture.center.x = 0.5;
// colorTexture.center.y = 0.5;

/**
 * Filtering & MipMapping
 * => Texture에 로드한 이미지의 원본 크기에서 절반씩 작은 버전의 이미지를 Three.js 내부적으로 만들어내고,
 * => 실제 렌더링되는 화면을 축소하여 렌더링되는 Texture 크기가 작게 된다면, 해당 크기에 맞는 버전의 이미지가 사용된다.
 * => 즉, 크기가 큰 원본 이미지를 그대로 사용하지 않고, 실제 렌더링되는 크기에 맞는 크기의 이미지를 사용하는 알고리즘이다.
 * 
 * => 프로젝트를 개발하면서 Texture.minMap 값을 바꿔보면서 원하는 렌더링 결과를 선택하는 정도로 사용하자.
 */
/**
 * `Texture.minFilter`
 * => 화면을 확대했을 때, Texture 를 어떻게 보여줄 것인가 설정
 */
/**
 * `THREE.NearestFilter`
 * => 화면을 확대했을 때(Texture를 사용하는 Mesh가 매우 크게 렌더링됨), blur 효과가 아니라 날카롭게 보이는듯?
 * 
 * => PC 성능을 덜 사용하므로, 성능 퍼포먼스나 Frame rate 에서 유리하다.
 * 
 * => 아래와 같이 `minFilter = THREE.NearestFilter` 를 사용하는 것은 `MipMapping` 을 사용하지 않는것과 유사하다.
 * => 그러므로, `MipMapping` 자체를 **미사용** 하는 것이 성능에서 유리핟다.
 * => `MipMapping` 미사용 처리 방법
 * => => `Texture.generateMipMaps = false`
 */
// colorTexture.minFilter = THREE.NearestFilter;
colorTexture.generateMipMaps = false;

/**
 * `Texture.magFilter`
 * => magFilter 의 FullName 은, `Magnification Filter`
 * => 화면을 축소했을 때(Texture를 사용하는 Mesh가 작게 렌더링됨) 또는,
 * => Texture를 사용한 이미지의 크기가 매우 작을 경우,
 * => 각 픽셀의 색상 경계를 blur 처리할 것인지, 마인크래프트처럼 날카롭게 구분할 것인지 설정
 */
colorTexture.magFilter = THREE.NearestFilter;



/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Object
 */
const geometry = new THREE.BoxGeometry(1, 1, 1)
// `UV coordinator`는 `Geometry` 에 `Texture` 를 어떻게 입힐지에 대한 좌표 등의 데이터를 가진다.
// console.log('geometry.attributes.uv: ', geometry.attributes.uv);
const material = new THREE.MeshBasicMaterial({
    map: colorTexture,
});
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

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
camera.position.z = 1
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