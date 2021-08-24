import * as THREE from "three";

type limb = {
  name: string;
  size: number;
  height: number;
  x?: number;
  y?: number;
  z?: number;
  color?: string;
  shape?: string;
};

export default class {
  public personArea;
  public limbs: Array<limb> = [
    {
      name: "左腿",
      size: 2,
      height: 8,
      x: -2,
      y: -8,
    },
    {
      name: "右腿",
      size: 2,
      height: 8,
      x: 2,
      y: -8,
    },
    {
      name: "身体",
      size: 5,
      height: 8,
      x: 0,
      y: 0.5,
    },
    {
      name: "左手",
      size: 1.5,
      height: 8,
      x: 3.5,
      y: 0.5,
    },
    {
      name: "右手",
      size: 1.5,
      height: 8,
      x: -3.5,
      y: 0.5,
    },
    {
      name: "头",
      size: 4,
      height: 4,
      x: 0,
      y: 7,
    },
    {
      name: "左眼",
      size: 0.5,
      height: 0.5,
      x: -0.8,
      color: "black",
      y: 7.5,
      z: 2,
    },
    {
      name: "右眼",
      size: 0.5,
      height: 0.5,
      color: "black",
      x: 0.8,
      y: 7.5,
      z: 2,
    },
  ];
  private i = 0;
  constructor(_limbs?: Array<limb>) {
    if (_limbs) this.limbs = _limbs;
    this.Builder();
  }

  public Builder() {
    this.i = 0;
    this.personArea = new THREE.Object3D();
    this.limbs.forEach(this.createLimb.bind(this));
    this.personArea.children.forEach((m) => {
      if (m.name.indexOf("眼") < 0) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
    this.personArea.position.y -= 0.5;
    drawCore.scene.add(this.personArea);
  }
  private createLimb({
    name,
    size,
    height,
    color = "#991616",
    x = 0,
    y = 0,
    z = 0,
    shape = "BoxGeometry",
  }: limb) {
    let box = new THREE[shape](size, height, size);
    let mater = new THREE.MeshPhongMaterial({ color: color });
    let mesh = new THREE.Mesh(box, mater);
    mesh.name = name;
    mesh.position.set(x, y, z);
    mesh.userData["i"] = this.i;
    this.personArea.add(mesh);
    this.i++;
  }
  public destroy() {
    this.personArea.children.forEach((m: THREE.Mesh) => {
      m.geometry.dispose();
      this.personArea.remove(m);
    });
    drawCore.scene.remove(this.personArea);
  }
}
