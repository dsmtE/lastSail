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
    constructor (nbRocksInPool, gameState) {
        this.mesh = new THREE.Object3D()
        this.activeRocks = []
        this.Rockspool = []
        this.spawnPos = gameState.spawnPos
        this.rockDistanceTolerance = gameState.rockDistanceTolerance
        for (let i = 0; i < nbRocksInPool; i++) {
            this.Rockspool.push(new Rock())
        }
    }

    spawnRock (offset = 0) {
        if (this.Rockspool.length) {
            const r = this.Rockspool.pop()

            // pos
            r.mesh.position.set(randInt(-1, 2) * 100, 0, this.spawnPos + offset * 80) //  + (offset > 0) * (Math.round() * 2 - 1) * 30)
            // rotate
            r.mesh.rotation.y = Math.random() * Math.PI

            this.activeRocks.push(r)
            this.mesh.add(r.mesh) // add in scene
        }
    }

    update (delta, gameState) {
        for (let i = 0; i < this.activeRocks.length; i++) { // for each rock
            const r = this.activeRocks[i]
            // move rock
            r.mesh.position.z -= delta * gameState.speed

            if (r.mesh.position.z < -200) {
                this.Rockspool.push(this.activeRocks.splice(i, 1)[0])
                this.mesh.remove(r.mesh)
                break
            }

            if (r.getBoundingBox().intersectsBox(gameState.boat.getBoundingBox())) {
                this.mesh.remove(r.mesh)
                this.Rockspool.push(this.activeRocks.splice(i, 1)[0])
                // emmit particles
                gameState.fuel = Math.max(0, gameState.fuel - 15) // reduce fuel
                console.log('rock hit')
            }
        }

        // spawn new rocks randomly
        const lastRock = last(this.activeRocks)
        // console.log(lastRock)
        if (lastRock) {
            if (Math.abs(lastRock.mesh.position.z - this.spawnPos) > 300 && Math.random() > 0.4) {
                for (let i = 0; i < randInt(0, 3); i++) { this.spawnRock(i) }
            }
        } else {
            this.spawnRock(0)
        }
    }

}
