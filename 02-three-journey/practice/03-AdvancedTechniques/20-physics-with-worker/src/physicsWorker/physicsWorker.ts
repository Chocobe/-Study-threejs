// cannon.js
import * as CANNON from 'cannon-es';
// type
import { 
  physicsDefaultMaterial,
  physicsWorkerMessageTypeMapper,
  TPhysicsWorkerAddSphereMessageData,
  TPhysicsWorkerMessage,
  TPhysicsWorkerMessageType,
  TPhysicsWorkerUpdateMessageData,
} from './physicsWorker.type';

//
// Config
//
const sphereBodies: CANNON.Body[] = [];

//
// Base
//
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.81, 0),
  allowSleep: true,
});
world.broadphase = new CANNON.SAPBroadphase(world);

//
// Material
//
const defaultContactMaterial = new CANNON.ContactMaterial(
  physicsDefaultMaterial,
  physicsDefaultMaterial,
  {
    friction: 0.4,
    restitution: 0.6,
  }
);
world.addContactMaterial(defaultContactMaterial);

//
// Method
//
function addFloor() {
  const shape = new CANNON.Plane();
  const body = new CANNON.Body({
    mass: 0,
    shape,
    position: new CANNON.Vec3(0, 0, 0),
    allowSleep: true,
    material: physicsDefaultMaterial,
  });
  body.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1, 0, 0),
    Math.PI * 0.5
  );

  world.addBody(body);
}

function addSphere(data: TPhysicsWorkerAddSphereMessageData) {
  const {
    position,
    radius,
  } = data;

  const shape = new CANNON.Sphere(radius);
  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(
      position.x,
      position.y,
      position.z
    ),
    material: physicsDefaultMaterial,
    shape,
    allowSleep: true,
  });

  sphereBodies.push(body);
  world.addBody(body);
}

function update(data: TPhysicsWorkerUpdateMessageData) {
  const {
    deltaTime,
  } = data;

  world.step(1 / 60, deltaTime, 3);

  self.postMessage({
    type: 'update',
    data: {
      spheres: sphereBodies.map(sphere => ({
        position: sphere.position,
        quaternion: sphere.quaternion,
      })),
    },
  });
}

const workerMethodMapper: Record<
  TPhysicsWorkerMessageType,
  (data: any) => any
> = {
  [physicsWorkerMessageTypeMapper.ADD_FLOOR]: addFloor,
  [physicsWorkerMessageTypeMapper.ADD_SPHERE]: addSphere,
  [physicsWorkerMessageTypeMapper.UPDATE]: update,
} as const;

//
// onMessage
//
self.onmessage = (e: MessageEvent<TPhysicsWorkerMessage<any>>) => {
  if (e.type !== 'message') {
    return;
  }

  const method = workerMethodMapper[e.data?.type as TPhysicsWorkerMessageType];
  const data = e.data?.data;

  method?.(data);
};
