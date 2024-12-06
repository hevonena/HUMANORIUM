import * as THREE from "three/webgpu";
import Materials from "./Materials.js";

/**
 * Classe qui gère la création et la gestion du sol
 * Permet de créer un sol avec des trous pour les cubes et des murs intérieurs
 */
export default class Floor {
  /**
   * Initialise une nouvelle instance de Floor
   * @param {Object} params - Paramètres de configuration du sol
   * @param {number} params.gridColumns - Nombre de colonnes de la grille
   * @param {number} params.gridRows - Nombre de lignes de la grille
   * @param {number} params.cubeSize - Taille des cubes individuels
   * @param {number} params.cubeSpacing - Espacement entre les cubes
   */
  constructor(params) {
    console.log("Floor constructor", params);
    // Stocke les paramètres de configuration
    this.gridColumns = params.gridColumns;
    this.gridRows = params.gridRows;
    this.cubeSize = params.cubeSize;
    this.cubeSpacing = params.cubeSpacing;

    // Définit les dimensions du sol et des trous
    this.floorSize = 52; // Taille totale du sol
    this.holeSize = this.cubeSize + 0.4; // Taille des trous légèrement plus grande que les cubes
    this.holeDepth = 4; // Profondeur des trous

    // Create materials instance
    this.materials = new Materials(params);

    // Crée le sol initial
    this.createFloor();
  }

  /**
   * Crée la forme de base du sol avec les trous
   * Utilise THREE.Shape pour définir le contour et les trous
   */
  createFloorShape() {
    const shape = new THREE.Shape();
    // Dessine le contour carré du sol
    shape.moveTo(-this.floorSize / 2, -this.floorSize / 2);
    shape.lineTo(this.floorSize / 2, -this.floorSize / 2);
    shape.lineTo(this.floorSize / 2, this.floorSize / 2);
    shape.lineTo(-this.floorSize / 2, this.floorSize / 2);
    shape.lineTo(-this.floorSize / 2, -this.floorSize / 2);

    // Ajoute les trous pour les cubes
    shape.holes = this.createHoles();
    return shape;
  }

  /**
   * Crée les trous pour chaque position de cube dans la grille
   * Chaque trou est un rectangle arrondi
   */
  createHoles() {
    const holes = [];
    for (let i = 0; i < this.gridRows; i++) {
      for (let j = 0; j < this.gridColumns; j++) {
        const holeShape = new THREE.Path();
        // Calcule la position centrale de chaque trou
        const centerOffsetX = ((this.gridColumns - 1) * this.cubeSpacing) / 2;
        const centerOffsetZ = ((this.gridRows - 1) * this.cubeSpacing) / 2;
        const x = j * this.cubeSpacing - centerOffsetX - this.holeSize / 2;
        const y = i * this.cubeSpacing - centerOffsetZ - this.holeSize / 2;

        // Crée un rectangle arrondi pour chaque trou
        const radius = 0.4; // Rayon des coins arrondis
        // Dessine le contour du trou avec des coins arrondis
        holeShape.moveTo(x + radius, y);
        holeShape.lineTo(x + this.holeSize - radius, y);
        holeShape.quadraticCurveTo(
          x + this.holeSize,
          y,
          x + this.holeSize,
          y + radius
        );
        holeShape.lineTo(x + this.holeSize, y + this.holeSize - radius);
        holeShape.quadraticCurveTo(
          x + this.holeSize,
          y + this.holeSize,
          x + this.holeSize - radius,
          y + this.holeSize
        );
        holeShape.lineTo(x + radius, y + this.holeSize);
        holeShape.quadraticCurveTo(
          x,
          y + this.holeSize,
          x,
          y + this.holeSize - radius
        );
        holeShape.lineTo(x, y + radius);
        holeShape.quadraticCurveTo(x, y, x + radius, y);

        holes.push(holeShape);
      }
    }
    return holes;
  }

  /**
   * Crée le sol complet avec les murs intérieurs
   * Utilise ExtrudeGeometry pour donner de la profondeur à la forme
   */
  createFloor() {
    const shape = this.createFloorShape();
    // Configuration de l'extrusion pour créer la profondeur et les bords biseautés
    const extrudeSettings = {
      steps: 1,
      depth: this.holeDepth,
      bevelEnabled: true,
      bevelThickness: 0.2,
      bevelSize: 0.2,
      bevelOffset: 0,
      bevelSegments: 10,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Use materials from Materials class
    this.floor = new THREE.Mesh(geometry, this.materials.getFloorMaterial());
    this.floor.rotation.x = -Math.PI / 2; // Rotation pour l'orienter horizontalement
    this.floor.position.y = -4; // Position verticale du sol
    this.floor.receiveShadow = true;

    this.innerFloor = new THREE.Mesh(
      geometry,
      this.materials.getInnerFloorMaterial()
    );
    this.innerFloor.rotation.x = -Math.PI / 2;
    this.innerFloor.position.y = -4;
    this.innerFloor.receiveShadow = true;
  }

  /**
   * Ajoute le sol et les murs intérieurs à la scène
   * @param {THREE.Scene} scene - La scène Three.js
   */
  addToScene(scene) {
    scene.add(this.floor);
    scene.add(this.innerFloor);
  }

  /**
   * Supprime le sol et les murs intérieurs de la scène
   * @param {THREE.Scene} scene - La scène Three.js
   */
  removeFromScene(scene) {
    scene.remove(this.floor);
    scene.remove(this.innerFloor);
  }

  /**
   * Met à jour les couleurs du sol et des murs intérieurs
   * @param {string|THREE.Color} floorColor - Nouvelle couleur du sol
   * @param {string|THREE.Color} innerWallColor - Nouvelle couleur des murs intérieurs
   */
  updateColors(floorColor, innerWallColor) {
    this.materials.updateFloorColors(floorColor, innerWallColor);
  }
}
