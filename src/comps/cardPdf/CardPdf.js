import {
  Circle,
  ClipPath,
  Defs,
  Document,
  Line,
  Page,
  Path,
  PDFViewer,
  Rect,
  G,
  Svg,
} from "@react-pdf/renderer";
import React from "react";
import { getSheetData } from "../../utils/svgMakerUtils";
import { getPaths } from "../blocksSvg/BlocksSvg";
import styles from "./cardPdf.module.css";

export default function CardPdf({ blockData, blockSize, showAsOutlines }) {
  if (!blockData) return null;

  const sheetData = getSheetData({ blockData, blockSize });
  const pagePaths = [];

  for (let sheet of sheetData) {
    const paths = getPaths({ blockData: sheet.sheetBlockData, blockSize });
    pagePaths.push(paths);
  }

  // const totalRows = 10;
  // let hueIncrement = 360 / totalRows;
  // const fill = showAsOutlines ? "#ccc" : "black";
  const svgWidth = 148;
  const svgHeight = 210;

  const totalBlocksHeight = Math.floor(svgHeight / blockSize) * blockSize;
  const totalBlocksWidth = Math.floor(svgWidth / blockSize) * blockSize;

  const page = pagePaths[0];

  return (
    <div className={styles.cardPdf}>
      <PDFViewer>
        <Document title="Mountains Portrait Cards">
          {pagePaths.map((page, pIndex) => (
            <Page size="A5" key={`p-${pIndex}`}>
              <Svg
                viewBox={`0, 0, ${svgWidth}, ${svgHeight}`}
                style={{
                  width: "100%",
                  height: "100%",
                }}
              >
                <Defs>
                  <ClipPath id="clipper">
                    {page.map((p, i) => (
                      <Path
                        key={i}
                        d={p}
                        fill="#000"
                        // fill={fill}
                        // fill={`hsl(${i * hueIncrement}, 100%, 30%)`}
                        // strokeWidth={0.2}
                        // stroke={`hsl(${i * hueIncrement}, 100%, 30%)`}
                        stroke="none"
                      />
                    ))}
                  </ClipPath>
                </Defs>

                <HatchedPdfRect />

                {page.map((p, i) => (
                  <Path
                    key={i}
                    d={p}
                    fill="none"
                    // fill={fill}
                    // fill={`hsl(${i * hueIncrement}, 100%, 30%)`}
                    strokeWidth={0.2}
                    // stroke={`hsl(${i * hueIncrement}, 100%, 30%)`}
                    stroke="black"
                  />
                ))}

                <Rect
                  x="0"
                  y="0"
                  width={totalBlocksWidth}
                  height={totalBlocksHeight}
                  fill="none"
                  strokeWidth={0.2}
                  stroke="#ccc"
                />
              </Svg>
            </Page>
          ))}
        </Document>
      </PDFViewer>
    </div>
  );
}

const HatchedPdfRect = ({
  x = 0,
  y = 0,
  width = 148,
  height = 210,
  spacing = 2,
  doubleHatch = true,
  strokeWidth = 0.2,
  clipPathUrl = "#clipper",
}) => {
  const totalYPoints = Math.round(height / spacing);
  const totalXPoints = Math.round(width / spacing);

  const startPts = [];
  for (let a = 0; a < totalYPoints; a++) {
    startPts.push({ x: 0, y: a * spacing });
  }
  for (let b = 0; b < totalXPoints; b++) {
    startPts.push({ x: b * spacing, y: height });
  }

  const endPts = [];
  for (let c = 0; c < totalXPoints; c++) {
    endPts.push({ x: c * spacing, y: 0 });
  }
  for (let d = 0; d < totalYPoints; d++) {
    endPts.push({ x: width, y: d * spacing });
  }

  const lines = [];

  // create lines from left edge to
  for (let l = 0; l < startPts.length; l++) {
    lines.push({
      x1: startPts[l].x,
      y1: startPts[l].y,
      x2: endPts[l].x,
      y2: endPts[l].y,
    });
  }

  return (
    <G clipPath={`url(${clipPathUrl})`}>
      {lines.map((l, i) => (
        <Line
          key={i}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke="black"
          strokeWidth={strokeWidth}
        />
      ))}
    </G>
  );
};
