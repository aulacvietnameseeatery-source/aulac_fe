import React from 'react';
import LegendItem from './LegendItem';

const Legend = () => {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      <LegendItem color="bg-emerald-500" label="AVAILABLE" />
      <LegendItem color="bg-stone-400" label="RESERVED" />
      <LegendItem color="bg-[#1A3A52]" label="SELECTED" bordered />
    </div>
  );
};

export default Legend;
