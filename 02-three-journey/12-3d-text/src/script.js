/**
 * Font 파일은 여러가지 확장자가 있다.
 * => ttf, otf, woff, woff2...
 * 
 * Three.js에서 Font를 사용하기 위해서는 Font 파일을 `JSON`파일로 변환해야 한다.
 * => [Font 변환 사이트](https://gero3.github.io/facetype.js/)
 */

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

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
 * AxesHelper
 */
const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
// const matcapTexture = textureLoader.load('/textures/matcaps/1.png', texture => {
const imageName = `${Math.ceil(Math.random() * 8)}.png`;
const matcapTexture = textureLoader.load(`/textures/matcaps/${imageName}`, texture => {
    /**
     * `texture.colorSpace` 설정
     * => `map` 또는 `matcap` 으로 사용할 `Texture`는 
     * => `colorSpace`를 `THREE.SRGBColorSpace`로 설정해야 원본 이미지와 동일한 배색이 렌더링된다.
     */
    texture.colorSpace = THREE.SRGBColorSpace;
});

/**
 * Fonts
 */
const fontLoader = new FontLoader();
fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    font => {
        const textGeometry = new TextGeometry(
            'Hello TextGeometry!',
            {
                font,
                size: 0.5,
                depth: 0.2,
                /**
                 * `curveSegment`: 문자의 둥근 부분을 몇 개의 segment로 표현할 것인지 설정
                 */
                curveSegments: 5,
                bevelEnabled: true,
                // z축 방향의 둥근 영역 두께
                bevelThickness: 0.03,
                // x, y축 방향의 둥근 영역 길이
                bevelSize: 0.02,
                bevelOffset: 0,
                /**
                 * `bevelSegment`: 문자의 모서리를 몇 개의 segment로 표현할 것인지 설정
                 * => 값이 커질수록 모서리가 둥글게 만들어진다.
                 */
                bevelSegments: 4,
            }
        );

        /**
         * TextGeometry 중앙 정렬하기
         * => Mesh 이동이 아닌, Geomety 이동이다!
         */

        /**
         * 방법 1)
         * 
         * => `bevel`이 차지하는 공간만큼, TextGeometry의 좌표값이 틀어지게 되는데,
         * => `bevel` 영역까지 정확하게 조정하기 위한 작업이 필요하다.
         * 
         * => `Mesh`가 아닌, `Geometry`를 이동하는 것은 Mesh를 이동, 회전, 스케일 조작을 했을 때,
         * => 변형의 원점을 변경하려는 목적이다.
         * 
         * Three.js는 카메라에 보이는 object만 렌더링하는데, 이를 `frustum culling` 이라고 한다.
         * object들이 카메라에 보이는지 파악하기 위해, object들의 공간 관련 정보들이 필요하다.
         * => 이 정보는 연산이 필요하며, 이러한 정보를 `bounding` 또는 `bounding volume` 이라고 한다.
         * 
         * `bevel` 영역까지 포함한 실제 object의 좌표값을 알기 위해서 `bounding volume`을 사용한다.
         * 
         * Three.js 의 기본 `bounding` 연산 방식은 (아마도..) `bounding sphere` 다.
         * 
         * `bounding volume` 값을 사용하려면, 먼저 연산 메소드를 호출해야 한다.
         * => `geometry.computeBoundingBox()`
         * => `geometry. computeBoundingSphere()`
         * 
         * `bounding volume` 연산 메소드를 호출했다면, `Geometry`에 연산 결과 좌표값이 반영된다.
         * => `geometry.computeBoundingBox()` => 결과: `geometry.boundingBox`
         * => `geometry.computeBoundingSphere()` => 결과: `geometry.boundingSphere`
         */
        // textGeometry.computeBoundingBox();
        // console.log('textGeometry.boundingBox: ', textGeometry.boundingBox);
        // textGeometry.computeBoundingSphere();
        // console.log('textGeometry.boundingSphere: ', textGeometry.boundingSphere);

        /**
         * `textGeometry.boundingBox` 를 사용하여, 원점이 중앙이 되도록 이동하기
         * 
         * 기본 좌표값은 `좌측 하단` 이므로, `-boundingBox.max.축 / 2` 만큼 이동하면, 중앙으로 이동할 수 있다.
         * => 하지만, `boundingBox`의 좌표값은 `bevel`이 적용된 값이므로, 이를 뺀 값의 절반이 중앙값이 된다.
         * 
         * 정확한 중앙으로 이동하기 위해서는
         * => `x`, `y`축에 대해서는 `textGeometry.bevelSize`를 빼고,
         * => => bevelSize: `textGeometry.parameters.options.bevelSize`
         * => `z`축에 대해서는 `textGeometry.bevelThickness`를 뺀다.
         * => => bevelThickness: `textGeometry.parameters.options.bevelThickness`
         */
        // textGeometry.translate(
        //     -(textGeometry.boundingBox.max.x - textGeometry.parameters.options.bevelSize) / 2,
        //     -(textGeometry.boundingBox.max.y - textGeometry.parameters.options.bevelSize) / 2,
        //     -(textGeometry.boundingBox.max.z - textGeometry.parameters.options.bevelThickness) / 2
        // );


        /**
         * 방법 2)
         * 
         * => 위 연산 방법과 동일한 방법을 `gemetry.center()` 메소드로 제공한다.
         */
        textGeometry.center();


        // 중앙으로 이동했는지 확인하기
        textGeometry.computeBoundingBox();
        console.log('중앙 정렬후 textGeometry.boundingBox: ', textGeometry.boundingBox);


        // const textMaterial = new THREE.MeshBasicMaterial();
        // const textMaterial = new THREE.MeshMatcapMaterial({
        //     matcap: matcapTexture,
        // });
        // textMaterial.wireframe = true;
        const material = new THREE.MeshMatcapMaterial({
            matcap: matcapTexture,
        });

        // const text = new THREE.Mesh(textGeometry, textMaterial);
        const text = new THREE.Mesh(textGeometry, material);
        scene.add(text);

        // Donut Mesh 100개 만들기
        console.time('donuts');

        const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45);
        // const donutMaterial = new THREE.MeshMatcapMaterial({
        //     matcap: matcapTexture,
        // });

        for (let i = 0; i < 300; i++) {
            /**
             * 최적화 하기
             * 
             * => `Geometry`와 `Material`이 동일하다면,
             * => 각각 1개의 인스턴스만 만들고, `Mesh`만 원하는 만큼 만들 수 있다.
             */
            // const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45);
            // const donutMaterial = new THREE.MeshMatcapMaterial({
            //     matcap: matcapTexture,
            // });

            // const donut = new THREE.Mesh(donutGeometry, donutMaterial);
            const donut = new THREE.Mesh(donutGeometry, material);
            donut.position.x = (Math.random() * 2 - 1) * 5;
            donut.position.y = (Math.random() * 2 - 1) * 5;
            donut.position.z = (Math.random() * 2 - 1) * 5;

            donut.rotation.x = Math.random() * Math.PI;
            donut.rotation.y = Math.random() * Math.PI;

            const scale = Math.random();
            donut.scale.set(scale, scale, scale);

            scene.add(donut);
        }

        /**
         * 최적화 전: 250ms
         * 
         * donuts만 최적화 후: 20ms
         * 
         * donuts, text 최적화 후: 14ms
         */
        console.timeEnd('donuts');
    }
);

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