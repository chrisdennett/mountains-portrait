import { Document, Page, Path, PDFViewer, Svg } from "@react-pdf/renderer";
import React from "react";
import { getSheetData } from "../../utils/svgMakerUtils";
import { getPaths } from "../blocksSvg/BlocksSvg";
import styles from "./cardPdf.module.css";

export default function CardPdf({ blockData, blockSize, showAsOutlines }) {
  if (!blockData) return null;

  const sheetData = getSheetData({ blockData, blockSize });

  const sheet1 = sheetData[0];
  const { sheetBlockData } = sheet1;
  console.log("sheet1 > sheetBlockData: ", sheetBlockData);
  // console.log("sheetData: ", sheetData);

  const paths = getPaths({ blockData: sheetBlockData, blockSize });

  const totalRows = sheetBlockData.length;
  let hueIncrement = 360 / totalRows;
  const fill = showAsOutlines ? "none" : "black";

  return (
    <div className={styles.cardPdf}>
      <PDFViewer>
        <Document title="Mountains Portrait Cards">
          <Page size="A5">
            <Svg
              viewBox={`0, 0, 148, 210`}
              style={{
                width: "100%",
                height: "100%",
              }}
            >
              {paths.map((p, i) => (
                <Path
                  key={i}
                  d={p}
                  fill={fill}
                  // fill={`hsl(${i * hueIncrement}, 100%, 30%)`}
                  strokeWidth={0.5}
                  stroke={`hsl(${i * hueIncrement}, 100%, 30%)`}
                  // stroke="none"
                />
              ))}
            </Svg>
          </Page>
        </Document>
      </PDFViewer>
    </div>
  );
}
