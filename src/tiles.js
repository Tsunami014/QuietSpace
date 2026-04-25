const files = new Map()
const tiles = new Map()


// S on a diagonal = SW
const dirs = ["E", "N", "S", "W"]
const nxtdirs = {
    "N": {nxt: "E", y: true}, "E": {nxt: "S", x: true},
    "S": {nxt: "W", y: true}, "W": {nxt: "N", x: true}
}
const straightflips = {"NS": "EW", "EW": "NS"}
function loadTileType(t) {
    if (t.type == "rand") {
        return [{type: "rand", opts: t.options}]
    } else if (t.type == "edge") {
        // TODO: Finish
        return [
            {tile: t.fill}
        ]
    } else if (t.type == "line") {
        const out = []
        var tle = t["1"].slice(1)
        var tnam = t["1"][0]
        var flip = {h: false, v: false}
        function pushTile() {
            out.push({tile: tle, namPrefix: tnam,
                flipH: flip.h, flipV: flip.v})
        }
        for (let i = 0; i < 4; i++) {
            pushTile()
            let nxt = nxtdirs[tnam]
            tnam = nxt.nxt
            if (nxt.x) flip.h = !flip.h
            if (nxt.y) flip.v = !flip.v
        }
        flip = {h: false, v: false}
        tle = t.straight.slice(1)
        tnam = t.straight[0]
        pushTile()
        tnam = straightflips[tnam]
        flip.v = true
        pushTile()
        // TODO: Corners
        var thole = t["3"][0]
        tle = t["3"].slice(1)
        for (let i = 0; i < 4; i++) {
            tnam = dirs.reduce((prev,nxt)=>{
                if (nxt == thole) return prev
                return prev+nxt
            })
            pushTile()
            let nxt = nxtdirs[thole]
            thole = nxt.nxt
            if (nxt.x) flip.h = !flip.h
            if (nxt.y) flip.v = !flip.v
        }
        flip = {h: false, v: false}
        tle = t["4"]
        tnam = dirs.reduce((prev,nxt)=>{return prev+nxt})
        pushTile()
        return out
    } else {
        console.log(t)
        console.log("Unknown type:", t.type)
        return [{type: "?"}]
    }
}

async function loadTiles(nam, tls, prefix="") {
    for (const tnam in tls) {
        const realnam = tnam == "."? prefix.slice(0,prefix.length-1):prefix+tnam
        const t = tls[tnam];
        if (Array.isArray(t)) {
            tiles.set(realnam, {img: nam, tile: t})
        } else if ('type' in t) {
            loadTileType(t).forEach(it=>{
                tiles.set(realnam+(it.namPrefix ? "_"+it.namPrefix : ""),
                    {img: nam, ...it})
            })
        } else {
            loadTiles(nam, t, prefix?realnam+"_":tnam+"_")
        }
    }
}

export async function load(nxt) {
    let file = await fetch("/assets/tiles.json")
    let js = await file.json()
    nxt()
    for (const nam in js) {
        const img = new Image()
        img.src = `assets/${nam}.svg`
        files.set(nam, img)
        await img.decode()
        nxt()
        await loadTiles(nam, js[nam])
        nxt()
    }
}

export function getTile(tname, rand) {
    const tle = tiles.get(tname)
    if (!tle) {
        console.log("Unknown tile:", tname)
        return [null, null]
    } else {
        const img = files.get(tle.img)
        if (tle.type == "?") {
            return [img, 0, 0, 0, 0]
        }
        var tlepos;
        if (tle.type == "rand") {
            tlepos = tle.opts[rand%tle.opts.length]
        } else {
            tlepos = tle.tile
        }
        var flip = null;
        if (tle.flipH || tle.flipV) {
            flip = [tle.flipH? -1:1, tle.flipV? -1:1]
        }
        const wid = 32
        const hei = 16
        return [[img, tlepos[0]*wid, tlepos[1]*hei, wid, hei], flip]
    }
}
