import * as THREE from "three/webgpu";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Lights from "./Lights.js";
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import Tooth from "./Tooth.js";
import Knife from "./Knife.js";
import Wagon from "./Wagon.js";
import EarGuy from "./EarGuy.js";
import EyeFloat from "./EyeFloat.js";
import Toupie from "./Toupie.js";
import Hand from "./Hand.js";
// import HandMarionette from "./HandMarionette.js";
import Humanorium from "./Humanorium.js";
import Guirlande from "./Guirlande.js";
import Interaction from "./Interaction.js";
import FirebaseConfig from "./FirebaseConfig.js";
import FirebaseListener from "./FirebaseListener.js";
import { loadModels } from "./loader";
import { modelDescriptors, buttonDescriptors } from "./modelDescriptors";

/**
 * Classe principale qui gère la scène 3D
 * Cette classe coordonne tous les éléments : cubes, lumières, animations, etc.
 */
export default class MainScene {
  /**
   * Initialise la scène avec les paramètres par défaut
   */
  constructor(AmmoLib) {
    // this.Ammo = AmmoLib;
    this.meshes = [];
    this.teeth = [];
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.arrayModels = modelDescriptors;
    this.arrayButtons = buttonDescriptors;
    this.lights = {};

    // Physics variables
    // this.physicsWorld = null;
    // this.collisionConfiguration = null;
    // this.dispatcher = null;
    // this.broadphase = null;
    // this.solver = null;
    // this.softBodySolver = null;
    // this.transformAux1 = null;

    // Clock for deltaTime
    this.clock = new THREE.Clock();

    this.preload();
  }

  async init() {
    await this.loadConfig();

    this.initializeBasicSettings();
    this.setupRenderer();
    this.setupCamera();
    // this.setupControls();
    this.setupLights();
    this.setupEnvironment();
    // this.setupPhysics();
    this.createModels();
    this.createTeeth();
    // this.createHandMarionette(this.palm, this.fingers);
    this.setupEventListeners();
    this.setupInteraction();
    this.render();

    this.firebaseListener = new FirebaseListener(this.animatedModels);
  }

  async preload() {
    await this.loadConfig();

    // Load models
    this.models = await loadModels(this.arrayModels);

    // cast and receive shadow on all models
    this.models.forEach((model) => {
      model.object.castShadow = true;
      model.object.receiveShadow = true;
    });

    const coiler = this.models.find((model) => model.id === "coiler");
    this.knife = new Knife(this.models.find((model) => model.id === "knife"), coiler);
    this.dentWagons = this.models.filter((model) => model.id.includes("dentWagon"));
    this.wagon = new Wagon(this.dentWagons);
    this.earGuy = new EarGuy(this.models.find((model) => model.id === "earGuy"));
    this.guirlande = new Guirlande(this.models.find((model) => model.id === "guirlande"));
    
    // this.palm = this.models.find((model) => model.id === "palm");
    // this.fingers = this.models.filter((model) => model.id.includes("finger"));
    
    const clamp = this.models.find((model) => model.id === "clamp");
    const eyeFollow = this.models.find((model) => model.id === "eyeFollow");
    const eyeUP = this.models.find((model) => model.id === "eyeUP");
    const porte1 = this.models.find((model) => model.id === "porte1");
    
    this.eyeFloat = new EyeFloat([clamp, eyeFollow, eyeUP, porte1]);

    this.humanorium = new Humanorium(this.models.filter((model) => model.id.includes("human")));

    this.toupie = new Toupie(this.models.filter((model) => model.id.includes("toup")));

    this.hand = new Hand(this.models.filter((model) => model.id.includes("hand")));
    
    this.animatedModels = [this.knife, this.wagon, this.earGuy, this.eyeFloat, this.toupie, this.hand];
    
    // Load buttons
    this.buttons = await loadModels(this.arrayButtons);

    // Initialize the scene
    await this.init();
  }

  /**
   * Initialise les paramètres de base de la scène
   */
  initializeBasicSettings() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#ff90ee");

    this.params = {
      isAnimating: false,
      uid: "pink",
      name: "nyria-jonathan",
      title: "organoid"
    };
  }

  /**
   * Configure le rendu WebGPU
   */
  setupRenderer() {
    this.renderer = new THREE.WebGPURenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = true;
    this.renderer.receiveShadow = true;

    this.renderer.setClearColor("#ff90ee");
    document.body.appendChild(this.renderer.domElement);
  }

  /**
   * Configure la caméra orthographique
   */
  setupCamera() {
    const aspect = this.width / this.height;
    const viewSize = 10;
    this.camera = new THREE.OrthographicCamera(
      -viewSize * aspect,
      viewSize * aspect,
      viewSize,
      -viewSize,
      -50,
      100
    );
    this.camera.position.set(10, 17, 8);
    this.camera.lookAt(new THREE.Vector3(2, 9, 0));
  }

  /**
   * Configure les contrôles de la caméra
   */
  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = true;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 50;
  }

  /**
   * Configure l'éclairage de la scène
   */
  setupLights() {
    this.lights = new Lights(this.scene);
  }

  setupEnvironment() {
    const loader = new EXRLoader();

    loader.load('hdri/photo_studio_01_4k.exr', (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      // intensity of the environment map

      this.scene.environment = texture;

      // this.scene.background = texture;
    });
  }

  setupPhysics() {
    // Use this.Ammo instead of global Ammo
    this.collisionConfiguration = new this.Ammo.btSoftBodyRigidBodyCollisionConfiguration();
    this.dispatcher = new this.Ammo.btCollisionDispatcher(this.collisionConfiguration);
    this.broadphase = new this.Ammo.btDbvtBroadphase();
    this.solver = new this.Ammo.btSequentialImpulseConstraintSolver();
    this.softBodySolver = new this.Ammo.btDefaultSoftBodySolver();

    // set iterations for the solver
    

    // Create the physics world
    this.physicsWorld = new this.Ammo.btSoftRigidDynamicsWorld(
      this.dispatcher,
      this.broadphase,
      this.solver,
      this.collisionConfiguration,
      this.softBodySolver
    );

    // Set gravity
    this.physicsWorld.setGravity(new this.Ammo.btVector3(0, -9.81, 0));
    this.physicsWorld.getWorldInfo().set_m_gravity(new this.Ammo.btVector3(0, -9.81, 0));
    this.physicsWorld.getSolverInfo().set_m_numIterations(20);

    this.transformAux1 = new this.Ammo.btTransform();
  }

  createModels() {
    this.models.forEach((model) => {
      let obj = model.object;
      this.scene.add(obj);
      this.meshes.push(obj);
    });
  }

  createTeeth() {
    this.buttons.forEach((model, index) => {

      const params = {
        ...this.params,
        uid: this.otherUIDs[index].uid,
        name: this.otherUIDs[index].name,
        title: this.otherUIDs[index].title,
      };

      let obj = model.object;
      this.scene.add(obj);
      this.teeth.push(new Tooth(obj, params));
    });
  }

  createHandMarionette(palm, fingers) {

    // Initialize HandMarionette
    this.handMarionette = new HandMarionette(
      palm,
      fingers,
      this.physicsWorld,
      this.scene,
      this.Ammo // Pass Ammo instance
    );
    this.animatedModels.push(this.handMarionette);

  }

  /**
   * Configure les écouteurs d'événements
   */
  setupEventListeners() {
    this.onResize = this.onResize.bind(this);
    this.render = this.render.bind(this);
    window.addEventListener("resize", this.onResize);
  }

  /**
   * Configure l'interaction avec les cubes
   */
  setupInteraction() {
    this.interaction = new Interaction(this.camera, this.scene, this.teeth);
  }

  /**
   * Boucle de mise à jour pour l'animation
   */
  update() {
    const deltaTime = this.clock.getDelta();
    if (this.controls) {
      this.controls.update();
    }

    if (this.interaction) {
      this.interaction.update();
    }
    if (this.animatedModels) {
      this.animatedModels.forEach((model) => {
        model.animate(deltaTime);
      });
      this.humanorium.animate(deltaTime);
    }

    if (this.physicsWorld) {
      this.updatePhysics(deltaTime);
    }
  }

  updatePhysics(deltaTime) {
    // Step the physics world
    this.physicsWorld.stepSimulation(deltaTime, 10);

    // Update the HandMarionette
    if (this.handMarionette) {
      // this.handMarionette.update(deltaTime);
    }
  }

  /**
   * Boucle de rendu
   */
  render() {
    requestAnimationFrame(this.render);
    this.update();
    this.renderer.renderAsync(this.scene, this.camera);
  }

  /**
   * Gère le redimensionnement de la fenêtre
   */
  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    const aspect = this.width / this.height;
    const viewSize = 10;

    this.camera.left = -viewSize * aspect;
    this.camera.right = viewSize * aspect;
    this.camera.top = viewSize;
    this.camera.bottom = -viewSize;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);

    this.render();
  }

  /**
   * Nettoie les ressources
   */
  cleanup() {
    if (this.guiControls) this.guiControls.destroy();
    if (this.lights) this.lights.dispose();
    if (this.floor) this.floor.removeFromScene(this.scene);
    if (this.interaction) this.interaction.dispose();
    window.removeEventListener("resize", this.onResize);
  }

  /**
   * Charge la configuration depuis le fichier JSON
   */
  loadConfig() {
    return new Promise(async (resolve) => {
      try {
        const response = await fetch("json/Config.json");
        const config = await response.json();

        const urlParams = new URLSearchParams(window.location.search);
        const uid = urlParams.get("uid");

        FirebaseConfig.UID = uid || config.UID;
        FirebaseConfig.NAME = config.NAME;
        FirebaseConfig.reset();

        this.otherUIDs = config.OTHERS.map((other) => ({
          name: other.name,
          uid: other.uid,
          title: other.title,
        }));
      } catch (error) {
        console.error("Erreur lors du chargement de la configuration:", error);
      }
      resolve();
    });
  }
}
