export var fselopen
var contnr; var inncontnr;
var page1; var page2; var pageconts
var width; var height
var pagenum = 0

function maxPage() {
    return worlds.world_nams.length+3
}

var aftms; var befms; var nowms
const marks = [
    [1, "c", null],
    [2, "n", null],
    [3, "l", null]
]

const precache = [
  './assets/journal/bin.svg'
];


export async function init(nxt) {
    // I ain't waiting for ts
    Promise.all(precache.map((src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = resolve;
            img.onerror = reject;
        });
    }));


    const jrnlstr = await (await fetch("./assets/journal/jrnl.svg")).text()
    nxt()
    const markstr = await (await fetch("./assets/journal/mark.svg")).text()
    nxt()
    const parser = new DOMParser()

    const markDoc = parser.parseFromString(markstr, 'image/svg+xml')
    marks.forEach(m=>{
        m[2] = markDoc.documentElement.cloneNode(true)
        m[2].onclick = ()=>{
            pagenum = m[0]
            redraw()
        }
        const t = document.createElementNS("http://www.w3.org/2000/svg", "text")
        t.setAttribute("x", "40%"); t.setAttribute("y", "22.5%")
        t.setAttribute("font-weight", "bold")
        t.setAttribute("font-size", "1px")
        t.innerHTML = m[1].toUpperCase()
        m[2].appendChild(t)
    })
    aftms = document.createElement("div")
    aftms.className = "marks"
    befms = document.createElement("div")
    befms.className = "marks"
    nowms = document.createElement("div")
    nowms.id = "nowmarks"
    nowms.onclick = function() { press(-1, {}); }

    const jrnlDoc = parser.parseFromString(jrnlstr, 'image/svg+xml')
    contnr = document.getElementById("fselout")
    inncontnr = document.getElementById("fsel")

    page1 = jrnlDoc.documentElement
    page1.onclick = function() { press(-1, {}); }
    width = parseInt(page1.getAttribute("width")); height = parseInt(page1.getAttribute("height"))

    page2 = jrnlDoc.documentElement.cloneNode(true)
    pageconts = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject")
    pageconts.setAttribute("x", 0); pageconts.setAttribute("y", 0)
    //pageconts.onclick = function() { press(1, {}); }
    page2.appendChild(pageconts)

    redraw()
    inncontnr.append(
        aftms, befms,
        page1, page2,
        nowms)
}

export function toggle() {
    if (contnr.style.display == "") {
        contnr.style.display = "none"
        fselopen = false
        if (pagenum == 2) {
            worlds.mknew()
        } else if (pagenum > 2 && pagenum < maxPage()) {
            worlds.load(worlds.world_nams[pagenum-3])
        }
    } else {
        contnr.style.display = ""
        if (fselopen !== undefined) {
            worlds.save()
            pagenum = worlds.world_idx()+3
        }
        fselopen = true
        redraw()
    }
}

var s;
function addText(txt, sze, hei) {
    const t = document.createElement('p')
    t.className = "txt"
    t.innerText = txt
    t.style.fontSize = sze*s/10+"px"
    t.style.lineHeight = t.style.fontSize
    t.style.top = hei+"%"
    pageconts.appendChild(t)
}
function drawPage() {
    if (pagenum == 0) {
        addText("Quiet Space", 30, 5)
        addText(
            "Left/right arrows or click to change page",
        10, 70)
    } else if (pagenum == 1) {
        addText("Controls", 25, 0)
        addText(
            "Escape to toggle this menu.\nIf a world page is selected, will load that world\n\n"+
            "WSAD to move\n\n"+
            "Space/left click to pick block\n\n"+
            "Enter/right click to place block",
        8, 54)
    } else if (pagenum == 2) {
        addText("New world", 20, 4)
        addText(
            "Pressing esc here will generate a new world!",
        10, 48)
    } else if (pagenum < maxPage()) {
        const t = document.createElement('input')
        t.type = "text"
        t.className = "txt"
        let last = worlds.world_nams[pagenum-3]
        t.value = last.replace("\x01", '')
        t.style.fontSize = 2*s+"px"
        t.style.lineHeight = t.style.fontSize
        t.onchange = function() {
            if (worlds.rename(last, t.value)) {
                last = t.value
                redraw()
            } else {
                t.value = last.replace("\x01", '')
            }
        }
        pageconts.appendChild(t)
        if (pagenum > 3) {
            const bin = document.createElement('img');
            bin.src = '/assets/journal/bin.svg';
            bin.style.bottom = "5%"; bin.style.right = "5%"
            bin.style.width = "20%"; bin.style.rotate = "3deg"
            bin.style.cursor = "pointer"
            bin.onclick = function() {
                if (worlds.delworld(t.value)) {
                    pagenum = 3
                    redraw()
                }
            }
            pageconts.appendChild(bin)
        }
    }
}

const mainfill = "#753127"
const subfill = "#ECE4D5"
export function redraw() {
    const mx = maxPage()
    if (canvas1.width < canvas1.height) {
        s = canvas1.width/width * 0.7
    } else {
        s = canvas1.height/height * 0.7
    }
    const transx = pagenum == 0 || pagenum == mx ? -50 : -70
    inncontnr.style.transform = `rotate(-1deg) scale(${s}) translate(${transx}%, -50%)`
    pageconts.setAttribute("width", width*s); pageconts.setAttribute("height", height*s)
    pageconts.setAttribute("transform", `scale(${1/s})`)

    aftms.style.right = pagenum == mx ? "10%" : "55%"
    befms.style.left = pagenum == 0 ? "0" : "50%"

    page1.style.fill = pagenum == 1 || pagenum == mx ? mainfill : subfill
    page1.style.display = pagenum == 0 ? "none" : ""
    page1.style.transform = pagenum == 0 ? "" : "translate(3%) scale(-1, 1)"
    page2.style.fill = pagenum == 0 ? mainfill : subfill
    page2.style.display = pagenum == mx ? "none" : ""

    pageconts.replaceChildren()
    drawPage()

    marks.forEach(m=>{
        if (m[0] > mx) {
            m[2].remove()
            return;
        }
        if (m[0] == pagenum) {
            nowms.appendChild(m[2])
        } else if (m[0] > pagenum) {
            befms.appendChild(m[2])
        } else {
            aftms.appendChild(m[2])
        }
    })
}

export function press(dx, keys) {
    var topage = marks.find(it=>{ return keys[it[1]] })
    if (topage !== undefined) {
        pagenum = topage[0]
    } else if (dx != 0) {
        if (dx == -2) pagenum = 0;
        else if (dx == 2) pagenum = maxPage();
        else pagenum += dx;
    } else { return; }
    if (pagenum < 0) pagenum = 0
    const mx = maxPage()
    if (pagenum > mx) pagenum = mx
    redraw()
}

