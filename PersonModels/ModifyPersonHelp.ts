import * as THREE from "three";
import Person from "./Person";
import colorpicker from "../units/colorpicker";

export default class {
  private line: THREE.LineSegments;
  private camera: THREE.Camera;
  private scene: THREE.Scene;
  private canvas: HTMLCanvasElement;
  private person: Person;
  private picker;
  private height = document.querySelector("#limbheight") as HTMLInputElement;
  private title = document.querySelector("#limbtitle");
  private index;
  constructor(
    _canvas: HTMLCanvasElement,
    _scene: THREE.Scene,
    _person: Person,
    _camera: THREE.Camera
  ) {
    this.camera = _camera;
    this.canvas = _canvas;
    this.person = _person;
    this.scene = _scene;
    window.addEventListener("click", this.modifyLimb.bind(this));
    window.addEventListener("dblclick", () => {
      if (this.enabled) {
        this.scene.remove(this.line);
        this.index = -1;
      }
    });
    this.picker = colorpicker("colorSelector", (e) => {
      this.ReRender(this.index, "color", e);
    });
    this.height.addEventListener("input", (e) => {
      this.ReRender(this.index, "height", (e.target as any).value);
    });
  }
  private _enabled = false;
  public get enabled(): boolean {
    return this._enabled;
  }

  public set enabled(v: boolean) {
    if (!v) this.scene.remove(this.line);
    this._enabled = v;
  }

  private ReRender(index, propName, value) {
    if (index >= 0) {
      this.person.destroy();
      this.person.limbs[index][propName] = value;
      this.person.Builder();
    }
  }

  private setAreaBox(event): THREE.Mesh {
    let rect = this.canvas.getBoundingClientRect();
    let pos = {
      x: ((event.clientX - rect.left) * this.canvas.width) / rect.width,
      y: ((event.clientY - rect.top) * this.canvas.height) / rect.height,
    };
    let PointerPos = {
      x: (pos.x / this.canvas.width) * 2 - 1,
      y: (pos.y / this.canvas.height) * -2 + 1,
    };
    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(PointerPos, this.camera);
    let childrens = [];
    this.GetAllChildren(this.person.personArea, childrens);
    let intersects = raycaster.intersectObjects(childrens);
    if (intersects.length > 0) {
      if (this.line) this.scene.remove(this.line);
      let mesh = intersects[0].object as THREE.Mesh;
      let edges = new THREE.EdgesGeometry(mesh.geometry);
      this.line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: "white" })
      );
      this.line.scale.set(1.05, 1.05, 1.05);
      let pos = new THREE.Vector3();
      mesh.getWorldPosition(pos);
      this.line.position.copy(pos);
      this.scene.add(this.line);
      return mesh;
    }
    return null;
  }

  private modifyLimb(event) {
    if (!this.enabled) return;
    let mesh = this.setAreaBox(event);
    if (mesh) {
      let mater = mesh.material as THREE.MeshPhongMaterial;
      this.index = mesh.userData.i;
      this.picker.ColorPickerSetColor(mater.color.getHexString());
      this.picker.children("div").css({
        backgroundColor: mater.color.getStyle(),
      });
      this.title.textContent = mesh.name;
      this.height.value = this.person.limbs[this.index].height.toString();
    }
  }

  private GetAllChildren(obj: THREE.Object3D, childrens: Array<any>) {
    childrens.push(...obj.children);
    obj.children.forEach((m) => {
      this.GetAllChildren(m, childrens);
    });
  }
}
