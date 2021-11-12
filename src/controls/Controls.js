import React, { useEffect } from "react";
import { folder, Leva, useControls } from "leva";
import {
  useQueryParams,
  BooleanParam,
  //   StringParam,
  NumberParam,
} from "use-query-params";

export default function Controls({ showControls = true, onChange }) {
  const [query, setQuery] = useQueryParams({
    showInfo: BooleanParam,
    sharpAdjust: NumberParam,
    blockSize: NumberParam,
    pixelsWide: NumberParam,
    cropLeft: NumberParam,
    cropRight: NumberParam,
    cropTop: NumberParam,
    cropBottom: NumberParam,
  });

  const [values, set] = useControls(() => ({
    view: folder({
      showInfo: {
        value: false,
        onChange: (value) => setQuery({ showInfo: value }),
      },
    }),
    sizes: folder(
      {
        blockSize: {
          value: 12,
          step: 1,
          min: 1,
          max: 100,
          onChange: (value) => setQuery({ blockSize: value }),
        },
        pixelsWide: {
          value: 72,
          step: 1,
          min: 10,
          max: 1000,
          onChange: (value) => setQuery({ pixelsWide: value }),
        },
      },
      {
        collapsed: false,
      }
    ),

    cropping: folder(
      {
        cropLeft: {
          value: 0,
          min: 0,
          max: 1,
          onChange: (value) => setQuery({ cropLeft: value }),
        },
        cropTop: {
          value: 0,
          min: 0,
          max: 1,
          onChange: (value) => setQuery({ cropTop: value }),
        },
        cropRight: {
          value: 1,
          min: 0,
          max: 1,
          onChange: (value) => setQuery({ cropRight: value }),
        },
        cropBottom: {
          value: 1,
          min: 0,
          max: 1,
          onChange: (value) => setQuery({ cropBottom: value }),
        },
      },
      {
        collapsed: false,
      }
    ),

    imageAdjustments: folder(
      {
        sharpAdjust: {
          value: 0,
          step: 1,
          min: -10,
          max: 10,
          onChange: (value) => setQuery({ sharpAdjust: value }),
        },
      },
      {
        collapsed: true,
      }
    ),
  }));

  useEffect(() => {
    const updatedKeys = Object.keys(query);
    if (updatedKeys.length > 0) {
      const updates = {};

      for (let key of updatedKeys) {
        updates[key] = query[key];
      }

      // set the controls based on the query
      set(updates);

      // update the app based on the query
      onChange({ ...values, ...updates });
    }

    // eslint-disable-next-line
  }, [query]);

  return <Leva hidden={!showControls} />;
}
