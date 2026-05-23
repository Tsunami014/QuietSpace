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
    document.getElementById("playerContainer").appendChild(elm)
}

var dir = 1
export function setdir(d) { dir = d }

const blkhei = 2.8
export function scale(hblk) {
    const s = (hblk*blkhei) / height
    elm.style.transform = `scale(${s*dir}, ${s})`
    elm.style.left = `calc(50vw - ${width*s*0.58 - hblk}px)`
    elm.style.top = `calc(50vh - ${height*s*0.5}px)`
}

export function sze(hblk) {
    const s = (hblk*blkhei) / height
    return { wid: width*s, hei: height*s }
}

export function hide() { elm.style.display = "none" }
export function show() { elm.style.display = "" }
