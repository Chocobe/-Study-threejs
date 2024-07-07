# Three.js Journey

## Setup
Download [Node.js](https://nodejs.org/en/download/).
Run this followed commands:

``` bash
# Install dependencies (only the first time)
npm install

# Run the local server at localhost:8080
npm run dev

# Build for production in the dist/ directory
npm run build
```



<br /><hr /><br />



# 1. Texture를 사용할 때, 최적화 하는 방법 3가지 포인트

* File 용량이 작을수록 좋다.
* 이미지 해상도
* Texture data

<br />

## 1-1. File 용량이 작을수록 좋다.

`.jpg` 는 **lossy compresion(손실 압축)` 을 하는 대신, 용량이 작다. 
`.png` 는 **lossless compresion(무손실 압축)` 을 하는 대신, 용량이 크다.

그러므로, `.png` 이미지를 사용한다면, `.jpg` 로 변환해서 사용하는 것이 좋다.

* [`.jpg` => `.png` 변환 사이트](https://tinypng.com/)

<br />

## 1-2. 이미지 해상도 1

`Texture` 는 `GPU` 로 전달하여 사용된다.

해상도가 큰 이미지(`Texture`)는 `GPU` 에 부담이 된다. (`GPU` 에 전달할 수 없을수도 있다.)

그래서 **가능한 작은 해상도 이미지** 를 `Texture` 로 사용하는 것이 좋다.

<br />

## 1-3. 이미지 해상도 2

`Texture` 를 사용할 때, `Texture.generateMips = false` 로 직접 `MipMapping` 을 미사용 처리하지 안흔 한, `MipMapping` 동작인 **원본 이미지의 절반씩 줄여나가는 버전들** 을 생성하게 된다.

만약 이미지 해상도가 2로 나누어 떨어지지 않는 값이라면, `GPU` 는 생성한 `MipMapping` 이미지를 늘려서 렌더링하게 되며, 이로 인해 이미지가 늘어난 것처럼 렌더링되는 현상이 발생한다.

그러므로, 2의 배수의 값을 해상도로 가지는 이미지를 사용하는 것이 좋다.

* 512 * 512
* 1024 * 1024
* 512 * 2048

그리고 브라우저 콘솔에 에러가 출력될 것이다.

<br />

## 1-4 Texture data 1

투명(`transparency`) 를 위해 `png` 를 사용한다면, 이는 `Alpha Texture` 와 함께 `png` 이미지 2개로 처리할 수 있다고 한다.

`png` 파일을 2개 사용하게 되지만, `jpg` 보다 용량이 작아서 성능에서 이점이 생긴다고 한다.

<br />

## 1-5 Texture data 2

`Normal Texture` 를 사용하게 될 경우, 이미지의 정확한 좌표값이 필요하다고 한다.

때문에 `손실 이미지` 인 `png` 를 사용하면, 빛 반사나 그림자 등에서 원하는 결과가 나오지 않는다고 한다.

때문에 `Normal Texture` 를 사용할 경우에는 `jpg` 이미지를 사용한다고 한다.

(그렇다고 `png` 를 `jpg` 로 변환하게 되면, 이미 손실된 압축을 사용하게 되므로, `GPU` 에서 렌더링한 결과는 `png` 와 같은 원치않는 결과가 렌더링 된다.)



<br /><hr /><br />



## 2. Texture 이미지 제작

Adobe 의 [Substance 3D Designer](https://www.adobe.com/kr/products/substance3d-designer.html?promoid=FHRLZ9BG&mv=other) 으로 Texture 용 이미지를 직접 만들 수 있다.
