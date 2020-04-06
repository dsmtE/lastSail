import * as THREE from 'three'
import Colors from '../Colors'
import { randInt, last } from '../useful'

class Rock {
    constructor () {
        this.mesh = new THREE.Object3D() // empty container

        // create a cube geometry
        // this shape will be duplicated to create the cloud
        const geom = new THREE.BoxGeometry(30, 30, 30)

        // create a material a simple white material will do the trick
        const mat = new THREE.MeshPhongMaterial({
            color: Colors.brown,
            flatShading: THREE.FlatShading
        })

        const r = new THREE.Mesh(geom, mat)
        this.mesh.add(r)

        // calc bounding box
        this.boundingBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
        this.boundingBox.setFromObject(this.mesh)
    }

    getBoundingBox () {
        return this.boundingBox.clone().translate(this.mesh.position)
    }
}

export default class RocksHandler {
    constructor (nbRocksInPool, spawnPos) {
        this.mesh = new THREE.Object3D()
        this.activeRocks = []
        this.Rockspool = []
        this.spawnPos = spawnPos
        for (let i = 0; i < nbRocksInPool; i++) {
            this.Rockspool.push(new Rock())
        }
    }

    spawnRock (offset = 0, boats) {
        if (this.Rockspool.length) {
            const r = this.Rockspool.pop()

            // pos
            r.mesh.position.set(randInt(-1, 2) * 100, 0, this.spawnPos + offset * 80) //  + (offset > 0) * (Math.round() * 2 - 1) * 30)
            r.mesh.rotation.y = Math.random() * Math.PI // rotate

            this.activeRocks.push(r)
            boats.forEach(b => { b.rockTestcollisions.push(true) })
            this.mesh.add(r.mesh) // add in scene
        }
    }

    update (delta, speed, boats, displayBoatIndex) {
        for (let i = 0; i < this.activeRocks.length; i++) { // for each rock
            const r = this.activeRocks[i]
            // move rock
            r.mesh.position.z -= delta * speed

            if (r.mesh.position.z < -300) {
                this.Rockspool.push(this.activeRocks.splice(i, 1)[0]) // add our rock to pool
                boats.forEach(b => b.rockTestcollisions.splice(i, 1)[0]) // remove for our boat test collisions too
                this.mesh.remove(r.mesh)

                break
            }

            boats.forEach(b => { // for each boat
                // console.log(b.rockTestcollisions)
                if (b.rockTestcollisions[i] && r.getBoundingBox().intersectsBox(b.getBoundingBox())) {
                    if (b === boats[displayBoatIndex]) { // remove mesh display only for displayed boat
                        this.mesh.remove(r.mesh)
                    }
                    b.rockTestcollisions[i] = false // we doesn't check anymore the collision between the rock and this boat
                    // this.Rockspool.push(this.activeRocks.splice(i, 1)[0])
                    b.fuel = Math.max(0, b.fuel - 15) // reduce fuel for this boat

                    console.log('rock hit')
                }
            })
        }

        // spawn new rocks randomly
        const lastRock = last(this.activeRocks)
        if (lastRock) {
            if (Math.abs(lastRock.mesh.position.z - this.spawnPos) > 300 && Math.random() > 0.4) {
                for (let i = 0; i < randInt(0, 3); i++) { this.spawnRock(i, boats) }
            }
        } else {
            this.spawnRock(0, boats)
        }
    }

}
