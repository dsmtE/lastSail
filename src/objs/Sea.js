import * as THREE from 'three'
import Colors from '../Colors'

export default class Sea {
    constructor () {
        this.geometry = new THREE.PlaneGeometry(3000, 2000, 20, 100)
        this.geometry.rotateX(-Math.PI / 2)
        this.geometry.translate(0, 0, 800)
        this.geometry.dynamic = true
        // this.geometry.mergeVertices()

        this.waves = [] // create an array to store new data associated to each vertex

        for (var i = 0; i < this.geometry.vertices.length; i++) {
            // get each vertex
            var v = this.geometry.vertices[i]

            // store some data associated to it
            this.waves.push({
                y: v.y,
                x: v.x,
                z: v.z,
                ang: Math.random() * Math.PI * 2,
                amp: 5 + Math.random() * 5,
                speed: 0.128 + Math.random() * 0.512
            })
        }

        // create the material
        const mat = new THREE.MeshPhongMaterial({
            color: Colors.blue,
            transparent: true,
            opacity: .8,
            flatShading: THREE.FlatShading
        })

        this.mesh = new THREE.Mesh(this.geometry, mat)
        this.mesh.receiveShadow = true
    }

    moveWaves (delta) {
        const vertices = this.mesh.geometry.vertices

        for (let i = 0; i < vertices.length; i++) {
            const v = vertices[i]
            const vprops = this.waves[i]
            v.x = vprops.x + Math.cos(vprops.ang) * vprops.amp
            v.y = vprops.y + Math.sin(vprops.ang) * vprops.amp
            vprops.ang = (vprops.ang + vprops.speed * delta) % (2 * Math.PI)
        }
        this.mesh.geometry.verticesNeedUpdate = true

    }

}
