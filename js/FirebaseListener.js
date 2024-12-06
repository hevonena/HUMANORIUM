import FirebaseConfig from "./FirebaseConfig.js";
import DebugLayer from "./UI_tools/DebugLayer.js";

/**
 * Classe qui écoute les changements dans Firebase et met à jour les shapes en conséquence
 */
export default class FirebaseListener {
  /**
   * Initialise l'écouteur Firebase
   * @param {Array} shapes - Tableau des shapes à contrôler
   */
  constructor(animatedModels) {
    this.animatedModels = animatedModels;
    this.firstCall = false;
    //this.initDebugLayer();
    this.setupListener();
  }

  /**
   * Initialise la couche de débogage
   */
  initDebugLayer() {
    this.debugLayer = new DebugLayer();
  }

  /**
   * Configure l'écouteur sur le nœud "connections" de Firebase
   */
  setupListener() {
    FirebaseConfig.listenToData(FirebaseConfig.DEFAULT_PATH, (data) => {
      // Ignore le premier appel pour éviter les effets indésirables à l'initialisation
      if (!this.firstCall) {
        this.firstCall = true;
        return;
      }

      this.handleFirebaseData(data);
    });
  }

  /**
   * Gère les données reçues de Firebase
   * @param {Object} data - Données reçues de Firebase
   */
  handleFirebaseData(data) {
    // Ajoute le message à la couche de débogage
    //this.debugLayer.addMessage(data);

    // Traite chaque entrée de données
    Object.keys(data).forEach((key) => {
      this.processDataEntry(key, data[key]);
    });
  }

  /**
   * Traite une entrée de données spécifique
   * @param {string} key - Clé de l'entrée
   * @param {Object} entry - Données de l'entrée
   */
  processDataEntry(key, entry) {
    // console.log("Processing entry:", entry.target);

    if (entry.target === FirebaseConfig.UID) {
      console.log(entry.target, FirebaseConfig.UID);
      switch (key) {
        case "pink":
          console.log("Processing pink"); // couteau
          if (entry.position === "down") {
            this.animatedModels[0].play();
          } else {
            this.animatedModels[0].pause();
          }
          break;
        case "orange":
          console.log("Processing orange"); // montagne russe
          if (entry.position === "down") {
            this.animatedModels[1].play();
          } else {
            this.animatedModels[1].pause();
          }
          break;
        case "green":
          console.log("Processing green"); // earguy
          if (entry.position === "down") {
            this.animatedModels[2].play();
          } else {
            // this.animatedModels[2].pause();
          }
          break
        case "blue":
          console.log("Processing blue"); // eye Float
          if (entry.position === "down") {
            this.animatedModels[3].play();
          } else {
            // this.animatedModels[3].pause();
          }
          break;
        case "red":
          console.log("Processing red"); // toupie
          if (entry.position === "down") {
            this.animatedModels[4].play();
          } else {
            // this.animatedModels[4].pause();
          }
          break;
        case "black":
          console.log("Processing black"); // hand
          if (entry.position === "down") {
            this.animatedModels[5].play();
          } else {
            // this.animatedModels[5].pause();
          }
        default:
          break;
      }
    }
  }
  /**
   * Met à jour la référence à la couche de débogage si nécessaire
   * @param {DebugLayer} newDebugLayer - Nouvelle couche de débogage
   */
  updateDebugLayer(newDebugLayer) {
    this.debugLayer = newDebugLayer;
  }
}
