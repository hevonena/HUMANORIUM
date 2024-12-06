import BaseShape from "./BaseShape.js";
import FirebaseConfig from "../FirebaseConfig.js";

export default class ButtonCube extends BaseShape {
  constructor(params) {
    super(params);
    this.clickable = true;
    this.addDebugLabel();
  }

  togglePress() {
    if (this.clickable) {
      this.isPressed = !this.isPressed;
      console.log("togglePress", -this.params.cubeSize / 2);
      this.startTransition(
        this.isPressed ? -this.params.cubeSize / 2 : this.initialY
      );

      FirebaseConfig.sendData("connections/" + FirebaseConfig.UID, {
        target: this.uid,
        name: this.name,
        date: Date.now(),
        position: this.isPressed ? "down" : "up",
      });
    }
  }
}
