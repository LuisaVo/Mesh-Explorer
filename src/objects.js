import * as THREE from 'three';

function noise(x, y, z, freq = 1, amp = 1) {
  // Simple pseudo-noise using Math.sin for demonstration
  return Math.sin(x * freq) * Math.sin(y * freq) * Math.sin(z * freq) * amp;
}

// Centralized color definition
function getTypeColor(type) {
  switch (type) {
    case 'small': return 0xff6699;
    case 'big': return 0x44cc88;
    case 'smooth': return 0x995fd3;
    default: return 0xffffff;
  }
}

export function createDonut({ position, meshDensity, type }) {
  // Torus parameters
  const radius = 2;
  const tube = 0.7;
  const geometry = new THREE.TorusGeometry(radius, tube, meshDensity, meshDensity * 2);

  // Displace vertices for craters/hills
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);
    let displacement = 0;
    if (type === 'big') {
      displacement = noise(x, y, z, 1.5, 0.7); // big craters
    } else if (type === 'small') {
      displacement = noise(x, y, z, 8, 0.3); // small, many craters
    }
    pos.setXYZ(i, x + x * displacement * 0.15, y + y * displacement * 0.15, z + z * displacement * 0.15);
  }
  geometry.computeVertexNormals();

  // Material
  const color = getTypeColor(type);
  const material = new THREE.MeshStandardMaterial({ color, flatShading: true });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);

  // Wireframe
  const wire = new THREE.LineSegments(
    new THREE.WireframeGeometry(geometry),
    new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true })
  );
  wire.position.copy(mesh.position);

  return { mesh, wire };
}

export function createPlanet({ position, meshDensity, type }) {
  const radius = 3;
  const geometry = new THREE.SphereGeometry(radius, meshDensity, meshDensity);

  // Displace vertices for craters/hills
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);
    let displacement = 0;
    if (type === 'big') {
      displacement = noise(x, y, z, 1.5, 0.7); // big craters
    } else if (type === 'small') {
      displacement = noise(x, y, z, 8, 0.3); // small, many craters
    }
    pos.setXYZ(i, x + x * displacement * 0.15, y + y * displacement * 0.15, z + z * displacement * 0.15);
  }
  geometry.computeVertexNormals();

  // Material
  const color = getTypeColor(type);
  const material = new THREE.MeshStandardMaterial({ color, flatShading: true });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);

  // Wireframe
  const wire = new THREE.LineSegments(
    new THREE.WireframeGeometry(geometry),
    new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true })
  );
  wire.position.copy(mesh.position);

  return { mesh, wire };
}

export function createTerrain({ position, meshDensity, type }) {
  const size = 6;
  const geometry = new THREE.PlaneGeometry(size, size, meshDensity, meshDensity);

  // Displace vertices for hills/craters
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let displacement = 0;
    if (type === 'big') {
      displacement = noise(x, y, 6, 1.2, 1.2); // big hills
    } else if (type === 'small') {
      displacement = noise(x, y, 6, 6, 0.5); // small, many hills
    }
    pos.setZ(i, displacement);
  }
  geometry.computeVertexNormals();

  // Material
  const color = getTypeColor(type);
  const material = new THREE.MeshStandardMaterial({ color, flatShading: true, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.rotation.x = -Math.PI / 2;

  // Wireframe
  const wire = new THREE.LineSegments(
    new THREE.WireframeGeometry(geometry),
    new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true })
  );
  wire.position.copy(mesh.position);
  wire.rotation.copy(mesh.rotation);

  return { mesh, wire };
}