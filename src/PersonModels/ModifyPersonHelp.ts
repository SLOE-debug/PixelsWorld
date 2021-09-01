import * as THREE from "three";
import Person from "./Person";
import colorpicker from "../units/colorpicker";
import * as $ from "jquery";
import { defaultLimbs } from "../units/common";

export default class {
  private line: THREE.LineSegments;
  private person: Person;
  private picker;
  private index;
  eles = {
    limbtitle: {},
    limbheight: {
      input: (e) => {
        this.ReRender(
          this.index,
          "height",
          parseFloat((e.target as any).value)
        );
      },
    },
    operationSave: {
      click: () => {
        localStorage.setItem("personInfo", JSON.stringify(this.person.limbs));
        alert("保存成功！");
      },
    },
    limbsize: {
      input: (e) => {
        this.ReRender(this.index, "size", parseFloat((e.target as any).value));
      },
    },
    operationReset: {
      click: () => {
        localStorage.removeItem("personInfo");
        this.person.limbs = defaultLimbs();
        this.person.reBuilderPerson();
      },
    },
    limbZ: {
      input: (e) => {
        this.ReRender(this.index, "z", parseFloat((e.target as any).value));
      },
    },
  };
  constructor(_person: Person) {
    this.person = _person;
    this.picker = colorpicker("colorSelector", (e) => {
      this.ReRender(this.index, "color", e);
    });
    $(window)
      .on("click", this.modifyLimb.bind(this))
      .on("dblclick", () => {
        if (this.enabled) {
          drawCore.scene.remove(this.line);
          this.index = -1;
        }
      });
    for (const id in this.eles) {
      this[id] = $("#" + id);
      for (const eName in this.eles[id]) {
        (this[id] as JQuery<HTMLElement>).on(eName, this.eles[id][eName]);
      }
    }
  }
  private _enabled = false;
  public get enabled(): boolean {
    return this._enabled;
  }

  public set enabled(v: boolean) {
    if (!v) {
      this.person.state = "none";
      drawCore.scene.remove(this.line);
    } else {
      this.person.state = "modify";
    }
    this._enabled = v;
  }

  private ReRender(index, propName, value) {
    if (index >= 0) {
      this.person.limbs[index][propName] = value;
      this.person.reBuilderPerson();
    }
  }

  private setAreaBox(event): THREE.Mesh {
    let mesh = targetAcquisitor.Gettarget(event, this.person.personArea, false)
      ?.object as THREE.Mesh;
    if (mesh) {
      if (this.line) drawCore.scene.remove(this.line);
      let edges = new THREE.EdgesGeometry(mesh.geometry);
      this.line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: "white" })
      );
      this.line.scale.set(1.05, 1.05, 1.05);
      let pos = new THREE.Vector3();
      mesh.getWorldPosition(pos);
      this.line.position.copy(pos);
      drawCore.scene.add(this.line);
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
      this["limbtitle"].text(mesh.name);
      this["limbheight"].val(this.person.limbs[this.index].height.toString());
      this["limbsize"].val(this.person.limbs[this.index].size.toString());
      this["limbsize"].attr(
        "max",
        this.person.limbs[this.index].max.toString()
      );
      this["limbZ"].val(this.person.limbs[this.index].z?.toString());
      if (mesh.userData["type"] != "eye") this["limbZ"].attr("disabled", true);
      else this["limbZ"].attr("disabled", false);
    }
  }
}
