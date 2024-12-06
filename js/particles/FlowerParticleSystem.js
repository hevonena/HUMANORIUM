import * as THREE from "three";

export default class FlowerParticleSystem {
  constructor(params) {
    this.params = params;
    this.boundingBox = {
      width: this.params.cubeSize * 0.9,
      height: this.params.cubeSize * 0.9,
      depth: this.params.cubeSize * 0.9,
    };

    // Rose parameters
    this.numLayers = 5; // Number of petal layers
    this.petalsPerLayer = 8; // Petals in each layer
    this.petalSize = 0.4; // Base petal size
    this.growthSpeed = 0.008; // Slower for more graceful opening
    this.rotationSpeed = 0.002;
    this.growthProgress = 0;

    this.container = new THREE.Group();
    this.container.position.y = this.boundingBox.height * 0.1;

    this.createRose();
  }

  createRosePetal() {
    const shape = new THREE.Shape();

    // Create heart-like petal shape
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.2, 0.1, 0.3, 0.4, 0, 0.8); // Right curve
    shape.bezierCurveTo(-0.3, 0.4, -0.2, 0.1, 0, 0); // Left curve

    return new THREE.ShapeGeometry(shape);
  }

  createRose() {
    // Create stem
    const stemGeometry = new THREE.CylinderGeometry(
      0.04,
      0.06,
      this.boundingBox.height * 0.7,
      8
    );
    const stemMaterial = new THREE.MeshPhongMaterial({
      color: 0x1b4d1b,
      shininess: 10,
    });
    this.stem = new THREE.Mesh(stemGeometry, stemMaterial);
    this.stem.position.y = -this.boundingBox.height * 0.35;
    this.stem.scale.set(0.01, 0.01, 0.01);
    this.container.add(this.stem);

    // Create center bud
    const budGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const budMaterial = new THREE.MeshPhongMaterial({
      color: 0x8b0000,
      shininess: 30,
    });
    this.center = new THREE.Mesh(budGeometry, budMaterial);
    this.center.scale.set(0.01, 0.01, 0.01);
    this.container.add(this.center);

    // Create petal layers
    this.petalLayers = [];
    const petalGeometry = this.createRosePetal();

    for (let layer = 0; layer < this.numLayers; layer++) {
      const layerGroup = new THREE.Group();
      const layerPetals = [];

      // Adjust size and color based on layer
      const layerSize = 1 + layer * 0.2; // Outer layers slightly larger
      const darkness = 1 - layer * 0.15; // Outer layers slightly darker

      for (let i = 0; i < this.petalsPerLayer; i++) {
        const petalMaterial = new THREE.MeshPhongMaterial({
          color: new THREE.Color().setHSL(0.95, 0.8, 0.3 + darkness * 0.2),
          shininess: 30,
          side: THREE.DoubleSide,
        });

        const petal = new THREE.Mesh(petalGeometry, petalMaterial);

        // Position petals in a circle with slight variations
        const angle = (i / this.petalsPerLayer) * Math.PI * 2;
        const radius = this.petalSize * (0.8 + layer * 0.3);

        petal.position.x = Math.cos(angle) * radius;
        petal.position.z = Math.sin(angle) * radius;
        petal.position.y = layer * 0.1; // Stack layers vertically

        // Rotate petals to create rose pattern
        petal.rotation.x = Math.PI / 3 + layer * 0.1;
        petal.rotation.y = -angle;
        petal.rotation.z = layer * 0.2;

        // Start closed
        petal.scale.set(0.01, 0.01, 0.01);

        layerPetals.push(petal);
        layerGroup.add(petal);
      }

      this.petalLayers.push(layerPetals);
      this.container.add(layerGroup);
    }

    // Add leaves
    this.leaves = [];
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.bezierCurveTo(0.3, 0.2, 0.4, 0.5, 0, 1);
    leafShape.bezierCurveTo(-0.4, 0.5, -0.3, 0.2, 0, 0);

    for (let i = 0; i < 3; i++) {
      const leafGeometry = new THREE.ShapeGeometry(leafShape);
      const leafMaterial = new THREE.MeshPhongMaterial({
        color: 0x2d5a27,
        shininess: 15,
        side: THREE.DoubleSide,
      });
      const leaf = new THREE.Mesh(leafGeometry, leafMaterial);

      leaf.position.y = -this.boundingBox.height * 0.35 + i * 0.4;
      leaf.rotation.y = (i * Math.PI * 2) / 3;
      leaf.rotation.x = Math.PI / 4;
      leaf.scale.set(0.01, 0.01, 0.01);

      this.leaves.push(leaf);
      this.container.add(leaf);
    }
  }

  update() {
    if (this.growthProgress < 1) {
      this.growthProgress += this.growthSpeed;

      // Grow stem and center
      const stemScale = this.easeOutQuad(this.growthProgress);
      this.stem.scale.set(stemScale, stemScale, stemScale);
      this.center.scale.set(stemScale, stemScale, stemScale);

      // Grow and unfurl petals layer by layer
      this.petalLayers.forEach((layer, layerIndex) => {
        const layerDelay = layerIndex * 0.15; // Delay outer layers
        const layerProgress = Math.max(
          0,
          (this.growthProgress - layerDelay) * 1.2
        );

        layer.forEach((petal, petalIndex) => {
          const scale = this.easeOutBack(layerProgress);
          petal.scale.set(scale, scale, scale);

          // Add subtle movement
          const time = Date.now() * 0.001;
          const wave = Math.sin(time + petalIndex * 0.5) * 0.05;
          petal.rotation.z += wave * 0.01;
        });
      });

      // Grow leaves
      this.leaves.forEach((leaf, index) => {
        const leafDelay = index * 0.1;
        const leafProgress = Math.max(
          0,
          (this.growthProgress - leafDelay) * 1.2
        );
        const scale = this.easeOutQuad(leafProgress);
        leaf.scale.set(scale, scale, scale);
      });
    }

    // Gentle overall rotation
    this.container.rotation.y += this.rotationSpeed;
  }

  easeOutQuad(x) {
    return 1 - (1 - x) * (1 - x);
  }

  easeOutBack(x) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }

  getParticleSystem() {
    return this.container;
  }

  dispose() {
    this.stem.geometry.dispose();
    this.stem.material.dispose();
    this.center.geometry.dispose();
    this.center.material.dispose();

    this.petalLayers.forEach((layer) => {
      layer.forEach((petal) => {
        petal.geometry.dispose();
        petal.material.dispose();
      });
    });

    this.leaves.forEach((leaf) => {
      leaf.geometry.dispose();
      leaf.material.dispose();
    });
  }
}
