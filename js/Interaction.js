import * as THREE from "three/webgpu";

/**
 * Classe gérant les interactions utilisateur avec les cubes
 * Permet de détecter et gérer les clics sur les cubes
 */
export default class Interaction {
  /**
   * Initialise le gestionnaire d'interactions
   * @param {THREE.Camera} camera - Caméra de la scène
   * @param {THREE.Scene} scene - Scène Three.js
   * @param {Array} cubes - Tableau des cubes interactifs
   */
  constructor(camera, scene, teeth) {
    this.camera = camera;
    this.scene = scene;
    this.teeth = teeth;

    // Initialisation du raycaster pour la détection des clics
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    window.addEventListener("click", this.onClick.bind(this));
  }

  /**
   * Gère les événements de clic
   * @param {Event} event - Événement de clic
   */
  onClick(event) {
    // Convert mouse position to normalized device coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update raycaster to cast a ray from the camera through the mouse position
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Flatten all child meshes of the FBX models for raycasting
    const allMeshes = this.teeth.flatMap((tooth) => {
      const meshes = [];
      tooth.model.traverse((child) => {
        if (child.isMesh) {
          meshes.push(child);
        }
      });
      return meshes;
    });

    // Check intersections
    const intersects = this.raycaster.intersectObjects(allMeshes, true);

    // Verify if an intersection occurred
    if (intersects.length > 0) {
      // Find the tooth associated with the intersected mesh
      const clickedTooth = this.teeth.find((tooth) =>
        tooth.model.getObjectById(intersects[0].object.id)
      );

      if (clickedTooth) {
        // console.log("Clicked tooth:", clickedTooth);
        clickedTooth.togglePress();
      }
    }
  }

  /**
   * Met à jour l'état des interactions
   * Pas d'animations nécessaires - les changements de position sont immédiats
   */
  update() {
    // Aucune mise à jour d'animation nécessaire
  }

  /**
   * Nettoie les écouteurs d'événements
   */
  dispose() {
    window.removeEventListener("click", this.onClick);
  }
}
