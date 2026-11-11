"use client";

import StreetView from "@/components/streetview";
import type {} from 'location-picker/jsx/react';
import { useState } from 'react' 
import 'location-picker';

export default function Game() {
  const [value, setValue] = useState('');
  
  function updateLoc(value) {
    console.log(value)
  }

  return (
    <main>
      <StreetView/>
      <div className="fixed bottom-[0px] right-[0px] z-50">
          <location-picker id="loc" name="location" lat-name="lat" lng-name="lng" required
            value={value} onChange={updateLoc} style={{ width: 500, height: 360 }} />
          {/* <p>{value || 'Pan the map to choose'}</p> */}
      </div>
      <div className="w-full h-15 bg-[#e8e4d3] fixed top-[0px] left-[0px] z-50"></div>
    </main>
  )
}