export var open = false
var contnr; var conts; var newcont;
export function init() {
    newcont = document.getElementById("news")
    contnr = document.getElementById("overl")
    conts = document.getElementById("bpconts")
}

export function toggle() {
    if (contnr.classList.contains('bkpk')) {
        const e = mouse.elmAtMouse()
        if (conts.contains(e)) e.click();
        contnr.classList.remove("bkpk")
        open = false
    } else {
        contnr.classList.add("bkpk")
        open = true
    }
}

var aimw = 0
function drawTile(nam) {
    const source = tiles.normalisedImg(nam);
    if (!source) return null;
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false
    const scale = aimw/32

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
    canvas.width = canvw*scale; canvas.height = canvh*scale
    ctx.drawImage(source.img,
        Math.ceil((canvw-wid)/2 * scale), Math.ceil((canvh-hei)/2 * scale),
        Math.floor(wid*scale), Math.floor(hei*scale))
    return canvas
}

export var founds = []
export function loadFounds(fs) {
    founds = fs??[]
    redraw = true
}
function prettify(nam) {
    return nam.charAt(0).toUpperCase()+nam.slice(1).replace('_', ' ')
}
function newfound(nam) {
    founds.push(nam)
    const n = document.createElement("div")
    const t = document.createElement("span")
    const b = document.createElement("strong");
    b.innerText = prettify(nam)
    t.appendChild(b)
    t.appendChild(document.createTextNode(" discovered!"))
    n.appendChild(t)

    const canv = drawTile(nam)
    if (canv) n.appendChild(canv);

    newcont.appendChild(n)
    setTimeout(()=>{ n.style.opacity = 0; }, 2000)
    setTimeout(()=> n.remove(), 3000)
    redraw = true
}
export function found(blks) {
    blks.forEach(b=>{
        if (!founds.includes(b)) {
            newfound(b)
        }
    })
}


var redraw = true
export function resized(blk) {
    redraw = true;
    aimw = blk*1.2
    newcont.childNodes.forEach(c=>{
        c.firstChild.style.fontSize = blk/5
        c.lastChild.style.width = blk
    })
}


export function draw() {
    if (!redraw) return;
    conts.replaceChildren()
    founds.forEach(it=>{
        const canv = drawTile(it)
        if (!canv) return;
        const c = document.createElement("div")
        const t = document.createElement("span")
        t.innerText = prettify(it)
        c.appendChild(t)
        c.appendChild(canv)
        c.onclick = ()=>{
            mouse.setsel(it)
            toggle()
        }
        conts.appendChild(c)
    })
    redraw = false
}
