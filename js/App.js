import MainScene from "./MainScene.js";
// import { loadAmmo } from './loadAmmo.js';

export default class App {
  constructor() {
    console.log("App constructor");
    this.init();
  }

  async init() {
    try {
      // const AmmoLib = await loadAmmo();
      this.mainScene = new MainScene();
    } catch (error) {
      console.error('Error loading Ammo.js:', error);
    }
  }
}