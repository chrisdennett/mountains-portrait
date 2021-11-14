const DEFAULT_CROP_VALUES = {
  leftPercent: 0,
  rightPercent: 1,
  topPercent: 0,
  bottomPercent: 1,
};

export const createCroppedCanvas = (
  sourceCanvas,
  cropData,
  backgroundColour = "red"
) => {
  // if there's no cropping just return the sourceCanvas unchanged
  if (!cropData || cropData === DEFAULT_CROP_VALUES) {
    return sourceCanvas;
  }

  const { top, right, bottom, left } = cropData;
  const { width: sourceWidth, height: sourceHeight } = sourceCanvas;

  const outputCanvas = document.createElement("canvas");

  const leftCrop = sourceWidth * left;
  const rightCrop = sourceWidth * (1 - right);
  const topCrop = sourceHeight * top;
  const bottomCrop = sourceHeight * (1 - bottom);
  let croppedWidth = sourceCanvas.width - (leftCrop + rightCrop);
  let croppedHeight = sourceCanvas.height - (topCrop + bottomCrop);

  outputCanvas.width = croppedWidth;
  outputCanvas.height = croppedHeight;

  const ctx = outputCanvas.getContext("2d");

  ctx.fillStyle = backgroundColour;
  ctx.clearRect(0, 0, croppedWidth, croppedHeight);

  ctx.drawImage(
    sourceCanvas,
    leftCrop,
    topCrop,
    croppedWidth,
    croppedHeight,
    0,
    0,
    croppedWidth,
    croppedHeight
  );

  return outputCanvas;
};

export const createSmallCanvas = (source, maxWidth, maxHeight) => {
  const sourceW = source.width;
  const sourceH = source.height;

  const wToHRatio = sourceH / sourceW;
  const hToWRatio = sourceW / sourceH;

  // allow maxHeight or maxWidth to be null
  if (!maxWidth) maxWidth = source.width;
  if (!maxHeight) maxHeight = source.height;

  let targetW = maxWidth;
  let targetH = targetW * wToHRatio;

  if (sourceH > maxHeight) {
    targetH = maxHeight;
    targetW = targetH * hToWRatio;
  }

  const smallCanvas = document.createElement("canvas");
  const ctx = smallCanvas.getContext("2d");
  smallCanvas.width = targetW;
  smallCanvas.height = targetH;

  ctx.drawImage(source, 0, 0, sourceW, sourceH, 0, 0, targetW, targetH);

  return smallCanvas;
};

export const drawCanvas = (ctx, source) => {
  if (!ctx || !source) return;

  ctx.drawImage(source, 0, 0);
};

// const getRandomColour = () => {
//   const hue = Math.random() * 255;
//   return `hsl(${hue}, ${190}%, ${20}%)`;
// };

export const createImageCanvas = (img) => {
  const { width: inputW, height: inputH } = img;

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = inputW;
  outputCanvas.height = inputH;
  const outputCtx = outputCanvas.getContext("2d");
  outputCtx.drawImage(img, 0, 0);

  return outputCanvas;
};

export const createRestrictedSizeCanvas = (
  inputCanvas,
  maxHeight,
  maxWidth
) => {
  const { width: inputW, height: inputH } = inputCanvas;
  const inputWidthToHeightRatio = inputH / inputW;
  const inputHeightToWidthRatio = inputW / inputH;

  let outputW = inputW > maxWidth ? maxWidth : inputW;
  let outputH = outputW * inputWidthToHeightRatio;

  if (outputH > maxHeight) {
    outputH = maxHeight;
    outputW = outputH * inputHeightToWidthRatio;
  }

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = outputW;
  outputCanvas.height = outputH;
  copyToCanvas(inputCanvas, outputCanvas);

  return outputCanvas;
};

export const copyToCanvas = (inputCanvas, outputCanvas, copySize = false) => {
  const { width: inputW, height: inputH } = inputCanvas;

  if (copySize) {
    outputCanvas.width = inputW;
    outputCanvas.height = inputH;
  }

  const outputCtx = outputCanvas.getContext("2d");
  const { width: outputW, height: outputH } = outputCanvas;

  outputCtx.drawImage(
    inputCanvas,
    0,
    0,
    inputW,
    inputH,
    0,
    0,
    outputW,
    outputH
  );
};

export const createGreyScaleCanvas = (inputCanvas) => {
  const pixelFunction = ({ r, g, b }) => {
    const grey = (r + g + b) / 3;
    return { r2: grey, g2: grey, b2: grey };
  };

  return createPixelManipulatedCanvas({ inputCanvas, pixelFunction });
};

export const createRGBThresholdCanvas = (inputCanvas) => {
  const pixelFunction = ({ r, g, b }) => {
    const r2 = r > 127 ? 255 : 0;
    const g2 = g > 127 ? 255 : 0;
    const b2 = b > 127 ? 255 : 0;
    return { r2, g2, b2 };
  };

  return createPixelManipulatedCanvas({ inputCanvas, pixelFunction });
};

export const createContrastCanvas = (inputCanvas) => {
  const threshold = 10;
  const contrast = threshold * 2.55; // or *= 255 / 100; scale integer percent to full range
  const contrastFactor = (255 + contrast) / (255.01 - contrast); //add .1 to avoid /0 error

  const pixelFunction = ({ r, g, b }) => {
    const r2 = contrastFactor * (r - 128) + 128;
    const g2 = contrastFactor * (g - 128) + 128;
    const b2 = contrastFactor * (b - 128) + 128;
    return { r2, g2, b2 };
  };

  return createPixelManipulatedCanvas({ inputCanvas, pixelFunction });
};

export const createThresholdCanvas = (inputCanvas) => {
  const pixelFunction = ({ r, g, b }) => {
    const avg = (r + g + b) / 3;
    const value = avg > 127 ? 255 : 0;
    return { r2: value, g2: value, b2: value };
  };

  return createPixelManipulatedCanvas({ inputCanvas, pixelFunction });
};

const createPixelManipulatedCanvas = ({ inputCanvas, pixelFunction }) => {
  const { width: inputW, height: inputH } = inputCanvas;
  const inputCtx = inputCanvas.getContext("2d");
  let imgData = inputCtx.getImageData(0, 0, inputW, inputH);
  let pixels = imgData.data;
  let r, g, b;
  for (let i = 0; i < pixels.length; i += 4) {
    r = pixels[i];
    g = pixels[i + 1];
    b = pixels[i + 2];

    const { r2, g2, b2 } = pixelFunction({ r, g, b });

    pixels[i] = r2;
    pixels[i + 1] = g2;
    pixels[i + 2] = b2;
  }

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = inputW;
  outputCanvas.height = inputH;
  const outputCtx = outputCanvas.getContext("2d");
  outputCtx.putImageData(imgData, 0, 0);

  return outputCanvas;
};

export const createSharperCanvas = (inputCanvas, sharpenBy = 4) => {
  const centerVal = sharpenBy;
  const sideVal = 0 - (sharpenBy - 1) / 4;

  const weights = [0, sideVal, 0, sideVal, centerVal, sideVal, 0, sideVal, 0];

  return createConvolutionFilterCanvas({ inputCanvas, weights });
};

export const createMaxHueCanvas = (inputCanvas) => {
  const pixelFunction = ({ r, g, b }) => {
    const { h, l } = rgbToHsl({ r, g, b });

    // full saturation
    const s2 = 1;

    // if lightness below threshold, make it black
    // if it's higher than a threshold make it white
    // otherwise set it in the middle
    let l2 = l;

    const lowerThreshold = 0.34;
    const upperThreshold = 0.58;
    //
    if (l < lowerThreshold) {
      l2 = 0;
    } else if (l > upperThreshold) {
      l2 = 1;
    } else {
      l2 = 0.5;
    }

    // full saturation
    // if (s < 0.5) s2 = 0;
    // else s2 = 1;

    const { r: r2, g: g2, b: b2 } = hslToRgb({ h, s: s2, l: l2 });

    return { r2, g2, b2 };
  };

  return createPixelManipulatedCanvas({ inputCanvas, pixelFunction });
};

export const createBlurredCanvas = (inputCanvas, blur = 3) => {
  const matrixSize = blur * blur;
  const val = 1 / matrixSize;
  const weights = Array(matrixSize).fill(val);

  return createConvolutionFilterCanvas({ inputCanvas, weights });
};

const createConvolutionFilterCanvas = ({ inputCanvas, weights }) => {
  const { width: inputW, height: inputH } = inputCanvas;
  const inputCtx = inputCanvas.getContext("2d");
  let inputImgData = inputCtx.getImageData(0, 0, inputW, inputH);
  let inputPixels = inputImgData.data;

  convolute(inputPixels, weights, true, inputW, inputH);

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = inputW;
  outputCanvas.height = inputH;
  const outputCtx = outputCanvas.getContext("2d");
  outputCtx.putImageData(inputImgData, 0, 0);

  return outputCanvas;
};

const convolute = (pixels, weights, opaque, w, h) => {
  const pixelsCopy = pixels.slice(0);

  const side = Math.round(Math.sqrt(weights.length));
  const halfSide = Math.floor(side / 2);

  const alphaFac = opaque ? 1 : 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sy = y;
      const sx = x;
      const dstOff = (y * w + x) * 4;
      // calculate the weighed sum of the source image pixels that
      // fall under the convolution matrix
      let r = 0,
        g = 0,
        b = 0,
        a = 0;
      for (let cy = 0; cy < side; cy++) {
        for (let cx = 0; cx < side; cx++) {
          const scy = sy + cy - halfSide;
          const scx = sx + cx - halfSide;
          if (scy >= 0 && scy < h && scx >= 0 && scx < w) {
            const srcOff = (scy * w + scx) * 4;
            const wt = weights[cy * side + cx];
            r += pixelsCopy[srcOff] * wt;
            g += pixelsCopy[srcOff + 1] * wt;
            b += pixelsCopy[srcOff + 2] * wt;
            a += pixelsCopy[srcOff + 3] * wt;
          }
        }
      }
      pixels[dstOff] = r;
      pixels[dstOff + 1] = g;
      pixels[dstOff + 2] = b;
      pixels[dstOff + 3] = a + alphaFac * a;
    }
  }
};

export const createPosterizeCanvas = (inputCanvas, colorsize) => {
  const { width: inputW, height: inputH } = inputCanvas;
  const inputCtx = inputCanvas.getContext("2d");
  let imgData = inputCtx.getImageData(0, 0, inputW, inputH);

  const newImgData = posterize(imgData, colorsize);

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = inputW;
  outputCanvas.height = inputH;
  const outputCtx = outputCanvas.getContext("2d");
  outputCtx.putImageData(newImgData, 0, 0);

  return outputCanvas;
};

export const createDitheredCanvas = (inputCanvas) => {
  const { width: inputW, height: inputH } = inputCanvas;
  const inputCtx = inputCanvas.getContext("2d");
  let imgData = inputCtx.getImageData(0, 0, inputW, inputH);

  // "bayer"
  //const newImgData = dither2(imgData, 80, "floydsteinberg");
  const newImgData = dither2(imgData, 127, "bayer");
  // default is Atkinson
  //const newImgData = dither2(imgData);

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = inputW;
  outputCanvas.height = inputH;
  const outputCtx = outputCanvas.getContext("2d");
  outputCtx.putImageData(newImgData, 0, 0);

  return outputCanvas;
};

const posterize = (imgData, colorsize) => {
  colorsize = colorsize || 4;
  const pixelSize = imgData.width * imgData.height;
  let min = 255;
  let max = 0;
  let index;
  for (let i = 0; i < pixelSize; i++) {
    index = i * 4;
    if (imgData.data[index + 3] !== 0) {
      const value = imgData.data[index];
      if (value < min) {
        min = value;
      }
      if (value > max) {
        max = value;
      }
    }
  }
  const lookupTable = new Uint8Array(256);
  const colorWidth = (0.5 + (max - min) / colorsize) | 0;
  const stepSize = (0.5 + 256 / (colorsize - 1)) | 0;
  for (let level = 0; level < colorsize; level++) {
    for (let i = 0; i < colorWidth; i++) {
      index = min + colorWidth * level + i;
      let val = level * stepSize;
      if (val > 255) {
        val = 255;
      }
      lookupTable[index] = val;
    }
  }
  for (let i = index; i < 256; i++) {
    lookupTable[i] = 255;
  }

  for (let i = 0; i < pixelSize; i++) {
    index = i * 4;
    imgData.data[index] = lookupTable[imgData.data[index]];
    imgData.data[index + 1] = lookupTable[imgData.data[index + 1]];
    imgData.data[index + 2] = lookupTable[imgData.data[index + 2]];
    imgData.data[index + 3] = imgData.data[index + 3];
  }

  return imgData;
};

// https://stackoverflow.com/questions/3732046/how-do-you-get-the-hue-of-a-xxxxxx-colour
export const rgbToHsl = ({ red, green, blue }) => {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }

  // hue is in degrees, saturation and lightness in percentages
  return { hue: Math.round(h * 360), saturation: s * 100, lightness: l * 100 };
};

/*
  const dither = (imageData) => {
    // var bayerMap = [
    //   [  1,  9,  3, 11 ],
    //   [ 13,  5, 15,  7 ],
    //   [  4, 12,  2, 10 ],
    //   [ 16,  8, 14,  6 ]
    // ];
  
    var bayermatrix = [
      [0, 128, 32, 160],
      [192, 64, 224, 96],
      [48, 176, 16, 144],
      [240, 112, 208, 80],
    ];
  
    // const bayermatrix = [
    //   [15, 135, 45, 165],
    //   [195, 75, 225, 105],
    //   [60, 180, 30, 150],
    //   [240, 120, 210, 90]
    // ];
    for (let y = 0; y < imageData.height; y++) {
      for (let x = 0; x < imageData.width; x++) {
        const index = (x + y * imageData.width) * 4;
        if (imageData.data[index + 3] !== 0) {
          const level =
            imageData.data[index] > bayermatrix[y % 4][x % 4] ? 255 : 0;
          imageData.data[index] = level;
          imageData.data[index + 1] = level;
          imageData.data[index + 2] = level;
          imageData.data[index + 3] = 255;
        }
      }
    }
    return imageData;
  };
  */

// source: https://github.com/meemoo/meemooapp/blob/master/src/nodes/image-monochrome-worker.js
// https://kosamari.com/presentation/render-2016/#78
// https://github.com/kosamari/sweaterify/blob/master/assets/js/src/main.js
const bayerThresholdMap = [
  [15, 135, 45, 165],
  [195, 75, 225, 105],
  [60, 180, 30, 150],
  [240, 120, 210, 90],
];

// const halftoneMatrix = [
//   [10, 4, 6, 9],
//   [12, 0, 2, 14],
//   [7, 9, 11, 5],
//   [3, 15, 13, 1],
// ];

// const screwMatrix = [
//   [13, 7, 6, 12],
//   [8, 1, 0, 5],
//   [9, 2, 3, 4],
//   [14, 10, 11, 5],
// ];

// var bayerMap = [
//   [1, 9, 3, 11],
//   [13, 5, 15, 7],
//   [4, 12, 2, 10],
//   [16, 8, 14, 6],
// ];

// const bayer = [
//   [0, 8, 2, 10],
//   [12, 4, 14, 6],
//   [3, 11, 1, 9],
//   [15, 7, 13, 5],
// ];

const dither2 = (imageData, threshold, type) => {
  const imageDataLength = imageData.data.length;
  let lumR = [];
  var lumG = [];
  let lumB = [];
  for (let i = 0; i < 256; i++) {
    lumR[i] = i * 0.299;
    lumG[i] = i * 0.587;
    lumB[i] = i * 0.114;
  }

  // Greyscale luminance (sets r pixels to luminance of rgb)
  for (let i = 0; i <= imageDataLength; i += 4) {
    imageData.data[i] = Math.floor(
      lumR[imageData.data[i]] +
        lumG[imageData.data[i + 1]] +
        lumB[imageData.data[i + 2]]
    );
  }

  const w = imageData.width;
  let newPixel, err;

  for (
    let currentPixel = 0;
    currentPixel <= imageDataLength;
    currentPixel += 4
  ) {
    if (type === "none") {
      // No dithering
      imageData.data[currentPixel] =
        imageData.data[currentPixel] < threshold ? 0 : 255;
    } else if (type === "bayer") {
      // 4x4 Bayer ordered dithering algorithm
      const x = (currentPixel / 4) % w;
      const y = Math.floor(currentPixel / 4 / w);
      const map = Math.floor(
        (imageData.data[currentPixel] + bayerThresholdMap[x % 4][y % 4]) / 2
      );
      imageData.data[currentPixel] = map < threshold ? 0 : 255;
    } else if (type === "floydsteinberg") {
      // Floyd–Steinberg dithering algorithm
      newPixel = imageData.data[currentPixel] < 129 ? 0 : 255;
      err = Math.floor((imageData.data[currentPixel] - newPixel) / 16);
      imageData.data[currentPixel] = newPixel;

      imageData.data[currentPixel + 4] += err * 7;
      imageData.data[currentPixel + 4 * w - 4] += err * 3;
      imageData.data[currentPixel + 4 * w] += err * 5;
      imageData.data[currentPixel + 4 * w + 4] += err * 1;
    } else {
      // Bill Atkinson's dithering algorithm
      newPixel = imageData.data[currentPixel] < 129 ? 0 : 255;
      err = Math.floor((imageData.data[currentPixel] - newPixel) / 8);
      imageData.data[currentPixel] = newPixel;

      imageData.data[currentPixel + 4] += err;
      imageData.data[currentPixel + 8] += err;
      imageData.data[currentPixel + 4 * w - 4] += err;
      imageData.data[currentPixel + 4 * w] += err;
      imageData.data[currentPixel + 4 * w + 4] += err;
      imageData.data[currentPixel + 8 * w] += err;
    }

    // Set g and b pixels equal to r
    imageData.data[currentPixel + 1] = imageData.data[currentPixel + 2] =
      imageData.data[currentPixel];
  }

  return imageData;
};

const hue2rgb = (p, q, t) => {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
};

export const hslToRgb = ({ h, s, l }) => {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return { r: r * 255, g: g * 255, b: b * 255 };
};
