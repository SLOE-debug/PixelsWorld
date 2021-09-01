import { OrbitControls } from "@three-ts/orbit-controls";
import * as $ from "jquery";
import Person from "../PersonModels/Person";
import ModifyPersonHelp from "../PersonModels/ModifyPersonHelp";
import * as THREE from "three";
import Startup from "../kernel/Startup";

class Entry {
  showArea = [
    ["menu", "modifyPerson", "paly"],
    ["back", "operation"],
  ];
  eles = {
    menu: {},
    operation: {},
    back: {
      click: () => {
        // this.light.visible = true;
        // this.wallmesh.visible = true;
        this.startup?.destroy();
        this.controlMenu(false, this.showArea[0], false);
      },
    },
    modifyPerson: {
      click: () => {
        this.controlMenu(true, this.showArea[1]);
      },
    },
    paly: {
      click: () => {
        this.controlMenu(true, ["back"], false);
        this.modifyPersonHelp.enabled = false;
        this.startup = new Startup(this.person);
        // this.light.visible = false;
        // this.wallmesh.visible = false;
      },
    },
  };
  startup: Startup;
  modifyPersonHelp: ModifyPersonHelp;
  person: Person;
  orbitCamera: OrbitControls;
  light: THREE.DirectionalLight;
  globalLight: THREE.AmbientLight;
  wallmesh: THREE.Mesh;
  constructor() {
    this.createPersonArea().createLight().createFloor();
    for (const id in this.eles) {
      this[id] = $("#" + id);
      for (const eName in this.eles[id]) {
        (this[id] as JQuery<HTMLElement>).on(eName, this.eles[id][eName]);
      }
    }
  }

  private createPersonArea() {
    this.createOrbitCamera(false);
    this.person = new Person(JSON.parse(localStorage.getItem("personInfo")));
    this.modifyPersonHelp = new ModifyPersonHelp(this.person);
    return this;
  }

  private createOrbitCamera(enabled) {
    if (this.orbitCamera) this.orbitCamera.dispose();
    drawCore.camera.position.set(0, 10, 40);
    this.orbitCamera = new OrbitControls(drawCore.camera, drawCore.canvas);
    this.orbitCamera.target.set(0, 10, 0);
    this.orbitCamera.enabled = enabled;
    this.orbitCamera.enableZoom = false;
    this.orbitCamera.maxPolarAngle = Math.PI / 2 + 0.2;
    this.orbitCamera.enableDamping = true;
    this.orbitCamera.keys = {
      UP: 87,
      BOTTOM: 83,
      LEFT: 65,
      RIGHT: 68,
    };
    this.orbitCamera.keyPanSpeed = 20;
    this.orbitCamera.enableKeys = true;
    this.orbitCamera.rotateSpeed = 0.5;
    this.orbitCamera.update();
  }

  private createLight() {
    this.light = new THREE.DirectionalLight("white", 1);
    this.light.position.set(-10, 21, 15);
    this.light.target.position.set(0, -3, 8);
    this.light.shadow.camera.bottom = -20;
    this.light.shadow.camera.top = 50;
    this.light.shadow.camera.near = 0.1;
    this.light.shadow.camera.far = 100;
    this.light.castShadow = true;
    drawCore.scene.add(this.light);
    this.globalLight = new THREE.AmbientLight("white", 0.6);
    drawCore.scene.add(this.globalLight);
    return this;
  }

  private createFloor() {
    let wall = new THREE.PlaneGeometry(100, 100);
    let wallmater = new THREE.MeshPhongMaterial({
      color: "#EE6B3C",
      side: THREE.DoubleSide,
    });
    this.wallmesh = new THREE.Mesh(wall, wallmater);
    this.wallmesh.rotation.x = Math.PI / 2;
    this.wallmesh.position.set(0, 0, 0);
    this.wallmesh.receiveShadow = true;
    drawCore.scene.add(this.wallmesh);
  }

  private controlMenu(
    enabled: boolean,
    showEles: Array<string>,
    orbitCameraEnabled: boolean = true
  ) {
    this.createOrbitCamera(orbitCameraEnabled);
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
    this.person.reposition();
  }
}

export default Entry;
