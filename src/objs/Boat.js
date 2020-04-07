import * as THREE from 'three'
import Colors from '../Colors'
import { boundValue } from '../Utils/useful'
import { activationsFunctions, NeuralNetwork } from '../Utils/NeuralNetwork'

const maxDirAngle = Math.PI / 4
export default class Boat {

    constructor (maxBoatpos, brain) {

        this.mesh = new THREE.Object3D()

        // Create the boat structure
        var geomBoat = new THREE.BoxGeometry(30, 20, 60, 1, 1, 1)
        var matBoat = new THREE.MeshPhongMaterial({ color: Colors.red, flatShading: THREE.FlatShading })
        var boat = new THREE.Mesh(geomBoat, matBoat)
        boat.castShadow = true
        boat.receiveShadow = true
        this.mesh.add(boat)

        // Create the mast
        var geomMast = new THREE.BoxGeometry(8, 40, 10, 1, 1, 1)
        var matMast = new THREE.MeshPhongMaterial({ color: Colors.brown, flatShading: THREE.FlatShading })
        var boatmast = new THREE.Mesh(geomMast, matMast)
        boatmast.position.set(-10, 20, -5)
        boatmast.castShadow = true
        boatmast.receiveShadow = true
        this.mesh.add(boatmast)

        // calc bounding box
        this.boundingBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
        this.boundingBox.setFromObject(this.mesh)

        this.velocity = 10
        this.dirAngle = 0
        this.distance = 0
        this.fuel = 100
        this.rocksHit = 0
        this.refuelTaken = 0
        this.maxBoatpos = maxBoatpos
        this.mesh.position.z = 20
        this.rockTestcollisions = []
        this.fuelTestcollisions = []
        if (brain) {
            this.brain = brain
        }else {
            this.brain = new NeuralNetwork([6, 4, 4, 3, 1], [activationsFunctions.leakyRelu, activationsFunctions.leakyRelu, activationsFunctions.leakyRelu, activationsFunctions.tanh])
        }
    }

    fitness () {
        return Math.pow(this.distance, 2) + Math.pow(refuelTaken * 10, 2) - Math.pow(rocksHit, 3)
    }
    alive () {
        return this.fuel > 0
    }

    increaseMovement (deltaAngle) {
        this.dirAngle = boundValue(this.dirAngle + deltaAngle, -maxDirAngle, maxDirAngle)
    }

    moveLeft (delta, speed) {
        this.increaseMovement(delta * speed * Math.PI / 400)
    }

    moveRight (delta, speed) {
        this.increaseMovement(-delta * speed * Math.PI / 400)
    }

    takeDecisionAndMove (lastFuel, lastRock, delta, speed) {
        const out = this.takeDecision(lastFuel, lastRock)
        // this.dirAngle = out * maxDirAngle
        if (Math.abs(out) > 0.3) {
            if (out > 0) {
                this.moveLeft(delta, speed)
            } else {
                this.moveRight(delta, speed)
            }
        }
    }

    takeDecision (lastFuel, lastRock) {
        const input = [
            (this.mesh.position.x - lastRock.mesh.position.x) / this.maxBoatpos,
            (this.mesh.position.y - lastRock.mesh.position.y) / this.maxBoatpos,
            (this.mesh.position.x - lastFuel.mesh.position.x) / this.maxBoatpos,
            (this.mesh.position.y - lastFuel.mesh.position.y) / this.maxBoatpos,
            this.maxBoatpos - this.mesh.position.x,
            this.fuel / 100
        ]
        return this.brain.forward(input).data[0]
    }

    update (delta, speed, ratioDistance, ratioFuel) {
        // update fuel
        this.fuel -= speed * delta * ratioFuel
        this.fuel = Math.max(0, this.fuel)

        // update distance
        this.distance += speed * delta * ratioDistance

        // updateMovement
        this.mesh.position.x = boundValue(this.mesh.position.x + delta * speed * 2 * Math.sin(this.dirAngle), -this.maxBoatpos, this.maxBoatpos)
        this.dirAngle *= 0.972

        // update model display
        this.mesh.rotation.y = this.dirAngle / 8
    }

    getBoundingBox () {
        return this.boundingBox.clone().translate(this.mesh.position)
    }
}
