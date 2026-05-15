var elm;
var width; var height;
export async function load(nxt) {
    const str = await (await fetch("./assets/player.svg")).text()
    nxt()
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(str, 'image/svg+xml')
    elm = svgDoc.documentElement
    width = elm.getAttribute("width"); height = elm.getAttribute("height")
    hide()
    document.body.appendChild(elm)
}

const blkhei = 2.8
export function scale(hblk) {
    const s = (hblk*blkhei) / height
    const dir = -1
    elm.style.transform = `translate(0, -${Math.round(height*s*0.45)}px) scale(${s*dir}, ${s})`
}

export function sze(hblk) {
    const s = (hblk*blkhei) / height
    return { wid: width*s, hei: height*s }
}

export function hide() { elm.style.display = "none" }
export function show() { elm.style.display = "" }
