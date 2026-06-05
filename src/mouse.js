var mx; var my;

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
    if (dragL) click_left(true)
    if (dragR) click_right(true)
});
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
export function resetsel() { select = null; }
var lastrx; var lastry
var lastidx
function click_left(drag) {
    if (fsel.fselopen) return;
    if (lastidx == 0 || select === null) return;
    const [px, py] = getPos()
    const [realx, realy] = phys.realpos(px, py)
    gen.placeTile(realx, realy, select, lastidx > 1)
}
function click_right(drag) {
    if (fsel.fselopen) return;
    const [px, py] = getPos()
    const [realx, realy] = phys.realpos(px, py)
    if (realx != lastrx || realy != lastry) {
        lastrx = realx; lastry = realy
        lastidx = 0
    } else if (drag) return;
    const tle = gen.getRealTile(realx, realy)
    lastidx = lastidx%tle.length
    select = tiles.normalise(tle[lastidx++])
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
