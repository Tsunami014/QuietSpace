const files = new Map()
const tiles = new Map()

export const pixel = false

var tleWid;
var tleHei;
export function setTleSzes(wid, hei) {
    tleWid = wid*2
    tleHei = hei*2
}
async function makeTile(sheet, tle, flipH=false, flipV=false, rotate=0) {
    var w; var h;
    if (pixel) {
        w = sheet.w
        h = sheet.h
    } else {
        w = tleWid * (sheet.w/32) + 4
        h = tleHei * (sheet.h/16) + 2
    }
    const r = (rotate+4) % 4
    const yscale = (r%2) + 1
    const xscale = 1 / yscale

    const c = new OffscreenCanvas(w, h);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(r * Math.PI / 2);
    ctx.scale(xscale, yscale);
    ctx.translate((flipH ? w : 0) - w/2, (flipV ? h : 0) - h/2);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(sheet.img, tle[0]*sheet.w, tle[1]*sheet.h, sheet.w, sheet.h, 0, 0, w, h);
    ctx.restore();

    return await createImageBitmap(c);
}


// S on a diagonal = SW
const dirs = ["E", "N", "S", "W"]
const nxtdirs = {
    "N": {nxt: "E", y: true}, "E": {nxt: "S", x: true},
    "S": {nxt: "W", y: true}, "W": {nxt: "N", x: true}
}
const straightflips = {"NS": "EW", "EW": "NS"}
const straightturns = {"NW": "EN", "EN": "ES", "ES": "SW", "SW": "NW"}
async function loadTileType(sheet, realnam, t) {
    if (t.type == "rand") {
        tiles.set(realnam, await Promise.all(
            t.options.map(opt => makeTile(sheet, opt))
        ))
    } else if (t.type == "edge") {
        tiles.set(realnam, await makeTile(sheet, t["4"]))
        var tle = t["1"].slice(1)
        var tnam = t["1"][0]
        var flipH = false; var flipV = false;
        var rot
        async function pushTile() {
            tiles.set(realnam+"_"+tnam, await makeTile(sheet, tle, flipH, flipV, rot))
        }
        for (rot = 0; rot < 4; rot++) {
            await pushTile()
            let nxt = nxtdirs[tnam]
            tnam = nxt.nxt
        }
        tle = t["2"].slice(1)
        tnam = t["2"][0]
        for (rot = 0; rot < 4; rot++) {
            await pushTile()
            tnam = straightturns[tnam]
        }
        // TODO: Finish
    } else if (t.type == "line") {
        var tle = t["1"].slice(1)
        var tnam = t["1"][0]
        var flipH = false; var flipV = false;
        async function pushTile() {
            tiles.set(realnam+"_"+tnam, await makeTile(sheet, tle, flipH, flipV))
        }
        for (let i = 0; i < 4; i++) {
            await pushTile()
            let nxt = nxtdirs[tnam]
            tnam = nxt.nxt
            if (nxt.x) flipH = !flipH
            if (nxt.y) flipV = !flipV
        }
        flipH = false; flipV = false;
        tle = t.straight.slice(1)
        tnam = t.straight[0]
        await pushTile()
        tnam = straightflips[tnam]
        flipV = true
        await pushTile()
        // TODO: Corners
        flipH = false; flipV = false;
        var thole = t["3"][0]
        tle = t["3"].slice(1)
        for (let i = 0; i < 4; i++) {
            tnam = dirs.reduce((prev,nxt)=>{
                if (nxt == thole) return prev
                return prev+nxt
            })
            await pushTile()
            let nxt = nxtdirs[thole]
            thole = nxt.nxt
            if (nxt.x) flipH = !flipH
            if (nxt.y) flipV = !flipV
        }
        flipH = false; flipV = false;
        tle = t["4"]
        tnam = dirs.reduce((prev,nxt)=>{return prev+nxt})
        await pushTile()
    } else {
        console.log(t)
        console.log("Unknown type:", t.type)
    }
}

async function loadTiles(sheet, tls, prefix="") {
    for (const tnam in tls) {
        const realnam = tnam == "."? prefix.slice(0,prefix.length-1):prefix+tnam
        const t = tls[tnam];
        if (Array.isArray(t)) {
            tiles.set(realnam, await makeTile(sheet, t))
        } else if ('type' in t) {
            await loadTileType(sheet, realnam, t)
        } else {
            await loadTiles(sheet, t, realnam+"_")
        }
    }
}

export async function reloadAllTiles() {
    for (const nam in files) {
        await loadTiles({img: files[nam][0], w: 32, h: 16}, files[nam][1])
    }
}
export async function load(nxt) {
    let file = await fetch("/assets/tiles.json")
    let js = await file.json()
    nxt()
    for (const nam in js) {
        const img = new Image()
        img.src = `assets/${nam}.svg`
        files.set(nam, [img, js[nam]])
        await img.decode()
        nxt()
        await loadTiles({img: img, w: 32, h: 16}, js[nam])
        nxt()
    }
}

export function getTile(tname, rand) {
    const tle = tiles.get(tname)
    if (!tle) {
        console.log("Unknown tile:", tname)
        return null
    } else {
        if (Array.isArray(tle)) {
            return tle[rand%tle.length]
        }
        return tle
    }
}
