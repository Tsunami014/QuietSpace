export var x = 0
export var y = 0

export function getUnderThis(nx, ny) {
    const tx = nx/draw.units
    const ty = ny/draw.units
    const realx = tx-((ty-1)/2)
    const realy = tx+(ty/2) + 0.5
    return gen.getRealTile(Math.floor(realx), Math.floor(realy))
}
export function getUnder() {
    return gen.getUnderThis(x, y)
}

const speed = 0.25
const speeddiag = Math.sqrt(5)*speed/2
export function tick(dx, dy) {
    if (dx == 0 && dy == 0) return false
    var newx = x; var newy = y
    let diag = (dx != 0 && dy != 0)
    newx += (diag? speeddiag:speed)*dx
    newy += (diag? speeddiag:speed*2)*dy*2
    if (getUnderThis(newx, newy) == "grass") return false
    x = newx; y = newy
    return true
}
