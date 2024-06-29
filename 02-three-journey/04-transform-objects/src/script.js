import * as THREE from 'three'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
// const mesh = new THREE.Mesh(geometry, material)

/**
 * Object3D.position
 */
// mesh.position.x = 0.7;
// mesh.position.y = -0.6;
// mesh.position.z = 1;
// mesh.position.set(0.7, -0.6, 1);
// scene.add(mesh)

/**
 * Object3D.scale
 */
// mesh.scale.x = 2;
// mesh.scale.y = 0.5;
// mesh.scale.z = 0.5;
// mesh.scale.set(2, 0.5, 0.5);

/**
 * Object3D.rotation
 * `Euler Angle` 이론을 사용하는 회전 방식이다.
 * Object3D 자체의 Axes 를 가지는 방식으로, Object3D 가 회전할 때 Axes 도 함께 회전하게 된다.
 * => 그러므로, x, y, z 에 대한 회전 순서가 달라지면, 회전 결과도 달라진다.
 * 
 * 회전 순서의 기본값은 `XYZ` 이며, `Object3D.rotation.reorder('회전순서')` 메서드를 사용하여 변경할 수 있다.
 * 
 * 참고: `rotation` 을 변경하면 `quaternion` 에도 rotation 의 결과와 동일한 변경값이 반영된다.
 * => 하지만, `rotation`과 `quaternion` 의 **연산식** 은 다르기 때문에, 회전 결과물은 동일하지만, 값은 다르다.
 */
// mesh.rotation.reorder('YXZ');
// mesh.rotation.x = Math.PI * 0.25;
// mesh.rotation.y = Math.PI * 0.25;

/**
 * Sizes
 */
const sizes = {
    width: 800,
    height: 600
}

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3;
scene.add(camera)

/**
 * Object3D.position.distanceTo() 를 사용하여,
 * mesh 와 camera 의 (적대값)거리 구하기
 */
// console.log('The distance to mesh from camera: ', mesh.position.distanceTo(camera.position));
// console.log(camera.position.distanceTo(mesh.position));

/**
 * Object3D.position.normalize()
 * Object3D 의 현재 position 을 조정하여, 좌표계 원점에서의 거리가 `1` 이 되는 position으로 이동시킨다.
 */
// mesh.position.normalize();
// console.log('mesh.position.length: ', mesh.position.length());

const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);

// camera.lookAt(mesh.position);

/**
 * Group
 */
const group = new THREE.Group();
group.position.y = 1;
group.scale.y = 2;
group.rotation.y = 1;
scene.add(group);

const cube1 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0xFF0000 })
);
group.add(cube1);

const cube2 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x00FF00 })
);
cube2.position.x = -2;
group.add(cube2);

const cube3 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x0000FF })
);
cube3.position.x = 2;
group.add(cube3);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)