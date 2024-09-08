// type
import { 
  physicsWorkerMessageTypeMapper,
  TPhysicsWorkerAddSphereMessageData,
  TPhysicsWorkerCommonMessage,
  TPhysicsWorkerUpdateMessageData,
} from './physicsWorker.type';

export const createAddFloorMessage = (): TPhysicsWorkerCommonMessage<
  typeof physicsWorkerMessageTypeMapper.ADD_FLOOR,
  undefined
> => {
  return {
    type: 'addFloor',
    data: undefined,
  };
}

export const createAddSphereMessage = (
  data: TPhysicsWorkerAddSphereMessageData
): TPhysicsWorkerCommonMessage<
  typeof physicsWorkerMessageTypeMapper.ADD_SPHERE,
  TPhysicsWorkerAddSphereMessageData
> => {
  return {
    type: 'addSphere',
    data,
  };
};

export const createUpdateMessage = (
  data: TPhysicsWorkerUpdateMessageData
): TPhysicsWorkerCommonMessage<
  typeof physicsWorkerMessageTypeMapper.UPDATE,
  TPhysicsWorkerUpdateMessageData
> => {
  return {
    type: 'update',
    data,
  };
};
