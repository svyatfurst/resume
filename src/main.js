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

// Function to rotate the island
// function MoveCamera(direction){
//   if(isRotating) return;

//   isRotating = true;
//   function SmoothRotation(targetValue){
//     const interval = setInterval(() => {
//       if(IslandRotation < IslandRotation + targetValue){
//         IslandRotation += targetValue * 0.01;
//       }else
//         clearInterval(interval);
//     }, 10);
//   }

//   if(direction == "right"){
//     SmoothRotation(-0.5);
//     terrain.rotation.y = IslandRotation;
//   }

//   if(direction == "left"){
//     SmoothRotation(0.5);
//     terrain.rotation.y = IslandRotation;
//   }
//   isRotating = false;
// }

let targetRotation = 0; // бажаний кут
let rotatingSpeed = 0.10; // швидкість обертання

function MoveCamera(direction){
  if(isRotating) return;

  if(direction === "right"){
    targetRotation -= 0.5;
  }
  if(direction === "left" && IslandRotation < 0){
    targetRotation += 0.5;
  }
}

// Global variables
let IslandRotation = 0;
let isRotating = false;
let lastScrollTop = 0;

// Detecting movement
document.addEventListener('keydown', (e) => {
  if(e.code === 'KeyA'){
    MoveCamera("left");
  }

  else if(e.code === 'KeyD'){
    MoveCamera("right");
  }
});

// Detecting swipe direction
let startX, startY;

document.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const diffX = endX - startX;
    const diffY = endY - startY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Горизонтальний свайп
        if (diffX > 50) MoveCamera("left");
        else if (diffX < -50) MoveCamera("right");
    } else {
        // Вертикальний свайп
        if (diffY > 50) console.log('Свайп вниз');
        else if (diffY < -50) console.log('Свайп вверх');
    }
});

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
renderer.setClearColor(0x8ABABA, 1);

//Adding light to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
ambientLight.intensity = 1;
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(50, 100, 50);
scene.add(dirLight);

const hemiLight = new THREE.HemisphereLight(0x88ccff, 0x444422, 0.5);
scene.add(hemiLight);


// Adding grid helper
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(gridHelper);

// Adding controls to the scene
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;


// Loading terrain model
const terrain = await LoadModel(import.meta.env.BASE_URL + 'models/island.glb')
terrain.scale.set(75, 75, 75);
terrain.position.set(85, -27.5, 0);
terrain.rotation.y = Math.PI;
scene.add(terrain);

//Loading car model
const car = await LoadModel(import.meta.env.BASE_URL + 'models/flying_car_1_low-poly.glb')
car.scale.set(0.025, 0.025, 0.025);
car.position.set(20, -1.5, 0); // Starting position
scene.add(car);

const EPSILON = 0.0001;

// Main loop function
function animate(now) {
  requestAnimationFrame(animate);
  // controls.update();

  // Smooth rotation
  if(Math.abs(targetRotation - IslandRotation) > EPSILON){
    isRotating = true;
    IslandRotation += (targetRotation - IslandRotation) * rotatingSpeed;
    terrain.rotation.y = IslandRotation;
  }else
    isRotating = false;

  console.log("IslandRotation: ", IslandRotation, " | targetRotation: ", targetRotation, " | isRotating: ", isRotating);

  camera.lookAt(car.position.x, car.position.y + 20, car.position.z);
  renderer.render(scene, camera);
}
animate();