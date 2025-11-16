export function CultureCompassHeader() {
  return (
    <header className="w-full bg-[#e8e6e1] border-b border-[#d0cec9]">
      <div className="container mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#c4a962] px-3 py-2 rounded">
            <span className="text-black font-bold text-xl">CC</span>
          </div>
          <span className="text-black font-semibold text-xl">CultureCompass</span>
        </div>
        <nav className="flex items-center gap-12">
          <a href="/" className="text-black text-lg font-medium hover:text-[#c4a962] transition-colors">
            Home
          </a>
        </nav>
      </div>
    </header>
  )
}
