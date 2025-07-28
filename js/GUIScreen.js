// js/GUIScreen.js
class GUIScreen {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        // <-- Обновленный путь к текстуре шрифта
        this.fontImage = new Image();
        this.fontImage.src = 'res/ZT/default.png'; // Load font texture
        this.charMap = this.createCharMap();
    }

    createCharMap() {
        // Based on the original getCharId logic
        const map = {};
        for (let i = 0; i <= 9; i++) map[String(i)] = i;
        for (let i = 0; i < 26; i++) map[String.fromCharCode('a'.charCodeAt(0) + i)] = 10 + i;
        for (let i = 0; i < 26; i++) map[String.fromCharCode('A'.charCodeAt(0) + i)] = 10 + i; // Same as lowercase
        map[':'] = 36;
        map[' '] = 37;
        map['/'] = 38;
        map['!'] = 39;
        return map;
    }

    render(score, wave, zombieCount) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.renderText(`Score: ${score}`, 20, 30);
        this.renderText(`Wave: ${wave}`, 20, 60);
        this.renderText(`Zombies: ${zombieCount}`, 20, 90);
    }

    renderMenu(isMouseOverButton) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw noise background
        this.drawNoiseBackground();

        // Draw logo
        this.drawLogo();

        // Draw PLAY button
        const buttonX = 350;
        const buttonY = 300;
        const buttonWidth = 100;
        const buttonHeight = 40;
        
        this.ctx.fillStyle = isMouseOverButton ? '#ff5555' : '#ffffff'; // Example highlight
        this.ctx.font = '24px Arial'; // Fallback font until texture is loaded
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Wait for font image to load before drawing textured text
        if (this.fontImage.complete) {
             // For simplicity, we'll draw plain text here.
             // A full implementation would draw the text using the font texture.
             this.ctx.fillText('PLAY', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
        } else {
             this.fontImage.onload = () => {
                 // Redraw when font is loaded
                 // This is a simplification, ideally you'd redraw the whole menu
                 // or manage state to know when to redraw.
                 // For now, we rely on the fallback font or next frame redraw.
                 this.ctx.fillText('PLAY', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
             };
             // Draw with fallback until loaded
             this.ctx.fillText('PLAY', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
        }
    }

    drawNoiseBackground() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#ffffff'; // Base color for points
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const intensity = 0.2 + Math.random() * 0.3;
            this.ctx.fillStyle = `rgb(${Math.floor(intensity * 255)},${Math.floor(intensity * 255)},${Math.floor(intensity * 255)})`;
            this.ctx.fillRect(x, y, 2, 2); // Draw as small rectangles
        }
    }

    drawLogo() {
        // <-- Обновленный путь к текстуре логотипа
        const logoImg = new Image();
        logoImg.src = 'res/ZT/logo.png';
        // Draw when loaded
        logoImg.onload = () => {
            const logoWidth = 232;
            const logoHeight = 36;
            const logoX = (this.canvas.width - logoWidth) / 2;
            const logoY = 150;
            this.ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
        };
        // If already loaded (e.g., on redraw), draw immediately
        if (logoImg.complete) {
            const logoWidth = 232;
            const logoHeight = 36;
            const logoX = (this.canvas.width - logoWidth) / 2;
            const logoY = 150;
            this.ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
        }
    }


    renderText(text, x, y) {
        // Simplified text rendering using canvas font
        // A full implementation would use the font texture.
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial'; // Adjust size as needed
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(text, x, y);
        
        /*
        // Placeholder for texture-based rendering logic
        if (!this.fontImage.complete) return;

        const CHAR_WIDTH = 16;
        const CHAR_HEIGHT = 16;
        const TEXTURE_SIZE = 128;
        const texelSize = 8.0 / TEXTURE_SIZE;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charId = this.charMap[char] !== undefined ? this.charMap[char] : 37; // Default to space
            const cx = charId % 16;
            const cy = Math.floor(charId / 16);

            const sx = cx * 8; // Source x on texture
            const sy = cy * 8; // Source y on texture
            const sw = 8;     // Source width
            const sh = 8;     // Source height

            const dx = x + i * CHAR_WIDTH; // Destination x
            const dy = y;                  // Destination y
            const dw = CHAR_WIDTH;         // Destination width
            const dh = CHAR_HEIGHT;        // Destination height

            this.ctx.drawImage(this.fontImage, sx, sy, sw, sh, dx, dy, dw, dh);
        }
        */
    }
}