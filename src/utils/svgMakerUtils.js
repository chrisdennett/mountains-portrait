import {
  createCroppedCanvas,
  createSharperCanvas,
  createSmallCanvas,
} from "./utils";

export const getBlockData = ({
  sourceImg,
  pixelsWide,
  sharpAdjust,
  ...otherParams
}) => {
  const crop = {
    left: otherParams.cropLeft,
    right: otherParams.cropRight,
    top: otherParams.cropTop,
    bottom: otherParams.cropBottom,
  };

  const croppedCanvas = createCroppedCanvas(sourceImg, crop, "red");

  const smallCanvas = createSmallCanvas(croppedCanvas, pixelsWide);
  const sharpCanvas =
    sharpAdjust > 0
      ? createSharperCanvas(smallCanvas, sharpAdjust)
      : smallCanvas;

  const { width: inputW, height: inputH } = sharpCanvas;

  const inputCtx = sharpCanvas.getContext("2d");
  let imgData = inputCtx.getImageData(0, 0, inputW, inputH);
  let pixels = imgData.data;
  const blocks = [];

  let r, g, b, a, brightness;
  let row = [];

  for (let y = 0; y < inputH; y++) {
    for (let x = 0; x < inputW; x++) {
      const i = (y * inputW + x) * 4;

      r = pixels[i];
      g = pixels[i + 1];
      b = pixels[i + 2];
      a = pixels[i + 3];

      let alpha = 255;

      let fraction = brightness / 255;
      brightness = r * 0.2126 + g * 0.7152 + b * 0.0722;
      if (a < 255) {
        brightness = 0;
        alpha = 0;
        fraction = 0;
      }

      row.push({ brightness, x, y, alpha, fraction });
    }

    blocks.push(row);
    row = [];
  }

  return blocks;
};

export const getSheetData = ({ blockData, blockSize }) => {
  const sheetHeight = 210;
  const sheetWidth = 148;
  const rowsInSheet = Math.floor(sheetHeight / blockSize);
  const colsInSheet = Math.floor(sheetWidth / blockSize);

  const totalRows = blockData.length;
  const totalCols = blockData[0].length;

  const sheetsAcross = Math.ceil(totalCols / colsInSheet);
  const sheetsDown = Math.ceil(totalRows / rowsInSheet);

  const sheetData = getSheetMetaData({
    rowsInSheet,
    colsInSheet,
    sheetsAcross,
    sheetsDown,
  });

  console.log("sheetData: ", sheetData);

  for (let r = 0; r < totalRows; r++) {
    for (let c = 0; c < totalCols; c++) {
      // find

      if (
        r >= sheetData[0].startRow &&
        r <= sheetData[0].endRow &&
        c >= sheetData[0].startCol &&
        c <= sheetData[0].endCol
      ) {
        const sheetRow = r - sheetData[0].startRow;
        const sheetCol = c - sheetData[0].startCol;

        sheetData[0].sheetBlockData[sheetRow][sheetCol] = blockData[r][c];

        // if it's the last one add the next cell to know where to end the line
        if (c === sheetData[0].endCol) {
          //
          if (c + 1 < totalCols) {
            sheetData[0].sheetBlockData[sheetRow][sheetCol].endCellConnection =
              blockData[r][c + 1];
          }
        }
      }
    }
  }

  return sheetData;
};

const getSheetMetaData = ({
  rowsInSheet,
  colsInSheet,
  sheetsAcross,
  sheetsDown,
}) => {
  const sheetData = [];

  for (let sr = 0; sr < sheetsDown; sr++) {
    for (let sc = 0; sc < sheetsAcross; sc++) {
      const sheetBlockData = new Array(rowsInSheet);

      for (let sr = 0; sr < sheetBlockData.length; sr++) {
        sheetBlockData[sr] = new Array(colsInSheet);
      }

      const startRow = sr * rowsInSheet;
      const endRow = startRow + rowsInSheet - 1;
      const startCol = sc * colsInSheet;
      const endCol = startCol + colsInSheet - 1;

      const sheet = {
        startRow,
        endRow,
        startCol,
        endCol,
        sheetBlockData,
      };
      sheetData.push(sheet);
    }
  }

  return sheetData;
};

export const createBlockCanvas = (blockData, blockSize = 7) => {
  const outputCanvas = document.createElement("canvas");
  const totalRows = blockData.length;
  const totalCols = blockData[0].length;
  outputCanvas.width = totalCols * blockSize;
  outputCanvas.height = totalRows * blockSize;
  const outputCtx = outputCanvas.getContext("2d");

  for (let y = 0; y < totalRows; y++) {
    for (let x = 0; x < totalCols; x++) {
      const block = blockData[y][x];

      const { brightness, alpha } = block;

      const xPos = block.x * blockSize;
      const yPos = block.y * blockSize;

      outputCtx.fillStyle = `rgba(${brightness},${brightness},${brightness}, ${alpha})`;
      outputCtx.fillRect(xPos, yPos, blockSize, blockSize);
    }
  }

  return outputCanvas;
};
