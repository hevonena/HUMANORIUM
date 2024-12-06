import * as THREE from "three";

export default class ParticleSystem {
  constructor(params) {
    this.params = params;
    this.count = 200; // Number of particles
    this.speed = 0.2; // Speed of particle motion
    this.boundingBox = {
      width: this.params.cubeSize,
      height: this.params.cubeSize,
      depth: this.params.cubeSize,
    };

    this.createParticles();
    this.initParticles();
  }

  createParticles() {
    // Create particle geometry
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);
    const velocities = new Float32Array(this.count * 3);

    // Create particle material
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // Initialize random positions and velocities
    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      // Random position within cube bounds
      positions[i3] = (Math.random() - 0.5) * this.boundingBox.width;
      positions[i3 + 1] = (Math.random() - 0.5) * this.boundingBox.height;
      positions[i3 + 2] = (Math.random() - 0.5) * this.boundingBox.depth;

      // Random velocity
      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = -Math.random() * 0.02 - 0.01; // Downward bias
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    this.velocities = velocities;

    // Create particle system
    this.particles = new THREE.Points(particleGeometry, particleMaterial);
  }

  initParticles() {
    // Store original positions for resetting
    this.originalPositions =
      this.particles.geometry.attributes.position.array.slice();
  }

  update() {
    const positions = this.particles.geometry.attributes.position.array;

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;

      // Update positions with velocities
      positions[i3] += this.velocities[i3];
      positions[i3 + 1] += this.velocities[i3 + 1];
      positions[i3 + 2] += this.velocities[i3 + 2];

      // Check bounds and reset particles if needed
      if (positions[i3 + 1] < -this.boundingBox.height / 2) {
        positions[i3 + 1] = this.boundingBox.height / 2;
        // Add some randomness when resetting
        positions[i3] = (Math.random() - 0.5) * this.boundingBox.width;
        positions[i3 + 2] = (Math.random() - 0.5) * this.boundingBox.depth;
      }

      // Add some random motion
      this.velocities[i3] += (Math.random() - 0.5) * 0.001;
      this.velocities[i3 + 2] += (Math.random() - 0.5) * 0.001;

      // Constrain particles within bounds
      if (Math.abs(positions[i3]) > this.boundingBox.width / 2) {
        positions[i3] *= 0.95;
      }
      if (Math.abs(positions[i3 + 2]) > this.boundingBox.depth / 2) {
        positions[i3 + 2] *= 0.95;
      }
    }

    this.particles.geometry.attributes.position.needsUpdate = true;
  }

  getParticleSystem() {
    return this.particles;
  }

  dispose() {
    this.particles.geometry.dispose();
    this.particles.material.dispose();
  }
}
