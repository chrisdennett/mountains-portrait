import React from "react";

export const BlocksSvg = ({ pixelsWide, blockSize, blockData }) => {
  if (!blockData) return null;

  const blocksHigh = blockData.length;
  const paths = [];

  const maxHeight = blockSize * 0.9;
  const minHeight = blockSize * 0.1;
  const totalRows = blockData.length;
  const totalCols = blockData[0].length;

  let hueIncrement = 360 / totalRows;

  for (let r = 0; r < totalRows; r++) {
    const row = blockData[r];
    const startY = blockSize + blockSize * r;
    let path = `M 0 ${startY}`;
    let yPos;

    for (let c = 0; c < totalCols; c++) {
      const cell = row[c];
      const { fraction } = cell;
      const xPos = c * blockSize;
      const yBottom = blockSize + r * blockSize;
      const randomLittleExtra = Math.random() * minHeight;

      if (fraction > 0) {
        const peakHeight = maxHeight * fraction;
        let darknessHeight = maxHeight - peakHeight;
        if (darknessHeight < minHeight) {
          darknessHeight = minHeight;
        }
        yPos = yBottom - darknessHeight;
      } else if (cell.alpha > 0) {
        yPos = yBottom - minHeight;
      } else {
        yPos = yBottom - 1;
      }

      if (c === totalCols - 1) {
        yPos = yBottom;
      }

      yPos -= randomLittleExtra;

      path += `L ${xPos} ${yPos}`;
    }

    path += `L ${0} ${yPos}`;

    paths.push(path);
  }

  return (
    <svg width={pixelsWide * blockSize} height={blocksHigh * blockSize}>
      {paths.map((p, i) => (
        <path
          key={i}
          d={p}
          fill="black"
          // fill={`hsl(${i * hueIncrement}, 100%, 30%)`}
          stroke={`hsl(${i * hueIncrement}, 100%, 30%)`}
          // stroke="none"
        />
      ))}
    </svg>
  );
};
