const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

var x = 0
var y = 0
const units = 8 // How many units in one block (one block is 2x1 'blocks')

function getSizes() {
    // Edit this to change the screen sizing ratio
    var cols = Math.floor((canvas.width/canvas.height + 1) * 3.4)
    if (cols > 12) {
        cols = 12
    }
    var blk = Math.floor(canvas.width/cols) // width
    blk -= blk%4
    const hblk = Math.floor(blk/2) // height or half width
    const qblk = Math.floor(blk/4) // half height (quarter width)
    const rows = Math.floor(canvas.height/qblk)
    return [cols, rows, blk, hblk, qblk]
}


var tiles;
var player;
var gen;

const pbhei = 40
const pbgap = 4
function drawLoading(progress) {
    resizeCanvas();
    const pbx = canvas.width / 6
    const pby = (canvas.height - pbhei) / 2;
    const pbwid = canvas.width - pbx*2;
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    ctx.font = "bold 32px sans serif";
    ctx.fillStyle = "black";
    ctx.fillText("Loading...", pbx, pby-32-2);
    ctx.beginPath()
    ctx.roundRect(pbx, pby, pbwid, pbhei, pbhei/3);
    ctx.fill();
    ctx.fillStyle = 'cornflowerblue';
    const nhei = pbhei - pbgap*2
    ctx.beginPath()
    ctx.roundRect(pbx+pbgap, pby+pbgap, (pbwid - pbgap*2)*progress, nhei, nhei/3);
    ctx.fill();
}

async function load() {
    const max = 10;
    var i = 0
    function nxt() {
        if (i <= max) {
            drawLoading(i/max)
        }
        i++
    }
    tiles = await import("/src/tiles.js")
    resizeCanvas(true)
    nxt()
    await tiles.load(nxt)
    gen = await import("/src/gen.js")
    nxt()
    player = await import("/src/player.js")
    nxt()
    await player.load(nxt)
    nxt()

    if (i > max) {
        console.warn("Went over maximum by "+(i-max)+" (should be "+i+")")
    } else if (i < max) {
        console.warn("Went under maximum by "+(max-i)+" (should be "+i+")")
    }
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.imageSmoothingEnabled = false

    // Calculate offsets
    const [cols, rows, blk, hblk, qblk] = getSizes()
    player.scale(hblk)

    const xtile = Math.floor(x/units)
    const ytile = Math.floor(y/units)
    const txoffs = Math.floor(cols/2 - xtile)
    const tyoffs = Math.floor(rows/2 - ytile)
    const xoffs = Math.abs(canvas.width - cols*blk)/2
        - (x/units - xtile)*blk
        - hblk*(cols%2)
    const yoffs = Math.abs(canvas.height - rows*qblk)/2
        - (y/units - ytile)*qblk
        - qblk + (qblk/2)*(rows%2)

    // Draw all the tiles
    for (let i = -3; i < rows+6; i++) {
        const offs = (i+tyoffs)%2 == 0 ? 0 : 0.5
        for (let j = -2; j < cols+3; j++) {
            const tx = j-txoffs
            const ty = i-tyoffs
            const source = tiles.getTile(gen.getTile(tx, ty), gen.hash(-1, tx, ty))
            if (source) {
                const xpos = blk*(j-offs) + xoffs
                const ypos = qblk*i + yoffs
                const wid = source.wid * blk
                const hei = source.hei * hblk
                ctx.drawImage(source.img,
                    xpos-wid+hblk, ypos-hei+hblk,
                    wid+(tiles.pixel?0:1), hei+(tiles.pixel?0:1))
            }
        }
    }
}

// Keep keys in a dict
const keys = {}
window.addEventListener('keydown', (e) => keys[e.key] = true)
window.addEventListener('keyup', (e) => keys[e.key] = false)

const speed = 0.2
const speeddiag = Math.sqrt(5)*speed/2
function tick() {
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        resizeCanvas(true)
        if (!tiles.pixel) {
            player.hide()
            tiles.reloadAllTiles().then(()=>{
                draw()
                player.show()
                tick()
            })
            return
        }
        draw()
    }
    var dx = 0
    var dy = 0
    if (keys['ArrowUp'])    dy = -1
    if (keys['ArrowDown'])  dy = 1
    if (keys['ArrowLeft'])  dx = -1
    if (keys['ArrowRight']) dx = 1
    if (dx != 0 || dy != 0) {
        let diag = (dx != 0 && dy != 0)
        x += (diag? speeddiag:speed)*dx
        y += (diag? speeddiag:speed*2)*dy*2
        draw()
    }
    requestAnimationFrame(tick)
}


function resizeCanvas(setTles) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (setTles) {
        const [cols, rows, blk, hblk, qblk] = getSizes()
        tiles.setTleSzes(blk, hblk)
    }
}

async function init() {
    resizeCanvas();
    drawLoading(0);
    await load()
    draw()
    player.show()
    tick()
}
init()
