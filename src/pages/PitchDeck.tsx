import { useState, useEffect, useCallback } from "react";
import { ScaledSlide, SlideContainer } from "@/components/pitch/SlideLayout";
import { SLIDES } from "@/components/pitch/slides";
import { ChevronLeft, ChevronRight, Maximize, Minimize, Grid3X3 } from "lucide-react";

const PitchDeck = () => {
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [gridView, setGridView] = useState(false);

  const next = useCallback(() => setCurrent(c => Math.min(c + 1, SLIDES.length - 1)), []);
  const prev = useCallback(() => setCurrent(c => Math.max(c - 1, 0)), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      if (e.key === "Escape" && fullscreen) {
        document.exitFullscreen?.();
      }
      if (e.key === "g" || e.key === "G") setGridView(v => !v);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, fullscreen]);

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  };

  const CurrentSlide = SLIDES[current].component;

  if (gridView) {
    return (
      <div className="min-h-screen bg-[hsl(var(--navy))] p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[hsl(var(--primary-foreground))]" style={{ fontFamily: "var(--font-display)" }}>
            icare.ai — Pitch Deck
          </h1>
          <button onClick={() => setGridView(false)} className="text-[hsl(var(--primary-foreground))]/60 hover:text-[hsl(var(--gold))] transition-colors flex items-center gap-2 text-sm">
            <Grid3X3 className="w-4 h-4" /> Close Grid
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {SLIDES.map((slide, i) => {
            const Comp = slide.component;
            return (
              <button
                key={i}
                onClick={() => { setCurrent(i); setGridView(false); }}
                className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all hover:scale-[1.02] ${
                  i === current ? "border-[hsl(var(--gold))]" : "border-transparent hover:border-[hsl(var(--primary-foreground))]/20"
                }`}
              >
                <SlideContainer>
                  <ScaledSlide><Comp /></ScaledSlide>
                </SlideContainer>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                  <span className="text-xs text-white/80">{i + 1}. {slide.title}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen bg-[hsl(var(--navy))] ${fullscreen ? "" : ""}`}>
      {/* Sidebar thumbnails */}
      {!fullscreen && (
        <div className="w-48 border-r border-[hsl(var(--primary-foreground))]/10 overflow-y-auto shrink-0 py-4 px-2 space-y-2">
          {SLIDES.map((slide, i) => {
            const Comp = slide.component;
            return (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-full aspect-video rounded-md overflow-hidden border-2 transition-all relative ${
                  i === current ? "border-[hsl(var(--gold))] shadow-lg shadow-[hsl(var(--gold))]/20" : "border-transparent hover:border-[hsl(var(--primary-foreground))]/20"
                }`}
              >
                <SlideContainer>
                  <ScaledSlide><Comp /></ScaledSlide>
                </SlideContainer>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-[10px] text-white/70 px-1.5 py-0.5 text-left">
                  {i + 1}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Main canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        {!fullscreen && (
          <div className="h-12 flex items-center justify-between px-4 border-b border-[hsl(var(--primary-foreground))]/10 shrink-0">
            <span className="text-sm text-[hsl(var(--primary-foreground))]/60">
              Slide {current + 1} of {SLIDES.length} — <span className="text-[hsl(var(--gold))]">{SLIDES[current].title}</span>
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setGridView(true)} className="p-2 rounded hover:bg-[hsl(var(--primary-foreground))]/10 text-[hsl(var(--primary-foreground))]/60 transition-colors">
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button onClick={toggleFullscreen} className="p-2 rounded hover:bg-[hsl(var(--primary-foreground))]/10 text-[hsl(var(--primary-foreground))]/60 transition-colors">
                {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Slide area */}
        <div className="flex-1 relative">
          <SlideContainer>
            <ScaledSlide><CurrentSlide /></ScaledSlide>
          </SlideContainer>

          {/* Nav arrows */}
          <button
            onClick={prev}
            disabled={current === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white/60 hover:text-white hover:bg-black/50 disabled:opacity-20 transition-all z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={next}
            disabled={current === SLIDES.length - 1}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white/60 hover:text-white hover:bg-black/50 disabled:opacity-20 transition-all z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Slide indicator dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === current ? "bg-[hsl(var(--gold))] w-6" : "bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PitchDeck;
