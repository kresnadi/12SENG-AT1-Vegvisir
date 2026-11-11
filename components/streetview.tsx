"use client"

export default function StreetView() {
  return (
    <iframe className="map-top w-screen h-screen overflow-hidden"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        src="https://www.google.com/maps/embed/v1/streetview?location=-33.8694%2C151.2069&key=AIzaSyBnnYBWIQqlV3Ky3zyAq6thFsRT3kz3Az4"
        >
    </iframe>
  )
}