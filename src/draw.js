export const units = 8 // How many units in one block (one block is 2x1 'blocks')

export function getSizes() {
    // Edit this to change the screen sizing ratio
    var cols = Math.floor((canvas1.width/canvas1.height + 1) * 3.4)
    if (cols > 12) {
        cols = 12
    }
    var blk = Math.floor(canvas1.width/cols) // width
    blk -= blk%4
    const hblk = Math.floor(blk/2) // height or half width
    const qblk = Math.floor(blk/4) // half height (quarter width)
    const rows = Math.floor(canvas1.height/qblk)
    return [cols, rows, blk, hblk, qblk]
}


export function draw() {
    ctx1.clearRect(0, 0, canvas1.width, canvas1.height)
    ctx2.clearRect(0, 0, canvas1.width, canvas1.height)
    ctx1.imageSmoothingEnabled = false
    ctx2.imageSmoothingEnabled = false

    // Calculate offsets
    const [cols, rows, blk, hblk, qblk] = getSizes()
    player.scale(hblk)

    const xtile = Math.floor(phys.x/units)
    const ytile = Math.floor(phys.y/units)
    const txoffs = Math.floor(cols/2 - xtile)-1
    const tyoffs = Math.floor(rows/2 - ytile)-1
    const xoffs = Math.abs(canvas1.width - cols*blk)/2
        - (phys.x/units - xtile)*blk
        + hblk*(cols%2) + hblk
    const yoffs = Math.abs(canvas1.height - rows*qblk)/2
        - (phys.y/units - ytile)*qblk
        - qblk + (qblk/2)*(rows%2)

    const midp = Math.round(canvas1.height/2) - qblk

    // Draw all the tiles
    for (let i = -2; i < rows+15; i++) {
        const offs = (i+tyoffs)%2 == 0 ? 0 : 0.5
        for (let j = -2; j < cols+3; j++) {
            const tx = j-txoffs
            const ty = i-tyoffs
            gen.getTile(tx, ty).forEach((tle, idx)=>{
                if (!tle) return;
                const source = tiles.getTile(tle, gen.hash(-1, tx, ty))
                if (!source) return;
                if (i-source.hei > rows+5) return;
                var wid = source.wid * blk
                var hei = source.hei * hblk
                const xpos = blk*(j-offs)+xoffs - (wid-blk)/2+hblk
                const basey = qblk*i+yoffs
                const ypos = basey - hei+hblk
                if (!tiles.pixel) { wid++; hei++ }
                if (basey >= midp && idx != 0)
                    ctx2.drawImage(source.img, xpos, ypos, wid, hei)
                else
                    ctx1.drawImage(source.img, xpos, ypos, wid, hei)
            })
        }
    }
}
