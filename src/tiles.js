const files = new Map()
const tiles = new Map()

async function loadTiles(nam, tls, prefix="") {
    for (const tnam in tls) {
        const realnam = tnam == "."? prefix.slice(0,prefix.length-1):prefix+tnam
        const t = tls[tnam];
        if (Array.isArray(t)) {
            tiles.set(realnam, {img: nam, tile: t})
        } else if ('type' in t) {
            console.log(realnam, t)
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

export function getTile(tname) {
    const tle = tiles.get(tname)
    if (!tle) {
        console.log("Unknown image:", tname)
    } else {
        return [files.get(tle.img), tle.tile[0]*32, tle.tile[1]*16, 32, 16]
    }
}
