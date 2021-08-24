import * as THREE from "three";

class DrawCore {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public canvas: HTMLCanvasElement;
  public render: THREE.WebGLRenderer;
  public drawActivity: { [x: string]: Function } = {};
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#179987");
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 2, 40);
    this.canvas = document.getElementById("c") as HTMLCanvasElement;
    this.render = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.render.shadowMap.enabled = true;
    this.render.shadowMap.type = THREE.PCFSoftShadowMap;
    requestAnimationFrame(this.draw.bind(this));
  }

  private ResetSize() {
    let w = this.canvas.clientWidth;
    let h = this.canvas.clientHeight;
    let needReset = this.canvas.width !== w || this.canvas.height !== h;
    if (needReset) this.render.setSize(w, h, false);
    return needReset;
  }

  private draw(t) {
    requestAnimationFrame(this.draw.bind(this));
    if (this.ResetSize()) {
      this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
      this.camera.updateProjectionMatrix();
    }
    for (const func in this.drawActivity) {
      this.drawActivity[func](t);
    }
    this.render.render(this.scene, this.camera);
  }
}

declare global {
  let drawCore: DrawCore;
  interface Window {
    drawCore: DrawCore;
  }
}
window.drawCore = null;

export default DrawCore;
