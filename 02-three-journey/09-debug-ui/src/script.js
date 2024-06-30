import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import GUI from 'lil-gui';

/**
 * Debug
 */
const gui = new GUI({
    width: 300,
    title: 'Nice debug UI',
    closeFolders: false,
});
// gui.close();
// gui.hide();
// `h` 단축키를 사용하여 gui 패널 토글 만들기
window.addEventListener('keypress', event => {
    const key = event.key;

    if (key === 'h') {
        console.log('gui._hidden: ', gui._hidden);
        gui.show(gui._hidden);
    }
})

const debugObject = {
    // mesh를 생성하는 곳에서 직접 color 속성을 초기화 함
};

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
debugObject.color = '#a778d8';

const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2)
// const material = new THREE.MeshBasicMaterial({ color: '#dcc31e' })
const material = new THREE.MeshBasicMaterial({
    color: debugObject.color,
    wireframe: true,
});
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// gui에 folder를 만들어서 그룹으로 묶기
const cubeTweaks = gui.addFolder('Awesome cube');
// cubeTweaks.close();

// gui.add(mesh.position, 'y');
// gui.add(mesh.position, 'y', -3, 3, 0.01);
cubeTweaks
    .add(mesh.position, 'y')
    .min(-3)
    .max(3)
    .step(0.01)
    .name('elevation');

cubeTweaks
    .add(mesh, 'visible');

cubeTweaks
    .add(mesh.material, 'wireframe');

// Issue) Material 오브젝트를 직접 연결하면, ColorPallet 로 변경한 색상값이 Three.js 에는 변경되어 적용된다.
// Solution) GUI로 변경한 색상값을 저장할 별도의 object 를 사용한다.
cubeTweaks
    .addColor(debugObject, 'color')
    .onChange(
        /**
         * 
         * @param {THREE.Color} value 
         */
        () => {
            mesh.material.color.set(debugObject.color);
        }
    );

// Button 형식의 GUI 디버그 기능 추가하기 (클릭 시, 회전함)
debugObject.spin = () => {
    gsap.to(mesh.rotation, {
        y: mesh.rotation.y + Math.PI * 2,
        duration: 2,
    });
};
cubeTweaks
    .add(debugObject, 'spin');

// BoxGeometry 의 각 축의 segment 개수 변경 디버그 추가하기
debugObject.subdivision = 2;
cubeTweaks
    .add(debugObject, 'subdivision')
    .min(1)
    .max(20)
    .step(1)
    // .onChange(() => {
    //     console.log('subdivision has been changed');
    // })
    .onFinishChange(() => {
        mesh.geometry.dispose();
        mesh.geometry = new THREE.BoxGeometry(
            1, 1, 1,
            debugObject.subdivision, debugObject.subdivision, debugObject.subdivision
        );
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

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()