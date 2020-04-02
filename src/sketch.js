// libs
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Stats from 'stats-js'

import './css/game.css' // eslint-disable-line no-unused-vars
// Objs
import Boat from './objs/Boat'
import Sky from './objs/Sky'
import Sea from './objs/Sea'
import RocksHandler from './objs/RocksHandler'
import FuelsHandler from './objs/FuelHandler'

// other
import { isKeyDown } from './keyboardHandler'
import { normalize } from './useful'

// variables

let gameState
let statsGui
let scene, camera, renderer, clock, container, height, width
let hemisphereLight, shadowLight, ambientLight
let sea, sky, rocksHandler, fuelsHandler
let mousePos = { x: 0, y: 0 }
let gltfLoader
const animations = []

// UI dom elemts
let fuelBar, fieldDistance

// this dosn't work .. execute twice initGame
// window.addEventListener('load', init)
window.onload = initGame

function loadingAssets () {
    // init GLTF loader models
    gltfLoader = new GLTFLoader()

    gltfLoader.load(
        // parameter 1: The URL
        './assets/Stork.glb',
        // parameter 2:The onLoad callback
        (gltf, position) => { loadAsset(gltf) }
        // parameter 3:The onProgress callback
        // parameter 4:The onError callback
    )
}

function loadAsset (gltf) {
    console.log(gltf)
    const model = gltf.scene.children[0]
    model.position.set(20, 15, 20)
    model.scale.set(0.1, 0.1, 0.1)

    const animation = gltf.animations[0]

    const mixer = new THREE.AnimationMixer(model)
    animations.push(mixer)

    const action = mixer.clipAction(animation)
    action.play()

    scene.add(model)

}

function initGame () {
    console.log('----- init -----')
    // console.trace()
    // init stats-js
    statsGui = new Stats()
    statsGui.showPanel(0)
    document.body.appendChild(statsGui.dom)
    // UI dom
    fieldDistance = document.getElementById('distanceValue')
    fuelBar = document.getElementById('fuelBarprogress')

    clock = new THREE.Clock() // used tu get timeStamp and deltaTime

    createScene() // set up the scene, the camera and the renderer

    loadingAssets()

    // init gameState variable
    gameState = {
        distance: 0,
        fuel: 100,
        ratioFuel: 0.04,
        ratioDistance: 1,
        maxBoatpos: 150,
        speed: 50,
        seaWidth: 600,
        seaLength: 800,
        seaLevel: -5,
        wavesAmp: 5,
        spawnPos: 800,
        rockDistanceTolerance: 30,
        CameraTargetPos: 0,
        CamMoveSensivity: 1
    }

    // createBoat
    const boat = new Boat(gameState.maxBoatpos)
    boat.mesh.position.z = 20
    scene.add(boat.mesh)
    gameState.boat = boat

    createLights() // add the lights

    // add game objectsn
    // createSea
    sea = new Sea()
    sea.mesh.position.y = gameState.seaLevel
    scene.add(sea.mesh) // add the mesh of the sea to the scene
    // createSky
    sky = new Sky(8, gameState.spawnPos)
    scene.add(sky.mesh)
    // initRocksHandler
    rocksHandler = new RocksHandler(10, gameState)
    scene.add(rocksHandler.mesh)
    // initFuelsHandler
    fuelsHandler = new FuelsHandler(gameState.spawnPos)
    scene.add(fuelsHandler.mesh)

    // add event listener
    window.addEventListener('resize', handleWindowResize, false)
    document.addEventListener('mousemove', handleMouseMove, false)

    loop() // start loop
}

function createScene () {
    height = window.innerHeight
    width = window.innerWidth

    // Create the scene
    scene = new THREE.Scene()

    // Add a fog effect to the scene same color as the
    // background color used in the style sheet
    scene.fog = new THREE.FogExp2(0xf7d9aa, 0.002)

    // Create the camera
    const aspectRatio = width / height
    const fieldOfView = 90
    const nearPlane = 1
    const farPlane = 10000
    camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane)

    // Set the position of the camera
    camera.position.set(0, 180, -100)
    camera.lookAt(0, 0, 150)
    // camera.rotation.set(Math.PI / 4, 0, 0)

    // Create the renderer
    renderer = new THREE.WebGLRenderer({
        // Allow transparency to show the gradient background
        // we defined in the CSS
        alpha: true,
        antialias: true
    })

    renderer.setSize(width, height) // Define the size of the renderer, fill the entire screen
    renderer.shadowMap.enabled = true // Enable shadow rendering

    // Add the DOM element of the renderer to the containerL
    container = document.getElementById('container')
    container.appendChild(renderer.domElement)
}

function handleWindowResize () {
    // update height and width of the renderer and the camera
    height = window.innerHeight
    width = window.innerWidth
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
}

function createLights () {
    // A hemisphere light is a gradient colored light
    // the first parameter is the sky color, the second parameter is the ground color,
    // the third parameter is the intensity of the light
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9)

    // A directional light shines from a specific direction.
    // It acts like the sun, that means that all the rays produced are parallel.
    shadowLight = new THREE.DirectionalLight(0xffffff, .9)

    // Set the direction of the light
    shadowLight.position.set(10, -5, 8)

    // Allow shadow casting
    shadowLight.castShadow = true

    // define the visible area of the projected shadow
    shadowLight.shadow.camera.left = -400
    shadowLight.shadow.camera.right = 400
    shadowLight.shadow.camera.top = 400
    shadowLight.shadow.camera.bottom = -400
    shadowLight.shadow.camera.near = 1
    shadowLight.shadow.camera.far = 1000

    // define the resolution of the shadow the higher the better,
    // but also the more expensive and less performant
    shadowLight.shadow.mapSize.width = 1024
    shadowLight.shadow.mapSize.height = 1024

    ambientLight = new THREE.AmbientLight(0xdc8874, .3) // an ambient light modifies the global color of a scene and makes the shadows softer

    // to activate the lights, just add them to the scene
    scene.add(hemisphereLight)
    scene.add(shadowLight)
    scene.add(ambientLight)
}

function loop () {
    statsGui.begin()

    update()
    renderer.render(scene, camera) // render the scene

    window.requestAnimationFrame(loop) // call the loop function again
    statsGui.end()
}

function update () {

    const delta = clock.getDelta()
    const time = clock.getElapsedTime()

    for (const anim of animations) {
        anim.update(delta)
    }

    if (isKeyDown('ArrowLeft')) {
        gameState.boat.increaseMovement(delta * gameState.speed * Math.PI / 4)
    } else if (isKeyDown('ArrowRight')) {
        gameState.boat.increaseMovement(delta * gameState.speed * -Math.PI / 4)
    }

    gameState.boat.updateMovement(delta)
    sea.moveWaves(delta, time, gameState.speed)
    sky.update(delta, gameState.speed)
    rocksHandler.update(delta, gameState)
    fuelsHandler.update(delta, gameState)
    // updateDistance
    gameState.distance += gameState.speed * delta * gameState.ratioDistance
    fieldDistance.innerHTML = Math.floor(gameState.distance)
    // update fuel
    gameState.fuel -= gameState.speed * delta * gameState.ratioFu
    gameState.fuel = Math.max(0, gameState.fuel)
    fuelBar.style.width = gameState.fuel + '%'
    // updateCamera
    camera.position.x += (-gameState.CameraTargetPos - camera.position.x) * delta * gameState.CamMoveSensivity
    camera.fov = normalize(mousePos.y, -1, 1, 85, 100)
    camera.updateProjectionMatrix()
}

function handleMouseMove (event) {
    mousePos = { x: -1 + (event.clientX / width) * 2, y: 1 - (event.clientY / height) * 2 }
    gameState.CameraTargetPos = normalize(mousePos.x, -1, 1, -50, 50)
}
