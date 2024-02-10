import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export {
	THREE,
	OrbitControls,
	RGBELoader,
	GLTFLoader,
	EffectComposer,
	RenderPass,
	UnrealBloomPass,
};

export function GenerateCanvas(domEl) {
	const canvas = document.createElement("canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	const parent = domEl ? domEl : document.body;
	parent.appendChild(canvas);

	return canvas;
}

export function MakeScrollArea() {
	const scrollWrapper = document.createElement("div");
	scrollWrapper.style.width = window.innerWidth + "px";
	scrollWrapper.style.height = window.innerHeight + "px";
	scrollWrapper.style.overflow = "scroll";

	const scrollEl = document.createElement("div");
	scrollEl.style.width = "100%";
	scrollEl.style.height = window.innerHeight * 5 + "px";

	document.body.appendChild(scrollWrapper);
	scrollWrapper.appendChild(scrollEl);

	return scrollWrapper;
}

export class CreateParticles {
	// constructor
	constructor(scene, size, radius, count, color, texture, opacity = 0.8) {
		this.radius = radius;
		this.scene = scene;
		this.particles;
		this.particleCount = count;
		this.particleSystem;
		this.positions = [];
		this.texture = texture;
		this.color = color;
		this.size = size;
		this.opacity = opacity;

		this.init();
	}

	init() {
		this.particles = new THREE.BufferGeometry();
		this.positions = new Float32Array(this.particleCount * 3);
		this.colors = new Float32Array(this.particleCount * 3);

		// place particles ring around center
		let radius = 20;
		for (let i = 0; i < this.particleCount; i++) {
			let x =
				Math.sin((i / this.particleCount) * Math.PI * 2) * radius +
				(Math.random() - 0.5) * radius;
			let y = (Math.random() - 0.5) * radius * 0.5;
			let z =
				Math.cos((i / this.particleCount) * Math.PI * 2) * radius +
				(Math.random() - 0.5) * radius;
			this.positions[i * 3] = x;
			this.positions[i * 3 + 1] = y;
			this.positions[i * 3 + 2] = z;
		}

		this.particles.setAttribute(
			"position",
			new THREE.BufferAttribute(this.positions, 3)
		);

		let particleMaterial = new THREE.PointsMaterial({
			size: this.size,
			color: new THREE.Color(this.color),
			map: new THREE.TextureLoader().load(this.texture),
			blending: THREE.AdditiveBlending,
			transparent: true,
			depthWrite: false,
			opacity: this.opacity,
		});
		this.particleSystem = new THREE.Points(this.particles, particleMaterial);

		this.scene.add(this.particleSystem);
	}

	update() {
		// rotate particle system
		const ptspeed = 0.001;
		this.particleSystem.rotation.y += ptspeed;

		// move particles
		let particlePositions =
			this.particleSystem.geometry.attributes.position.array;
		for (let i = 0; i < this.particleCount; i++) {
			let y = this.positions[i * 3 + 1];
			particlePositions[i * 3 + 1] =
				this.radius * 0.2 * Math.sin(i + this.particleSystem.rotation.y);
		}
		this.particles.attributes.position.needsUpdate = true;
	}
}
