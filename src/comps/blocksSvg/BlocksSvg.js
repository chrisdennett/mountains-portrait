import React from "react";

export const BlocksSvg = ({
  pixelsWide,
  blockSize,
  blockData,
  showAsOutlines,
}) => {
  if (!blockData) return null;

  const paths = getPaths({ blockData, blockSize });

  const totalRows = blockData.length;
  const blocksHigh = blockData.length;
  let hueIncrement = 360 / totalRows;
  const fill = showAsOutlines ? "none" : "black";

  return (
    <svg width={pixelsWide * blockSize} height={blocksHigh * blockSize}>
      {paths.map((p, i) => (
        <path
          key={i}
          d={p}
          fill={fill}
          // fill={`hsl(${i * hueIncrement}, 100%, 30%)`}
          stroke={`hsl(${i * hueIncrement}, 100%, 30%)`}
          // stroke="none"
        />
      ))}
    </svg>
  );
};

export const getPaths = ({ blockData, blockSize }) => {
  const paths = [];

  const maxHeight = blockSize * 0.9;
  const minHeight = blockSize * 0.1;
  const totalRows = blockData.length;
  const totalCols = blockData[0].length;

  for (let r = 0; r < totalRows; r++) {
    const row = blockData[r];
    const startY = blockSize + blockSize * r;
    let path = `M 0 ${startY}`;
    let xPos;
    let yPos;
    let yBottom;

    for (let c = 0; c < totalCols; c++) {
      const cell = row[c];

      xPos = c * blockSize;
      yBottom = blockSize + r * blockSize;
      const isLastColumn = c === totalCols - 1;

      // trace out errors
      if (!cell) {
        console.log("bad cell: ", cell);
        yPos = yBottom;
      } else {
        yPos = getYPosFromCell({
          cell,
          minHeight,
          maxHeight,
          yBottom,
          isLastColumn,
        });
      }
      path += `L ${xPos} ${yPos}`;
    }

    path += `L ${xPos} ${yBottom}`;
    path += `L ${0} ${yBottom}`;

    paths.push(path);
  }

  return paths;
};

const getYPosFromCell = ({
  cell,
  minHeight,
  maxHeight,
  yBottom,
  isLastColumn,
}) => {
  const randomLittleExtra = Math.random() * minHeight;
  let yPos;

  const peakHeight = maxHeight * cell.fraction;
  let darknessHeight = maxHeight - peakHeight;
  if (darknessHeight < minHeight) {
    darknessHeight = minHeight;
  }

  if (cell.fraction > 0) {
    yPos = yBottom - darknessHeight;
  } else if (cell.alpha > 0) {
    yPos = yBottom - minHeight;
  } else {
    yPos = yBottom - 1;
  }

  if (isLastColumn) {
    if (cell.endCellConnection) {
    } else {
      yPos = yBottom;
    }
  }

  yPos -= randomLittleExtra;

  return yPos;
};
