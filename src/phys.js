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
function collides(nx, ny) {
    return getUnderThis(nx, ny).some(tle=>{
        return tle.includes("water") ||
                tle.includes("cone") ||
                tle == "tree"
    })
}


const speed = 0.25
const speeddiag = Math.sqrt(5)*speed/2
export function tick(dx, dy) {
    if (dx == 0 && dy == 0) return false
    dy *= 2
    if (dx != 0 && dy != 0) {
        let nx = x+speeddiag*dx; let ny = y+speeddiag*dy
        if (collides(nx, ny)) return false
        x = nx; y = ny
        return true
    }
    if (collides(x+speed*dx, y+speed*dy*2)) {
        if (dx == 0) {
            let ny = y + speeddiag*dy
            let d1 = collides(x+speeddiag, ny)
            let d2 = collides(x-speeddiag, ny)
            if (d1 ^ d2) {
                x += speeddiag*(d1? -1:1); y = ny
                return true
            }
        } else {
            let nx = x + speeddiag*dx
            let d1 = collides(nx, y+speeddiag*2)
            let d2 = collides(nx, y-speeddiag*2)
            if (d1 ^ d2) {
                x = nx; y += speeddiag*(d1? -2:2)
                return true
            }
        }
        return false
    }
    x += speed*dx; y += speed*dy*2
    return true
}
