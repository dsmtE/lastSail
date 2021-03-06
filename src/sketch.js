// libs
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Stats from 'stats-js'
import { NeuralNetwork } from '../Utils/NeuralNetwork'

import './css/game.css' // eslint-disable-line no-unused-vars
// Objs
import Boat from './objs/Boat'
import Sky from './objs/Sky'
import Sea from './objs/Sea'
import RocksHandler from './objs/RocksHandler'
import FuelsHandler from './objs/FuelHandler'

// other
import { isKeyDown } from './keyboardHandler'
import { normalize } from './Utils/useful'

// variables

const gameSettings = {
    speed: 100,
    ratioFuel: 0.04,
    ratioDistance: 1,
    seaSettings: {
        seaWidth: 3000,
        seaLength: 2000,
        seaLevel: -5
    },
    maxBoatpos: 150,
    CamMoveSensivity: 1,
    spawnPos: 800,
    entitiesByGenerations: 20
}

let results
let gameState
let statsGui
// scene vars
let scene, camera, renderer, clock, container, height, width
const animations = [] // animations container for animated models
// lights vars
let hemisphereLight, shadowLight, ambientLight
// game environment vars
let sea, sky, rocksHandler, fuelsHandler
let mousePos = { x: 0, y: 0 }
const boats = [] // our entity container
let displayBoatIndex

// UI dom elements
let fuelBar, fieldDistance

// this dosn't work .. execute twice initGame
// window.addEventListener('load', init)
window.onload = initGame

function initGame () {
    console.log('----- game init -----')
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
        CameraTargetPos: 0,
        pause: false
    }

    displayBoatIndex = 0
    // createBoat entities
    for (let i = 0; i < gameSettings.entitiesByGenerations; i++) {
        boats.push(new Boat(gameSettings.maxBoatpos))
        // scene.add(boat.mesh)
    }
    scene.add(boats[displayBoatIndex].mesh)

    createLights() // add the lights

    // add game objects
    // createSea
    sea = new Sea(gameSettings.seaSettings)
    scene.add(sea.mesh) // add the mesh of the sea to the scene
    // createSky
    sky = new Sky(8, gameSettings.spawnPos)
    scene.add(sky.mesh)
    // initRocksHandler
    rocksHandler = new RocksHandler(10, gameSettings.spawnPos)
    scene.add(rocksHandler.mesh)
    // initFuelsHandler
    fuelsHandler = new FuelsHandler(gameSettings.spawnPos)
    scene.add(fuelsHandler.mesh)

    // add event listener
    window.addEventListener('resize', handleWindowResize, false)
    document.addEventListener('mousemove', handleMouseMove, false)

    loop() // start loop
}

function loadingAssets () {
    // init GLTF loader models
    const gltfLoader = new GLTFLoader()

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

function createScene () {
    height = window.innerHeight
    width = window.innerWidth

    // Create the scene
    scene = new THREE.Scene()

    // Add fog effect with same color background
    scene.fog = new THREE.FogExp2(0xf7d9aa, 0.002)

    // camera
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
    // first parameter is the sky color,
    // second parameter is the ground color,
    // third parameter is the intensity of the light
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9)

    // A directional light with a specific direction for sun
    shadowLight = new THREE.DirectionalLight(0xffffff, .9)
    shadowLight.position.set(10, -5, 8)
    shadowLight.castShadow = true

    // Define the visible area of the projected shadow
    shadowLight.shadow.camera.left = -400
    shadowLight.shadow.camera.right = 400
    shadowLight.shadow.camera.top = 400
    shadowLight.shadow.camera.bottom = -400
    shadowLight.shadow.camera.near = 1
    shadowLight.shadow.camera.far = 1000
    // Resolution of the shadow map
    shadowLight.shadow.mapSize.width = 1024
    shadowLight.shadow.mapSize.height = 1024

    // Ambient light for softer shadows
    ambientLight = new THREE.AmbientLight(0xdc8874, .3)

    // Add to the scene
    scene.add(hemisphereLight)
    scene.add(shadowLight)
    scene.add(ambientLight)
}

function loop () {
    statsGui.begin()

    if (isKeyDown('Space')) {
        gameState.pause = !gameState.pause
        console.log(results)
    }

    if (!gameState.pause) {
        update() // global update function for the game
    }
    renderer.render(scene, camera) // render the scene

    statsGui.end()
    window.requestAnimationFrame(loop) // call the loop function again
}

function newGeneration () {
    // natural selection
    const maxFitness = Math.max(...boats.map( b => b.fitness()))
    newBoats = []
    let a, b, child
    while (newBoats.length < gameSettings.entitiesByGenerations) {
        a = boats[Math.floor(Math.random() * boats.length)] // pick random one
        b = boats[Math.floor(Math.random() * boats.length)] // pick another one
        child = new boats(gameSettings.maxBoatpos, NeuralNetwork.crossOver(a.brain, b.brain))
    }

}

function update () {

    const delta = clock.getDelta()
    const time = clock.getElapsedTime()
    const boatsAlive = boats.filter(b => b.alive())

    if (boatsAlive.length === 0) { // if there are still alive boats
        console.log('all dead')
        gameState.pause = true
    } else {

        // if (isKeyDown('ArrowLeft')) {
        //     boats[displayBoatIndex].moveLeft(delta, gameSettings.speed)
        // } else if (isKeyDown('ArrowRight')) {
        //     boats[displayBoatIndex].moveRight(delta, gameSettings.speed)
        // }

        if (!boats[displayBoatIndex].alive()) { // if our displayed boats dead
            scene.remove(boats[displayBoatIndex].mesh) // remove from our scene
            // change displayed boat inded ( find new one)
            for (let i = 0; i < boats.length; i++) {
                if (boats[i].alive() && i !== displayBoatIndex) {
                    displayBoatIndex = i
                    scene.add(boats[displayBoatIndex].mesh)
                    break
                }
            }
        }

        boatsAlive.forEach(b => {
            const lastFuel = fuelsHandler.getLast()
            const lastRock = rocksHandler.getLast()
            if (lastFuel && lastRock) {
                b.takeDecisionAndMove(fuelsHandler.getLast(), rocksHandler.getLast(), delta, gameSettings.speed)
            }
        })

        // update games objs handlers
        rocksHandler.update(delta, gameSettings.speed, boatsAlive, displayBoatIndex)
        fuelsHandler.update(delta, gameSettings.speed, boatsAlive, displayBoatIndex)
        boats.forEach(b => { b.update(delta, gameSettings.speed, gameSettings.ratioDistance, gameSettings.ratioFuel) })

        // update htmlDisplay
        fieldDistance.innerHTML = Math.floor(boats[displayBoatIndex].distance)
        fuelBar.style.width = boats[displayBoatIndex].fuel + '%'

        animations.forEach(anim => { anim.update(delta) }) // update animated model (test)

        // update graphic environment
        sea.moveWaves(delta, time, gameSettings.speed)
        sky.update(delta, gameSettings.speed)

        // updateCamera
        // camera.position.x += (-gameState.CameraTargetPos - camera.position.x) * delta * gameSettings.CamMoveSensivity
        camera.fov = normalize(mousePos.y, -1, 1, 85, 100)
        camera.updateProjectionMatrix()
    }

}

function handleMouseMove (event) {
    mousePos = { x: -1 + (event.clientX / width) * 2, y: 1 - (event.clientY / height) * 2 }
    gameState.CameraTargetPos = normalize(mousePos.x, -1, 1, -50, 50)
}
