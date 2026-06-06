export var fselopen
var contnr; var inncontnr;
var page1; var page2; var pageconts
var width; var height
var pagenum = 0

export function goCurWorld() {
    pagenum = worlds.world_idx()+extraPages+2
}

const extraPages = 3
function maxPage() {
    return worlds.world_nams.length+extraPages+2
}

var aftms; var befms; var nowms
const marks = [
    [1, "t", "#7D5557"],
    [2, "c", "#8C5848"],
    [extraPages+1, "n", "#8C5048"],
    [extraPages+2, "l", "#8C6348"]
]

const precache = [
  './assets/journal/play.svg',
  './assets/journal/copy.svg',
  './assets/journal/bin.svg',
  './assets/journal/xport.svg',
];

function avaliable() {
    return document.activeElement == document.body
}


var bmwid; var bmhei
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

    aftms = document.createElement("div")
    aftms.className = "marks"
    aftms.style.flexDirection = "row-reverse"
    befms = document.createElement("div")
    befms.className = "marks"
    nowms = document.createElement("div")
    nowms.id = "nowmarks"
    nowms.ondblclick = function() { press(-1); }

    const parser = new DOMParser()
    const markDoc = parser.parseFromString(markstr, 'image/svg+xml')
    bmwid = parseInt(markDoc.documentElement.getAttribute("width")); bmhei = parseInt(markDoc.documentElement.getAttribute("height"))
    marks.forEach(m=>{
        const mn = markDoc.documentElement.cloneNode(true)
        mn.setAttribute("fill", m[2])
        mn.onclick = ()=>{
            pagenum = m[0]
            redraw()
        }
        m.push(mn)
        const ms = document.createElement("div")
        ms.style.marginRight = mn.getAttribute("width")
        m.push(ms)
        befms.appendChild(ms)
        const t = document.createElementNS("http://www.w3.org/2000/svg", "text")
        t.setAttribute("x", "40%"); t.setAttribute("y", "22.5%")
        t.setAttribute("font-weight", "bold")
        t.setAttribute("font-size", "1px")
        t.setAttribute("fill", mn.getAttribute("stroke"))
        t.innerHTML = m[1].toUpperCase()
        mn.appendChild(t)
    })

    const jrnlDoc = parser.parseFromString(jrnlstr, 'image/svg+xml')
    contnr = document.getElementById("overl")
    inncontnr = document.getElementById("fsel")

    page1 = jrnlDoc.documentElement.cloneNode(true)
    page1.ondblclick = function() { press(-1); }
    width = parseInt(page1.getAttribute("width")); height = parseInt(page1.getAttribute("height"))
    page1.style.position = "absolute"

    page2 = jrnlDoc.documentElement
    pageconts = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject")
    pageconts.setAttribute("x", 0); pageconts.setAttribute("y", 0)
    pageconts.ondblclick = function() {
        if (!avaliable()) return;
        press(1)
    }
    page2.appendChild(pageconts)

    redraw()
    inncontnr.append(
        aftms, befms,
        page1, page2,
        nowms)
}

export function toggle() {
    if (contnr.classList.contains('fsel')) {
        contnr.classList.remove("fsel")
        worlds.save()
        fselopen = false
    } else {
        contnr.classList.add("fsel")
        worlds.save()
        if (fselopen !== undefined) {
            goCurWorld()
        }
        fselopen = true
        redraw()
    }
}

var s; var startend;
function addText(txt, sze, hei) {
    const t = document.createElement('p')
    t.className = "txt"
    t.innerText = txt
    t.style.fontSize = sze*s/10+"px"
    t.style.lineHeight = t.style.fontSize
    t.style.top = hei+"%"
    if (startend) t.style.color = "wheat";
    pageconts.appendChild(t)
}
function mkButton(src, right, cont, onclick) {
    const wrap = document.createElement('div');
    wrap.className = "popwrap"
    wrap.style.bottom = "25%"; wrap.style.right = right+"%"
    wrap.style.width = "20%"
    const hover = document.createElement('div');
    hover.className = "popcont"
    hover.innerText = cont
    wrap.appendChild(hover)
    const btn = document.createElement('img');
    btn.className = "imgbtn"
    btn.src = src
    btn.onclick = onclick
    wrap.appendChild(btn)
    pageconts.appendChild(wrap)
    return btn
}
function drawPage() {
    if (pagenum == 0) {
        addText("Quiet Space", 30, 5)
        addText(
            "Left/right arrows or double click to change page",
        10, 70)
    } else if (pagenum == 1) {
        addText("Todos", 25, 5)
        addText(
            "- Discover a traffic cone\n"+
            "- Walk around a tree\n"+
            "- Find the beach and ocean\n"+
            "- Encase yourself in trees\n"+
            "- Build your own road",
        8, 55)
    } else if (pagenum == 2) {
        addText("Menu Controls", 25, 5)
        addText(
            "Escape to toggle this menu.\nOpen this menu to save!\n\n"+
            "I to import a world.\nBookmarks jump to their page.",
        8, 60)
    } else if (pagenum == 3) {
        addText("Game controls", 25, 5)
        addText(
            "WSAD or arrow keys to move.\n"+
            "Mouse to highlight a tiles.\n\n"+
            "Left click/Q to place tiles.\n"+
            "Right click/E to select & discover tiles!\n\n"+
            "R to open/close backpack of discovered tiles.\n"+
            "Click/F on a backpack item to select it.",
        7, 60)
    } else if (pagenum == maxPage()) {
        addText(
            "Made with <3 by Tsunami014",
        10, 50)
    } else {
        const wnam = worlds.world_nams[pagenum-extraPages-2]
        mkButton('./assets/journal/play.svg', 5,
            "Play world\nSpace",
        ()=>{
            if (wnam === undefined) {
                worlds.mknew()
            } else {
                worlds.load(wnam)
            }
            nxttog = true
        })
        if (pagenum == extraPages+1) {
            addText("New world", 20, 4)
            addText(
                "This will generate a new world!",
            10, 48)
            return;
        }
        mkButton('./assets/journal/xport.svg', 25,
            "Export world\nE",
        ()=>{ worlds.expor(wnam); })
        mkButton('./assets/journal/copy.svg', 50,
            "Copy world\n=",
        ()=>{
            worlds.copyworld(wnam)
            goCurWorld()
            redraw()
        })
        if (pagenum == extraPages+2) {
            addText("Last world", 20, 4)
            addText(
                "Warning: this gets overridden when another world is loaded!\n\n"+
                "To permanently store this world, copy it!",
            8, 45)
        } else {
            const t = document.createElement('input')
            t.type = "text"
            t.className = "txt"
            t.value = wnam.replace("\x01", '')
            t.setAttribute("maxlength", 10)
            t.style.fontSize = 2*s+"px"
            t.style.lineHeight = t.style.fontSize
            t.onchange = function() {
                if (worlds.rename(wnam, t.value, true)) {
                    goCurWorld()
                    redraw()
                } else {
                    t.value = wnam.replace("\x01", '')
                    t.blur()
                }
            }
            pageconts.appendChild(t)
            addText(
                "Type in the box above and press enter to rename",
            8, 45)
            mkButton('./assets/journal/bin.svg', 70,
                "Delete world\nBackspace",
            ()=>{
                if (worlds.delworld(wnam)) {
                    pagenum = extraPages+2
                    redraw()
                }
            })
        }
    }
}

const mainfill = "#753127"
const subfill = "#ECE4D5"
export function redraw() {
    const mx = maxPage()
    startend = pagenum == 0 || pagenum == mx
    if (canvas1.width < canvas1.height) {
        s = canvas1.width/width * 0.7
    } else {
        s = canvas1.height/height * 0.7
    }
    inncontnr.style.transform = `rotate(-1deg) translate(${startend ? -50 : -30}%, -50%)`
    pageconts.setAttribute("width", width*s); pageconts.setAttribute("height", height*s)
    if (pagenum == mx) {
        pageconts.setAttribute("transform", `scale(${-1/s}, ${1/s})`)
        pageconts.style.translate = "100%"
    } else {
        pageconts.setAttribute("transform", `scale(${1/s})`)
        pageconts.style.translate = ""
    }

    page1.style.fill = pagenum == 1 || pagenum == mx ? mainfill : subfill
    page1.style.display = startend ? "none" : ""
    page1.setAttribute("width", width*s); page1.setAttribute("height", height*s)
    page1.style.transform = startend ? "" : `translate(-95%) scale(-1, 1)`
    page2.style.fill = startend ? mainfill : subfill
    page2.style.transform = pagenum == mx ? `scale(-1, 1)` : ""
    page2.setAttribute("width", width*s); page2.setAttribute("height", height*s)

    pageconts.replaceChildren()
    drawPage()

    aftms.style.right = pagenum == mx ? "3%" : "100%"
    marks.forEach(m=>{
        const mn = m[3]
        const ms = m[4]
        mn.setAttribute("width", bmwid*s); mn.setAttribute("height", bmhei*s)
        if (m[0] > mx) {
            ms.style.display = "none"
            mn.remove()
            return;
        }
        if (m[0] > pagenum) {
            ms.style.display = "none"
            befms.appendChild(mn)
        } else {
            ms.style.display = ""
            if (m[0] == pagenum) {
                nowms.appendChild(mn)
            } else {
                aftms.appendChild(mn)
            }
        }
    })
}

export function press(dx, keys = {}, lastks = {}) {
    if (!avaliable()) return;
    if (keys[' '] && !lastks[' ']) {
        if (pagenum == extraPages+1) {
            worlds.mknew()
        } else if (pagenum == extraPages+2) {
            worlds.load("")
        } else if (pagenum > extraPages+2 && pagenum != maxPage()) {
            const nam = worlds.world_nams[pagenum-extraPages-2]
            worlds.load(nam)
        } else return;
        nxttog = true
    }
    if (keys['Backspace'] && !lastks['Backspace']) {
        if (pagenum <= extraPages+2 || pagenum == maxPage()) return;
        const nam = worlds.world_nams[pagenum-extraPages-2]
        if (worlds.delworld(nam)) {
            pagenum = extraPages+2
            redraw()
        }
    }
    if (keys['='] && !lastks['=']) {
        if (pagenum <= extraPages+1 || pagenum == maxPage()) return;
        const nam = worlds.world_nams[pagenum-extraPages-2]
        worlds.copyworld(nam)
        goCurWorld()
        redraw()
        return;
    }
    if (keys['e'] && !lastks['e']) {
        if (pagenum <= extraPages+1 || pagenum == maxPage()) return;
        const nam = worlds.world_nams[pagenum-extraPages-2]
        worlds.expor(nam)
        return;
    }
    if (keys['i'] && !lastks['i']) {
        worlds.impor()
        return;
    }
    var topage = marks.find(it=>{ return keys[it[1]] && !lastks[it[1]] })
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

