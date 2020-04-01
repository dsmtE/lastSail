import * as THREE from 'three'
import Colors from '../Colors'
import { randInt, last } from '../useful'

class Jerrycan {
    constructor () {
        this.mesh = new THREE.Object3D()

        const jerrycanMat = new THREE.MeshPhongMaterial({ color: Colors.red, flatShading: THREE.FlatShading })

        // mainBox
        const mainBoxGeom = new THREE.BoxGeometry(30, 50, 10, 1, 1, 1)
        const mainBox = new THREE.Mesh(mainBoxGeom, jerrycanMat)
        mainBox.castShadow = true
        mainBox.receiveShadow = true
        this.mesh.add(mainBox)

        // topPlug
        const plugGeom = new THREE.CylinderGeometry(4, 4, 4, 10)
        const plug = new THREE.Mesh(plugGeom, jerrycanMat)
        plug.castShadow = true
        plug.receiveShadow = true
        plugGeom.translate(3, 26, 0)
        this.mesh.add(plug)

        // calc bounding box
        this.boundingBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
        this.boundingBox.setFromObject(this.mesh)
    }

    getBoundingBox () {
        return this.boundingBox.clone().translate(this.mesh.position)
    }
}

export default class FuelsHandler {
    constructor (spawnPos) {
        this.mesh = new THREE.Object3D()
        this.actives = []
        this.pool = []
        this.spawnPos = spawnPos
        for (let i = 0; i < 15; i++) {
            const j = new Jerrycan()
            j.mesh.scale.set(0.5, 0.5, 0.5)
            this.pool.push(j)
        }
    }

    spawn (offset = 0) {
        if (this.pool.length) {
            const f = this.pool.pop()

            f.mesh.position.set(randInt(-1, 2) * 100, 0, this.spawnPos + offset * 30)

            this.actives.push(f)
            this.mesh.add(f.mesh)
        }
    }

    update (delta, gameState) {
        for (let i = 0; i < this.actives.length; i++) { // for each
            const f = this.actives[i]
            // move
            f.mesh.position.z -= delta * gameState.speed

            if (f.mesh.position.z < -200) {
                this.pool.push(this.actives.splice(i, 1)[0])
                this.mesh.remove(f.mesh)
                break
            }

            // rotate
            f.mesh.rotation.y += Math.PI * delta

            if (f.getBoundingBox().intersectsBox(gameState.boat.getBoundingBox())) {
                this.mesh.remove(f.mesh)
                this.pool.push(this.actives.splice(i, 1)[0])
                gameState.fuel = Math.min(gameState.fuel + 10, 100)
                console.log('refuel')
            }
        }

        // spawn new jerrican randomly
        const lastJerrycan = last(this.actives)
        if (lastJerrycan) {
            if (Math.abs(lastJerrycan.mesh.position.z - this.spawnPos) > 300 && Math.random() > 0.3) {
                for (let i = 0; i < randInt(0, 5); i++) { this.spawn(i) }
            }
        } else {
            this.spawn(0)
        }
    }

}
