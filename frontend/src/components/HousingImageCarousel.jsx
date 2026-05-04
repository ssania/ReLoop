import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PLACEHOLDER_THEMES = [
  { accent: '#2a7a5e', glow: 'rgba(42,122,94,.18)', bg: 'linear-gradient(135deg,#eff7f3 0%,#d6e9e0 52%,#b8dbd0 100%)' },
  { accent: '#c96a2e', glow: 'rgba(201,106,46,.18)', bg: 'linear-gradient(135deg,#faf1e8 0%,#f2dcc6 52%,#f0c8a8 100%)' },
  { accent: '#3f5f8f', glow: 'rgba(63,95,143,.18)', bg: 'linear-gradient(135deg,#edf3fb 0%,#d9e5f6 52%,#b8cde8 100%)' },
];

function getHousingSeed(h) {
  const raw = `${h.id ?? h.name ?? ''}`;
  let total = 0;
  for (let i = 0; i < raw.length; i += 1) total += raw.charCodeAt(i);
  return total;
}

function buildPlaceholderSlides(h, variant) {
  const seed = getHousingSeed(h);
  const themes = PLACEHOLDER_THEMES.map((theme, idx) => PLACEHOLDER_THEMES[(idx + seed) % PLACEHOLDER_THEMES.length]);
  const isDetail = variant === 'detail';
  return [
    {
      kind: 'placeholder',
      label: 'Community View',
      headline: h.name,
      copy: `${h.distance} mi from campus`,
      emoji: h.emoji,
      theme: themes[0],
    },
    {
      kind: 'placeholder',
      label: isDetail ? 'Living Snapshot' : 'Highlights',
      headline: h.amenities?.[0] || h.type,
      copy: h.amenities?.[1] || (h.busRoutes?.[0] ?? 'Details coming soon'),
      emoji: '🏡',
      theme: themes[1],
    },
    {
      kind: 'placeholder',
      label: isDetail ? 'Transit Snapshot' : 'Rent Snapshot',
      headline: isDetail
        ? (h.busRoutes?.[0] || 'Transit Access')
        : `$${h.rentMin.toLocaleString()} - $${h.rentMax.toLocaleString()}`,
      copy: isDetail
        ? `${h.type} • ${h.distance} mi from campus`
        : (h.busRoutes?.join(' • ') || 'Transit details coming soon'),
      emoji: '📍',
      theme: themes[2],
    },
  ];
}

export default function HousingImageCarousel({
  h,
  height,
  showControls = false,
  showDots = false,
  autoPlay = false,
  intervalMs = 3200,
  roundedTop = false,
  variant = 'card',
}) {
  const slides = useMemo(() => {
    if (Array.isArray(h.imageUrls) && h.imageUrls.length) {
      return h.imageUrls
        .map((image, index) => {
          const src = typeof image === 'string' ? image : image?.url;
          if (!src) return null;
          return {
            kind: 'image',
            src,
            alt: `${h.name} image ${index + 1}`,
          };
        })
        .filter(Boolean);
    }
    if (Array.isArray(h.imageUrls) && h.imageUrls.length === 0) {
      return buildPlaceholderSlides(h, variant);
    }
    return buildPlaceholderSlides(h, variant);
  }, [h, variant]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [slides.length, h.id]);

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return undefined;
    const id = window.setInterval(() => {
      setActiveIndex(current => (current + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [autoPlay, intervalMs, slides.length]);

  const goPrev = () => setActiveIndex(current => (current - 1 + slides.length) % slides.length);
  const goNext = () => setActiveIndex(current => (current + 1) % slides.length);

  return (
    <div
      className={`housing-carousel housing-carousel--${variant} position-relative overflow-hidden${roundedTop ? ' rounded-top-4' : ''}`}
      style={height ? { height } : undefined}
    >
      <div
        className="housing-carousel-track d-flex h-100"
        style={{ width: `${slides.length * 100}%`, transform: `translateX(-${(100 / slides.length) * activeIndex}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={slide.src ?? `${slide.label}-${index}`} className="housing-carousel-slide position-relative" style={{ width: `${100 / slides.length}%` }}>
            {slide.kind === 'image' ? (
              <img
                src={slide.src}
                alt={slide.alt}
                className="housing-carousel-image"
                loading="lazy"
                decoding="async"
                draggable="false"
              />
            ) : (
              <div className="housing-placeholder-slide w-100 h-100 position-relative d-flex flex-column justify-content-end" style={{ background: slide.theme.bg }}>
                <div className="housing-placeholder-glow" style={{ background: slide.theme.glow }} />
                <div className="housing-placeholder-grid" />
                <div className="housing-placeholder-copy position-relative">
                  <div className="housing-placeholder-kicker" style={{ color: slide.theme.accent }}>{slide.label}</div>
                  <div className="housing-placeholder-headline">{slide.headline}</div>
                  <div className="housing-placeholder-subline">{slide.copy}</div>
                </div>
                <div className="housing-placeholder-emoji" aria-hidden="true">{slide.emoji}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {slides.length > 1 && showControls && (
        <>
          <button type="button" className="housing-carousel-control prev" onClick={goPrev} aria-label="Previous image">
            <ChevronLeft size={18} strokeWidth={2.1} />
          </button>
          <button type="button" className="housing-carousel-control next" onClick={goNext} aria-label="Next image">
            <ChevronRight size={18} strokeWidth={2.1} />
          </button>
        </>
      )}

      {slides.length > 1 && showDots && (
        <div className="housing-carousel-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`housing-carousel-dot${index === activeIndex ? ' active' : ''}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
