const models = {
    rgb: ['r', 'g', 'b'],
    cmyk: ['c', 'm', 'y', 'k'],
    hsv: ['h', 's', 'v'],
};
const max = {r: 255, g: 255, b: 255, c: 100, m: 100, y: 100, k: 100, h: 360, s: 100, v: 100};

const $ = id => document.getElementById(id);

function read(model) {
    return models[model].map(id => Number($(id).value));
}

function write(model, values) {
    models[model].forEach((id, i) => {
        $(id).value = Math.round(values[i]);
        $(id + '-range').value = values[i];
    });
}

function toRgb(model, v) {
    if (model === 'rgb') return v;
    if (model === 'cmyk') return cmyk2rgb(v[0] / 100, v[1] / 100, v[2] / 100, v[3] / 100);
    return hsv2rgb(v[0], v[1] / 100, v[2] / 100);
}

function showColor(rgb, source) {
    $('preview').style.background = `rgb(${rgb.map(Math.round)})`;
    $('rgb-palette').value = '#' + rgb.map(x => Math.round(x).toString(16).padStart(2, '0')).join('');

    if (source !== 'rgb') write('rgb', rgb);
    if (source !== 'cmyk') write('cmyk', rgb2cmyk(...rgb).map(x => x * 100));
    if (source !== 'hsv') {
        const [h, s, v] = rgb2hsv(...rgb);
        write('hsv', [h, s * 100, v * 100]);
    }
    drawPalettes();
}

function changed(model) {
    const error = document.querySelector(`#${model} .error`);
    for (const id of models[model]) {
        const text = $(id).value.trim();
        const valid = text !== '' && !isNaN(text) && text >= 0 && text <= max[id];
        $(id).classList.toggle('invalid', !valid);
        if (!valid) {
            error.textContent = `${id.toUpperCase()}: enter a number from 0 to ${max[id]}`;
            return;
        }
    }
    error.textContent = '';
    showColor(toRgb(model, read(model)), model);
}

function drawCanvas(canvas, colorAt) {
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(canvas.width, canvas.height);
    for (let py = 0; py < canvas.height; py++) {
        for (let px = 0; px < canvas.width; px++) {
            const rgb = colorAt(px / canvas.width, 1 - py / canvas.height);
            img.data.set([...rgb, 255], (py * canvas.width + px) * 4);
        }
    }
    ctx.putImageData(img, 0, 0);
}

function drawMarker(canvas, x, y) {
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(x * canvas.width, (1 - y) * canvas.height, 4, 0, 2 * Math.PI);
    ctx.strokeStyle = 'black';
    ctx.stroke();
}

function drawPalettes() {
    const [, , y, k] = read('cmyk');
    const h = read('hsv')[0];
    drawCanvas($('cmyk-palette'), (x, yy) => cmyk2rgb(x, yy, y / 100, k / 100));
    drawCanvas($('hsv-palette'), (x, yy) => hsv2rgb(h, x, yy));
    drawMarker($('cmyk-palette'), read('cmyk')[0] / 100, read('cmyk')[1] / 100);
    drawMarker($('hsv-palette'), read('hsv')[1] / 100, read('hsv')[2] / 100);
}

function pickFromCanvas(canvas, model, xIndex, yIndex, e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, 1 - (e.clientY - rect.top) / rect.height));
    const values = read(model);
    values[xIndex] = x * max[models[model][xIndex]];
    values[yIndex] = y * max[models[model][yIndex]];
    write(model, values);
    showColor(toRgb(model, values), model);
}

for (const model in models) {
    for (const id of models[model]) {
        $(id).addEventListener('input', () => changed(model));
        $(id + '-range').addEventListener('input', () => {
            $(id).value = $(id + '-range').value;
            changed(model);
        });
    }
}

$('rgb-palette').addEventListener('input', e => {
    const n = parseInt(e.target.value.slice(1), 16);
    const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    write('rgb', rgb);
    showColor(rgb, 'rgb');
});

for (const [model, xIndex, yIndex] of [['cmyk', 0, 1], ['hsv', 1, 2]]) {
    const canvas = $(model + '-palette');
    canvas.addEventListener('mousedown', e => pickFromCanvas(canvas, model, xIndex, yIndex, e));
    canvas.addEventListener('mousemove', e => {
        if (e.buttons === 1) pickFromCanvas(canvas, model, xIndex, yIndex, e);
    });
}

write('rgb', [255, 0, 0]);
changed('rgb');
