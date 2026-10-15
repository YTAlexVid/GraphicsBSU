function rgb2cmyk(r, g, b) {
    const k = Math.min(1 - r / 255, 1 - g / 255, 1 - b / 255);
    if (k === 1) return [0, 0, 0, 1];
    const c = (1 - r / 255 - k) / (1 - k);
    const m = (1 - g / 255 - k) / (1 - k);
    const y = (1 - b / 255 - k) / (1 - k);
    return [c, m, y, k];
}

function cmyk2rgb(c, m, y, k) {
    const r = 255 * (1 - c) * (1 - k);
    const g = 255 * (1 - m) * (1 - k);
    const b = 255 * (1 - y) * (1 - k);
    return [r, g, b];
}

function hsv2rgb(h, s, v) {
    if (s === 0) {
        const gray = 255 * v;
        return [gray, gray, gray];
    }

    h = h === 360 ? 0 : h / 60;

    const i = Math.floor(h);
    const f = h - i;
    const m = v * (1 - s);
    const n = v * (1 - s * f);
    const k = v * (1 - s * (1 - f));

    let r, g, b;
    switch (i) {
        case 0: [r, g, b] = [v, k, m]; break;
        case 1: [r, g, b] = [n, v, m]; break;
        case 2: [r, g, b] = [m, v, k]; break;
        case 3: [r, g, b] = [m, n, v]; break;
        case 4: [r, g, b] = [k, m, v]; break;
        case 5: [r, g, b] = [v, m, n]; break;
    }
    return [255 * r, 255 * g, 255 * b];
}

function rgb2hsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;

    const v = max;
    const s = max === 0 ? 0 : d / max;

    let h = 0;
    if (d !== 0) {
        if (max === r) h = 60 * (((g - b) / d) % 6);
        else if (max === g) h = 60 * ((b - r) / d + 2);
        else h = 60 * ((r - g) / d + 4);
        if (h < 0) h += 360;
    }
    return [h, s, v];
}
