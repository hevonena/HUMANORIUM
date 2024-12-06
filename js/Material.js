import * as THREE from "three/webgpu";
import { texture, uniform } from "three/tsl";
import { ref } from "firebase/database";

export default class Material {
    constructor() {
        this.SSSMaterial = null;
        this.StandardMaterial = null;
    }

    getMaterial(model) {
        switch (model.material) {
            case "subsurface":
                return this.getSSSMaterial(model.src, model.color);
            case "tooth":
                return this.getStandardMaterial(model.src);
            case "toothrail":
                return this.getToothMaterial(model.color);
            case "metal":
                return this.getMetalMaterial(model.color);
            case "hand":
                return this.getHandMaterial(model.src, model.color);
            case "standard":
                return this.getStandardMaterial(model.color);
            case "none":
                return null;
            default:
                return this.getStandardMaterial(model.color);
        }
    }

    getStandardMaterial(src = null, color = 0xffffff) {
        if (src) {
            return this.getStandardMaterialFromTexture(src, color);
        } else {
            return this.getStandardMaterialFromColor(color);
        }
    }

    getToothMaterial(color) {
        this.StandardMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xffffff),
            roughness: 0.8,
            metalness: 0.5,
            // envMapIntensity: 0.1,
            // emissive: new THREE.Color(color),
            // emissiveIntensity: 0.02,
        });
        return this.StandardMaterial;
    }

    getStandardMaterialFromColor(color) {
        this.StandardMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color),
            roughness: 0.5,
            metalness: 0.5,
        });
        return this.StandardMaterial;
    }

    getHandMaterial(path, color) {
        path = path.replace("source/model.glb", "textures/");
        const textureLoader = new THREE.TextureLoader();
        const base = textureLoader.load(path + "base.png");
        base.encoding = THREE.sRGBEncoding;

        this.StandardMaterial = new THREE.MeshStandardMaterial({
            // color: new THREE.Color(color),
            map: base,
            roughness: 0.8,
            metalness: 0,
            envMapIntensity: 0.1,
        });
        return this.StandardMaterial;
    }

    getStandardMaterialFromTexture(path, color) {
        // check if path contains fbx or glb
        if (path.includes(".fbx")) {
            path = path.replace("source/model.fbx", "textures/");
        } else if (path.includes(".glb")) {
            path = path.replace("source/model.glb", "textures/");
        }


        const textureLoader = new THREE.TextureLoader();

        const base = textureLoader.load(path + "base.png");
        base.encoding = THREE.sRGBEncoding;
        const normal = textureLoader.load(path + "normal.png");
        normal.encoding = THREE.LinearEncoding;
        const roughness = textureLoader.load(path + "roughness.png");
        roughness.encoding = THREE.LinearEncoding;

        texture.encoding = THREE.sRGBEncoding;
        this.StandardMaterial = new THREE.MeshStandardMaterial({
            map: base,
            // color: new THREE.Color(color),
            normalMap: normal,
            roughnessMap: roughness,
            roughness: 1,
            metalness: 0.5,
        });
        return this.StandardMaterial;
    }

    getMetalMaterial(color) {
        this.StandardMaterial = new THREE.MeshStandardMaterial({
            // color: new THREE.Color(0xff0000),
            roughness: 0.1,
            metalness: 1,
            lightMapIntensity: 0,
            // reflectivity: 1,



            envMapIntensity: 0.6,
        });
        return this.StandardMaterial;
    }

    getSSSMaterial(path, color) {
        if (path.includes(".fbx")) {
            path = path.replace("source/model.fbx", "textures/");
        } else if (path.includes(".glb")) {
            path = path.replace("source/model.glb", "textures/");
        }


        const textureLoader = new THREE.TextureLoader();

        const baseTexture = textureLoader.load(path + "base.png");
        baseTexture.colorSpace = THREE.sRGBEncoding;
        const normalTexture = textureLoader.load(path + "normal.png");
        normalTexture.colorSpace = THREE.LinearEncoding;
        const roughnessTexture = textureLoader.load(path + "roughness.png");
        roughnessTexture.colorSpace = THREE.LinearEncoding;
        const thicknessTexture = textureLoader.load(path + "thickness.png");
        thicknessTexture.colorSpace = THREE.LinearEncoding;

        // shadows

        this.SSSMaterial = new THREE.MeshSSSNodeMaterial()
        this.SSSMaterial.color = new THREE.Color(color); // Base color
        this.SSSMaterial.map = baseTexture; // Assign base texture
        this.SSSMaterial.normalMap = normalTexture; // Assign normal map
        this.SSSMaterial.roughnessMap = roughnessTexture; // Assign roughness map
        this.SSSMaterial.roughness = 0.1; // Base roughness level
        this.SSSMaterial.metalness = 0.0; // Base metalness level
        this.SSSMaterial.subsurface = uniform(0.8);
        this.SSSMaterial.envMapIntensity = uniform(0.0);
        this.SSSMaterial.thicknessColorNode = texture(thicknessTexture).mul(0.3);
        this.SSSMaterial.thicknessDistortionNode = uniform(0.1);
        this.SSSMaterial.thicknessAmbientNode = uniform(0.9);
        this.SSSMaterial.thicknessAttenuationNode = uniform(0.2);
        this.SSSMaterial.thicknessPowerNode = uniform(2.0);
        this.SSSMaterial.thicknessScaleNode = uniform(2.0);
        return this.SSSMaterial;
    }
}