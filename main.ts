import Person from "./PersonModels/Person";
import ModifyPersonHelp from "./PersonModels/ModifyPersonHelp";
import * as THREE from "three";
import { OrbitControls } from "@three-ts/orbit-controls";
import * as $ from "jquery";

let scene = new THREE.Scene();
scene.background = new THREE.Color("#179987");

let camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 40);
let canvas = document.getElementById("c") as HTMLCanvasElement;
let render = new THREE.WebGLRenderer({ canvas });
render.shadowMap.enabled = true;
render.shadowMap.type = THREE.PCFSoftShadowMap;

function ResetSize() {
  let w = canvas.clientWidth;
  let h = canvas.clientHeight;
  let needReset = canvas.width !== w || canvas.height !== h;
  if (needReset) render.setSize(w, h, false);
  return needReset;
}

function draw(t) {
  requestAnimationFrame(draw);
  if (ResetSize()) {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  orbitCamera.update();
  render.render(scene, camera);
}

let modifyPersonHelp: ModifyPersonHelp;
let menu = $("#menu");
let back = $("#back");
let modifyPerson = $("#modifyPerson");
let operation = $("#operation");
let orbitCamera: OrbitControls;

function main() {
  let person = new Person(scene);
  modifyPersonHelp = new ModifyPersonHelp(canvas, scene, person, camera);
  {
    let light = new THREE.DirectionalLight("white", 1);
    light.position.set(-10, 21, 15);
    light.target.position.set(0, -3, 8);
    light.shadow.camera.bottom = -20;
    light.shadow.camera.top = 20;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 100;
    light.castShadow = true;
    scene.add(light);
    let globalLight = new THREE.AmbientLight("white", 0.6);
    scene.add(globalLight);
  }
  {
    let wall = new THREE.PlaneGeometry(100, 100);
    let wallmater = new THREE.MeshPhongMaterial({
      color: "#EE6B3C",
      side: THREE.DoubleSide,
    });
    let wallmesh = new THREE.Mesh(wall, wallmater);
    wallmesh.rotation.x = Math.PI / 2;
    wallmesh.position.set(0, -12.5, 0);
    wallmesh.receiveShadow = true;
    scene.add(wallmesh);
  }
  {
    orbitCamera = new OrbitControls(camera, canvas);
    orbitCamera.target.set(0, 2, 0);
    orbitCamera.saveState();
    orbitCamera.enabled = false;
    orbitCamera.enableZoom = false;
    orbitCamera.autoRotate = true;
    orbitCamera.maxPolarAngle = Math.PI / 2 + 0.3;
    orbitCamera.update();
    modifyPerson.on("click", () => {
      controlMenu(true, orbitCamera);
    });
    back.on("click", () => {
      controlMenu(false, orbitCamera);
      orbitCamera.reset();
    });
  }
  requestAnimationFrame(draw);
}

function controlMenu(enabled: boolean, orbitCamera: OrbitControls) {
  orbitCamera.autoRotate = !enabled;
  back.css({ display: enabled ? "flex" : "none" });
  operation.css({ display: enabled ? "flex" : "none" });
  menu.css({ display: enabled ? "none" : "flex" });
  modifyPersonHelp.enabled = enabled;
  orbitCamera.enabled = enabled;
}

main();
