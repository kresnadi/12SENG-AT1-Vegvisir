"use client"

export default function StreetView() {
  return (
    <iframe className="map-top w-screen h-screen overflow-hidden"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        src="https://www.google.com/maps/embed/v1/streetview?location=32.0783%2C34.7776&key=AIzaSyBnnYBWIQqlV3Ky3zyAq6thFsRT3kz3Az4"
        >
    </iframe>
  )
}