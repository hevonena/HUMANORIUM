import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import Material from "./Material";
import * as THREE from "three";

export const loadModels = (models) => {
    return new Promise((resolve, reject) => {
        const promises = models.map((model) => {
            switch (model.type) {
                case "fbx":
                    return loadFBX(model);
                case "gltf":
                    const gltf = loadGLTF(model)
                    return gltf;
                case "obj":
                    return loadOBJ(model);
                default:
                    return Promise.reject(new Error("Invalid model type"));
            }
        });
        Promise
            .all(promises)
            .then((models) => {
                const uniformisedModels = postProcessObjs(models);
                resolve(uniformisedModels);
            });
    });
};

function postProcessObjs(models) {
    models.forEach((model) => {
        switch (model.type) {
            case "fbx":
                model.object = model.object;
                model.object.animations = model.object.animations;
                break;
            case "gltf":
                model.object = model.object.scene;
                model.object.animations = model.animation;
                break;
            case "obj":
                model.obj = model.object;
                break;
            default:
                break;
        }
    });
    return models;
}

export const loadGLTF = (model) => {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(
            model.src,
            (object) => {
                // console.log("✅", model.id, "model loaded");
                object.scene.scale.set(model.scale, model.scale, model.scale);
                if (model.material !== "none" && model.material !== "skin") {
                    object.scene.traverse((child) => {
                        if (child.isMesh) {
                            child.material = new Material().getMaterial(model);
                        }
                    }
                    );
                }
                if (model.material === "skin") {
                    object.scene.traverse((child) => {
                        if (child.isMesh) {
                            child.material.emissive = new THREE.Color(0xf4b5cd);
                            child.material.emissiveIntensity = 0.3;
                        }
                    }
                    );
                }

                resolve({ ...model, object, animation: object.animations });
            },
            (xhr) => {
            },
            (error) => {
                console.error("An error happened", error);
                reject(error);
            }
        );
    });
};

export const loadFBX = (model) => {
    return new Promise((resolve, reject) => {
        const loader = new FBXLoader();
        loader.load(
            model.src,
            (object) => {
                // console.log("✅", model.id, "model loaded");
                object.traverse((child) => {
                    if (child.isMesh) {
                        child.material = new Material().getMaterial(model);
                    }
                });
                object.scale.set(model.scale, model.scale, model.scale);
                resolve({ ...model, object });
            },
            (xhr) => { },
            (error) => {
                console.error("An error happened", error);
                reject(error);
            }
        );
    });
};













export const loadOBJ = (model) => {
    return new Promise((resolve, reject) => {
        const loader = new OBJLoader();
        loader.load(
            model.src,
            (object) => {
                // console.log("✅", model.id, "model loaded");
                resolve({ ...model, object });
            },
            (xhr) => { },
            (error) => {
                console.error("An error happened", error);
                reject(error);
            }
        );
    });
};
