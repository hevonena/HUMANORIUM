import BaseShape from "./BaseShape.js";
import ParticleSystem from "../particles/ParticleSystem.js";
import RainParticleSystem from "../particles/RainParticleSystem.js";
import FireworkParticleSystem from "../particles/FireworkParticleSystem.js";
import FlowerParticleSystem from "../particles/FlowerParticleSystem.js";

export default class RemoteCube extends BaseShape {
  constructor(params) {
    super(params);
    this.clickable = false;
    this.setupAsRemote();
    this.addDebugLabel();
    this.addParticleSystem(params.title);
  }

  setupAsRemote() {
    this.mesh.material = this.materials.getTransparentMaterial();
    this.mesh.position.y = -this.params.cubeSize / 2;
    this.isPressed = true;
  }

  addParticleSystem(title) {
    switch (title) {
      case "rain":
        this.particleSystem = new RainParticleSystem(this.params);
        break;
      case "fireworks":
        this.particleSystem = new FireworkParticleSystem(this.params);
        break;
      case "flower":
        this.particleSystem = new FlowerParticleSystem(this.params);
        break;
      default:
        this.particleSystem = new ParticleSystem(this.params);
    }
    this.mesh.add(this.particleSystem.getParticleSystem());
  }

  update() {
    super.update();
    if (this.particleSystem) {
      this.particleSystem.update();
    }
  }

  activate() {
    this.isPressed = !this.isPressed;
    this.startTransition(
      this.isPressed ? -this.params.cubeSize / 2 : this.initialY + 1.75
    );
  }
}
