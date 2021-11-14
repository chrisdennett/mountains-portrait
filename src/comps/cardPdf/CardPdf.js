import { Document, Page, Path, PDFViewer, Svg } from "@react-pdf/renderer";
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
  const fill = showAsOutlines ? "#ccc" : "black";

  return (
    <div className={styles.cardPdf}>
      <PDFViewer>
        <Document title="Mountains Portrait Cards">
          {pagePaths.map((page, pIndex) => (
            <Page size="A5" key={`p-${pIndex}`}>
              <Svg
                viewBox={`0, 0, 148, 210`}
                style={{
                  width: "100%",
                  height: "100%",
                }}
              >
                {page.map((p, i) => (
                  <Path
                    key={i}
                    d={p}
                    fill={fill}
                    // fill={`hsl(${i * hueIncrement}, 100%, 30%)`}
                    strokeWidth={0.2}
                    // stroke={`hsl(${i * hueIncrement}, 100%, 30%)`}
                    stroke="#ccc"
                  />
                ))}
              </Svg>
            </Page>
          ))}
        </Document>
      </PDFViewer>
    </div>
  );
}
