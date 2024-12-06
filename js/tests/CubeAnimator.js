/**
 * Classe gérant l'animation des cubes
 * Permet de créer des effets de vague et de mouvement sur la grille de cubes
 */
export default class CubeAnimator {
  /**
   * Initialise l'animateur avec les paramètres donnés
   * @param {Object} params - Paramètres d'animation
   */
  constructor(params) {
    this.time = 0;
    this.animationSpeed = params.animationSpeed || 0.005; // Vitesse de l'animation
    this.amplitude = Math.min(params.amplitude || params.cubeSize, 3); // Amplitude maximale de la vague
    this.phaseOffset = params.phaseOffset || 20; // Décalage de phase entre les cubes
    this.downwardOffset = params.downwardOffset || 3; // Décalage vers le bas
    this.isAnimating = params.isAnimating || false; // État de l'animation
  }

  /**
   * Met à jour l'animation des cubes
   * @param {Array} cubes - Tableau des cubes à animer
   * @param {number} gridSize - Taille de la grille
   */
  update(cubes, gridSize) {
    if (!this.isAnimating) {
      this.resetCubes(cubes);
      return;
    }

    this.time += this.animationSpeed;
    this.animateCubes(cubes, gridSize);
  }

  /**
   * Réinitialise la position des cubes
   * @param {Array} cubes - Tableau des cubes à réinitialiser
   */
  resetCubes(cubes) {
    cubes.forEach((cube) => {
      if (!cube.isPressed && !cube.isTransitioning) {
        cube.positionY = cube.initialY;
      }
    });
  }

  /**
   * Anime les cubes selon un motif de vague
   * @param {Array} cubes - Tableau des cubes à animer
   * @param {number} gridSize - Taille de la grille
   */
  animateCubes(cubes, gridSize) {
    cubes.forEach((cube, index) => {
      // Ignore les cubes en cours d'interaction
      if (cube.isPressed || cube.isMoving || cube.isTransitioning) return;

      // Calcule la position dans la grille
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      const phase = (row + col) * this.phaseOffset;

      // Calcule le mouvement de vague
      const wave = Math.sin(this.time * 2 + phase / 10);
      const height = this.amplitude * wave;

      // Calcule le mouvement vers le bas
      const downwardMotion =
        Math.sin(this.time * 2 + phase / 10) * this.downwardOffset;

      // Combine les mouvements verticaux
      cube.positionY = cube.initialY + height - Math.abs(downwardMotion);
    });
  }

  /**
   * Active ou désactive l'animation
   * @param {boolean} isAnimating - État d'animation souhaité
   */
  toggleAnimation(isAnimating) {
    this.isAnimating = isAnimating;
  }

  /**
   * Met à jour les paramètres d'animation
   * @param {Object} params - Nouveaux paramètres
   */
  updateParams(params) {
    if (params.animationSpeed !== undefined) {
      this.animationSpeed = params.animationSpeed;
    }
    if (params.amplitude !== undefined) {
      this.amplitude = Math.min(params.amplitude, 3);
    }
    if (params.phaseOffset !== undefined) {
      this.phaseOffset = params.phaseOffset;
    }
    if (params.downwardOffset !== undefined) {
      this.downwardOffset = params.downwardOffset;
    }
    this.isAnimating = params.isAnimating;
  }
}
