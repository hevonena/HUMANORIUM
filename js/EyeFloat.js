import * as THREE from 'three/webgpu';
import { AnimationMixer } from 'three/webgpu';

export default class EyeFloat {
    constructor(models) {
        const [model1, model2, model3, model4] = models;
        this.models = [model1.object, model2.object, model3.object, model4.object];

        this.mixers = this.models.map((model) => new AnimationMixer(model));

        this.actions = this.models.map((model, index) =>
            model.animations.map((clip) => this.mixers[index].clipAction(clip))
        );
        this.moves = this.actions.map((actionSet) => actionSet[0]); // Assuming the first clip is the 'move' action
        this.clock = new THREE.Clock();

        //no loop

        this.moves.forEach((move) => {
            move.setLoop(THREE.LoopOnce);
        });

        // console.log(this.actions);

        // this.clock = new THREE.Clock();
    }

    play() {
        console.log("play eye float");
        if (!this.moves[0].isRunning()) {
            // Pause the animation by setting the action to paused
            this.moves.forEach((move) => {
                move.reset();
                move.play()
            })
        }
    }

    animate(delta) {
        // const delta = this.clock.getDelta();
        this.mixers.forEach((mixer) => mixer.update(delta));
    }
}