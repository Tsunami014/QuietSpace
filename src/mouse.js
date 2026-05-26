var mx; var my;

window.addEventListener('mousemove', (event) => {
    mx = event.clientX; my = event.clientY
});
window.addEventListener('click', (event) => {
    mx = event.clientX; my = event.clientY
    click_left()
});
window.addEventListener('contextmenu', function(event) {
    event.preventDefault();
    mx = event.clientX; my = event.clientY
    click_right()
});
window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (event.key === 'Enter') {
        click_right()
    } else if (event.key === ' ') {
        click_left()
    }
});

export var select = null;
var lastrx; var lastry
var lastidx
function click_left() {
    if (fsel.fselopen) return;
    const [px, py] = getPos()
    const [realx, realy] = phys.realpos(px, py)
    if (realx != lastrx || realy != lastry) {
        lastrx = realx; lastry = realy
        lastidx = 0
    }
    const tle = gen.getRealTile(realx, realy)
    lastidx = lastidx%tle.length
    select = tiles.normalise(tle[lastidx++])
}
function click_right() {
    if (fsel.fselopen) return;
    if (lastidx == 0 || select === null) return
    const [px, py] = getPos()
    const [realx, realy] = phys.realpos(px, py)
    gen.placeTile(realx, realy, select, lastidx > 1)
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
