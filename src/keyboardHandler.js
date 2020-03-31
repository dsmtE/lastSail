export const isKeyDown = (() => {
    const state = {}

    window.addEventListener('keyup', (e) => { state[e.key] = false })
    window.addEventListener('keydown', (e) => { state[e.key] = true })

    return (key) => Object.prototype.hasOwnProperty.call(state, key) && (state[key] || false)
})()
