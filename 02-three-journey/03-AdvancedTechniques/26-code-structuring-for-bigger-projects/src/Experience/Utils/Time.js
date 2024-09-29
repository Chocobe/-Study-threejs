import EventEmitter from './EventEmitter';

export default class Time extends EventEmitter {
  constructor() {
    super();

    // 시작 시간 timestamp
    this.start = Date.now();
    // 현재 시간 timestamp
    this.current = this.start;
    // 이전 Frame에서 현재 Frame까지 경과 시간
    this.elapsed = this.current - this.start;

    // `delta`는 `FPS` 단위값
    // => 일반적으로 `1000/60` Frame으로 렌더링하므로, 아래와 같은 초기값 사용
    this.delta = Math.floor(1000 / 60); // `16ms`

    // `this.tick()`으로 호출하지 않는 이유,
    // => `this.delta` 초기값을 `1 Frame` 시점의 값을 지정했으므로,
    // => 최초 `tick()` 호출도 `1 Frame` 이 지나고 호출되도록 동기화 하기 위함이다.
    window.requestAnimationFrame(() => {
      this.tick();
    });
  }

  tick() {
    const currentTime = Date.now();
    this.delta = currentTime - this.current;
    this.current = currentTime;
    this.elapsed = this.current - this.start;

    this.trigger('tick');

    window.requestAnimationFrame(() => {
      this.tick();
    });
  }
}
