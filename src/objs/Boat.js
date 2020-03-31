import * as THREE from 'three'
import Colors from '../Colors'

const maxDirAngle = Math.PI / 4
const maxXpos = 150

export default class Boat {

    constructor () {

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

        this.velocity = 10
        this.dirAngle = 0
    }

    increaseMovement (deltaAngle) {
        this.dirAngle = Math.max(Math.min(this.dirAngle + deltaAngle, maxDirAngle), -maxDirAngle)
    }

    updateMovement (delta) {
        this.mesh.position.x = Math.max(Math.min(this.mesh.position.x + delta * 100 * Math.sin(this.dirAngle), maxXpos), -maxXpos)
        this.dirAngle *= 0.97
        this.updateModel()
    }

    updateModel () {
        this.mesh.rotation.y = this.dirAngle / 10
    }
}
