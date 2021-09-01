import Person from "../PersonModels/Person";

class Startup {
  person: Person;
  constructor(_person) {
    this.person = _person;
    this.person.play = true;
  }
  private createLight() {
    // this.light = new THREE.DirectionalLight("white", 1);
    // this.light.castShadow = true;
    // this.light.receiveShadow = true;
    // this.light.position.set(50, 50, 50);
    // this.light.target.position.set(0, 10, 0);
  }
  public destroy() {
    this.person.play = false;
  }
}

export default Startup;
