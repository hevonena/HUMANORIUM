import * as THREE from "three";
import Materials from "./Materials.js";

/**
 * Classe qui gère la création et la gestion d'un sol simple
 * Version simplifiée sans trous
 */
export default class FloorSimple {
  /**
   * Initialise une nouvelle instance de FloorSimple
   * @param {Object} params - Paramètres de configuration du sol
   * @param {number} params.gridSize - Taille de la grille (nombre de cubes par côté)
   * @param {number} params.cubeSize - Taille des cubes individuels
   * @param {number} params.cubeSpacing - Espacement entre les cubes
   */
  constructor(params) {
    // Stocke les paramètres de configuration
    this.gridSize = params.gridSize;
    this.cubeSize = params.cubeSize;
    this.cubeSpacing = params.cubeSpacing;

    // Définit les dimensions du sol
    this.floorSize = 52; // Taille totale du sol
    this.floorHeight = 0.2; // Épaisseur du sol

    // Create materials instance
    this.materials = new Materials(params);

    // Crée le sol initial
    this.createFloor();
  }

  /**
   * Crée le sol simple
   */
  createFloor() {
    // Création de la géométrie du sol (un simple plan rectangulaire)
    const geometry = new THREE.BoxGeometry(
      this.floorSize,
      this.floorHeight,
      this.floorSize
    );

    // Création du sol principal avec son matériau
    this.floor = new THREE.Mesh(geometry, this.materials.getFloorMaterial());
    this.floor.position.y = -4; // Position verticale du sol
    this.floor.receiveShadow = true;

    // Création du sol intérieur avec son matériau
    this.innerFloor = new THREE.Mesh(
      geometry,
      this.materials.getInnerFloorMaterial()
    );
    this.innerFloor.position.y = -4;
    this.innerFloor.receiveShadow = true;
  }

  /**
   * Ajoute le sol à la scène
   * @param {THREE.Scene} scene - La scène Three.js
   */
  addToScene(scene) {
    scene.add(this.floor);
    scene.add(this.innerFloor);
  }

  /**
   * Supprime le sol de la scène
   * @param {THREE.Scene} scene - La scène Three.js
   */
  removeFromScene(scene) {
    scene.remove(this.floor);
    scene.remove(this.innerFloor);
  }

  /**
   * Met à jour les couleurs du sol
   * @param {string|THREE.Color} floorColor - Nouvelle couleur du sol
   * @param {string|THREE.Color} innerWallColor - Nouvelle couleur du sol intérieur
   */
  updateColors(floorColor, innerWallColor) {
    this.materials.updateFloorColors(floorColor, innerWallColor);
  }
}
