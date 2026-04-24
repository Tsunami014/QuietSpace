const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

var tiles;

const pbhei = 40
const pbgap = 4
function drawLoading(progress) {
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
    const max = 6;
    var i = 0
    function nxt() {
        if (i >= max) {
            console.warn("Went over maximum by "+i)
        } else {
            drawLoading((++i)/max)
        }
    }
    tiles = await import("/src/tiles.js")
    nxt()
    await tiles.load(nxt)

    if (i < max-1) {
        console.warn("Went under maximum by "+(max-i))
    }
}


var x = 0
var y = 0
const units = 8 // How many units in one block (one block is 2x1 'blocks')

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    var cols = Math.floor((canvas.width/canvas.height + 1) * 4)
    if (cols > 12) {
        cols = 12
    }
    const blk = Math.ceil(canvas.width/cols) // width
    const hblk = Math.floor(blk/2) // height or half width
    const qblk = Math.floor(blk/4) // half height (quarter width)
    const rows = Math.floor(canvas.height/hblk)*2

    const xoffs = (x%units)/units * blk
    const yoffs = (y%units)/units * hblk

    for (let i = 0; i < rows; i++) {
        const offs = i%2 == 0 ? 0 : 0.5
        for (let j = 0; j < cols; j++) {
            const source = tiles.getTile("road")
            if (source) {
                const xpos = blk*(j-offs) - xoffs
                const ypos = qblk*i - yoffs
                ctx.drawImage(...source, xpos, ypos, blk+2, hblk+2)
            }
        }
    }
}

// Keep keys in a dict
const keys = {}
window.addEventListener('keydown', (e) => keys[e.key] = true)
window.addEventListener('keyup', (e) => keys[e.key] = false)

const speed = 0.5
function tick() {
    var oldx = x
    var oldy = y
    if (keys['ArrowUp']) {
        y -= speed*2
    }
    if (keys['ArrowDown']) {
        y += speed*2
    }
    if (keys['ArrowLeft']) {
        x -= speed
    }
    if (keys['ArrowRight']) {
        x += speed
    }
    if (oldx != x || oldy != y) {
        draw()
    }
}


function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);

async function init() {
    resizeCanvas();
    drawLoading(0);
    await load()
    draw()
    setInterval(tick, 17)
}
init()
