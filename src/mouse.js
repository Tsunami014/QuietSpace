var mx; var my;

window.addEventListener('mousemove', (event) => {
    mx = event.clientX; my = event.clientY
});
window.addEventListener('click', (event) => {
    mx = event.clientX; my = event.clientY
    const [px, py] = getPos()
    const tle = phys.getUnder(px, py)
    console.log(tle)
});

export function hasMouse() {
    return mx !== undefined
}

export function getPos() {
    const [cols, rows, blk, hblk, qblk] = draw.getSizes()
    return [
        (mx - Math.round(canvas1.width/2))/blk + phys.x/draw.units,
        (my - Math.round(canvas1.height/2))/qblk + phys.y/draw.units]
}
