import * as THREE from "three";
import { AnimationMixer } from "three/webgpu";

export default class FootMachine {
    constructor(model) {
        this.model = model.object;
        this.animations = this.model.animations;

        this.mixer = new AnimationMixer(this.model);
        console.log(this.animations);

        // Store all actions
        this.actions = this.animations.map((clip) => this.mixer.clipAction(clip));

        this.clock = new THREE.Clock();
    }

    toggle() {
        // Toggle all actions
        // this.actions.forEach((action) => {
        //     if (action.isRunning()) {
        //         action.stop();
        //     } else {
        //         action.play();
        //     }
        // });
        let i = 1;
        if (this.actions[i].isRunning()) {
            this.actions[i].stop();
        } else {
            this.actions[i].play();
        }
        if (this.actions[2].isRunning()) {
            this.actions[2].stop();
        } else {
            this.actions[2].play();
        }
    }

    play() {
        // Play all actions
        // this.actions.forEach((action) => action.play());
        this.actions[0].play()
    }

    stop() {
        // Stop all actions
        this.actions.forEach((action) => action.stop());
        //reset the animation
        this.mixer.uncacheRoot(this.model);
    }

    animate() {
        const delta = this.clock.getDelta();
        this.mixer.update(delta);
    }
}