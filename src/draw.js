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

const framescale = 1.4 /// The size of the current block frame in blk units
/// Get the position of the current block frame
export function framePos() {
    const [cols, rows, blk, hblk, qblk] = getSizes()
    return [
        canvas1.width-blk*1.5*framescale - blk*0.25, hblk*0.5,
        blk*1.5*framescale, hblk*1.5*framescale
    ]
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
            const [realx, realy] = gen.realPos(tx, ty)
            const tles = gen.getRealTile(realx, realy)
            // Loop over each tile generated
            tles.forEach((tle, idx)=>{
                if (!tle) return;
                const getfn = (x, y)=>{ return gen.getRealTile(realx+x, realy+y).includes(tle); }
                const fullgetfn = (x, y, t)=>{ return gen.getRealTile(realx+x, realy+y).find(it=>it.includes(t)); }
                var g = [tle]
                if (idx == 0 && !tiles.nodecor.includes(tle)) {
                    g = g.concat(tiles.addBorders(tle, fullgetfn))
                }
                // Loop over the tile plus any decorations
                for (const tle2 of g) {
                    idx++
                    const rtle = tiles.getBaseTile(tle2, tles, getfn)
                    if (!rtle) continue;
                    const source = tiles.getTile(rtle, gen.hash(-1, tx, ty))
                    if (!source) continue;
                    if (i-source.hei > rows+5) continue;
                    var wid = source.wid * blk
                    var hei = source.hei * hblk
                    const xpos = blk*(j-offs)+xoffs - (wid-blk)/2+hblk - (idx==1? 2:4)
                    const basey = qblk*i+yoffs
                    const ypos = basey - hei+hblk - (idx==1? 1:2)
                    if (!tiles.pixel) { wid+=(idx==1? 4:8); hei+=(idx==1? 2:4); }
                    // Draw either behind or in front of the player
                    if (basey >= midp && tiles.decor.includes(rtle)) {
                        ctx2.drawImage(source.img, xpos, ypos, wid, hei)
                    } else {
                        ctx1.drawImage(source.img, xpos, ypos, wid, hei)
                    }
                }
            })
        }
    }

    // Draw the UI
    const opens = fsel.fselopen || bkpk.open
    const mtf = !opens && mouse.touchFrame()
    if (!opens && !mtf && mouse.hasMouse()) {
        // Draw the mouse hover effect
        const [mx, my] = mouse.getPos()
        var offs = Math.abs((Math.abs(mx)*2+1)%2-1) >= Math.abs(Math.abs(my)%2-1) ? 0.5:0
        const wid = blk*(48/32)
        const hei = hblk*(22/16)
        ctx2.drawImage(tiles.UI, 0, 1, 48, 22,
            (Math.round(mx-offs) + offs + txoffs - 1)*blk + wid/2 + xoffs,
            ((Math.round(my/2) - offs)*2 + tyoffs + offs*Math.abs(Math.floor(my+1)%2)*4 - 0.75)*qblk + hei/2 + yoffs,
            wid, hei)
    }
    // Draw the current block frame
    const [framex, framey, framew, frameh] = framePos()
    ctx2.drawImage(tiles.UI, 0, 24+(mtf? 24:0), 48, 24,
        framex, framey, framew, frameh)
    if (mouse.select) {
        const source = tiles.normalisedImg(mouse.select)
        if (source) {
            var wid = source.wid
            var hei = source.hei
            var xtraw = 0; var xtrah = 0
            if (wid > hei) {
                hei = hblk*hei/wid
                wid = blk
                if (source.wid > 2) {
                    wid *= 2; hei *= 2
                    xtraw = 0.5
                }
            } else {
                wid = blk*wid/hei
                hei = hblk
                if (source.hei > 2) {
                    hei *= 2; wid *= 2
                    xtrah = 0.5
                }
            }
            const xpos = -blk*0.75 + (wid-blk)/2+hblk - xtraw*blk
            const ypos = -hblk*0.75 + (hei-hblk)/2+hblk - xtrah*blk
            wid *= framescale; hei *= framescale
            ctx2.drawImage(source.img, framex - xpos*framescale, framey + ypos*framescale, wid, hei)
        }
    }
}
