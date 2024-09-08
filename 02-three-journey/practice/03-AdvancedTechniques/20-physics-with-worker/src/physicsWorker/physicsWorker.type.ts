// three.js
import * as THREE from 'three';
// cannon.js
import * as CANNON from 'cannon-es';

export const physicsWorkerMessageTypeMapper = {
  ADD_FLOOR: 'addFloor',
  ADD_SPHERE: 'addSphere',
  UPDATE: 'update',
} as const;
export type TPhysicsWorkerMessageType = typeof physicsWorkerMessageTypeMapper[keyof typeof physicsWorkerMessageTypeMapper];

export type TPhysicsWorkerCommonMessage<
  TMessageType extends TPhysicsWorkerMessageType,
  TMessageData = any
> = {
  type: TMessageType;
  data: TMessageData;
};

//
// message
//
export type TPhysicsWorkerAddSphereMessageData = {
  radius: number;
  position: THREE.Vector3Like;
};

export type TPhysicsWorkerUpdateMessageData = {
  deltaTime: number;
};

export type TPhysicsWorkerUpdateReturnMessageData = {
  spheres: Array<{
    position: THREE.Vector3Like;
    quaterion: THREE.Vector3Like & {
      w: number;
    };
  }>;
};

export type TPhysicsWorkerMessage<TMessageType extends TPhysicsWorkerMessageType> =
  TMessageType extends 'addSphere' 
    ? TPhysicsWorkerCommonMessage<'addSphere', TPhysicsWorkerAddSphereMessageData> :
  TMessageType extends 'update' 
    ? TPhysicsWorkerCommonMessage<'update', TPhysicsWorkerUpdateMessageData> :
  undefined;

//
// physics material
//
export const physicsDefaultMaterial = new CANNON.Material('default');
