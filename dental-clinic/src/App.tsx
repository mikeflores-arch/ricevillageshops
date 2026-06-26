import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'

/* -------------------------------------------------------------------------- */
/*  Image URLs                                                                 */
/* -------------------------------------------------------------------------- */

const HERO_IMAGE =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260624_113640_ccf3cf97-d447-425b-a134-d7b09fc743fc.png&w=1280&q=85'

const SECTION2_IMAGE =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260624_114219_414dfe80-f15c-4e25-bf52-b13721f4bd88.png&w=1280&q=85'

const SECTION3_IMG1 =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260624_115253_c19ab167-8dd5-48b4-967d-b9f0d9d6e8fb.png&w=1280&q=85'

const SECTION3_IMG2 =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260624_115237_fc519057-6e87-4abf-999a-9610b8b085b4.png&w=1280&q=85'

const SECTION3_BG =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260624_114355_752ba9e6-0942-4abb-9047-5d9bb16632e9.png&w=1280&q=85'

/* -------------------------------------------------------------------------- */
/*  Data                                                                       */
/* -------------------------------------------------------------------------- */

const featureBars = ['Advanced Dentistry', 'High Quality Equipment', 'Friendly Staff']

const services: { name: string; num: string | null; active: boolean }[] = [
  { name: 'Dental\nVeneers', num: '01', active: true },
  { name: 'Dental\nCrowns', num: '02', active: false },
  { name: 'Teeth\nWhitening', num: '03', active: false },
  { name: 'Dental\nImplants', num: null, active: false },
]

const mobileNavLinks = ['Home', 'Services', 'About', 'Gallery', 'Contact']

/* -------------------------------------------------------------------------- */
/*  Types & helpers                                                            */
/* -------------------------------------------------------------------------- */

type MaskPosition = { x: number; y: number; sw: number; sh: number }

type AnyRef =
  | ((el: HTMLElement | null) => void)
  | { current: HTMLElement | null }
  | null
  | undefined

/** Combine several refs (callback or object) into a single callback ref. */
function setRefs(...refs: AnyRef[]) {
  return (el: HTMLElement | null) => {
    for (const ref of refs) {
      if (!ref) continue
      if (typeof ref === 'function') ref(el)
      else (ref as { current: HTMLElement | null }).current = el
    }
  }
}

/* -------------------------------------------------------------------------- */
/*  Hooks                                                                       */
/* -------------------------------------------------------------------------- */

/** Tracks the (max-width: 767px) media query. */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 767px)').matches,
  )

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)')
    const onChange = () => setIsMobile(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile
}

/**
 * For each card element, computes its top-left offset relative to the section
 * along with the section's own width/height. Re-measures via ResizeObserver on
 * the section (plus window resize / scroll to stay aligned through the reveal
 * animation that briefly translates the cards).
 */
function useMaskPositions(
  sectionRef: { current: HTMLElement | null },
  cardsRef: { current: (HTMLElement | null)[] },
): MaskPosition[] {
  const [positions, setPositions] = useState<MaskPosition[]>([])

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const measure = () => {
      const sec = section.getBoundingClientRect()
      const next: MaskPosition[] = cardsRef.current.map((card) => {
        if (!card) return { x: 0, y: 0, sw: sec.width, sh: sec.height }
        const r = card.getBoundingClientRect()
        return {
          x: r.left - sec.left,
          y: r.top - sec.top,
          sw: sec.width,
          sh: sec.height,
        }
      })
      setPositions(next)
    }

    measure()

    const ro = new ResizeObserver(measure)
    ro.observe(section)

    // The staggered reveal translates cards on the Y axis; re-measure a few
    // times so the masked backgrounds settle into perfect alignment.
    const timers = [120, 400, 800, 1300, 3200].map((ms) =>
      window.setTimeout(measure, ms),
    )

    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, { passive: true })

    return () => {
      ro.disconnect()
      timers.forEach((t) => window.clearTimeout(t))
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure)
    }
  }, [sectionRef, cardsRef])

  return positions
}

/**
 * Loads the image and returns how wide it would render if scaled to fill the
 * given section height: naturalWidth * (sectionHeight / naturalHeight).
 */
function useImageWidth(src: string, sectionHeight: number): number {
  const [natural, setNatural] = useState<{ w: number; h: number }>({ w: 0, h: 0 })

  useEffect(() => {
    const img = new Image()
    img.onload = () => setNatural({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = src
  }, [src])

  if (!natural.h || !sectionHeight) return 0
  return natural.w * (sectionHeight / natural.h)
}

/** Fires a one-shot reveal when the container crosses the viewport threshold. */
function useStaggeredReveal(_count: number, threshold = 0.15) {
  const containerRef = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  const getAnimStyle = (index: number): CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 120}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 120}ms`,
  })

  return { containerRef, getAnimStyle }
}

/* -------------------------------------------------------------------------- */
/*  MaskedCard                                                                  */
/* -------------------------------------------------------------------------- */

type MaskedCardProps = {
  bgImage: string
  position?: MaskPosition
  imageWidth: number
  focalX: number
  className?: string
  children?: ReactNode
  cardRef?: (el: HTMLDivElement | null) => void
  style?: CSSProperties
}

function MaskedCard({
  bgImage,
  position,
  imageWidth,
  focalX,
  className,
  children,
  cardRef,
  style,
}: MaskedCardProps) {
  const pos = position ?? { x: 0, y: 0, sw: 0, sh: 0 }
  const overflow = imageWidth > pos.sw ? imageWidth - pos.sw : 0
  const focalOffset = overflow * focalX

  const bgStyle: CSSProperties = {
    backgroundImage: `url(${bgImage})`,
    backgroundSize: `auto ${pos.sh}px`,
    backgroundPosition: `-${pos.x + focalOffset}px -${pos.y}px`,
    backgroundRepeat: 'no-repeat',
    ...style,
  }

  return (
    <div ref={cardRef} className={className} style={bgStyle}>
      {children}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Splash screen                                                               */
/* -------------------------------------------------------------------------- */

function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    let current = 0
    const interval = window.setInterval(() => {
      current += 1
      setCount(current)
      if (current >= 100) {
        window.clearInterval(interval)
        window.setTimeout(() => setExiting(true), 200)
        window.setTimeout(() => onComplete(), 900)
      }
    }, 20)
    return () => window.clearInterval(interval)
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-[100] bg-white flex items-end justify-start transition-opacity duration-700 ${
        exiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <span className="text-7xl md:text-9xl font-bold tabular-nums p-6 md:p-10 leading-none text-black">
        {count}
      </span>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Navbar                                                                      */
/* -------------------------------------------------------------------------- */

function Navbar() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 py-2 md:py-3 bg-white/80 backdrop-blur-md">
        {/* Logo */}
        <div className="flex flex-col">
          <span className="text-xl md:text-2xl font-extrabold uppercase tracking-tight leading-none">
            Dental
          </span>
          <span className="text-xl md:text-2xl font-extrabold uppercase tracking-tight leading-none -mt-1.5 md:-mt-2">
            Health
          </span>
          <span className="text-[8px] md:text-[9px] font-medium leading-none mt-1.5 md:mt-2">
            quality healthcare
          </span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:block">
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-black">Dental Emergency</span>
            <button className="px-6 py-3 bg-white rounded-full border border-black text-sm font-semibold hover:bg-black hover:text-white transition-colors duration-200">
              Menu
            </button>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden w-10 h-10 flex items-center justify-center relative"
        >
          <span
            className={`absolute h-0.5 w-6 bg-black rounded-full transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${
              open ? 'rotate-45 translate-y-0' : '-translate-y-2'
            }`}
          />
          <span
            className={`absolute h-0.5 w-6 bg-black rounded-full transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${
              open ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
            }`}
          />
          <span
            className={`absolute h-0.5 w-6 bg-black rounded-full transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${
              open ? '-rotate-45 translate-y-0' : 'translate-y-2'
            }`}
          />
        </button>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`md:hidden fixed inset-0 z-40 ${
          open ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-500 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Panel */}
        <div
          className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col justify-center h-full px-8 gap-1">
            {mobileNavLinks.map((link, i) => (
              <a
                key={link}
                href="#"
                onClick={() => setOpen(false)}
                className={`text-4xl font-bold text-black hover:text-neutral-500 transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                  open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                }`}
                style={{ transitionDelay: open ? `${100 + i * 60}ms` : '0ms' }}
              >
                {link}
              </a>
            ))}

            <div
              className="mt-8 pt-8 border-t border-neutral-200 transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]"
              style={{
                transitionDelay: open ? '450ms' : '0ms',
                opacity: open ? 1 : 0,
                transform: open ? 'translateX(0)' : 'translateX(2rem)',
              }}
            >
              <p className="text-sm font-semibold text-black mb-4">Dental Emergency</p>
              <button className="w-full px-6 py-4 bg-black rounded-full text-white text-sm font-semibold hover:bg-neutral-800 transition-colors duration-200">
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* -------------------------------------------------------------------------- */
/*  App                                                                         */
/* -------------------------------------------------------------------------- */

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const isMobile = useIsMobile()

  const handleSplashComplete = useCallback(() => setShowSplash(false), [])

  /* --- Section 1 --- */
  const section1Ref = useRef<HTMLElement | null>(null)
  const s1CardsRef = useRef<(HTMLElement | null)[]>([])
  const s1Reveal = useStaggeredReveal(4)
  const positions1 = useMaskPositions(section1Ref, s1CardsRef)
  const imageWidth1 = useImageWidth(HERO_IMAGE, positions1[0]?.sh ?? 0)
  const focalX1 = isMobile ? 0.7 : 0.8

  /* --- Section 2 --- */
  const section2Ref = useRef<HTMLElement | null>(null)
  const s2CardsRef = useRef<(HTMLElement | null)[]>([])
  const s2Reveal = useStaggeredReveal(4)
  const positions2 = useMaskPositions(section2Ref, s2CardsRef)
  const imageWidth2 = useImageWidth(SECTION2_IMAGE, positions2[0]?.sh ?? 0)
  const focalX2 = isMobile ? 0.65 : 0.8

  /* --- Section 3 --- */
  const s3Reveal = useStaggeredReveal(4)

  const setS1Card = (i: number) => (el: HTMLDivElement | null) => {
    s1CardsRef.current[i] = el
  }
  const setS2Card = (i: number) => (el: HTMLDivElement | null) => {
    s2CardsRef.current[i] = el
  }

  return (
    <div className="bg-white">
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      <Navbar />

      {/* ================= SECTION 1 — HERO ================= */}
      <section
        ref={setRefs(section1Ref, s1Reveal.containerRef)}
        className="h-screen w-full overflow-hidden flex flex-col pt-24 md:pt-24 px-3 md:px-5 pb-1.5 md:pb-2 gap-1.5 md:gap-2"
      >
        {featureBars.map((label, i) => (
          <MaskedCard
            key={label}
            bgImage={HERO_IMAGE}
            position={positions1[i]}
            imageWidth={imageWidth1}
            focalX={focalX1}
            cardRef={setS1Card(i)}
            style={s1Reveal.getAnimStyle(i)}
            className="w-full h-14 md:h-20 shrink-0 rounded-xl md:rounded-2xl overflow-hidden relative"
          >
            <span className="flex items-center justify-center h-full text-black text-lg md:text-3xl font-bold text-center relative z-10">
              {label}
            </span>
          </MaskedCard>
        ))}

        <MaskedCard
          bgImage={HERO_IMAGE}
          position={positions1[3]}
          imageWidth={imageWidth1}
          focalX={focalX1}
          cardRef={setS1Card(3)}
          style={s1Reveal.getAnimStyle(3)}
          className="w-full flex-1 min-h-0 rounded-xl md:rounded-2xl overflow-hidden relative"
        >
          {/* Top-left text */}
          <p className="absolute top-4 left-4 md:top-7 md:left-7 text-black text-xs md:text-sm font-semibold leading-4 md:leading-5 max-w-[200px] md:max-w-[300px] z-10">
            We wish to provide professional dental services
            <br />
            that match the current technologies
          </p>

          {/* Bottom-left block */}
          <div className="absolute bottom-5 left-3 md:bottom-8 md:left-4 z-10">
            <span className="block text-black text-xs md:text-sm font-semibold mb-1 md:mb-2">
              Trusted Dentist in West New York
            </span>
            <h1 className="text-black text-[clamp(3rem,11vw,11rem)] font-bold leading-[0.79] tracking-tight">
              Dental
              <br />
              Care
            </h1>
          </div>

          {/* Bottom-right text */}
          <span className="absolute bottom-6 right-4 md:bottom-10 md:right-8 text-white text-xs md:text-sm font-semibold z-10">
            Free Consultation
          </span>
        </MaskedCard>
      </section>

      {/* ================= SECTION 2 — SMILE GALLERY ================= */}
      <section
        ref={setRefs(section2Ref, s2Reveal.containerRef)}
        className="min-h-screen md:h-screen w-full overflow-hidden flex flex-col pt-1.5 md:pt-2 px-3 md:px-5 pb-1.5 md:pb-2 gap-1.5 md:gap-2"
      >
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 grid-rows-[auto_auto_auto_auto] md:grid-rows-[1fr_1fr_0.8fr] gap-1.5 md:gap-2">
          {/* Card 0 — Top Left */}
          <MaskedCard
            bgImage={SECTION2_IMAGE}
            position={positions2[0]}
            imageWidth={imageWidth2}
            focalX={focalX2}
            cardRef={setS2Card(0)}
            style={s2Reveal.getAnimStyle(0)}
            className="rounded-xl md:rounded-2xl overflow-hidden relative min-h-[160px] md:min-h-0"
          >
            <h2 className="absolute top-4 left-5 md:top-6 md:left-7 text-white md:text-black text-2xl md:text-3xl font-bold z-10">
              Smile Gallery
            </h2>
            <span className="absolute bottom-4 left-5 md:bottom-6 md:left-7 text-white md:text-black text-xs md:text-sm font-semibold z-10">
              Our cosmetic dental work
            </span>
          </MaskedCard>

          {/* Card 1 — Top Right (spans 2 rows) */}
          <MaskedCard
            bgImage={SECTION2_IMAGE}
            position={positions2[1]}
            imageWidth={imageWidth2}
            focalX={focalX2}
            cardRef={setS2Card(1)}
            style={s2Reveal.getAnimStyle(1)}
            className="md:row-span-2 rounded-xl md:rounded-2xl overflow-hidden relative min-h-[200px] md:min-h-0"
          >
            <p className="absolute bottom-16 left-5 md:bottom-20 md:left-7 text-white text-xs md:text-sm font-semibold leading-4 md:leading-5 z-10">
              If you want a gorgeous smile,
              <br />
              call us to ask about a smile makeover.
            </p>
            <button className="absolute bottom-4 right-4 md:bottom-6 md:right-6 px-5 py-3 md:px-8 md:py-5 bg-white rounded-full text-black text-base md:text-xl font-bold z-10 hover:scale-105 transition-transform">
              Call Us
            </button>
          </MaskedCard>

          {/* Card 2 — Bottom Left */}
          <MaskedCard
            bgImage={SECTION2_IMAGE}
            position={positions2[2]}
            imageWidth={imageWidth2}
            focalX={focalX2}
            cardRef={setS2Card(2)}
            style={s2Reveal.getAnimStyle(2)}
            className="rounded-xl md:rounded-2xl overflow-hidden relative min-h-[160px] md:min-h-0"
          >
            <h2 className="absolute top-4 left-5 md:top-6 md:left-7 text-white md:text-black text-[clamp(3rem,7vw,6rem)] font-bold leading-[0.9] z-10">
              Smile
              <br />
              makeover
            </h2>
          </MaskedCard>

          {/* Card 3 — Bottom Full Width (Services) */}
          <MaskedCard
            bgImage={SECTION2_IMAGE}
            position={positions2[3]}
            imageWidth={imageWidth2}
            focalX={focalX2}
            cardRef={setS2Card(3)}
            style={s2Reveal.getAnimStyle(3)}
            className="col-span-1 md:col-span-2 rounded-xl md:rounded-2xl overflow-hidden relative min-h-[200px] md:min-h-0"
          >
            <div className="absolute inset-0 z-10 flex flex-wrap md:flex-nowrap gap-1.5 md:gap-2 p-2 md:p-3">
              {services.map((svc) => (
                <div
                  key={svc.name}
                  className={`flex-1 min-w-[calc(50%-4px)] md:min-w-0 rounded-xl md:rounded-2xl p-3 md:p-5 flex flex-col justify-between ${
                    svc.active
                      ? 'bg-white/90 backdrop-blur-md'
                      : 'bg-white/20 backdrop-blur-xl'
                  }`}
                >
                  <h3
                    className={`text-xl md:text-4xl font-bold leading-[1.05] whitespace-pre-line ${
                      svc.active ? 'text-black' : 'text-white'
                    }`}
                  >
                    {svc.name}
                  </h3>
                  {svc.num && (
                    <span
                      className={`self-end w-8 h-8 md:w-12 md:h-12 rounded-full border flex items-center justify-center text-xs md:text-sm font-semibold ${
                        svc.active ? 'border-black text-black' : 'border-white text-white'
                      }`}
                    >
                      {svc.num}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </MaskedCard>
        </div>
      </section>

      {/* ================= SECTION 3 — IMPLANT DENTISTRY ================= */}
      <section
        ref={setRefs(s3Reveal.containerRef)}
        className="min-h-screen md:h-screen w-full overflow-hidden flex flex-col pt-1.5 md:pt-2 px-3 md:px-5 pb-1.5 md:pb-2 gap-1.5 md:gap-2"
      >
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-2">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-1.5 md:gap-2">
            {/* Heading card */}
            <div
              style={s3Reveal.getAnimStyle(0)}
              className="rounded-xl md:rounded-2xl bg-stone-50 p-5 md:p-7 flex flex-col justify-between flex-[1.2] min-h-[180px] md:min-h-0"
            >
              <h2 className="text-[clamp(3rem,7vw,6.5rem)] font-bold leading-[0.95] text-black">
                Implant
                <br />
                Dentistry
              </h2>
              <p className="text-xs md:text-sm font-semibold text-black">
                Restore Missing Teeth
              </p>
            </div>

            {/* Two image cards */}
            <div
              style={s3Reveal.getAnimStyle(1)}
              className="flex gap-1.5 md:gap-2 flex-1 min-h-[140px] md:min-h-0"
            >
              <div className="flex-1 rounded-xl md:rounded-2xl overflow-hidden">
                <img
                  src={SECTION3_IMG1}
                  alt="Dental implant procedure"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 rounded-xl md:rounded-2xl overflow-hidden">
                <img
                  src={SECTION3_IMG2}
                  alt="Dental restoration"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Consultation card */}
            <div
              style={s3Reveal.getAnimStyle(2)}
              className="rounded-xl md:rounded-2xl bg-zinc-200 p-5 md:p-7 flex items-end justify-between flex-[0.8] min-h-[160px] md:min-h-0"
            >
              <div>
                <p className="text-xs md:text-sm font-semibold text-black mb-2 md:mb-3">
                  Consultation
                </p>
                <h3 className="text-xl md:text-3xl font-bold text-black leading-6 md:leading-8">
                  Dental
                  <br />
                  Restoration
                  <br />
                  Services
                </h3>
              </div>
              <button className="px-5 py-3 md:px-8 md:py-5 bg-white rounded-full text-black text-base md:text-xl font-bold hover:scale-105 transition-transform">
                Book Online
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div
            style={s3Reveal.getAnimStyle(3)}
            className="rounded-xl md:rounded-2xl overflow-hidden relative min-h-[350px] md:min-h-0"
          >
            <img
              src={SECTION3_BG}
              alt="Smiling patient"
              className="w-full h-full object-cover"
            />

            <div className="absolute bottom-3 left-3 right-3 md:bottom-5 md:left-5 md:right-5 flex gap-1.5 md:gap-2">
              {/* Overlay card 1 — white */}
              <div className="flex-1 bg-white rounded-xl md:rounded-2xl p-3 md:p-5 flex flex-col justify-between h-36 md:h-52">
                <h4 className="text-lg md:text-2xl font-bold text-black leading-5 md:leading-7">
                  The Process
                  <br />
                  of Installing
                  <br />
                  Implants
                </h4>
                <span className="self-end w-9 h-9 md:w-12 md:h-12 rounded-full border border-black flex items-center justify-center">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="rotate-[-45deg]"
                  >
                    <path
                      d="M1 7h12m0 0L8 2m5 5L8 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>

              {/* Overlay card 2 — glass */}
              <div className="flex-1 bg-white/20 backdrop-blur-xl rounded-xl md:rounded-2xl p-3 md:p-5 flex flex-col justify-between h-36 md:h-52">
                <h4 className="text-lg md:text-2xl font-bold text-white leading-5 md:leading-7">
                  Caring
                  <br />
                  for Dental
                  <br />
                  Implants
                </h4>
                <span className="self-end w-9 h-9 md:w-12 md:h-12 rounded-full border border-white flex items-center justify-center text-white">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="rotate-[-45deg] text-white"
                  >
                    <path
                      d="M1 7h12m0 0L8 2m5 5L8 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
