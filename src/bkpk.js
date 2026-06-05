var newcont;
export function init() {
    newcont = document.getElementById("news")
}

export var founds = []
export function loadFounds(fs) {
    founds = fs??[]
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

    const tile = tiles.normalisedImg(nam);
    if (tile) {
        const canvas = document.createElement('canvas')
        canvas.width = tile.img.width
        canvas.height = tile.img.height

        const ctx = canvas.getContext('2d')
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(tile.img, 0, 0)
        n.appendChild(canvas)
    }
    newcont.appendChild(n)
    setTimeout(()=>{ n.style.opacity = 0; }, 2000)
    setTimeout(()=> n.remove(), 3000)
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
