import FirebaseConfig from "./FirebaseConfig.js";

export default class Tooth {
    constructor(model, params) {
        this.model = model;
        this.params = params;
        this.uid = params.uid;
        this.name = params.name;
        this.clickable = true;

    }
    togglePress() {
        if (this.clickable) {
            this.isPressed = !this.isPressed;

            FirebaseConfig.sendData(
                FirebaseConfig.DEFAULT_PATH + "/" + FirebaseConfig.UID,
                {
                    target: this.uid,
                    name: this.name,
                    date: Date.now(),
                    position: this.isPressed ? "down" : "up",
                }
            );

            this.animatePress();
        }

    }

    animatePress() {
        if (this.isPressed) {
            // console.log(this.model.children[0].name);
            if(this.model.children[0].name === "Teeth_Do_low_poly016" || this.model.children[0].name === "Teeth_Do_low_poly013"  || this.model.children[0].name === "Teeth_Do_low_poly007"  ) {
                this.model.position.x -= 0.6;
            } else {
                this.model.position.z -= 0.6;
            }
        } else {
            if(this.model.children[0].name === "Teeth_Do_low_poly016" || this.model.children[0].name === "Teeth_Do_low_poly013"  || this.model.children[0].name === "Teeth_Do_low_poly007"  ) {
                this.model.position.x += 0.6;
            } else {
                this.model.position.z += 0.6;
            }
        }
    }
}