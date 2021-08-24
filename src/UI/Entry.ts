import { OrbitControls } from "@three-ts/orbit-controls";
import * as $ from "jquery";
import Person from "../PersonModels/Person";
import ModifyPersonHelp from "../PersonModels/ModifyPersonHelp";
import * as THREE from "three";

class Entry {
  modifyPersonHelp: ModifyPersonHelp;
  person: Person;
  showArea = [
    ["menu", "modifyPerson"],
    ["back", "operation"],
  ];
  eles = {
    menu: {},
    operation: {},
    back: {
      click: () => {
        this.controlMenu(false, this.showArea[0], this.orbitCamera);
        this.orbitCamera.reset();
      },
    },
    modifyPerson: {
      click: () => {
        this.controlMenu(true, this.showArea[1], this.orbitCamera);
      },
    },
  };
  orbitCamera: OrbitControls;
  constructor() {
    this.createPersonArea().createLight().createFloor();
    drawCore.drawActivity["EntryAutoRotate"] = () => {
      this.orbitCamera.update();
    };
    for (const id in this.eles) {
      this[id] = $("#" + id);
      for (const eName in this.eles[id]) {
        (this[id] as JQuery<HTMLElement>).on(eName, this.eles[id][eName]);
      }
    }
  }

  private createPersonArea() {
    this.orbitCamera = new OrbitControls(drawCore.camera, drawCore.canvas);
    this.orbitCamera.target.set(0, 2, 0);
    this.orbitCamera.saveState();
    this.orbitCamera.enabled = false;
    this.orbitCamera.enableZoom = false;
    this.orbitCamera.autoRotate = true;
    this.orbitCamera.maxPolarAngle = Math.PI / 2 + 0.3;
    this.orbitCamera.enableDamping = true;
    this.orbitCamera.enableKeys = false;
    this.orbitCamera.rotateSpeed = 0.5;
    this.orbitCamera.update();
    this.person = new Person(JSON.parse(localStorage.getItem("personInfo")));
    this.modifyPersonHelp = new ModifyPersonHelp(this.person);
    return this;
  }

  private createLight() {
    let light = new THREE.DirectionalLight("white", 1);
    light.position.set(-10, 21, 15);
    light.target.position.set(0, -3, 8);
    light.shadow.camera.bottom = -20;
    light.shadow.camera.top = 20;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 100;
    light.castShadow = true;
    drawCore.scene.add(light);
    let globalLight = new THREE.AmbientLight("white", 0.6);
    drawCore.scene.add(globalLight);
    return this;
  }

  private createFloor() {
    let wall = new THREE.PlaneGeometry(100, 100);
    let wallmater = new THREE.MeshPhongMaterial({
      color: "#EE6B3C",
      side: THREE.DoubleSide,
    });
    let wallmesh = new THREE.Mesh(wall, wallmater);
    wallmesh.rotation.x = Math.PI / 2;
    wallmesh.position.set(0, -12.5, 0);
    wallmesh.receiveShadow = true;
    drawCore.scene.add(wallmesh);
  }

  private controlMenu(
    enabled: boolean,
    showEles: Array<string>,
    orbitCamera: OrbitControls
  ) {
    orbitCamera.autoRotate = !enabled;
    for (const id in this.eles) {
      (this[id] as JQuery<HTMLElement>).css({
        display: "none",
      });
    }
    showEles.forEach((m) => {
      (this[m] as JQuery<HTMLElement>).css({
        display: "flex",
      });
    });
    this.modifyPersonHelp.enabled = enabled;
    orbitCamera.enabled = enabled;
  }
}

export default Entry;
