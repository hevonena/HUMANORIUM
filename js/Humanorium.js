import { AnimationMixer } from 'three';
import * as THREE from 'three';

export default class Humanorium {
    constructor(models) {
        this.models = models.map((model) => model.object);

        const helice1 = this.models[1];
        const helice2 = this.models[2];

        helice2.traverse((child) => {
            if (child === "Cube019_1") {
                console.log("child", child);
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xfffafa,
                    roughness: 0.9,
                    metalness: 0.1,
                    emissive: 0xff0000,
                    emissiveIntensity: 100,
                });
            }
        });

        this.mixer1 = new AnimationMixer(helice1);
        this.mixer2 = new AnimationMixer(helice2);

        this.action1 = this.mixer1.clipAction(helice1.animations[0]);
        this.action2 = this.mixer2.clipAction(helice2.animations[0]);

        this.clock = new THREE.Clock();
        this.play();
    }

    play() {
        if (this.action1) this.action1.play();
        if (this.action2) this.action2.play();
    }

    animate() {
        const delta = this.clock.getDelta();
        if (this.mixer1) this.mixer1.update(delta);
        if (this.mixer2) this.mixer2.update(delta);
    }
}