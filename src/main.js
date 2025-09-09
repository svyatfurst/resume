// Importing three.js, OrbitControls, GLTF Loader and styles
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './style.css';

// Function section
function LoadModel(path) {

  // Declaring loader and model
  const loader = new GLTFLoader();
  
  // Loading model
  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => resolve(gltf.scene),
      undefined,
      (error) => reject(error)
    );
  });
}

function MoveCamera(){
  const t = document.querySelector('.scrolling-filler').getBoundingClientRect().top;
  car.position.z = t * -0.1;
  car.position.y = t * -0.005;
  camera.position.z = t * -0.1;
  camera.position.y = t * -0.005 + 20;
  pointLight.position.z = car.position.z;
  carLight.position.z = car.position.z;
}

// Creating scene, camera and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-60, 20, 0);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

// Setting scene size and ratio
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x080707, 1);

//Adding light to the scene
// const ambientLight = new THREE.AmbientLight(0xffffff, 1);
// ambientLight.intensity = 0.05;
// scene.add(ambientLight);

// Point light
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(100, 50, 10);
pointLight.intensity = 20000;
scene.add(pointLight);

// Car Point light
const carLight = new THREE.PointLight(0xffffff, 1, 100);
carLight.position.set(-15, 10, 0);
carLight.intensity = 100;
scene.add(carLight);

// Adding grid helper
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(gridHelper);

// Adding controls to the scene
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;

//Adding event listener for scrolling
document.querySelector('.scrolling').addEventListener('scroll', MoveCamera);

// Loading terrain model
const terrain = await LoadModel(import.meta.env.BASE_URL + 'models/mars_landscape.glb')
terrain.scale.set(75, 75, 75);
terrain.position.set(350, -25, -215);
terrain.rotation.y = Math.PI;
terrain.traverse((child) => {
  if (child.isMesh) {
    child.material = new THREE.MeshStandardMaterial({
      map: child.material.map, // збережемо текстуру
    });
  }
});
scene.add(terrain);

//Loading car model
const car = await LoadModel(import.meta.env.BASE_URL + 'models/flying_car_1_low-poly.glb')
car.scale.set(0.05, 0.05, 0.05);
car.position.set(0, 2, 0); // Starting position
scene.add(car);

// Main loop function
function animate() {
  requestAnimationFrame(animate);
  // controls.update();
  camera.lookAt(car.position.x, car.position.y + 20, car.position.z);
  renderer.render(scene, camera);
}
animate();