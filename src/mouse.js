var mx; var my;
/// Get the element at the mouse position
export function elmAtMouse() {
    if (mx === undefined) return null;
    return document.elementFromPoint(mx, my)
}

window.addEventListener('contextmenu', function(event) {
    event.preventDefault(); // Prevent right click popup
});
// Remember mouse movements and drags
var dragL; var dragR;
document.addEventListener('mousedown', (e) => {
    mx = event.clientX; my = event.clientY
    if (e.button === 0) {
        dragL = true
        click_left(false, true)
    } else if (e.button === 2) {
        dragR = true
        click_right(false, true)
    }
});
window.addEventListener('mousemove', (event) => {
    mx = event.clientX; my = event.clientY
    move()
});
export function move() {
    if (dragL) click_left(true, true)
    if (dragR) click_right(true, true)
}
document.addEventListener('mouseup', (e) => {
    if (e.button === 0) {
        dragL = false
    } else if (e.button === 2) {
        dragR = false
    }
});
// Do a similar functionality with keypresses
export function press(keys, lastkeys) {
    if (keys['q']) {
        click_left(lastkeys['q'], false)
    }
    if (keys['e']) {
        click_right(lastkeys['e'], false)
    }
}

export var select = null;
export function setsel(val = null) { select = val; }
function click_left(drag, mse) {
    if (fsel.fselopen || bkpk.open || mx === undefined) return;
    if (!drag && mse && touchFrame()) {
        bkpk.toggle()
        return;
    }
    if (select === null) return;
    const [px, py] = getPos()
    const [realx, realy] = phys.realpos(px, py)
    const tle = gen.getRealTile(realx, realy)
    bkpk.found(tle)
    gen.placeTile(realx, realy, select)
}
function click_right(drag, mse) {
    if (fsel.fselopen || bkpk.open || mx === undefined) return;
    if (!drag && mse && touchFrame()) {
        bkpk.toggle()
        return;
    }
    const [px, py] = getPos()
    const [realx, realy] = phys.realpos(px, py)
    const tle = gen.getRealTile(realx, realy)
    bkpk.found(tle)
    select = tiles.normalise(tle[0])
}

// Only false when the game just started and the player hasn't moved the mouse yet
export function hasMouse() {
    return mx !== undefined
}

/// Get the mouse position in terms of blocks
export function getPos() {
    const [cols, rows, blk, hblk, qblk] = draw.getSizes()
    return [
        (mx - Math.round(canvas1.width/2))/blk + phys.x/draw.units,
        (my - Math.round(canvas1.height/2))/qblk + phys.y/draw.units]
}

/// Is the cursor touching the current block frame?
export function touchFrame() {
    const [framex, framey, framew, frameh] = draw.framePos()
    if (mx < framex || mx > framex+framew || my < framey || my > framey+frameh) return false;
    return Math.abs(2*(my-framey)/frameh - 1) <= 1-Math.abs(2*(mx-framex)/framew - 1)
}
