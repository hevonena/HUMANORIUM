import * as THREE from "three/webgpu";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { texture, uniform, vec3 } from "three/tsl";

/**
 * Classe gérant les matériaux des cubes
 * Permet de créer et gérer les matériaux standard et transparent
 */
export default class Materials {
  // Tableau de couleurs pastel pour les cubes
  static PASTEL_COLORS = [
    "#FFB5E8", // rose
    "#B5DEFF", // bleu
    "#E7FFAC", // vert
    "#FFC9DE", // rose clair
    "#97E5D7", // menthe
    "#FFD4B5", // pêche
    "#D4B5FF", // violet
    "#B5ECD4", // vert d'eau
    "#FFE5B5", // jaune
  ];

  // Valeurs par défaut pour les matériaux standard
  static DEFAULTS = {
    roughness: 0.6,
    metalness: 0.1,
  };

  // Create a static loader to be shared
  static hdrLoader = new RGBELoader().setPath("textures/equirectangular/");
  static hdrTexture = null;
  //   static FLOOR_COLORS = [
  //     { floor: "#f0e6e6", inner: "#e0d6d6" }, // Classic cream
  //     { floor: "#e6f0e6", inner: "#d6e0d6" }, // Soft mint
  //     { floor: "#e6e6f0", inner: "#d6d6e0" }, // Light lavender
  //     { floor: "#f0e6f0", inner: "#e0d6e0" }, // Gentle rose
  //     { floor: "#f0f0e6", inner: "#e0e0d6" }, // Warm beige
  //     { floor: "#e6f0f0", inner: "#d6e0e0" }, // Cool azure
  //   ];
  static FLOOR_COLORS = [
    { floor: "#f5f5f5", inner: "#e0e0e0" }, // Light gray
    { floor: "#bbdefb", inner: "#90caf9" }, // Soft blue
    { floor: "#c8e6c9", inner: "#a5d6a7" }, // Pale green
    { floor: "#ffcdd2", inner: "#ef9a9a" }, // Light pink
    { floor: "#e1bee7", inner: "#ce93d8" }, // Soft purple
    { floor: "#ffe0b2", inner: "#ffcc80" }, // Light orange
    { floor: "#fff9c4", inner: "#fff59d" }, // Pale yellow
    { floor: "#cfd8dc", inner: "#b0bec5" }, // Cool gray
  ];

  static FLOOR_DEFAULTS = {
    floorRoughness: 0.8,
    floorMetalness: 0.2,
    innerRoughness: 0.9,
    innerMetalness: 0.1,
  };

  /**
   * Initialise les matériaux avec les paramètres donnés
   * @param {Object} params - Paramètres des matériaux
   */
  constructor(params) {
    this.params = params;
    this.transparentMaterial = null;
    this.standardMaterial = null;
    this.blackMaterial = null;
    this.floorMaterial = null;
    this.innerFloorMaterial = null;
    this.SSSMaterial = null;
    this.currentColorIndex = Math.floor(
      Math.random() * Materials.FLOOR_COLORS.length
    );
  }

  /**
   * Crée le matériau transparent avec les effets de verre
   */
  getTransparentMaterial() {
    if (!this.transparentMaterial) {
      const texture = this.createAlphaTexture();
      const hdrEquirect = this.loadHDRTexture();

      this.transparentMaterial = new THREE.MeshPhysicalMaterial({
        color: this.params.color,
        metalness: this.params.metalness,
        roughness: this.params.roughness,
        ior: this.params.ior,
        alphaMap: texture,
        envMap: hdrEquirect,
        envMapIntensity: this.params.envMapIntensity,
        transmission: this.params.transmission,
        specularIntensity: this.params.specularIntensity,
        specularColor: this.params.specularColor,
        opacity: this.params.opacity,
        side: false,
        transparent: true,
        shadowSide: THREE.DoubleSide,
        depthWrite: false,
      });
    }
    return this.transparentMaterial;
  }

  /**
   * Crée le matériau standard avec une couleur pastel
   * @param {number} colorIndex - Index de la couleur dans le tableau PASTEL_COLORS
   */
  createStandardMaterial(colorIndex) {
    this.standardMaterial = new THREE.MeshStandardMaterial({
      color:
        Materials.PASTEL_COLORS[colorIndex % Materials.PASTEL_COLORS.length],
      roughness: Materials.DEFAULTS.roughness,
      metalness: Materials.DEFAULTS.metalness,
    });
  }

  /**
   * Crée le matériau noir
   */
  getBlackMaterial() {
    if (!this.blackMaterial) {
      this.blackMaterial = new THREE.MeshStandardMaterial({
        color: "#000000",
        roughness: Materials.DEFAULTS.roughness,
        metalness: Materials.DEFAULTS.metalness,
      });
    }
    return this.blackMaterial;
  }

  getSSSMaterial(path, color) {

    const textureLoader = new THREE.TextureLoader();

    const baseTexture = textureLoader.load(path + "base.png");
    baseTexture.colorSpace = THREE.sRGBEncoding;
    const normalTexture = textureLoader.load(path + "normal.png");
    normalTexture.colorSpace = THREE.LinearEncoding;
    const roughnessTexture = textureLoader.load(path + "roughness.png");
    roughnessTexture.colorSpace = THREE.LinearEncoding;
    const thicknessTexture = textureLoader.load(path + "thickness.png");
    thicknessTexture.colorSpace = THREE.LinearEncoding;

    if (!this.SSSMaterial) {
      this.SSSMaterial = new THREE.MeshSSSNodeMaterial({
        color: new THREE.Color(color),
        map: baseTexture,
        normalMap: normalTexture,
        roughnessMap: roughnessTexture,
        roughness: 0.5,
        thicknessColorNode: texture(thicknessTexture).mul(0.3),
        thicknessDistortionNode: uniform(0.1),
        thicknessAmbientNode: uniform(0.9),
        thicknessAttenuationNode: uniform(0.2),
        thicknessPowerNode: uniform(2.0),
        thicknessScaleNode: uniform(2.0),
      })
    }
    return this.SSSMaterial;
  }

  /**
   * Crée une texture alpha pour le matériau transparent
   * @returns {THREE.CanvasTexture} Texture alpha
   */
  createAlphaTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 2;
    const context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, 2, 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.wrapT = THREE.RepeatWrapping;
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.set(1, 3.5);
    return texture;
  }

  /**
   * Charge la texture HDR pour les reflets
   * @returns {THREE.Texture} Texture HDR
   */
  loadHDRTexture() {
    if (!Materials.hdrTexture) {
      Materials.hdrTexture = Materials.hdrLoader.load(
        "royal_esplanade_1k.hdr",
        function (texture) {
          texture.mapping = THREE.EquirectangularReflectionMapping;
        }
      );
    }
    return Materials.hdrTexture;
  }

  /**
   * Met à jour les propriétés du matériau transparent
   * @param {Object} params - Nouveaux paramètres
   */
  updateTransparentMaterial(params) {
    // Create the material if it doesn't exist
    if (!this.transparentMaterial) {
      this.getTransparentMaterial();
    }

    // Now update its properties
    Object.assign(this.transparentMaterial, {
      color: new THREE.Color(params.color),
      transmission: params.transmission,
      opacity: params.opacity,
      metalness: params.metalness,
      roughness: params.roughness,
      ior: params.ior,
      thickness: params.thickness,
      specularIntensity: params.specularIntensity,
      envMapIntensity: params.envMapIntensity,
    });
  }

  /**
   * Récupère le matériau standard
   * @returns {THREE.MeshStandardMaterial} Matériau standard
   */
  getStandardMaterial() {
    return this.standardMaterial;
  }
  getColorizedStandardMaterial(color) {
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: Materials.DEFAULTS.roughness,
      metalness: Materials.DEFAULTS.metalness,
    });
  }

  /**
   * Crée le matériau pour le sol principal
   */
  getFloorMaterial() {
    if (!this.floorMaterial) {
      this.floorMaterial = new THREE.MeshStandardMaterial({
        color: Materials.FLOOR_COLORS[this.currentColorIndex].floor,
        roughness: Materials.FLOOR_DEFAULTS.floorRoughness,
        metalness: Materials.FLOOR_DEFAULTS.floorMetalness,
        side: THREE.DoubleSide,
      });
    }
    return this.floorMaterial;
  }

  /**
   * Crée le matériau pour les murs intérieurs
   */
  getInnerFloorMaterial() {
    if (!this.innerFloorMaterial) {
      this.innerFloorMaterial = new THREE.MeshStandardMaterial({
        color: Materials.FLOOR_COLORS[this.currentColorIndex].inner,
        roughness: Materials.FLOOR_DEFAULTS.innerRoughness,
        metalness: Materials.FLOOR_DEFAULTS.innerMetalness,
        side: THREE.BackSide,
      });
    }
    return this.innerFloorMaterial;
  }

  /**
   * Met à jour les couleurs du sol
   */
  updateFloorColors(floorColor, innerWallColor) {
    if (this.floorMaterial) {
      this.floorMaterial.color.set(floorColor);
    }
    if (this.innerFloorMaterial) {
      this.innerFloorMaterial.color.set(innerWallColor);
    }
  }

  /**
   * Assombrit une couleur hexadécimale
   * @param {string} hexColor - Couleur au format hexadécimal
   * @param {number} percent - Pourcentage d'assombrissement (0-100)
   * @returns {string} Couleur assombrie au format hexadécimal
   */
  static darkenColor(hexColor, percent = 15) {
    const color = new THREE.Color(hexColor);
    color.multiplyScalar(1 - percent / 100);
    return "#" + color.getHexString();
  }

  /**
   * Retourne les couleurs actives du sol avec background assombri
   * @returns {Object} Couleurs actives {floor, inner, background}
   */
  getActiveColors() {
    const colors = Materials.FLOOR_COLORS[this.currentColorIndex];
    return {
      ...colors,
      background: Materials.darkenColor(colors.inner, 85),
    };
  }

  /**
   * Met à jour l'index de couleur et retourne les nouvelles couleurs
   * @returns {Object} Nouvelles couleurs {floor, inner}
   */
  getNextColorScheme() {
    this.currentColorIndex =
      (this.currentColorIndex + 1) % Materials.FLOOR_COLORS.length;
    return this.getActiveColors();
  }
}
