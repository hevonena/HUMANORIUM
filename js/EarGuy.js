import * as THREE from 'three/webgpu';
import { AnimationMixer } from 'three/webgpu';

export default class EarGuy {
    constructor(model) {
        this.model = model.object;
        this.animations = this.model.animations;

        this.mixer = new AnimationMixer(this.model);

        //no loop


        // Store all actions
        this.actions = this.animations.map((clip) => this.mixer.clipAction(clip));

        this.move = this.actions[0];

        this.move.setLoop(THREE.LoopOnce, 1);

        // console.log(this.actions);

        this.clock = new THREE.Clock();
    }

    play() {
        if (!this.move.isRunning()) {
            // Pause the animation by setting the action to paused
            this.move.reset();
            this.move.play()
        } 
    }

    animate() {
        const delta = this.clock.getDelta();
        this.mixer.update(delta);
    }
}