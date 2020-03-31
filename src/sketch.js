// libs
import * as THREE from 'three'
import Stats from 'stats-js'

// Objs
import Boat from './objs/Boat'
import Sky from './objs/Sky'
import Sea from './objs/Sea'

// other
import { isKeyDown } from './keyboardHandler'

// variables
let stats
let scene, camera, renderer, clock, container, height, width
let hemisphereLight, shadowLight, ambientLight
let sea, boat, sky
let mousePos = { x: 0, y: 0 }

window.addEventListener('load', init)

function init () {
    console.log('----- init -----')

    // init stats-js
    stats = new Stats()
    stats.showPanel(1) // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom)

    clock = new THREE.Clock()

    createScene() // set up the scene, the camera and the renderer
    createLights() // add the lights

    // add the objects
    createBoat()
    createSea()
    createSky()

    // add event listener
    // window.addEventListener('keydown', handleKeyDown, false)
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
    shadowLight.shadow.mapSize.width = 2048
    shadowLight.shadow.mapSize.height = 2048

    ambientLight = new THREE.AmbientLight(0xdc8874, .3) // an ambient light modifies the global color of a scene and makes the shadows softer

    // to activate the lights, just add them to the scene
    scene.add(hemisphereLight)
    scene.add(shadowLight)
    scene.add(ambientLight)
}

// Instantiate the sea and add it to the scene:

function createSea () {
    sea = new Sea()
    sea.mesh.position.y = 0

    // add the mesh of the sea to the scene
    scene.add(sea.mesh)

}

function createSky () {
    sky = new Sky()
    scene.add(sky.mesh)
}

function createBoat () {
    boat = new Boat()
    boat.mesh.position.z = 20
    scene.add(boat.mesh)
}

function loop () {
    stats.begin()

    update()
    renderer.render(scene, camera) // render the scene

    window.requestAnimationFrame(loop) // call the loop function again
    stats.end()
}

function update () {

    const delta = clock.getDelta()
    // const time = clock.getElapsedTime() * 10

    if (isKeyDown('ArrowLeft')) {
        boat.increaseMovement(delta * Math.PI * 4)
    } else if (isKeyDown('ArrowRight')) {
        boat.increaseMovement(delta * -Math.PI * 4)
    }

    sea.moveWaves(delta)
    boat.updateMovement(delta)
    sky.update(delta, boat)
}

// user event
// function handleKeyDown (event) {

//     switch (event.key) {
//     case 'ArrowLeft':
//         // console.log('left')
//         boat.increaseMovement(clock.getDelta() * Math.PI * 4)
//         break
//     case 'ArrowRight':
//         boat.increaseMovement(clock.getDelta() * -Math.PI * 4)
//         break
//     default:
//         console.log('key unknown: ' + event.key)
//         break
//     }
// }

function handleMouseMove (event) {
    mousePos = { x: -1 + (event.clientX / width) * 2, y: 1 - (event.clientY / height) * 2 }
}
