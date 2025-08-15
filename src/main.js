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
const initialCameraPosition = new THREE.Vector3(6, 6, 17);
const initialTarget = new THREE.Vector3(1, 1.5, -1.5);
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
const yellowlight = new THREE.DirectionalLight(0xffff00, 0.8);
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
  terrains.push(createTerrain({ position: [-7, -5, 0], meshDensity, type: 'smooth' }));
  terrains.push(createTerrain({ position: [0, -5, 0], meshDensity, type: 'big' }));
  terrains.push(createTerrain({ position: [7, -5, 0], meshDensity, type: 'small' }));
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

// Create modern controls panel
const controlsPanel = document.createElement('div');
controlsPanel.style.cssText = `
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  z-index: 1000;
  min-width: 250px;
`;

controlsPanel.innerHTML = `
  <h3 style="margin: 0 0 16px 0; color: #333; font-size: 18px; font-weight: 600;">Steuerung</h3>
  
  <div style="margin-bottom: 16px;">
    <label style="display: block; margin-bottom: 8px; color: #555; font-weight: 500; font-size: 14px;">Mesh-Dichte: <span id="meshDensityValue" style="color: #667eea; font-weight: 600;">32</span></label>
    <input type="range" id="meshDensity" min="8" max="128" value="32" style="
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: linear-gradient(to right, #667eea 0%, #764ba2 100%);
      outline: none;
      -webkit-appearance: none;
    ">
  </div>
  
  <div style="display: flex; gap: 8px; flex-direction: column;">
    <button id="resetCamera" style="
      padding: 10px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    ">Kamera zurücksetzen</button>
    
    <button id="toggleMesh" style="
      padding: 10px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    ">Mesh ausblenden</button>
  </div>
`;

// Add hover effects to buttons
const buttons = controlsPanel.querySelectorAll('button');
buttons.forEach(btn => {
  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'translateY(-2px)';
    btn.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translateY(0)';
    btn.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
  });
});

// Style the range slider thumb
const style = document.createElement('style');
style.textContent = `
  #meshDensity::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #667eea;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
    transition: all 0.2s ease;
  }
  #meshDensity::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.6);
  }
  #meshDensity::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #667eea;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  }
`;
document.head.appendChild(style);

document.body.appendChild(controlsPanel);

// Reset camera button functionality
const resetBtn = controlsPanel.querySelector('#resetCamera');
resetBtn.addEventListener('click', () => {
  camera.position.copy(initialCameraPosition);
  controls.target.copy(initialTarget);
  controls.update();
});

// Toggle mesh wireframe visibility
const toggleBtn = controlsPanel.querySelector('#toggleMesh');
let meshVisible = true;
toggleBtn.addEventListener('click', () => {
  meshVisible = !meshVisible;
  allWires.forEach(wire => {
    wire.visible = meshVisible;
  });
  toggleBtn.textContent = meshVisible ? 'Mesh ausblenden' : 'Mesh einblenden';
});

// Mesh density control
const meshDensityInput = controlsPanel.querySelector('#meshDensity');
const meshDensityValue = controlsPanel.querySelector('#meshDensityValue');
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

// Create Aufgaben button
const aufgabenBtn = document.createElement('button');
aufgabenBtn.textContent = 'Aufgaben';
aufgabenBtn.style.cssText = `
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
`;
aufgabenBtn.addEventListener('mouseenter', () => {
  aufgabenBtn.style.background = '#5a67d8';
  aufgabenBtn.style.transform = 'translateY(-2px)';
});
aufgabenBtn.addEventListener('mouseleave', () => {
  aufgabenBtn.style.background = '#667eea';
  aufgabenBtn.style.transform = 'translateY(0)';
});
document.body.appendChild(aufgabenBtn);

// Create overlay for questions
const overlay = document.createElement('div');
overlay.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  z-index: 2000;
  display: none;
  backdrop-filter: blur(5px);
`;

const questionsContainer = document.createElement('div');
questionsContainer.style.cssText = `
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 30px;
  border-radius: 16px;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
`;

const closeBtn = document.createElement('button');
closeBtn.innerHTML = '×';
closeBtn.style.cssText = `
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  font-size: 30px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

questionsContainer.innerHTML = `
  <h2 style="margin-top: 0; color: #333; margin-bottom: 20px;">Interaktive Aufgaben</h2>
  <ol style="line-height: 1.6; color: #555;">
    <li style="margin-bottom: 20px;">
      <b>Welche Unterschiede gibt es zwischen geringer und hoher Dichte?</b><br>
      <textarea rows="3" style="width:100%; margin-top: 8px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;" placeholder="Deine Antwort..."></textarea>
    </li>
    <li style="margin-bottom: 20px;">
      <b>Entscheide für jede Farbe (Lila, Grün und Rosa), welche Dichte mindestens nötig ist, um die Objekte detailliert zu modellieren.</b><br>
      <textarea rows="3" style="width:100%; margin-top: 8px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;" placeholder="Deine Antwort..."></textarea>
    </li>
    <li style="margin-bottom: 20px;">
      <b>Welchen Einfluss hat die Dichte auf die zugrundeliegende Berechnung der Visualisierung?</b><br>
      <textarea rows="3" style="width:100%; margin-top: 8px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;" placeholder="Deine Antwort..."></textarea>
    </li>
    <li style="margin-bottom: 20px;">
      <b>Ein Meteorologe möchte Hurricanes und Tornados modellieren, um Anwohner der Risikogebiete zu warnen. Entscheide für die folgenden Fälle, ob mit geringer oder hoher Dichte modelliert werden soll:</b>
      <ul style="margin: 8px 0;">
        <li>Welche Länder sind betroffen?</li>
        <li>Welche Städte sind betroffen?</li>
        <li>Liegen Krankenhäuser der betroffenen Städte in der Gefahrenzone?</li>
      </ul>
      <textarea rows="3" style="width:100%; margin-top: 8px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;" placeholder="Deine Antwort..."></textarea>
    </li>
    <li style="margin-bottom: 20px;">
      <b>Stell dir vor, du möchtest ein 3D-Modell für ein Computerspiel gestalten, in dem eine Heldin durch verschiedene Landschaften reist. Überlege, wie die Dichte der Modelle die Atmosphäre und das Spielerlebnis beeinflusst. Beschreibe, wie du die Dichte für die Landschaft, die Heldin und besondere Objekte (z.B. magische Artefakte) wählen würdest.</b><br>
      <textarea rows="3" style="width:100%; margin-top: 8px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;" placeholder="Deine Antwort..."></textarea>
    </li>
  </ol>
`;

questionsContainer.appendChild(closeBtn);
overlay.appendChild(questionsContainer);
document.body.appendChild(overlay);

// Toggle overlay functionality
function toggleOverlay() {
  overlay.style.display = overlay.style.display === 'none' ? 'flex' : 'none';
}

aufgabenBtn.addEventListener('click', toggleOverlay);
closeBtn.addEventListener('click', toggleOverlay);
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) toggleOverlay();
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
