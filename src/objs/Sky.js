import * as THREE from 'three'
import Cloud from './Cloud'
import { last } from '../Utils/useful'

export default class Sky {
    constructor (nbClouds, cloudsSpawnPos) {
        this.mesh = new THREE.Object3D()
        this.cloudsSpawnPos = cloudsSpawnPos
        this.activeClouds = []
        this.cloudspool = []

        for (let i = 0; i < nbClouds; i++) {
            this.cloudspool.push(new Cloud())
        }
    }

    spawnCloud () {
        if (this.cloudspool.length) {
            const c = this.cloudspool.pop()

            // pos
            c.mesh.position.set((Math.random() * 2 - 1) * 400, 150 + Math.random() * 20, this.cloudsSpawnPos)
            // rotate
            c.mesh.rotation.y = Math.random() * Math.PI
            // scale
            const s = 1.5 + Math.random() * .3
            c.mesh.scale.set(s, s, s)

            this.activeClouds.push(c)
            this.mesh.add(c.mesh) // add in scene
        }
    }

    update (delta, gameSpeed) {
        this.activeClouds.forEach((c, i) => { // move existing clouds
            // move clouds
            c.mesh.position.z -= delta * gameSpeed // move forward
            c.mesh.rotation.y += delta * Math.random() * Math.PI / 20 // change rotation
            c.mesh.rotation.z += delta * Math.random() * Math.PI / 20 // change rotation

            if (c.mesh.position.z < -200) {
                c.mesh.position.z = 1000
                this.cloudspool.push(this.activeClouds.splice(i, 1)[0])
                this.mesh.remove(c.mesh)
            }
        })

        // spawn new clouds randomly
        const lastCloud = last(this.activeClouds)
        if (lastCloud) {
            if (Math.abs(lastCloud.mesh.position.z - this.cloudsSpawnPos) > 150 && Math.random() > 0.5) {
                this.spawnCloud()
            }
        } else {
            this.spawnCloud()
        }
    }

}
