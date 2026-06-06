export var open = false
var contnr; var conts; var contsctx; var newcont;
export function init() {
    newcont = document.getElementById("news")
    contnr = document.getElementById("overl")

    conts = document.createElement("canvas")
    contsctx = conts.getContext('2d')
    contsctx.imageSmoothingEnabled = false
    document.getElementById("bpconts").appendChild(conts)
}

export function toggle() {
    if (contnr.classList.contains('bkpk')) {
        contnr.classList.remove("bkpk")
        open = false
    } else {
        contnr.classList.add("bkpk")
        open = true
    }
}

function drawTile(nam, ctx, canvas) {
    const source = tiles.normalisedImg(nam);
    if (!source) return null;
    const scale = Math.max(source.img.width/32, source.img.height/16)

    var wid = source.wid
    var hei = source.hei
    var canvw = 32; var canvh = 16
    if (wid > hei) {
        hei = 16*hei/wid
        wid = 32
        if (source.wid > 2) {
            wid *= 2; hei *= 2
            canvw *= 2
        }
    } else {
        wid = 32*wid/hei
        hei = 16
        if (source.hei > 2) {
            hei *= 2; wid *= 2
            canvh *= 2
        }
    }
    if (canvas) canvas.width = canvw*scale; canvas.height = canvh*scale
    ctx.drawImage(source.img, (canvw-wid)/2 * scale, (canvh-hei)/2 * scale, wid*scale, hei*scale)
}
function genTiles(check) {
}
export function reloadTiles() {
    foundTiles = []
    genTiles(false)
}

export var founds = []
var foundTiles = {}
export function loadFounds(fs) {
    founds = fs??[]
    reloadTiles()
}
function newfound(nam) {
    founds.push(nam)
    const n = document.createElement("div")
    const t = document.createElement("span")
    const b = document.createElement("strong");
    b.innerText = nam.charAt(0).toUpperCase()+nam.slice(1).replace('_', ' ')
    t.appendChild(b)
    t.appendChild(document.createTextNode(" discovered!"))
    n.appendChild(t)

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false
    drawTile(nam, ctx, canvas)
    n.appendChild(canvas)

    newcont.appendChild(n)
    setTimeout(()=>{ n.style.opacity = 0; }, 2000)
    setTimeout(()=> n.remove(), 3000)
    genTiles(true)
}
export function found(blks) {
    blks.forEach(b=>{
        if (!founds.includes(b)) {
            newfound(b)
        }
    })
}

export function size(blk) {
    newcont.childNodes.forEach(c=>{
        c.firstChild.style.fontSize = blk/5
        c.lastChild.style.width = blk
    })
}
