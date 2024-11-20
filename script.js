let snowflakes = [];
let mic;
let started = false;
let fft;
let prevSpectrum = [];
const sensitivity = 8;
const smoothingFactor = 0.3;

function setup() {
    createCanvas(windowWidth, windowHeight);
    for (let i = 0; i < 300; i++) {
        snowflakes.push(new Snowflake());
    }
    mic = new p5.AudioIn();
    fft = new p5.FFT(0.4, 512);
    fft.setInput(mic);
    noFill();
    strokeWeight(2);
    for (let i = 0; i < 512; i++) {
        prevSpectrum[i] = 0;
    }
}

function draw() {
    background(0);
    for (let flake of snowflakes) {
        flake.update();
        flake.display();
    }
    if (!started) {
        stroke(200);
        textAlign(CENTER, CENTER);
        textSize(16);
        text('Click to start microphone input', width / 2, height / 2);
        return;
    }
    let spectrum = fft.analyze();
    let vol = mic.getLevel();
    stroke(50);
    line(0, height / 2, width, height / 2);
    noFill();
    for (let i = 0; i < spectrum.length; i++) {
        prevSpectrum[i] = lerp(prevSpectrum[i], spectrum[i], smoothingFactor);
        let ampValue = prevSpectrum[i] * sensitivity;
        let r = sin(frameCount * 0.02 + i * 0.01) * 127 + 128;
        let g = sin(frameCount * 0.02 + i * 0.01 + PI / 2) * 127 + 128;
        let b = sin(frameCount * 0.02 + i * 0.01 + PI) * 127 + 128;
        let x = map(i, 0, spectrum.length, 0, width);
        let h = map(ampValue, 0, 255 * sensitivity, 0, height);
        strokeWeight(map(ampValue, 0, 255 * sensitivity, 1, 3));
        stroke(r, g, b);
        let y1 = height / 2 - h / 2;
        let y2 = height / 2 + h / 2;
        line(x, y1, x, y2);
        stroke(r, g, b, 50);
        strokeWeight(4);
        line(x, y1, x, y2);
    }
    let volHeight = vol * height * sensitivity;
    stroke(255);
    strokeWeight(2);
    line(width - 30, height / 2 + volHeight / 2, width - 10, height / 2 + volHeight / 2);
    line(width - 30, height / 2 - volHeight / 2, width - 10, height / 2 - volHeight / 2);
}

class Snowflake {
    constructor() {
        this.posX = random(width);
        this.posY = random(-height, 0);
        this.size = random(2, 5);
        this.speed = random(1, 3);
    }

    update() {
        this.posY += this.speed;
        if (this.posY > height) {
            this.posY = random(-50);
            this.posX = random(width);
        }
    }

    display() {
        fill(255);
        noStroke();
        ellipse(this.posX, this.posY, this.size);
    }
}

function mousePressed() {
    if (!started) {
        userStartAudio();
        mic.start();
        started = true;
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
