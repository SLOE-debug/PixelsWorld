import * as THREE from "three";
import * as Stats from "stats.js";

class DrawCore {
  public scene: THREE.Scene;
  private oldcameras: Array<THREE.PerspectiveCamera> = [];
  private _camera: THREE.PerspectiveCamera;
  public get camera(): THREE.PerspectiveCamera {
    return this._camera;
  }
  public set camera(v: THREE.PerspectiveCamera) {
    if (this._camera) this.oldcameras.push(this._camera.clone());
    this._camera = v;
    this.updateCameraAspect();
  }

  private stats: Stats;
  public canvas: HTMLCanvasElement;
  public render: THREE.WebGLRenderer;
  public drawActivity: { [x: string]: Function } = {};
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#179987");
    this.canvas = document.getElementById("c") as HTMLCanvasElement;
    this.render = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 10, 40);
    this.render.shadowMap.enabled = true;
    this.render.shadowMap.type = THREE.PCFSoftShadowMap;
    window.onresize = () => {
      this.updateCameraAspect();
    };
    // this.stats = new Stats();
    // this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    // document.body.appendChild(this.stats.dom);
    requestAnimationFrame(this.draw.bind(this));
  }

  public backCamera() {
    if (this.oldcameras.length > 0) {
      this._camera = this.oldcameras[0];
      this.updateCameraAspect();
      this.oldcameras.shift();
    }
  }

  private ResetSize() {
    let w = this.canvas.clientWidth;
    let h = this.canvas.clientHeight;
    let needReset = this.canvas.width !== w || this.canvas.height !== h;
    if (needReset) this.render.setSize(w, h, false);
    return needReset;
  }

  private updateCameraAspect() {
    this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera.updateProjectionMatrix();
  }

  private draw(t) {
    requestAnimationFrame(this.draw.bind(this));
    // this.stats.begin();
    if (this.ResetSize()) {
      this.updateCameraAspect();
    }
    for (const func in this.drawActivity) {
      this.drawActivity[func](t);
    }
    // this.stats.end();
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
