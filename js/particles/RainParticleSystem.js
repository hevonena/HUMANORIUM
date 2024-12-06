import * as THREE from "three";

export default class RainParticleSystem {
  constructor(params) {
    this.params = params;
    this.count = 1000; // More particles since it's more performant
    this.boundingBox = {
      width: this.params.cubeSize * 0.8,
      height: this.params.cubeSize * 0.8,
      depth: this.params.cubeSize * 0.8,
    };

    this.createParticles();
  }

  createParticles() {
    // Create geometry for all particles
    const geometry = new THREE.BufferGeometry();

    // Arrays for positions and velocities
    const positions = new Float32Array(this.count * 3);
    this.velocities = new Float32Array(this.count);

    // Initialize random positions and velocities
    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;

      // Random position within bounds
      positions[i3] = (Math.random() - 0.5) * this.boundingBox.width;
      positions[i3 + 1] = (Math.random() - 0.5) * this.boundingBox.height;
      positions[i3 + 2] = (Math.random() - 0.5) * this.boundingBox.depth;

      // Random fall speed
      this.velocities[i] = -Math.random() * 0.15 - 0.1;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Create elongated point material
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      transparent: true,
      opacity: 1,
      //   blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    // Create the particle system
    this.particles = new THREE.Points(geometry, material);
  }

  update() {
    const positions = this.particles.geometry.attributes.position.array;

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;

      // Update Y position with velocity
      positions[i3 + 1] += this.velocities[i];

      // Reset if particle goes below bounds
      if (positions[i3 + 1] < -this.boundingBox.height / 2) {
        positions[i3] = (Math.random() - 0.5) * this.boundingBox.width;
        positions[i3 + 1] = this.boundingBox.height / 2;
        positions[i3 + 2] = (Math.random() - 0.5) * this.boundingBox.depth;
      }

      // Add slight wind effect
      positions[i3] += (Math.random() - 0.5) * 0.002;
      positions[i3 + 2] += (Math.random() - 0.5) * 0.002;

      // Keep within bounds
      positions[i3] = THREE.MathUtils.clamp(
        positions[i3],
        -this.boundingBox.width / 2,
        this.boundingBox.width / 2
      );
      positions[i3 + 2] = THREE.MathUtils.clamp(
        positions[i3 + 2],
        -this.boundingBox.depth / 2,
        this.boundingBox.depth / 2
      );
    }

    this.particles.geometry.attributes.position.needsUpdate = true;
    this.particles.rotation.y += 0.0002; // Slight rotation for more dynamic effect
  }

  getParticleSystem() {
    return this.particles;
  }

  dispose() {
    if (this.particles) {
      this.particles.geometry.dispose();
      this.particles.material.dispose();
    }
  }
}
