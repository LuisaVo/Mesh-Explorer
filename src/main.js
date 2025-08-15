import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createPlanet } from './objects.js';
import { createDonut } from './objects.js';
import { createTerrain } from './objects.js';

const app = document.getElementById('app');
const scene = new THREE.Scene();

// Create modern gradient background
const canvas = document.createElement('canvas');
canvas.width = 1024;
canvas.height = 1024;
const ctx = canvas.getContext('2d');

// Create radial gradient
const gradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
// gradient.addColorStop(0, '#667eea');
// gradient.addColorStop(0.5, '#764ba2');
// gradient.addColorStop(1, '#1a1a2e');
gradient.addColorStop(0, '#7e97ce'); // light gray center
gradient.addColorStop(0.5, '#385594'); // mid gray
gradient.addColorStop(1, '#0f1f3d'); // dark gray edge

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 1024, 1024);

const bgTexture = new THREE.CanvasTexture(canvas);
scene.background = bgTexture;

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const initialCameraPosition = new THREE.Vector3(0, 9, 18);
const initialTarget = new THREE.Vector3(0, 0, 0);
camera.position.copy(initialCameraPosition);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0); // Transparent background
renderer.setSize(window.innerWidth, window.innerHeight);
app.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.copy(initialTarget);
controls.update();

const light = new THREE.DirectionalLight(0xffffff, 1.2);
light.position.set(10, 10, 10);
scene.add(light);
const yellowlight = new THREE.DirectionalLight(0xffff00, 1);
yellowlight.position.set(-10, -10, -10);
scene.add(yellowlight);
// scene.add(new THREE.AmbientLight(0xffffff, 0.2));

// Planets
let meshDensity = 32;
let planets = [];
let donuts = [];
let terrains = [];
let allMeshes = [];
let allWires = [];

function addObjects() {
  allMeshes = [];
  allWires = [];
  // Remove old planets
  planets.forEach(obj => {
    scene.remove(obj.mesh);
    scene.remove(obj.wire);
  });
  planets = [];
  // Remove old donuts
  donuts.forEach(obj => {
    scene.remove(obj.mesh);
    scene.remove(obj.wire);
  });
  donuts = [];
  // Remove old terrains
  terrains.forEach(obj => {
    scene.remove(obj.mesh);
    scene.remove(obj.wire);
  });
  terrains = [];

  // Add planets
  planets.push(createPlanet({ position: [-7, 7, 0], meshDensity, type: 'smooth' }));
  planets.push(createPlanet({ position: [0, 7, 0], meshDensity, type: 'big' }));
  planets.push(createPlanet({ position: [7, 7, 0], meshDensity, type: 'small' }));
  planets.forEach(obj => {
    scene.add(obj.mesh);
    scene.add(obj.wire);
    allMeshes.push(obj.mesh);
    allWires.push(obj.wire);
  });

  // Add donuts
  donuts.push(createDonut({ position: [-7, 0, 0], meshDensity, type: 'smooth' }));
  donuts.push(createDonut({ position: [0, 0, 0], meshDensity, type: 'big' }));
  donuts.push(createDonut({ position: [7, 0, 0], meshDensity, type: 'small' }));
  donuts.forEach(obj => {
    scene.add(obj.mesh);
    scene.add(obj.wire);
    allMeshes.push(obj.mesh);
    allWires.push(obj.wire);
  });

  // Add terrain patches
  terrains.push(createTerrain({ position: [-7, -7, 0], meshDensity, type: 'smooth' }));
  terrains.push(createTerrain({ position: [0, -7, 0], meshDensity, type: 'big' }));
  terrains.push(createTerrain({ position: [7, -7, 0], meshDensity, type: 'small' }));
  terrains.forEach(obj => {
    scene.add(obj.mesh);
    scene.add(obj.wire);
    allMeshes.push(obj.mesh);
    allWires.push(obj.wire);
  });
// Raycaster for picking
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function focusCameraOnObject(object) {
  // Animate camera to focus on the object's position
  const target = object.position.clone();
  // Move camera to a position offset from the object
  const offset = new THREE.Vector3(0, 0, 8);
  const newPos = target.clone().add(offset);
  // Animate camera position and controls.target
  let progress = 0;
  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();
  function animateFocus() {
    progress += 0.05;
    camera.position.lerpVectors(startPos, newPos, progress);
    controls.target.lerpVectors(startTarget, target, progress);
    controls.update();
    if (progress < 1) {
      requestAnimationFrame(animateFocus);
    }
  }
  animateFocus();
}

renderer.domElement.addEventListener('pointerdown', event => {
  // Get mouse position normalized
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(allMeshes);
  if (intersects.length > 0) {
    focusCameraOnObject(intersects[0].object);
  }
});
}

addObjects();

// Reset camera button functionality
const resetBtn = document.getElementById('resetCamera');
resetBtn.addEventListener('click', () => {
  camera.position.copy(initialCameraPosition);
  controls.target.copy(initialTarget);
  controls.update();
});

// Toggle mesh wireframe visibility
const toggleBtn = document.getElementById('toggleMesh');
let meshVisible = true;
toggleBtn.addEventListener('click', () => {
  meshVisible = !meshVisible;
  allWires.forEach(wire => {
    wire.visible = meshVisible;
  });
  toggleBtn.textContent = meshVisible ? 'Mesh ausblenden' : 'Mesh einblenden';
});

// Mesh density control
const meshDensityInput = document.getElementById('meshDensity');
const meshDensityValue = document.getElementById('meshDensityValue');
meshDensityInput.addEventListener('input', e => {
  meshDensity = parseInt(e.target.value);
  meshDensityValue.textContent = meshDensity;
  addObjects();
  // Keep mesh hidden if meshVisible is false
  if (!meshVisible) {
    allWires.forEach(wire => {
      wire.visible = false;
    });
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
