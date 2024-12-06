import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import Materials from "../Materials.js";

export default class BaseShape {
  static DEFAULTS = {
    holeDepth: 4,
    floorY: -4,
    transitionSpeed: 0.1,
  };

  constructor(params) {
    this.params = params;
    this.uid = params.uid;
    this.name = params.name;

    // Create materials
    const colorIndex = this.params.i * this.params.gridColumns + this.params.j;
    this.materials = new Materials(this.params);
    this.materials.createStandardMaterial(colorIndex);

    this.createMesh();
    this.setupPositioning();
    this.setupAnimationState();
  }

  createMesh() {
    const geometry =
      this.params.geometry ||
      new RoundedBoxGeometry(
        this.params.cubeSize, // width
        this.params.cubeSize, // height - now fixed to cubeSize
        this.params.cubeSize, // depth
        6, // segments
        0.4 // radius
      );

    this.mesh = new THREE.Mesh(geometry, this.materials.getStandardMaterial());
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    // Store the height for later use
    this.height = this.params.cubeSize;
  }

  setupPositioning() {
    const centerOffsetX =
      ((this.params.gridColumns - 1) * this.params.spacing) / 2;
    const centerOffsetZ =
      ((this.params.gridRows - 1) * this.params.spacing) / 2;

    this.mesh.position.x = this.params.j * this.params.spacing - centerOffsetX;
    this.mesh.position.z = this.params.i * this.params.spacing - centerOffsetZ;
    this.mesh.position.y =
      BaseShape.DEFAULTS.floorY + BaseShape.DEFAULTS.holeDepth;

    this.initialY = this.mesh.position.y;
    this.floorY = BaseShape.DEFAULTS.floorY;
  }

  setupAnimationState() {
    this.isPressed = false;
    this.isTransitioning = false;
    this.transitionProgress = 0;
    this.transitionSpeed = BaseShape.DEFAULTS.transitionSpeed;
    this.currentY = this.initialY;
    this.targetY = this.initialY;
  }

  startTransition(targetY) {
    this.isTransitioning = true;
    this.transitionProgress = 0;
    this.currentY = this.mesh.position.y;
    this.targetY = targetY;
  }

  update() {
    if (!this.isTransitioning) return;

    this.transitionProgress = Math.min(
      this.transitionProgress + this.transitionSpeed,
      1
    );

    const eased = this.easeInOutCubic(this.transitionProgress);
    const newY = this.currentY + (this.targetY - this.currentY) * eased;
    // console.log("update", newY);
    this.mesh.position.y = newY;

    if (this.transitionProgress >= 1) {
      this.isTransitioning = false;
      this.mesh.position.y = this.targetY;
    }
  }

  /**
   * Cubic easing for smooth transitions
   * @param {number} x - Value between 0 and 1
   * @returns {number} Eased value
   */
  easeInOutCubic(x) {
    return x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2;
  }

  get isDown() {
    return this.isPressed;
  }

  get isMoving() {
    return this.isTransitioning;
  }

  set positionY(y) {
    this.mesh.position.y = y;
  }

  addDebugLabel() {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.uid, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    const debugMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });

    const debugPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(this.params.cubeSize, this.params.cubeSize),
      debugMaterial
    );
    debugPlane.rotation.x = -Math.PI / 2;
    debugPlane.position.y = this.params.cubeSize / 2 + 0.01;
    debugPlane.raycast = () => {};

    this.mesh.add(debugPlane);
  }

  updateMaterial(params, index) {
    this.materials.updateTransparentMaterial(params);
  }
}
