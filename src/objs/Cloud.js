// import * as THREE from 'three'
import { Object3D, BoxGeometry, MeshPhongMaterial, Mesh, FlatShading } from 'three'
import Colors from '../Colors'

export default class Cloud {
    constructor () {
        this.mesh = new Object3D() // empty container

        // create a cube geometry
        // this shape will be duplicated to create the cloud
        const geom = new BoxGeometry(20, 20, 20)

        // create a material a simple white material will do the trick
        const mat = new MeshPhongMaterial({
            color: Colors.white,
            transparent: true,
            opacity: .3,
            flatShading: FlatShading
        })

        const nBlocs = 3 + Math.floor(Math.random() * 2)
        for (var i = 0; i < nBlocs; i++) {

            const m = new Mesh(geom, mat)

            // set the position and the rotation of each cube randomly
            m.position.set(i * 8, Math.random() * 10, Math.random() * 10)
            m.rotation.set(0, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2)

            // random scale
            var s = .5 + Math.random() * .5
            m.scale.set(s, s, s)

            m.castShadow = true
            m.receiveShadow = true

            this.mesh.add(m)
        }
    }
}
