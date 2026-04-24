const c = document.getElementById('canvas');
const ctx = canvas.getContext('2d');


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    ctx.fillStyle = 'cornflowerblue';
    ctx.fillRect(canvas.width / 4, canvas.height / 4, canvas.width / 2, canvas.height / 2);
}


function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial draw
