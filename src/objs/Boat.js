import * as THREE from 'three'
import Colors from '../Colors'
import { boundValue } from '../useful'

const maxDirAngle = Math.PI / 4
export default class Boat {

    constructor (maxBoatpos) {

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
        this.maxBoatpos = maxBoatpos
        this.mesh.position.z = 20
        this.rockTestcollisions = []
    }

    increaseMovement (deltaAngle) {
        this.dirAngle = boundValue(this.dirAngle + deltaAngle, -maxDirAngle, maxDirAngle)
    }

    update (delta, speed, ratioDistance, ratioFuel) {
        // update fuel
        this.fuel -= speed * delta * ratioFuel
        this.fuel = Math.max(0, this.fuel)

        // update distance
        this.distance += speed * delta * ratioDistance

        // updateMovement
        this.mesh.position.x = boundValue(this.mesh.position.x + delta * 100 * Math.sin(this.dirAngle), -this.maxBoatpos, this.maxBoatpos)
        this.dirAngle *= 0.97

        // update model display
        this.mesh.rotation.y = this.dirAngle / 8
    }

    getBoundingBox () {
        return this.boundingBox.clone().translate(this.mesh.position)
    }
}
