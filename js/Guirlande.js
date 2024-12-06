import * as THREE from 'three';
export default class Guirlande {
    constructor(guirlande) {
        this.guirlande = guirlande.object;
        // console.log(this.guirlande);
        this.lightBulbs = this.guirlande.children.filter(child => child.name.includes('ball'));
        // assign emmissive material to light bulbs with different colors
        this.lightBulbs.forEach((lightBulb, index) => {
            // 5 colors
            const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
            const color = colors[index % colors.length];
            lightBulb.material.emissive = new THREE.Color(color);
        });
    }
}