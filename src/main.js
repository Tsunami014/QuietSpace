const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

var x = 0
var y = 0
const units = 8 // How many units in one block (one block is 2x1 'blocks')

function getSizes() {
    var cols = Math.floor((canvas.width/canvas.height + 1) * 4)
    if (cols > 12) {
        cols = 12
    }
    var blk = Math.ceil(canvas.width/cols) // width
    blk -= blk%4
    const hblk = Math.floor(blk/2) // height or half width
    const rows = Math.floor(canvas.height/hblk)*2
    return [cols, rows, blk, hblk]
}


var tiles;
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
    const max = 5;
    var i = 0
    function nxt() {
        if (i >= max) {
            console.warn("Went over maximum by "+i)
        } else {
            drawLoading((++i)/max)
        }
    }
    tiles = await import("/src/tiles.js")
    resizeCanvas(true)
    nxt()
    await tiles.load(nxt)
    gen = await import("/src/gen.js")
    nxt()

    if (i < max-1) {
        console.warn("Went under maximum by "+(max-i))
    }
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.imageSmoothingEnabled = false

    const [cols, rows, blk, hblk] = getSizes()
    const qblk = Math.floor(blk/4) // half height (quarter width)

    var txoffs = Math.floor(Math.abs(x)/units)
    let xoffs = Math.round(Math.abs(x/units*blk)%blk)
    if (x < 0) {
        xoffs = -xoffs
    } else {
        txoffs = -txoffs
    }
    txoffs = Math.round(txoffs + cols/2)
    var tyoffs = Math.floor(Math.abs(y)/units)*2
    let yoffs = Math.round(Math.abs(y/units*hblk)%hblk)
    if (y < 0) {
        yoffs = -yoffs
    } else {
        tyoffs = -tyoffs
    }
    tyoffs = Math.round(tyoffs+rows/2)

    for (let i = -3; i < rows+6; i++) {
        const offs = (i+tyoffs)%2 == 0 ? 0 : 0.5
        for (let j = -2; j < cols+3; j++) {
            const tx = j-txoffs
            const ty = i-tyoffs
            const source = tiles.getTile(gen.getTile(tx, ty), gen.hash(-1, tx, ty))
            if (source) {
                ctx.drawImage(source,
                    blk*(j-offs)-hblk - xoffs, qblk*i - yoffs,
                    blk+1, hblk+1)
            }
        }
    }
}

// Keep keys in a dict
const keys = {}
window.addEventListener('keydown', (e) => keys[e.key] = true)
window.addEventListener('keyup', (e) => keys[e.key] = false)

const speed = 0.5
const speeddiag = Math.sqrt(5)*speed/2
function tick() {
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        resizeCanvas(true)
        if (!tiles.pixel) {
            tiles.reloadAllTiles().then(()=>{ draw();tick() })
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
        y += (diag? speeddiag:speed*2)*dy
        draw()
    }
    requestAnimationFrame(tick)
}


function resizeCanvas(setTles) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (setTles) {
        const [cols, rows, blk, hblk] = getSizes()
        tiles.setTleSzes(blk, hblk)
    }
}

async function init() {
    resizeCanvas();
    drawLoading(0);
    await load()
    draw()
    tick()
}
init()
