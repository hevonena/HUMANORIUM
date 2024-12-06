import * as THREE from 'three/webgpu';
import { AnimationMixer } from 'three/webgpu';

export default class Wagon {
    constructor(models) {
        const [model1, model2, model3, model4] = models;
        this.models = [model1.object, model2.object, model3.object, model4.object];
        this.mixers = this.models.map((model) => new AnimationMixer(model));
        this.actions = this.models.map((model, index) =>
            model.animations.map((clip) => this.mixers[index].clipAction(clip))
        );
        this.moves = this.actions.map((actionSet) => actionSet[0]); // Assuming the first clip is the 'move' action
        this.clock = new THREE.Clock();

        // console.log(this.actions);
    }

    toggle() {
        const allRunning = this.moves.every((move) => move.isRunning());

        this.moves.forEach((move) => {
            move.paused = allRunning;
            if (!allRunning) move.play();
        });
    }

    play() {
        this.moves.forEach((move) => {
            move.paused = false;
            if (!move.isRunning()) move.play();
        });
    }

    pause() {
        this.moves.forEach((move) => {
            if (move.isRunning()) move.paused = true;
        });
    }

    animate() {
        const delta = this.clock.getDelta();
        this.mixers.forEach((mixer) => mixer.update(delta));
    }
}