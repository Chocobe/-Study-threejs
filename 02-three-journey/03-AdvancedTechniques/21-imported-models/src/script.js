import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {
    GLTFLoader,
} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
    DRACOLoader,
} from 'three/examples/jsm/loaders/DRACOLoader.js';
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
 * GLTF Models
 * 
 * `GLTFLoader`로 불러올 수 있는 파일 포맷 3가지
 * * => `GLTF`, `GLTF Binary`, `GLTF Embedded`
 * * => `Draco` 포맷은 불러올 수 없다.
 */
const gltfLoader = new GLTFLoader();

/** Duck model */
// gltfLoader.load(
//     '/models/Duck/glTF/Duck.gltf',
//     gltf => {
//         scene.add(gltf.scene.children[0]);
//     }
// )
// gltfLoader.load(
//     '/models/Duck/glTF-Binary/Duck.glb',
//     gltf => {
//         scene.add(gltf.scene.children[0]);
//     }
// )
// gltfLoader.load(
//     '/models/Duck/glTF-Embedded/Duck.gltf',
//     gltf => {
//         scene.add(gltf.scene.children[0]);
//     }
// )

/** FlightHelmet */
// gltfLoader.load(
//     '/models/FlightHelmet/glTF/FlightHelmet.gltf',
//     gltf => {
//         const children = [...gltf.scene.children];

//         for (const child of children) {
//             scene.add(child);
//         }
//     }
// )

/**
 * DRACO Models
 * 
 * * `GLTF`처럼 3D Model 파일 확장자다.
 * * `GLTF` 파일보다 2배 이상 가볍다.
 * * `DRACOLoader`는 `WebAssembly`로 구현되어 있기 때문이다.
 * 
 * * Model이 `kb` 단위의 크기라면, 굳이 사용할 필요 없지만,
 * * `mb` 단위의 큰 Model 일 때 사용하자.
 * 
 * `node_modeuls` 의 `three` 에 있는 `draco` 폴더를 사용하여, DRACOLoader 의 worker를 사용한다.
 * * 체감이 될 정도로 로딩 속도가 빠르다.
 * * DRACOLoader 를 GLTFLoader에 설정해주면, GLTFLoader 가 DRACOLoader 를 사용하여 로딩하게 된다.
 * * => 만약, 불러올 파일이 `DRACO` 가 아닌 `GLTF` 형식이라면, 내부에서 DRACOLoader를 사용하지 않고, 원래의 GLTFLoader 방식으로 Model을 불러온다.
 * 
 * `GLTFLoader.setDecoderPath()` 를 사용하여 `DRACO` decoder 를 설정할 수 있는데,
 * * 경로에 `Trailing Slash` 를 잊지 말자.
 */
const dracoLoader = new DRACOLoader();
// 아래와 같이 `Trailing Slash` 가 없으면, DRACOLoader가 동작하지 않아서, Model이 렌더링되지 않는다.
// dracoLoader.setDecoderPath('/draco');
dracoLoader.setDecoderPath('/draco/');

gltfLoader.setDRACOLoader(dracoLoader);
// gltfLoader.load(
//     '/models/Duck/glTF-Draco/Duck.gltf',
//     gltf => {
//         scene.add(gltf.scene);
//     }
// )

/** Animate Model */
let mixer;

gltfLoader.load(
    '/models/Fox/glTF/Fox.gltf',
    gltf => {
        console.log('gltf:', gltf);

        mixer = new THREE.AnimationMixer(gltf.scene);
        const action = mixer.clipAction(gltf.animations[2]);
        action.play();

        gltf.scene.scale.set(0.025, 0.025, 0.025);
        scene.add(gltf.scene);
    }
)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

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
camera.position.set(2, 2, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update mixer
    mixer?.update(deltaTime);

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()