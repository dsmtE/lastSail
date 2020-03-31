import * as THREE from 'three'
import Cloud from './Cloud'

export default class Sky {
    constructor () {
        this.mesh = new THREE.Object3D()

        this.clouds = []
        this.spawnCloud(8)
    }

    spawnCloud (nb = 1) {
        for (var i = 0; i < nb; i++) {
            const c = new Cloud()

            // pos
            c.mesh.position.set((Math.random() * 2 - 1) * 200, 150, 1000 + i * 150)

            // rotate
            c.mesh.rotation.y = Math.random() * Math.PI

            // scale
            const s = 1.5 + Math.random() * .3
            c.mesh.scale.set(s, s, s)

            this.clouds.push(c)
            this.mesh.add(c.mesh) // add in scene

        }
    }

    update (delta, boat) {
        this.clouds.forEach(c => {
            c.move(delta)
            if (c.mesh.position.z < -200) {
                c.mesh.position.z = 1000
            }
            this.checkCollision(c, boat)
        })
    }

    checkCollision (cloud, boat) {
        const dist = boat.mesh.position.clone().sub(cloud.mesh.position.clone())
        if (dist.length() < 20) {
            this.mesh.remove(cloud.mesh) // coinDistanceTolerance
            // emmit particles
            // add score
            console.log('coin hit')
        }
    }
}
