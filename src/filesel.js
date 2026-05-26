export var fselopen = true
var contnr;
var inncontnr;
var page1; var page2; var pageconts
var width; var height
var pagenum = 0

export async function init(nxt) {
    const str = await (await fetch("./assets/journal.svg")).text()
    nxt()
    contnr = document.getElementById("fselout")
    inncontnr = document.getElementById("fsel")
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(str, 'image/svg+xml')

    page1 = svgDoc.documentElement
    width = parseInt(page1.getAttribute("width")); height = parseInt(page1.getAttribute("height"))

    page2 = svgDoc.documentElement.cloneNode(true)
    pageconts = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject")
    pageconts.setAttribute("x", 0); pageconts.setAttribute("y", 0)
    page2.appendChild(pageconts)

    redraw()
    inncontnr.appendChild(page1)
    inncontnr.appendChild(page2)
}

function addText(txt, sze, hei) {
    const t = document.createElement('p')
    t.className = "txt"
    t.innerText = txt
    t.style.fontSize = sze+"px"
    t.style.top = hei+"%"
    pageconts.appendChild(t)
}
function drawPage() {
    if (pagenum == 0) {
        addText("Worlds", 96, 0)
        addText(
            "Left/right arrows or click\nto change page",
        24, 65)
    } else if (pagenum == 1) {
        addText("Keybinds", 72, 0)
        addText(
            "WSAD to move\n"+
            "Space/left click to pick block\n"+
            "Enter/right click to place block",
        24, 55)
    }
}

const mainfill = "#753127"
const subfill = "#ECE4D5"
export function redraw() {
    var s;
    if (canvas1.width < canvas1.height) {
        s = canvas1.width/width * 0.7
    } else {
        s = canvas1.height/height * 0.7
    }
    const transx = pagenum == 0 ? -50 : -70
    inncontnr.style.transform = `rotate(-1deg) scale(${s}) translate(${transx}%, -50%)`
    pageconts.setAttribute("width", width*s); pageconts.setAttribute("height", height*s)
    pageconts.setAttribute("transform", `scale(${1/s})`)

    page1.style.fill = pagenum == 1 ? mainfill : subfill
    page1.style.display = pagenum == 0 ? "none" : ""
    page1.style.transform = pagenum == 0 ? "" : "translate(3%) scale(-1, 1)"
    page2.style.fill = pagenum == 0 ? mainfill : subfill

    pageconts.replaceChildren()
    drawPage()
}

export function press(dx) {
    pagenum += dx
    if (pagenum < 0) pagenum = 0
    redraw()
}

