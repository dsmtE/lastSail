export default class Matrix {
    constructor (rows, cols) {
        this.rows = rows
        this.cols = cols
        this.data = Array(this.rows).map(() => Array(this.cols).fill(0))
        return this
    }

    copy () {
        return new Matrix(this.rows, this.cols).map((_, i, j) => this.data[i][j])
    }

    static fromArray (array) {
        return new Matrix(1, array.length).map((_, i) => array[i])
    }

    randomize () { return this.randomize(this.cols, this.rows) }
    static randomize (cols, rows) { return new Matrix(cols, rows).map(e => Math.random() * 2 - 1) }

    map (funct) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.data[i][j] = funct(this.data[i][j], i, j)
            }
        }
        return this
    }

    static map (m, funct) { return m.map(funct) }

    applyWiseFunctwith (m, funct) {
        if (m instanceof Matrix) {
            if (this.rows !== m.rows || this.cols !== m.cols) {
                console.log('Columns and Rows of A must match Columns and Rows of B.')
                return
            }
            return new Matrix(this.cols, this.rows).map((_, i, j) => funct(this.data[i][j], m.data[i][j]))
        } else {
            return new Matrix(this.cols, this.rows).map(e => funct(e, m))
        }
    }

    sub (m) { this.applyWiseFunctwith(m, (a, b) => a - b) }

    static sub (a, b) { return a.sub(b) }

    add (m) { this.applyWiseFunctwith(m, (a, b) => a + b) }

    static add (a, b) { return a.add(b) }

    transpose () {
        return new Matrix(this.cols, this.rows).map((_, i, j) => this.data[j][i])
    }

    // alias for transpose
    T () { return this.transpose() }

    static transpose (m) { return m.transpose() }

    dot (m) {
        if (this.cols !== m.rows) {
            console.log('rows of m must match Cols')
            return
        }

        return new Matrix(this.rows, this.cols).map((e, i, j) => {
            let sum = 0
            for (let k = 0; k < this.cols; k++) {
                sum += this.data[i][k] * m.data[k][j]
            }
            return sum
        })
    }

    static dot (a, b) { return a.dot(b) }

    multiply (m) { this.applyWiseFunctwith(m, (a, b) => a * b) }
    static multiply (a, b) { return a.multiply(b) }

    log () { console.table(this.data) }
    static log (m) { m.log() }

    serialize () {
        return JSON.stringify(this)
    }

    static deserialize (data) {
        if (typeof data === 'string') {
            data = JSON.parse(data)
        }
        const matrix = new Matrix(data.rows, data.cols)
        matrix.data = data.data
        return matrix
    }

}
