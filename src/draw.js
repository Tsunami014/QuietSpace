export const units = 8 // How many units in one block (one block is 2x1 'blocks')

export function getSizes() {
    // Edit this to change the screen sizing ratio
    var cols = Math.floor((canvas.width/canvas.height + 1) * 3.4)
    if (cols > 12) {
        cols = 12
    }
    var blk = Math.floor(canvas.width/cols) // width
    blk -= blk%4
    const hblk = Math.floor(blk/2) // height or half width
    const qblk = Math.floor(blk/4) // half height (quarter width)
    const rows = Math.floor(canvas.height/qblk)
    return [cols, rows, blk, hblk, qblk]
}


export function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.imageSmoothingEnabled = false

    // Calculate offsets
    const [cols, rows, blk, hblk, qblk] = getSizes(canvas)
    player.scale(hblk)

    const xtile = Math.floor(phys.x/units)
    const ytile = Math.floor(phys.y/units)
    const txoffs = Math.floor(cols/2 - xtile)
    const tyoffs = Math.floor(rows/2 - ytile)-1
    const xoffs = Math.abs(canvas.width - cols*blk)/2
        - (phys.x/units - xtile)*blk
        + hblk*(cols%2) + hblk
    const yoffs = Math.abs(canvas.height - rows*qblk)/2
        - (phys.y/units - ytile)*qblk
        - qblk + (qblk/2)*(rows%2)

    // Draw all the tiles
    for (let i = -3; i < rows+6; i++) {
        const offs = (i+tyoffs)%2 == 0 ? 0 : 0.5
        for (let j = -2; j < cols+3; j++) {
            const tx = j-txoffs
            const ty = i-tyoffs
            const source = tiles.getTile(gen.getTile(tx, ty), gen.hash(-1, tx, ty))
            if (source) {
                const xpos = blk*(j-offs) + xoffs
                const ypos = qblk*i + yoffs
                const wid = source.wid * blk
                const hei = source.hei * hblk
                ctx.drawImage(source.img,
                    xpos-wid+hblk, ypos-hei+hblk,
                    wid+(tiles.pixel?0:1), hei+(tiles.pixel?0:1))
            }
        }
    }
}
