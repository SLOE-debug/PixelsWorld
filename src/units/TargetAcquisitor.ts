import * as THREE from "three";

class TargetAcquisitor {
  Gettarget(
    event,
    Area: THREE.Object3D,
    allResults: boolean
  ): THREE.Intersection & Array<THREE.Intersection> {
    let rect = drawCore.canvas.getBoundingClientRect();
    let pos = {
      x: ((event.clientX - rect.left) * drawCore.canvas.width) / rect.width,
      y: ((event.clientY - rect.top) * drawCore.canvas.height) / rect.height,
    };
    let PointerPos = {
      x: (pos.x / drawCore.canvas.width) * 2 - 1,
      y: (pos.y / drawCore.canvas.height) * -2 + 1,
    };
    let childrens = [];
    this.GetAllChildren(Area, childrens);
    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(PointerPos, drawCore.camera);
    let intersects = raycaster.intersectObjects(childrens);
    if (allResults) return intersects as any;
    else return intersects ? (intersects[0] as any) : null;
  }
  public GetAllChildren(obj: THREE.Object3D, childrens: Array<any>) {
    childrens.push(...obj.children);
    obj.children.forEach((m) => {
      this.GetAllChildren(m, childrens);
    });
  }
}

declare global {
  let targetAcquisitor: TargetAcquisitor;
  interface Window {
    targetAcquisitor: TargetAcquisitor;
  }
}
window.targetAcquisitor = null;

export default TargetAcquisitor;
