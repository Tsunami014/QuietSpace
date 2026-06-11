var mx; var my;
export function elmAtMouse() {
    if (mx === undefined) return null;
    return document.elementFromPoint(mx, my)
}

window.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});
var dragL; var dragR;
document.addEventListener('mousedown', (e) => {
    mx = event.clientX; my = event.clientY
    if (e.button === 0) {
        dragL = true
        click_left(false)
    } else if (e.button === 2) {
        dragR = true
        click_right(false)
    }
});
window.addEventListener('mousemove', (event) => {
    mx = event.clientX; my = event.clientY
    move()
});
export function move() {
    if (dragL) click_left(true)
    if (dragR) click_right(true)
}
document.addEventListener('mouseup', (e) => {
    if (e.button === 0) {
        dragL = false
    } else if (e.button === 2) {
        dragR = false
    }
});
export function press(keys, lastkeys) {
    if (keys['q']) {
        click_left(lastkeys['q'])
    }
    if (keys['e']) {
        click_right(lastkeys['e'])
    }
}

export var select = null;
export function setsel(val = null) { select = val; }
function click_left(drag) {
    if (fsel.fselopen || bkpk.open || select === null || mx === undefined) return;
    const [px, py] = getPos()
    const [realx, realy] = phys.realpos(px, py)
    const tle = gen.getRealTile(realx, realy)
    bkpk.found(tle)
    gen.placeTile(realx, realy, select)
}
function click_right(drag) {
    if (fsel.fselopen || bkpk.open || mx === undefined) return;
    const [px, py] = getPos()
    const [realx, realy] = phys.realpos(px, py)
    const tle = gen.getRealTile(realx, realy)
    bkpk.found(tle)
    select = tiles.normalise(tle[0])
}

export function hasMouse() {
    return mx !== undefined
}

export function getPos() {
    const [cols, rows, blk, hblk, qblk] = draw.getSizes()
    return [
        (mx - Math.round(canvas1.width/2))/blk + phys.x/draw.units,
        (my - Math.round(canvas1.height/2))/qblk + phys.y/draw.units]
}
