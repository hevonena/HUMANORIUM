import * as THREE from "three/webgpu";

/**
 * Classe gérant les lumières de la scène
 */
export default class Lights {
  /**
   * Initialise une nouvelle instance de Lights
   * @param {THREE.Scene} scene - La scène Three.js
   */
  constructor(scene) {
    this.scene = scene;
    this.setupLights();
  }

  /**
   * Configure toutes les lumières de la scène
   */
  setupLights() {
    // this.createMainLight();
    this.createAmbientLight();
    // this.createFillLight();
    // this.createHelpers();
  }

  createHelpers() {
    const mainLightHelper = new THREE.DirectionalLightHelper(this.mainLight, 5);
    const fillLightHelper = new THREE.DirectionalLightHelper(this.fillLight, 5);

    this.scene.add(mainLightHelper);
    this.scene.add(fillLightHelper);
  }

  /**
   * Crée et configure la lumière directionnelle principale
   */
  createMainLight() {
    this.mainLight = new THREE.DirectionalLight("#ffffff", 2);
    this.mainLight.position.set(-8, 8, 8);

    // Paramètres des ombres
    this.mainLight.castShadow = true;
    this.mainLight.shadow.mapSize.width = 1024;
    this.mainLight.shadow.mapSize.height = 1024;

    // Configuration de la caméra d'ombre
    this.mainLight.shadow.camera.near = 0.1;
    this.mainLight.shadow.camera.far = 50;
    this.mainLight.shadow.camera.left = -15;
    this.mainLight.shadow.camera.right = 15;
    this.mainLight.shadow.camera.top = 15;
    this.mainLight.shadow.camera.bottom = -15;
    this.mainLight.shadow.radius = 5;

    this.scene.add(this.mainLight);
  }

  /**
   * Crée et configure la lumière ambiante
   */
  createAmbientLight() {
    this.ambientLight = new THREE.AmbientLight("#ffffff", 2);
    this.scene.add(this.ambientLight);
  }

  /**
   * Crée et configure la lumière de remplissage
   */
  createFillLight() {
    this.fillLight = new THREE.DirectionalLight("#e8f4ff", 2);
    this.fillLight.position.set(-5, 8, -9);

    this.fillLight.castShadow = true;
    this.fillLight.shadow.mapSize.width = 1024;
    this.fillLight.shadow.mapSize.height = 1024;

    this.scene.add(this.fillLight);
  }

  dispose() {
    this.scene.remove(this.mainLight);
    this.scene.remove(this.ambientLight);
    this.scene.remove(this.fillLight);
  }
}
