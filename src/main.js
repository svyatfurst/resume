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

let targetRotation = 0; // бажаний кут
let rotatingSpeed = 0.10; // швидкість обертання

function MoveCamera(direction){
  if(isRotating) return;

  if(direction === "right" && IslandRotation > -4.9){
    targetRotation -= 1;
  }
  if(direction === "left" && IslandRotation < -0.9){
    targetRotation += 1;
  }
}

// function AdjustLighting(){
//   let intensity1 = 0;
//   let timePassed1 = 0;

//   console.log("Turning on the lights:")
//   const interval1 = setInterval(() => {
    
//     if(timePassed1 < 12000){
//       pointLights.forEach(light => {
//         light.intensity = intensity1
//       })
//       console.log(timePassed1, intensity1)
//       intensity1 += 0.25
//       timePassed1 += 10
//     }else
//       clearInterval(interval1);
//   }, 10)

      
//   setTimeout(() => {
//       console.log("Turning off the lights:")
//       let intensity2 = 300;
//       let timePassed2 = 0;
//       const interval2 = setInterval(() => {
//         if(timePassed2 < 12000){
//           pointLights.forEach(light => {
//             light.intensity = intensity2
//           })
//           console.log(timePassed2, intensity2)
//           intensity2 -= 0.25
//           timePassed2 += 10
//         }else
//           clearInterval(interval2);
//       }, 10)
//     }, 12000)
// }

function AdjustLighting() {
  const duration = 12000; // 12 секунд
  const start = performance.now();

  function turnOn(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1); // від 0 до 1
    const intensity = 300 * progress;

    pointLights.forEach(light => {
      light.intensity = intensity;
    });

    if (progress < 1) {
      requestAnimationFrame(turnOn);
    } else {
      // після вмикання запускаємо вимикання
      turnOff(performance.now());
    }
  }

  function turnOff(startTime) {
    function frame(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const intensity = 300 * (1 - progress);

      pointLights.forEach(light => {
        light.intensity = intensity;
      });

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    }
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(turnOn);
}

// Global variables
let IslandRotation = 0;
let isRotating = false;
let lastScrollTop = 0;
let lightsGroup = new THREE.Group();
const sun_and_moon_rotation_group = new THREE.Group();
// const axesHelper = new THREE.AxesHelper(20); // розмір 20
// lightsGroup.add(axesHelper);
lightsGroup.position.setX(85);

// Detecting movement
// document.addEventListener('keydown', (e) => {
//   if(e.code === 'KeyA'){
//     MoveCamera("left");
//   }

//   else if(e.code === 'KeyD'){
//     MoveCamera("right");
//   }
// });

// Detecting swipe direction
// let startX, startY;

// document.addEventListener('touchstart', (e) => {
//     startX = e.touches[0].clientX;
//     startY = e.touches[0].clientY;
// });

// document.addEventListener('touchend', (e) => {
//     const endX = e.changedTouches[0].clientX;
//     const endY = e.changedTouches[0].clientY;

//     const diffX = endX - startX;
//     const diffY = endY - startY;

//     if (Math.abs(diffX) > Math.abs(diffY)) {
//         // Горизонтальний свайп
//         if (diffX > 50) MoveCamera("left");
//         else if (diffX < -50) MoveCamera("right");
//     } else {
//         // Вертикальний свайп
//         if (diffY > 50) console.log('Свайп вниз');
//         else if (diffY < -50) console.log('Свайп вверх');
//     }
// });

const contentElements = [
  ['.welcome', 0],
  [".about", 1000],
  [".contacts", 1550],
  [".education", 2100],
  [".skills", 2650],
  [".experience", 3200],
  [".awards", 3750]
]
document.querySelector("main").addEventListener('scroll', (e) => {
  let t = document.querySelector('main').scrollTop;
  if(t <= 1000){
    camera.position.set(-150 + (t * 0.135), 50 - (t * 0.04), 0);
  }else{
    terrain.rotation.y = (t - 1000) * -0.002;
    lightsGroup.rotation.y = (t - 1000) * -0.002;
    sun_and_moon_rotation_group.rotation.y = (t - 1000) * -0.002;
  }
  contentElements.forEach(([selector, position]) => {
      const element = document.querySelector(selector);
      const difference = Math.abs(t - position);
      if(difference <= 250){
        element.style.opacity = 1 - (difference / 250);
      }else
        element.style.opacity = 0;

      console.log(selector, difference);
    });
  console.log("Scroll! Top: ", t);
});



// Creating scene, camera and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-150, 50, 0);
const renderer = new THREE.WebGLRenderer({
  alpha: true,
  canvas: document.querySelector('#bg'),
});

// Setting scene size and ratio
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xffffff00, 0);

//Adding light to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
ambientLight.intensity = 0.05;
scene.add(ambientLight);

const lightCords = [
  [72 - 85, 0, 65],
  [142 - 85, 0, 30],
  [67 - 85, 0, -31],
  [123 - 85, 0, -39],
]

let pointLights = [];
scene.add(lightsGroup);

lightCords.forEach(([x, y, z]) => {
  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(x, y, z);
  pointLight.intensity = 0;
  pointLights.push(pointLight);
  lightsGroup.add(pointLight);

  // const lightHelper = new THREE.PointLightHelper(pointLight);
  // scene.add(lightHelper);
});


// Adding controls to the scene
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;


// Loading terrain model
const terrain = await LoadModel(import.meta.env.BASE_URL + 'models/island.glb')
terrain.scale.set(75, 75, 75);
terrain.position.set(85, -27.5, 0);
terrain.rotation.y = IslandRotation;
scene.add(terrain);

//Loading car model
const car = await LoadModel(import.meta.env.BASE_URL + 'models/flying_car_1_low-poly.glb')
car.scale.set(0.0125, 0.0125, 0.0125);
car.position.set(20, -3, 0); // Starting position
scene.add(car);

//Loading sun and moon model
const sun_and_moon = await LoadModel(import.meta.env.BASE_URL + 'models/sun_and_moon.glb')
const sun_and_moon_group = new THREE.Group();

sun_and_moon.scale.set(20, 20, 20);
sun_and_moon.position.set(200 - 85, 0, 0);

const sun_light = new THREE.PointLight(0xffffff, 1);
sun_light.position.set(150 - 85, 150, 0);
sun_light.intensity = 100000;
// const sun_light_helper = new THREE.PointLightHelper(sun_light, 5);

// scene.add(sun_light_helper);
sun_and_moon_group.add(sun_and_moon, sun_light);
// const axesHelper = new THREE.AxesHelper(20);
// sun_and_moon_group.add(axesHelper)
sun_and_moon_rotation_group.add(sun_and_moon_group);
sun_and_moon_rotation_group.position.setX(85);
scene.add(sun_and_moon_rotation_group);

// Sun and moon rotation
// const sun_and_moon_interval = setInterval(() => {
//   sun_and_moon_group.rotation.x += Math.PI / 360 * 0.15;
// }, 10);

// Changing to night light
// setTimeout(() => {
//   AdjustLighting()
//   setInterval(() => {
//     AdjustLighting()
//   }, 42000)
// }, 12000)

let dayNightStart = performance.now();   // коли почався цикл
const dayNightPeriod = 48000;            // повний цикл (42s)
const lightPhaseDuration = 18000;        // скільки триває вмикання/вимикання

function updateDayNight(now) {
  const elapsed = (now - dayNightStart) % dayNightPeriod; // час у межах циклу

  if (elapsed < lightPhaseDuration) {
    // фаза "вмикання"
    const progress = elapsed / lightPhaseDuration;
    const intensity = 300 * progress;
    pointLights.forEach(l => l.intensity = intensity);
  }
  else if (elapsed < 2 * lightPhaseDuration) {
    // фаза "вимикання"
    const progress = (elapsed - lightPhaseDuration) / lightPhaseDuration;
    const intensity = 300 * (1 - progress);
    pointLights.forEach(l => l.intensity = intensity);
  }
  else {
    // решту часу світло вимкнене
    pointLights.forEach(l => l.intensity = 0);
  }
}


let lastFrameTime = performance.now();
let lastSunUpdate = performance.now();
let sun_and_moon_x = sun_and_moon_group.rotation.x;
let start = Date.now();
const updateInterval = 10;

// Main loop function
function animate(now) {
  requestAnimationFrame(animate);
  controls.update();

  const delta = (now - lastFrameTime) / 1000;
  lastFrameTime = now;

  // updateSunAndMoon(delta);     // сонце/місяць
  updateDayNight(now);   
  // sun_and_moon_group.rotation.x += (Math.PI / 360) * 0.15 * delta; 
  // console.log(delta)
  sun_and_moon_group.rotation.x = sun_and_moon_x + ((Date.now() - start) / 10) * (Math.PI / 360 * 0.15);

  camera.lookAt(car.position.x, car.position.y + 20, car.position.z + 5);
  renderer.render(scene, camera);
}
animate(performance.now());