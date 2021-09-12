import { defaultLimbs, throttle } from "../units/common";
import * as THREE from "three";
import { gsap } from "gsap";

export type limb = {
  name: string;
  size: number;
  height: number;
  type: "leg" | "arm" | "head" | "body" | "eye";
  order: number;
  x?: number;
  y?: number;
  z?: number;
  secondary?: boolean;
  color?: string;
  max?: number;
  parentType?: "leg" | "arm" | "head" | "body";
};

export default class Person {
  public personArea: THREE.Object3D = new THREE.Object3D();
  public limbs: Array<limb> = defaultLimbs();
  public enableShowAction = false;
  private keyMaps = {
    keyw: this.up.bind(this),
    keys: this.bottom.bind(this),
    keya: this.left.bind(this),
    keyd: this.right.bind(this),
    space: this.jump.bind(this),
  };
  public limbsInstance: { [x: string]: Array<THREE.Object3D> } = {
    leg: [],
    arm: [],
    head: [],
    body: [],
    eye: [],
  };
  private headlimb = {} as limb;
  public headCamera: THREE.PerspectiveCamera;
  private index = 0;
  public state: "modify" | "none" = "none";
  public step = 0.5;

  private _play: boolean = false;
  public get play(): boolean {
    return this._play;
  }

  public set play(v: boolean) {
    if (v) {
      drawCore.camera = this.headCamera;
      drawCore.canvas.requestPointerLock();
    } else {
      drawCore.backCamera();
    }
    this._play = v;
  }

  // 肢体运动的时间步长
  public limbStepSize = 0.4;
  // 手脚并行时间线
  private limbsMotion = gsap.timeline({
    paused: true,
    repeatDelay: 1,
    onComplete: () => {
      this.limbsMotion.restart();
    },
  });
  constructor(_limbs?: Array<limb>) {
    if (_limbs) this.limbs = _limbs;
    this.Builder();
    window.addEventListener("keydown", this.Activity.bind(this, false));
    window.addEventListener("keyup", this.Activity.bind(this, true));
    window.addEventListener("mousemove", this.CameraMove.bind(this));
    window.addEventListener("mousedown", this.mouseClick.bind(this));
    window.addEventListener("mouseup", this.mouseup.bind(this));
    this.initLimbsMotion();
  }

  // 初始化手脚运动
  private initLimbsMotion() {
    let range = 0.5;
    ["leg", "arm"].forEach((l) => {
      this.limbsInstance[l].forEach((m: THREE.Mesh) => {
        this.limbsMotion
          .to(
            m.rotation,
            {
              duration: this.limbStepSize / 2,
              x: m.userData["secondary"] ? -range : range,
              ease: "none",
            },
            0
          )
          .to(
            m.rotation,
            {
              duration: this.limbStepSize,
              x: m.userData["secondary"] ? range : -range,
              ease: "none",
            },
            ">"
          )
          .to(
            m.rotation,
            {
              duration: this.limbStepSize / 2,
              x: 0,
              ease: "none",
            },
            ">"
          );
      });
    });
  }

  // 取消手脚运动
  private cancelLimbsMotion() {
    this.limbsMotion.seek(0);
    this.limbsMotion.pause();
  }

  // 鼠标抬起
  private mouseup(e: MouseEvent) {
    delete drawCore.drawActivity["personRightAction"];
  }

  // 空手打击
  @throttle(0.3)
  private unarmedHit() {
    let arm = this.limbsInstance["arm"][0];
    let armx = this.limbsInstance["head"][0].rotation.x - Math.PI / 1.5;
    let tl = gsap.timeline({});
    tl.to(arm.rotation, {
      duration: 0.15,
      x: armx,
      ease: "circ.inOut",
    })
      .to(arm.rotation, {
        duration: 0.15,
        z: 0.3,
        ease: "circ.inOut",
      })
      .to(arm.rotation, {
        duration: 0.1,
        x: 0,
        z: 0,
        ease: "circ.inOut",
      });
  }
  // 鼠标点击
  private mouseClick(e: MouseEvent) {
    if (e.buttons == 1) {
      if (this.state == "modify") return;
      drawCore.drawActivity["personRightAction"] = this.unarmedHit.bind(this);
    }
  }

  // 移动人物朝向
  private CameraMove(e: MouseEvent) {
    let x = 0;
    let y = 0;
    if (this.state == "modify") return;
    if (this.play) {
      x = this.personArea.rotation.y += -e.movementX * 0.001;
      y = this.limbsInstance.head[0].rotation.x + e.movementY * 0.001;
    } else {
      x = THREE.MathUtils.degToRad(
        parseFloat((360 / (2 / (e.clientX / window.innerWidth))).toFixed(2)) -
          90
      );
      y = THREE.MathUtils.degToRad(
        parseFloat((360 / (1 / (e.clientY / window.innerHeight))).toFixed(2)) -
          90
      );
    }
    this.personArea.rotation.y = x;
    let angle = Math.abs(THREE.MathUtils.radToDeg(y));
    if (angle <= 75) {
      let mater = (this.limbsInstance["body"][0].children[0] as THREE.Mesh)
        .material as THREE.MeshPhongMaterial;
      if (angle > 45 && this.play) mater.opacity = 0;
      else mater.opacity = 1;
      this.limbsInstance.head[0].rotation.x = y;
    }
  }
  // 手脚并行--弃用
  @throttle(0.8)
  private limbsSwing() {
    ["leg", "arm"].forEach((l) => {
      this.limbsInstance[l].forEach((m: THREE.Mesh) => {
        let range = 0.5;
        if (m.userData["secondary"]) range = -range;
        gsap.to(m.rotation, {
          duration: this.limbStepSize,
          x: range,
          ease: "none",
          onComplete: () => {
            gsap.to(m.rotation, {
              duration: this.limbStepSize,
              x: -range,
              ease: "none",
            });
          },
        });
      });
    });
    // if (this.enableShowAction) {
    //   this.limbsInstance[type].forEach((m: THREE.Mesh) => {
    //     let n = Math.sin(t / this.personSpeed) * 36;
    //     if (m.userData["secondary"]) n = -n;
    //     m.rotation.x = THREE.MathUtils.degToRad(n);
    //   });
    // }
  }

  // 清除人物肢体部位
  private clearPersonLimbs() {
    for (const k in this.limbsInstance) {
      this.limbsInstance[k] = [];
    }
  }

  // 构建人物
  public Builder() {
    this.index = 0;
    this.clearPersonLimbs();
    this.limbs.forEach(this.createLimb.bind(this));
    if (this.headCamera) this.headCamera.removeFromParent();
    this.headCamera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    let headPos = new THREE.Vector3(
      0,
      this.headlimb.size / 8,
      this.headlimb.size / 2
    );
    this.headCamera.position.copy(headPos);
    headPos.z += 1;
    this.headCamera.lookAt(headPos);

    // let helper = new THREE.CameraHelper(this.headCamera);
    // drawCore.scene.add(helper);

    this.limbsInstance.head[0].add(this.headCamera);
    drawCore.scene.add(this.personArea);
  }

  // 创建人物肢体
  private createLimb({
    type,
    order,
    name,
    size,
    height,
    secondary = false,
    color = "#bababa",
    x = 0,
    y = 0,
    z = 0,
    parentType,
  }: limb) {
    if (type == "head") this.headlimb = this.limbs[this.index];
    let obj = new THREE.Object3D();
    let box = new THREE.BoxGeometry(size, height, size);
    let mater = new THREE.MeshPhongMaterial({
      color: color,
      transparent: true,
    });
    let mesh = new THREE.Mesh(box, mater);
    mesh.name = name;
    let existOrder = {};
    let siblingHeight = 0;
    this.limbs.forEach((m) => {
      if (parentType) if (m.type != parentType) return;
      if (m.order == order) {
        if (m.height >= siblingHeight) siblingHeight = m.height;
      }
      if (!(m.order < order)) {
      } else {
        if (existOrder[m.order]) {
          if (m.height <= existOrder[m.order]) return 0;
        }
        existOrder[m.order] = m.height + (m.order != 1 ? 0.5 : 0);
      }
    });
    for (const key in existOrder) {
      y += existOrder[key];
    }
    if (type != "head") mesh.position.set(0, -height / 2, 0);
    else y -= height / 2;
    if (type != "eye") {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
    mesh.userData["type"] = type;
    mesh.userData["i"] = this.index;
    obj.add(mesh);
    obj.position.set(x, y + siblingHeight + (order != 1 ? 0.5 : 0), z);
    obj.userData["secondary"] = secondary;

    // let axes = new THREE.AxesHelper(5);
    // (axes.material as THREE.MeshBasicMaterial).depthTest = false;
    // axes.renderOrder = 1;
    // obj.add(axes);

    if (parentType) {
      this.limbsInstance[parentType][0].children[0].add(obj);
    } else {
      this.personArea.add(obj);
    }
    this.index++;

    this.limbsInstance[type].push(obj);
  }

  // 初始化人物定位
  public reposition() {
    this.personArea.position.set(0, 0, 0);
    this.personArea.rotation.set(0, 0, 0);
  }

  // 重新构建人物
  public reBuilderPerson() {
    this.destroy();
    this.Builder();
  }

  public stepSize = 0.5;

  // 向前走
  private up() {
    let v3 = new THREE.Vector3();
    v3.setFromMatrixColumn(this.personArea.matrix, 0);
    v3.crossVectors(this.personArea.up, v3);
    this.personArea.position.addScaledVector(v3, -this.stepSize);
  }

  // 向后走
  private bottom() {
    let v3 = new THREE.Vector3();
    v3.setFromMatrixColumn(this.personArea.matrix, 0);
    v3.crossVectors(this.personArea.up, v3);
    this.personArea.position.addScaledVector(v3, this.stepSize);
  }
  // 向左
  private left() {
    let v3 = new THREE.Vector3();
    v3.setFromMatrixColumn(this.personArea.matrix, 0);
    this.personArea.position.addScaledVector(v3, this.stepSize);
  }
  // 向右
  private right() {
    let v3 = new THREE.Vector3();
    v3.setFromMatrixColumn(this.personArea.matrix, 0);
    this.personArea.position.addScaledVector(v3, -this.stepSize);
  }

  // 跳跃
  @throttle(0.55)
  private jump() {
    gsap.to(this.personArea.position, {
      duration: 0.3,
      y: this.personArea.position.y + 20,
      ease: "power1.out",
      onComplete: () => {
        gsap.to(this.personArea.position, {
          duration: 0.25,
          y: this.personArea.position.y - 20,
          ease: "power1.in",
        });
      },
    });
  }

  // 键盘按下触发事件
  activateKeys: Array<string> = [];
  private Activity(end: boolean, e: KeyboardEvent) {
    if (!this.play) return;
    let code = e.code.toLowerCase();
    if (this.keyMaps[code]) {
      if (!end) {
        if (!drawCore.drawActivity["person" + code]) {
          this.activateKeys.push(code);
          if (this.activateKeys.length != 0 && code != "space")
            this.limbsMotion.play();
          drawCore.drawActivity["person" + code] = this.keyMaps[code];
        }
      } else {
        this.activateKeys.pop();
        if (
          this.activateKeys.length == 0 ||
          (this.activateKeys.length == 1 && this.activateKeys[0] == "space")
        ) {
          this.cancelLimbsMotion();
        }
        delete drawCore.drawActivity["person" + code];
      }
    }
  }

  // 释放人物所有模型及资源
  public destroy() {
    let childrens = [];
    targetAcquisitor.GetAllChildren(this.personArea, childrens);
    for (let i = 0; i < childrens.length; i++) {
      if (childrens[i] instanceof THREE.Mesh) {
        childrens[i].geometry.dispose();
        (childrens[i].material as THREE.MeshBasicMaterial).dispose();
      }
      childrens[i]["dispose"] && childrens[i]["dispose"]();
      childrens[i].removeFromParent();
    }
  }
}
