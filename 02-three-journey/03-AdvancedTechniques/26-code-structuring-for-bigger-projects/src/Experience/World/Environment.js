import * as THREE from 'three';
import Experience from '../Experience';

export default class Environment {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    this.setSunLight();
    this.setEnvironmentMap();
  }

  setSunLight() {
    this.sunLight = new THREE.DirectionalLight('#fff', 4);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.camera.far = 15;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.sunLight.shadow.normalBias = 0.05;
    this.sunLight.position.set(3.5, 2, -1.25);
    this.scene.add(this.sunLight);
  }

  setEnvironmentMap() {
    this.environmentMap = {};
    this.environmentMap.intensity = 0.4;
    this.environmentMap.texture = this.resources.items.environmentMapTexture;
    this.environmentMap.texture.colorSpace = THREE.SRGBColorSpace;

    this.scene.environment = this.environmentMap.texture;

    /**
     * `Resources`에서 로딩이 완료된 후, Environment 인스턴스를 생성하게 되며, `setEnvironmentMap()` 메소드가 호출된다.
     * => 배포 환경에서는 Texture, GLTF 를 불러오는데 더 많은 시간이 걸리는데,
     * => 이러한 로딩 시간에 의해, Texture가 실제로 렌더링되지 않는 현상이 발생하게 된다.
     * 
     * => 이러한 현상을 해결하기 위해, 모든 MeshStandardMaterial 에 `envMap`을 직접 적용하고,
     * => MeshStandardMaterial의 `needsUpdate = true`로 Matrix 업데이트를 트리거 시켜서,
     * => 모든 Texture, GLTF가 정상적으로 렌더링 되도록 하자.
     */
    this.environmentMap.updateMaterials = () => {
      this.scene.traverse(child => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.envMap = this.environmentMap.texture;
          child.material.envMapIntensity = this.environmentMap.intensity;
          child.material.needsUpdate = true;
        }
      });
    };
    this.environmentMap.updateMaterials();
  }
}
