

export default function Footer() {
  return (
    <footer
      className="rounded-t-3xl shadow-2xl"
      style={{
        background:
          "linear-gradient(135deg, #c9d6f4 0%, #b3c6e6 60%, #8ec6e6 100%)",
      }}
    >
      <div className="mx-auto max-w-screen-xl px-4 pt-16 pb-8 sm:px-6 lg:px-8 lg:pt-24">
        
        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-[#1A2150] sm:text-5xl">
            Find EV Chargers Near You
          </h2>

          <p className="mx-auto mt-4 max-w-sm text-[#2B1B5F]">
            Discover reliable charging stations, connect your vehicle, and power
            your journey with Ecoswaech.
          </p>

          <a
            href="/charging-stations"
            className="mt-8 inline-block rounded-full border border-[#4AB0FF] px-12 py-3 text-sm font-medium text-[#1A2150] bg-white hover:bg-[#4AB0FF] hover:text-white transition"
          >
            Explore Map
          </a>
        </div>

        {/* Bottom Section */}
        <div className="mt-14 border-t border-gray-200 pt-8 sm:flex sm:items-center sm:justify-between lg:mt-24">
          
          {/* Links */}
          <ul className="flex flex-wrap justify-center gap-4 text-sm lg:justify-end">
            <li>
              <a href="#" className="text-[#1A2150] hover:opacity-75">
                Terms & Conditions
              </a>
            </li>
            <li>
              <a href="#" className="text-[#1A2150] hover:opacity-75">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="text-[#1A2150] hover:opacity-75">
                Cookies
              </a>
            </li>
            <li>
              <span className="text-[#1A2150]">
                © {new Date().getFullYear()} ECOSWAECH
              </span>
            </li>
          </ul>

          {/* Social Icons */}
          <ul className="mt-8 flex justify-center gap-6 sm:mt-0 lg:justify-end">
            {["Facebook", "Instagram", "Twitter", "GitHub", "Dribbble"].map(
              (platform) => (
                <li key={platform}>
                  <a
                    href="#"
                    target="_blank"
                    rel="noreferrer"
                    className="text-white hover:text-[#1A2150] transition"
                  >
                    <span className="sr-only">{platform}</span>
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">
                      {platform[0]}
                    </div>
                  </a>
                </li>
              )
            )}
          </ul>

        </div>
      </div>
    </footer>
  );
}