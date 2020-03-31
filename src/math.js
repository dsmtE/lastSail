export function normalize(v, vmin, vmax, tmin, tmax) {
	const bv = Math.max(Math.min(v,vmax), vmin)
	const nv = (bv-vmin) / (vmax-vmin)
	return tmin + vb * (tmax-tmin)
}