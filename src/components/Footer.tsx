// src/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="mt-16" style={{ background: 'var(--flex-green)', color: '#fff' }}>
      <div className="mx-auto grid max-w-[1120px] gap-10 px-4 py-12 md:grid-cols-3 md:px-6 lg:px-8">
        <div>
          <h3 className="mb-3 font-semibold">the flex.</h3>
          <p className="text-sm/6 opacity-90">Beautiful stays. Honest reviews. Seamless bookings.</p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide opacity-90">Company</h4>
          <ul className="space-y-2 text-sm/6 opacity-90">
            <li>About</li><li>Careers</li><li>Press</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide opacity-90">Support</h4>
          <ul className="space-y-2 text-sm/6 opacity-90">
            <li>Help center</li><li>Cancellation options</li><li>Safety</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between px-4 py-4 text-xs opacity-80 md:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} the flex.</span>
          <div className="flex gap-4"><span>Privacy</span><span>Terms</span></div>
        </div>
      </div>
    </footer>
  );
}
