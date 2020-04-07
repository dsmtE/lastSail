import * as THREE from 'three'
import Colors from '../Colors'
import { randInt, last } from '../Utils/useful'

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

    spawn (offset = 0, boats) {
        if (this.pool.length) {
            const f = this.pool.pop()

            f.mesh.position.set(randInt(-1, 2) * 100, 0, this.spawnPos + offset * 30)

            this.actives.push(f)
            boats.forEach(b => { b.fuelTestcollisions.push(true) })
            this.mesh.add(f.mesh)
        }
    }

    getLast () {
        return last(this.actives)
    }

    update (delta, speed, boats, displayBoatIndex) {
        for (let i = 0; i < this.actives.length; i++) { // for each
            const f = this.actives[i]
            // move
            f.mesh.position.z -= delta * speed

            if (f.mesh.position.z < -200) {
                this.pool.push(this.actives.splice(i, 1)[0])
                boats.forEach(b => b.fuelTestcollisions.splice(i, 1)[0]) // remove for our boat test collisions too
                this.mesh.remove(f.mesh)
                break
            }

            // rotate
            f.mesh.rotation.y += Math.PI * delta

            boats.forEach(b => { // for each boat
                if (b.fuelTestcollisions[i] && f.getBoundingBox().intersectsBox(b.getBoundingBox())) {
                    if (b === boats[displayBoatIndex]) { // remove mesh display only for displayed boat
                        this.mesh.remove(f.mesh)
                    }
                    b.fuelTestcollisions[i] = false
                    b.refuelTaken++
                    // this.pool.push(this.actives.splice(i, 1)[0])
                    b.fuel = Math.min(b.fuel + 10, 100)
                    // console.log('refuel')
                }
            })
        }

        // spawn new jerrican randomly
        const lastJerrycan = last(this.actives)
        if (lastJerrycan) {
            if (Math.abs(lastJerrycan.mesh.position.z - this.spawnPos) > 300 && Math.random() > 0.3) {
                for (let i = 0; i < randInt(0, 5); i++) { this.spawn(i, boats) }
            }
        } else {
            this.spawn(0, boats)
        }
    }

}
