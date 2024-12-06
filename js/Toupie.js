import * as THREE from 'three';

export default class Toupie {
    constructor(models) {
        this.models = models.map((model) => model.object);

        // Ensure models exist
        if (!this.models[0] || !this.models[1]) {
            throw new Error('Expected at least two models for Toupie.');
        }

        const toupie = this.models[0];
        const socle = this.models[1];

        // Initialize mixers for each model
        this.mixer1 = new THREE.AnimationMixer(toupie);
        this.mixer2 = new THREE.AnimationMixer(socle);

        // Ensure animations exist on models
        const toupieAnimations = toupie.animations || [];
        const socleAnimations = socle.animations || [];

        if (toupieAnimations.length === 0 || socleAnimations.length === 0) {
            throw new Error('Animations are missing on toupie or socle.');
        }

        // Prepare actions
        this.action1 = this.mixer1.clipAction(toupieAnimations[0]);
        this.action2 = this.mixer2.clipAction(socleAnimations[0]);

        // Set looping for actions
        this.action1.setLoop(THREE.LoopRepeat, 1);
        this.action2.setLoop(THREE.LoopRepeat, 1);
    }

    play() {
        if (!this.action1.isRunning() || !this.action2.isRunning()) {
            this.action1.reset();
            this.action2.reset();
            this.action1.play();
            this.action2.play();
        }
    }

    animate(delta) {
        if (this.mixer1) this.mixer1.update(delta);
        if (this.mixer2) this.mixer2.update(delta);
    }
}