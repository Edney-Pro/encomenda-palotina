// matrix.js - Easter Egg Matrix Rain
function showMatrix() {
    const canvas = document.createElement('canvas');
    canvas.id = 'matrix-canvas';
    document.body.appendChild(canvas);
    canvas.style.display = 'block';

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%";
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = Array.from({length: columns}, () => 1);

    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0F0';
        ctx.font = `${fontSize}px arial`;

        drops.forEach((y, i) => {
            const text = matrix[Math.floor(Math.random() * matrix.length)];
            ctx.fillText(text, i * fontSize, y * fontSize);
            if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        });
    }

    const interval = setInterval(draw, 33);
    setTimeout(() => {
        canvas.remove();
        clearInterval(interval);
    }, 10000); // Fecha após 10s
}