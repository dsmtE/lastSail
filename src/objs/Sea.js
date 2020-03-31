import * as THREE from 'three'
import SimplexNoise from 'simplex-noise'
import Colors from '../Colors'

export default class Sea {
    constructor () {
        this.size = { w: 3000, h: 2000 }
        this.resolution = { w: 100, h: 200 }
        this.geometry = new THREE.PlaneGeometry(this.size.w - 1, this.size.h - 1, this.resolution.w, this.resolution.h)
        this.geometry.translate(0.5, 0, 0)
        this.geometry.rotateX(-Math.PI / 2)
        this.geometry.dynamic = true
        // this.geometry.mergeVertices()

        this.simplex = new SimplexNoise(Math.random())
        this.offset = 0 // offset used to move waves forward
        this.waves = [] // store data associated to each vertex for waves movements

        for (let vId = 0; vId < this.geometry.vertices.length; vId++) {
            const v = this.geometry.vertices[vId]

            this.waves.push({
                y: v.y,
                x: v.x,
                z: v.z,
                ang: Math.random() * Math.PI * 2,
                amp: 5 + Math.random() * 5,
                speed: 0.128 + Math.random() * 0.512
            })
        }

        const mat = new THREE.MeshPhongMaterial({ // create the material
            color: Colors.blue,
            transparent: true,
            opacity: .8,
            flatShading: THREE.FlatShading
        })

        this.mesh = new THREE.Mesh(this.geometry, mat)
        this.mesh.translateZ(this.size.h / 2.5)
        this.mesh.receiveShadow = true
    }

    moveWaves (delta, time, gameSpeed) {

        const vertices = this.mesh.geometry.vertices
        for (let vId = 0; vId < vertices.length; vId++) {

            const i = vId % (this.resolution.w + 1)
            const j = Math.floor(vId / (this.resolution.h + 1))
            const v = vertices[vId]
            const w = this.waves[vId]
            v.x = w.x + Math.cos(w.ang)
            v.y = w.y + this.simplex.noise2D(w.x / 250, (w.z / 100 + this.offset)) * (10 + 3 * Math.sin(Math.PI * time / 6.1))
            w.ang = (w.ang + w.speed * delta) % (2 * Math.PI)
            this.offset += delta * gameSpeed / 1000000
        }
        this.mesh.geometry.verticesNeedUpdate = true
    }
}
