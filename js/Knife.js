import * as THREE from 'three/webgpu';
import { AnimationMixer } from 'three/webgpu';

export default class Knife {
    constructor(model, coil) {
        this.model = model.object;
        this.coil = coil.object;

        // Retrieve animations (if any) from the model
        this.modelAnimations = this.model.animations || [];
        // Retrieve animations (if any) from the coil
        this.coilAnimations = this.coil.animations || [];

        // Model mixer and actions
        this.modelMixer = new AnimationMixer(this.model);
        this.modelActions = this.modelAnimations.map((clip) => this.modelMixer.clipAction(clip));
        this.modelMove = this.modelActions[0]; // Assuming the first animation is the main move

        // Coil mixer and actions
        this.coilMixer = new AnimationMixer(this.coil);
        this.coilActions = this.coilAnimations.map((clip) => this.coilMixer.clipAction(clip));
        this.coilMove = this.coilActions[0]; // Assuming the first coil animation is the main move

        this.clock = new THREE.Clock();
    }

    toggle() {
        // Toggle model animation
        if (this.modelMove) {
            if (this.modelMove.isRunning()) {
                this.modelMove.paused = true;
            } else {
                this.modelMove.paused = false;
                if (!this.modelMove.isRunning()) {
                    this.modelMove.play();
                }
            }
        }

        // Toggle coil animation
        if (this.coilMove) {
            if (this.coilMove.isRunning()) {
                this.coilMove.paused = true;
            } else {
                this.coilMove.paused = false;
                if (!this.coilMove.isRunning()) {
                    this.coilMove.play();
                }
            }
        }
    }

    play() {
        // Play model animation
        if (this.modelMove) {
            this.modelMove.paused = false;
            if (!this.modelMove.isRunning()) {
                this.modelMove.play();
            }
        }

        // Play coil animation
        if (this.coilMove) {
            this.coilMove.paused = false;
            if (!this.coilMove.isRunning()) {
                this.coilMove.play();
            }
        }
    }

    pause() {
        // Pause model animation
        if (this.modelMove && this.modelMove.isRunning()) {
            this.modelMove.paused = true;
        }

        // Pause coil animation
        if (this.coilMove && this.coilMove.isRunning()) {
            this.coilMove.paused = true;
        }
    }

    animate() {
        const delta = this.clock.getDelta();
        this.modelMixer.update(delta);
        this.coilMixer.update(delta);
    }
}