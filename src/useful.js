export function normalize (v, vmin, vmax, tmin, tmax) {
    const bv = boundValue(v, vmin, vmax)
    const nv = (bv - vmin) / (vmax - vmin)
    return tmin + nv * (tmax - tmin)
}

export const last = array => array[array.length - 1]

export const boundValue = (value, min, max) => Math.max(Math.min(value, max), min)

export const randInt = (min = 0, max) => Math.floor(Math.random() * (max - min)) + min
