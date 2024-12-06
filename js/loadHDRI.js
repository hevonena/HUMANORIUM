import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import * as THREE from "three/webgpu";

export const loadHDRI = (path, renderer) => {
	return new Promise((resolve, reject) => {
		new RGBELoader().load(path, (texture) => {
			const gen = new THREE.PMREMGenerator(renderer);
			const envMap = gen.fromEquirectangular(texture).texture;
			texture.dispose();
			gen.dispose();
			resolve(envMap);
		});
	});
};
