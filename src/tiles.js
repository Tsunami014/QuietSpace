const files = new Map()
var tiles = new Map()

async function loadTiles(nam, tiles, prefix="") {
    for (const tnam in tiles) {
        const realnam = tnam == "."? prefix.slice(0,prefix.length-1):prefix+tnam
        const t = tiles[tnam];
        if (Array.isArray(t)) {
            console.log(realnam, t)
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
