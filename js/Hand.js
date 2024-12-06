import * as THREE from 'three';
import { AnimationMixer } from 'three';

export default class Hand {
    constructor(models) {
        this.models = models.map((model) => model.object);
        this.fingers = this.models.slice(1);

        // Create an AnimationMixer for each finger
        this.mixers = this.fingers.map((finger) => new AnimationMixer(finger));

        // Extract and prepare actions for each finger's animations
        this.actions = this.fingers.map((finger, index) => {
            if (finger.animations && finger.animations.length > 0) {
                return finger.animations.map((clip) => this.mixers[index].clipAction(clip));
            }
            return []; // Return an empty array if no animations exist
        });

        // Select the first action from each set of actions as the 'move' action
        this.moves = this.actions.map((actionSet) => actionSet[0] || null).filter((move) => move);
        //play once
        this.moves.forEach((move) => move.setLoop(THREE.LoopOnce, 1));
    }

    play() {
        this.moves.forEach((move) => {
            if (!move.isRunning()) {
                move.reset();
                move.play();
            }
        });
    }



    animate(delta) {
        this.mixers.forEach((mixer) => mixer.update(delta));
    }
}