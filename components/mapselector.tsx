"use client"

export default function MapsSelector() {
  return (
    <div className="fixed bottom-[25px] right-[65px] z-50">
        <iframe className="w-75 h-50 "
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            src="https://www.google.com/maps/embed/v1/place?q=place_id:EiVHZW9yZ2UgU3QsIFN5ZG5leSBOU1cgMjAwMCwgQXVzdHJhbGlhIi4qLAoUChIJt1JtIT-uEmsRC0b2e2VCR6oSFAoSCT-Yix5ArhJrEcDMMhZofQEF&key="
            >
        </iframe>
    </div>
  )
}