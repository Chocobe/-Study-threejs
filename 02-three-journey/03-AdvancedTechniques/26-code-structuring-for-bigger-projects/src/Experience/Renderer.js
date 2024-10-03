import * as THREE from 'three';
import Experience from './Experience';

export default class Renderer {
  constructor() {
    this.experience = new Experience();
    this.canvas = this.experience.canvas;
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;

    this.setInstance();
  }

  setInstance() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: this.sizes.pixelRatio < 2,
    });

    /**
     * 최종 렌더링 시, 적용할 ColorSpace 설정 (기본값: SRGBColorSpace)
     * => `r152` 버전부터 `outputEncoding` => `outputColorSpace` 로 이름 변경됨
     * 
     * 이 설정의 역할
     * * 실제 화면에 출력하기 위한 흐름은 총 2가지 동작으로 구성된다.
     * 1. 렌더링을 위해, `SRGB` => `Linear` 로 변환
     * 2. 렌더링 결과물인 `이미지` 를 `Linear` => `SRGB` 로 `감마 보정` 하여 화면에 출력
     * => `WebGLRenderer.outputColorSpace`는 `2번째` 과정에서 `감마 보정` 여부를 설정하는 것이다.
     * 
     * `감마` 란?
     * * `밝기` 와 `색상`을 말한다.
     * 
     * `감마 보정`이 필요한 이유
     * * 사람의 눈은 `밝기`, `색상`을 인식하는데 `비선형`으로 인지한다.
     * * 렌더링을 위해 `밝기` 와 `색상`을 연산할 때는 `선형`으로 연산한다.
     * * 사람 눈의 `비선형` 특성에서 자연스럽게 보여지기 위해, `선형 렌더링 연산 결과` 를 `비선형`으로 `감마 보정`이 필요한 것이다.
     */
    this.instance.outputColorSpace = THREE.SRGBColorSpace;

    this.instance.toneMapping = THREE.CineonToneMapping;
    this.instance.toneMappingExposure = 1.75;

    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap;

    this.instance.setPixelRatio(this.sizes.pixelRatio);
    this.instance.setSize(this.sizes.width, this.sizes.height);
  }

  resize() {
    this.instance.setPixelRatio(this.sizes.pixelRatio);
    this.instance.setSize(this.sizes.width, this.sizes.height);
  }

  update() {
    this.instance.render(this.scene, this.camera.instance);
  }
}
