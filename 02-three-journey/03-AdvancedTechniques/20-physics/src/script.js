import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
// import CANNON from 'cannon';
import * as CANNON from 'cannon-es';

/**
 * Debug
 */
const gui = new GUI()
const debugObject = {};

debugObject.createSphere = () => {
    const radius = Math.random() * 0.5;
    const position = {
        x: (Math.random() - 0.5) * 3,
        y: 3,
        z: (Math.random() - 0.5) * 3,
    };

    createSphere(radius, position);
};

debugObject.createBox = () => {
    const width = (Math.random() - 0.5) * 3;
    const height = (Math.random() - 0.5) * 3;
    const depth = (Math.random() - 0.5) * 3;

    const position = {
        x: (Math.random() - 0.5) * 3,
        y: 3,
        z: (Math.random() - 0.5) * 3,
    };

    createBox(width, height, depth, position);
}

debugObject.reset = () => {
    objectsToUpdate.forEach(object => {
        const {
            mesh,
            body,
        } = object;

        // Remove body
        body.removeEventListener('collide', playHitSound);
        world.removeBody(body);

        // Remove mesh
        scene.remove(mesh);
    });

    objectsToUpdate.splice(0, objectsToUpdate.length);
};

gui.add(debugObject, 'createBox');
gui.add(debugObject, 'createSphere');
gui.add(debugObject, 'reset');

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sounds
 */
const hitSound = new Audio('/sounds/hit.mp3');

/**
 * 
 * @param {{
 *      contact: CANNON.ContactEquation;
 * }} collision 
 */
const playHitSound = collision => {
    const impactStrength = collision.contact.getImpactVelocityAlongNormal();

    if (impactStrength > 1.5) {
        hitSound.volume = Math.random();
        hitSound.currentTime = 0;
        hitSound.play();
    }
};

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
])

/**
 * Physics
 */
// World
const world = new CANNON.World();
// 충돌 감지 알고리즘 설정 (Cannon.js)
// => 기본값은 `CANNON.NaiveBroadphase`
world.broadphase = new CANNON.SAPBroadphase(world);
// 더이상 움직이지도, 영향을 받지도 않는 객체는 `sleep`이 되도록 허용하는 설정
// => 움직이거나, 다른 물체와 충돌하지 않는 한, `sleep` 이 되고, 충돌 감지 연산의 성능을 높일 수 있다.
// => 기본값은 `false` 이므로, 꼭 설정하자
world.allowSleep = true;
world.gravity.set(0, -9.82, 0);

// Material
const defaultMaterial = new CANNON.Material('default');

const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1,
        restitution: 0.7,
    }
);
world.defaultContactMaterial = defaultContactMaterial;

// Floor
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
floorBody.mass = 0;
floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1, 0, 0),
    Math.PI * 0.5
);
floorBody.addShape(floorShape);
world.addBody(floorBody);

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
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
camera.position.set(- 3, 3, 3)
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
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Util
 * @type {Array<{
 *      mesh: THREE.Mesh
 *      body: CANNON.Body
 * }>}
 */
const objectsToUpdate = [];

// Sphere
// sphere 의 크기를 담당하는 radius 는 `단위값(1)` 로 생성한 후,
// `createSphere()` 에서 `Mesh`를 생성할 때, `scale`에 `radius` 를 적용하면, 동일한 크기의 `Sphere` 를 생성할 수 있다.
// => 그리고 `createSphere()` 의 `radius` 인자를 적용하여 생성할 수 있게 된다.
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
});

const createSphere = (
    radius,
    position
) => {
    // Three.js Mesh
    const mesh = new THREE.Mesh(
        sphereGeometry,
        sphereMaterial
    );
    mesh.castShadow = true;
    mesh.scale.set(radius, radius, radius);
    mesh.position.copy(position);
    scene.add(mesh);

    // Cannon.js body
    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape,
        material: defaultContactMaterial,
    });
    body.position.copy(position);
    body.addEventListener('collide', playHitSound);
    world.addBody(body);

    objectsToUpdate.push({
        mesh,
        body,
    });
};

createSphere(0.5, {
    x: 0,
    y: 3,
    z: 0,
});

// Box
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
});

const createBox = (width, height, depth, position) => {
    // Three.js Mesh
    const mesh = new THREE.Mesh(
        boxGeometry,
        boxMaterial
    );
    mesh.scale.set(width, height, depth);
    mesh.position.copy(position);
    scene.add(mesh);

    // Cannon.js Body
    const shape = new CANNON.Box(new CANNON.Vec3(
        width * 0.5,
        height * 0.5,
        depth * 0.5
    ));
    const body = new CANNON.Body({
        mass: 1,
        shape,
        material: defaultContactMaterial,
    });
    body.position.copy(position);
    body.addEventListener('collide', playHitSound);
    world.addBody(body);

    objectsToUpdate.push({
        mesh,
        body,
    });
}

/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0;

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime;
    oldElapsedTime = elapsedTime;

    // Update physics world
    world.step(1 / 60, deltaTime, 3);

    objectsToUpdate.forEach(object => {
        const {
            mesh,
            body,
        } = object;

        mesh.position.copy(body.position);
        mesh.quaternion.copy(body.quaternion);
    });

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()