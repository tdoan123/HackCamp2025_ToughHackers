'use client'

export function HeroSection() {
  return (
    <div className="relative w-full mx-0" style={{ marginTop: '48px', paddingBottom: '48px' }}>
      <div className="relative w-full" style={{ height: '400px' }}>
        <img
          src="/about-us-hero.svg"
          alt="Indigenous peoples cultural imagery"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  )
}
