const files = new Map()
const tiles = new Map()

export const pixel = false

export var UI;

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
        w = (tleWid + 4) * (sheet.w/32)
        h = (tleHei + 2) * (sheet.h/16)
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

    return {img: await createImageBitmap(c), wid: (sheet.w/32), hei: (sheet.h/16)};
}


// 'S' = SE on canvas
const dirs = ["E", "N", "S", "W"]
const nxtdirs = {
    "N": {nxt: "E", x: true}, "E": {nxt: "S", y: true},
    "S": {nxt: "W", x: true}, "W": {nxt: "N", y: true}
}
const straightflips = {"NS": "EW", "EW": "NS"}
const straightturns = {"NW": "EN", "EN": "ES", "ES": "SW", "SW": "NW"}
const corners = {
    "NW": {nxt: "ES", x: true}, "ES": {nxt: "NW", x: true},
    "SW": {nxt: "EN", y: true}, "EN": {nxt: "SW", y: true}
}
async function loadTileType(sheet, realnam, t, fH=false, fV=false, r=0) {
    if ("#" in t) {
        loadTileType(sheet, realnam+"_#", t["#"], fH, fV, r)
    }
    if (Array.isArray(t)) {
        tiles.set(realnam, await makeTile(sheet, t, fH, fV, r))
    } else if (t.type == "use") {
        tiles.set(realnam, {use: t.name})
    } else if (t.type == "rand") {
        const lns = t.options.map(opt=>opt[2]??1)
        let i = 0
        for (const opt of t.options) {
            await loadTileType(sheet, `${realnam}_rnd${i++}`, opt, t, fH, fV, r);
        }
        tiles.set(realnam, [t.options.map((_, idx)=>`${realnam}_rnd${idx}`), lns, lns.reduce((i,tot)=>i+tot)])
    } else if (t.type == "edge") {
        await loadTileType(sheet, realnam, t["4"], fH, fV, r)
        var tle = t["1"].slice(1)
        var tnam = t["1"][0]
        var flipH = false; var flipV = false;
        var rot = 0
        var txtranam = "smol"
        async function pushTile() {
            await loadTileType(sheet, realnam+"_"+tnam+txtranam, tle, flipH^fH, flipV^fV, rot+r)
        }
        for (rot = 0; rot < 4; rot++) {
            await pushTile()
            tnam = straightturns[tnam]
        }
        txtranam = ""
        tle = t["2"].slice(1)
        tnam = t["2"][0]
        rot = 0
        flipH = false; flipV = false;
        for (let i = 0; i < 4; i++) {
            await pushTile()
            var nxt = nxtdirs[tnam]
            tnam = nxt.nxt
            if (nxt.x) flipH = !flipH
            if (nxt.y) flipV = !flipV
        }
        flipH = false; flipV = false;
        tle = t["3"].slice(1)
        tnam = t["3"][0]
        for (rot = 0; rot < 4; rot++) {
            await pushTile()
            tnam = straightturns[tnam]
        }
    } else if (t.type == "line") {
        var tle = t["1"].slice(1)
        var tnam = t["1"][0]
        var flipH = false; var flipV = false;
        async function pushTile() {
            await loadTileType(sheet, realnam+"_"+tnam, tle, flipH^fH, flipV^fV, r)
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
        for (const cornr of [t.corner1, t.corner2]) {
            flipV = false; flipH = false;
            tle = cornr.slice(1)
            tnam = cornr[0]
            await pushTile()
            let nxt = corners[tnam]
            tnam = nxt.nxt
            if (nxt.x) flipH = !flipH
            if (nxt.y) flipV = !flipV
            await pushTile()
        }
        flipH = false; flipV = false;
        var thole = t["3"][0]
        tle = t["3"].slice(1)
        for (let i = 0; i < 4; i++) {
            if (thole == dirs[0]) {
                tnam = dirs.slice(1).join("")
            } else {
                tnam = dirs.reduce((prev,nxt)=>{
                    if (nxt == thole) return prev ?? ""
                    return prev+nxt
                })
            }
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
    for (const [nam, data] of files) {
        await loadTiles(data[0], data[1])
    }
}
var rules; var borders; var decor;
export async function load(nxt) {
    const js1 = await (await fetch("./assets/tiles.json")).json()
    nxt()
    for (const nam in js1) {
        const img = new Image()
        img.src = `assets/${nam.replace(".", "_")}.svg`
        var spl = nam.split("x")
        const dat = {img: img, w: Math.round(32*parseFloat(spl[0], 10)), h: Math.round(16*parseFloat(spl[1], 10))}
        files.set(nam, [dat, js1[nam]])
        await img.decode()
        await loadTiles(dat, js1[nam])
        nxt()
    }
    const dat = await (await fetch("./assets/rules.json")).json()
    rules = dat.rules
    borders = dat.borders
    decor = dat.decor
    nxt()
    UI = new Image()
    UI.src = "assets/ui.svg"
    await UI.decode()
    nxt()
}

export function getTile(tname, rand, logOnFail=true) {
    if (tname === null) return null;
    const tle = tiles.get(tname)
    if (!tle) {
        if (logOnFail) console.log("Unknown tile:", tname)
        return null
    } else if ('use' in tle) {
        return getTile(tle.use, rand, logOnFail)
    } else {
        if (Array.isArray(tle)) {
            if (rand == -1) return getTile(tle[0][(tle[0].length-2)%tle[0].length], -1, logOnFail)
            var num = rand%tle[2]
            const mx = tle[0].length
            for (let i = 0; i < mx; i++) {
                num -= tle[1][i]
                if (num < 0) return getTile(tle[0][i], rand*tle[2], logOnFail)
            }
            // Fallback
            return getTile(tle[0][rand%mx], rand*mx)
        }
        return tle
    }
}
function getAround(n, edge, tilefn) {
    const out = []
    for (let x = -n; x <= n; x++) {
        const y = n - Math.abs(x)
        const opts = y === 0 ? [[x, 0]] : [[x, y], [x, -y]]
        for (const [cx, cy] of opts) {
            const dx = cx > 0 ? "E" : cx < 0 ? "W" : null
            const dy = cy > 0 ? "N" : cy < 0 ? "S" : null
            const needX = dx && !out.includes(dx)
            const needY = dy && !out.includes(dy)

            if ((needX || needY) && edge^tilefn(cx, cy)) {
                if (needX) out.push(dx)
                if (needY) out.push(dy)
            }
        }
    }
    return out.sort().join("")
}
function handleStrBaseT(gname, edge, tilefn) {
    if (gname.endsWith("_")) {
        const out = getAround(1, edge, tilefn)
        if (!out) return gname.slice(0, -1);
        return gname+out
    }
    return gname
}
export function getBaseTile(gname, tles, tilefn) {
    if (gname.startsWith("$")) return gname.slice(1);
    if (decor.includes(gname)) return gname;
    const grp = rules[gname]
    if (!grp) {
        console.log("Unknown tile group:", gname)
        return null
    }
    if (typeof grp === "string") return grp;
    for (const it of grp) {
        if (typeof it === "string") return it;
        const k = Object.keys(it)[0]
        const v = it[k]
        switch (k) {
            case "decor":
                if (!tles.every(it=>{ return it === gname || decor.includes(it) })) {
                    return v
                }
                break;
            case k.startsWith("edge") && k:
            case k.startsWith("connect") && k:
                const edge = k.startsWith("edge")
                var n = 1
                if (k.endsWith("2")) { n = 2; }
                else if (k.endsWith("3")) { n = 3; }
                const out = getAround(n, edge, tilefn)
                if (out.length != 0) {
                    if (v.endsWith("_")) {
                        return handleStrBaseT(v+out, edge, tilefn)
                    } else {
                        return handleStrBaseT(v, edge, tilefn)
                    }
                }
                break;
            default:
                console.log("Unknown constraint name:", k)
        }
    }
    console.log("Unable to find a matching tile in group:", gname)
    return null
}

const alldirs = ["NW", "N", "EN", "E", "ES", "S", "SW", "W"]
export function addBorders(gname, fulltilefn) {
    var outs = []
    for (const k in borders) {
        var dirs = []
        if (gname === k) continue;
        for (const [dx, dy, d] of [
            [-1, 1,  0], // NW
            [0, 1,   1], // N
            [1, 1,   2], // EN
            [1, 0,   3], // E
            [1, -1,  4], // ES
            [0, -1,  5], // S
            [-1, -1, 6], // SW
            [-1, 0,  7], // W
        ]) {
            if (fulltilefn(dx, dy, k)) {
                dirs.push(d)
            }
        }
        if (dirs.length > 0) {
            const tle = borders[k]
            dirs.push(99)
            var last = dirs.shift()
            var best = last
            var first = null
            for (const d of dirs) {
                if (d-best > 1) {
                    if (last == 0 && best != 7 && dirs[dirs.length-2] == 7) {
                        first = best
                        last = d; best = d
                        continue // Come back to this at the end
                    }
                    if (best == 7 && first !== null) best = 8+first;
                    if (last == best) {
                        if (last%2 == 0) {
                            outs.push("$"+tle+alldirs[last]+"smol")
                        } else {
                            outs.push("$"+tle+alldirs[last])
                        }
                    } else {
                        const start = last+(1-last%2)
                        const end = best-(1-best%2)
                        if (start == end%8) {
                            outs.push("$"+tle+alldirs[start])
                        } else {
                            for (let i = start; i < end; i += 2) {
                                outs.push("$"+tle+[alldirs[i%8],alldirs[(i+2)%8]].sort().join(""))
                            }
                            if ((end+2)%8 == start) {
                                outs.push("$"+tle+[alldirs[end],alldirs[start]].sort().join(""))
                            }
                        }
                    }
                    last = d; best = d
                } else {
                    best = d
                }
            }
        }
    }
    return outs
}

export function normalise(tname) {
    if (!tname) return ""
    return tname.match(/(.+?)(?:_[NESW]+|_rnd[0-9]+|_plain)?$/)[1]
}

export function normalisedImg(tname) {
    let source = getTile(mouse.select+"_#", -1, false)
    if (source) return source;
    source = getTile(mouse.select, -1, false)
    if (source) return source;
    console.log("Unknown tile:", tname)
}
