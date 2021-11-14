import React, { useState, useEffect } from "react";
import { BlocksSvg } from "./comps/blocksSvg/BlocksSvg";
import CardPdf from "./comps/cardPdf/CardPdf";
import Controls from "./controls/Controls";
import { createBlockCanvas, getBlockData } from "./utils/svgMakerUtils";
import { drawCanvas } from "./utils/utils";

const App = () => {
  const [params, setParams] = useState({});
  const [sourceImg, setSourceImg] = useState(null);
  const [blockData, setBlockData] = useState(null);

  const canvasRef = React.useRef(null);

  // LOAD IMAGE
  useEffect(() => {
    if (!sourceImg) {
      const image = new Image();
      image.crossOrigin = "Anonymous";
      image.onload = () => setSourceImg(image);
      image.src = "shauna-coxsey-no-bg.png";
    }
  }, [sourceImg]);

  // CREATE BLOCK DATA
  // DRAW CANVAS
  useEffect(() => {
    if (!sourceImg) return;
    const blocks = getBlockData({ sourceImg, ...params });
    setBlockData(blocks);
  }, [sourceImg, params]);

  // DRAW CANVAS
  useEffect(() => {
    if (!blockData) return;

    const blockCanvas = createBlockCanvas(blockData, params.blockSize);

    const ctx = canvasRef.current.getContext("2d");
    canvasRef.current.width = blockCanvas.width;
    canvasRef.current.height = blockCanvas.height;
    drawCanvas(ctx, blockCanvas);
  }, [blockData, params.blockSize]);

  const onDownloadPack = () => {
    console.log("DOWNLOAD NOW!!!!!!");
  };

  return (
    <div>
      <Controls
        onChange={(newParams) => setParams(newParams)}
        onDownloadPack={() => onDownloadPack()}
      />

      <CardPdf blockData={blockData} {...params} />

      <h4>SVG</h4>
      <BlocksSvg blockData={blockData} {...params} />

      <h4>CANVAS</h4>
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
      />
    </div>
  );
};

export default App;
