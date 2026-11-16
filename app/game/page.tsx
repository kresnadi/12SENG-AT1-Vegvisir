"use client";

import StreetView from "@/components/streetview";
import type {} from 'location-picker/jsx/react';
import { useState } from 'react' 
import 'location-picker';
import Image from "next/image";

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
      <div className="flex items-center w-full h-20 gap-3 p-6 bg-[#e8e4d3] fixed top-[0px] left-[0px] z-50">
        <button>
          <Image
              src="/logo.svg"
              alt=""
              width="128"
              height="32"
              objectFit="contain"
              priority
          />
        </button>
        <div className="w-[1px] h-6 bg-gray-300 dark:bg-gray-400" />
        <Image
            src="/icons/timer.svg"
            alt=""
            width="32"
            height="32"
            objectFit="contain"
            priority
        />
        <p className="text-xl">00:00</p>
        <button className="ml-auto">
          <Image
              src="/icons/menu.svg"
              alt=""
              width="32"
              height="32"
              objectFit="contain"
              priority
          />
        </button>
      </div>
    </main>
  )
}