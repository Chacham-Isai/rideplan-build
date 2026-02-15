import { useState } from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Star, Quote, Play, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    quote: "RideLine identified 8 unnecessary routes in our first month. We saved $640,000 in Year 1 — and our drivers are happier with more efficient routes.",
    name: "Patricia Hernandez",
    title: "Director of Transportation",
    district: "Westchester County School District",
    savings: "$640K saved",
    metric: "8 routes eliminated",
  },
  {
    quote: "Before RideLine, we were drowning in parent phone calls every morning. Now parents track buses in real-time, and our office calls dropped by 65%.",
    name: "James Okonkwo",
    title: "Transportation Coordinator",
    district: "Bergen County Schools",
    savings: "65% fewer calls",
    metric: "3,200+ parents onboarded",
  },
  {
    quote: "The contractor oversight module caught $180,000 in overbilling we never would have found. RideLine paid for itself before the first semester ended.",
    name: "Linda Chen",
    title: "Chief Financial Officer",
    district: "Suffolk County BOCES",
    savings: "$180K recovered",
    metric: "Invoice fraud detected",
  },
  {
    quote: "STAC reports that used to take our team two weeks are now generated automatically. Compliance has gone from our biggest headache to a non-issue.",
    name: "Robert Williams",
    title: "Superintendent",
    district: "Dutchess County School District",
    savings: "80+ hours saved",
    metric: "Auto-generated reports",
  },
];

const videoTestimonials = [
  {
    name: "Dr. Michelle Torres",
    title: "Superintendent",
    district: "Capital Region BOCES, NY",
    duration: "2:34",
    topic: "How RideLine saved us $1.6M and restored parent trust",
    gradient: "from-accent/30 to-success/20",
  },
  {
    name: "Kevin Albright",
    title: "Director of Transportation",
    district: "Montgomery Township, PA",
    duration: "3:12",
    topic: "Eliminating 10 redundant routes in our first semester",
    gradient: "from-success/30 to-accent/20",
  },
  {
    name: "Sandra Kim",
    title: "Chief Operations Officer",
    district: "Fairfield County Schools, CT",
    duration: "1:58",
    topic: "Why our board approved RideLine in a single meeting",
    gradient: "from-accent/20 to-primary/30",
  },
];

export const TestimonialsSection = () => {
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);

  return (
    <section className="bg-background py-20 md:py-28" id="testimonials">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest text-accent mb-3">
              Trusted by Districts
            </p>
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
              What Transportation Leaders <span className="italic text-accent">Are Saying</span>
            </h2>
          </div>
        </ScrollReveal>

        {/* Video Testimonials */}
        <div className="grid gap-6 sm:grid-cols-3 mb-12">
          {videoTestimonials.map((v, i) => (
            <ScrollReveal key={v.name} delay={i * 0.1}>
              <div
                className="group relative rounded-2xl border border-border bg-card overflow-hidden cursor-pointer hover:border-accent/40 hover:shadow-[0_0_40px_-12px_hsl(var(--gold)/0.2)] transition-all duration-300"
                onClick={() => setPlayingVideo(i)}
              >
                {/* Video thumbnail area */}
                <div className={`relative aspect-video bg-gradient-to-br ${v.gradient} flex items-center justify-center`}>
                  {/* Decorative waveform */}
                  <div className="absolute inset-0 flex items-end justify-center gap-[3px] px-8 pb-6 opacity-20">
                    {Array.from({ length: 24 }).map((_, j) => (
                      <div
                        key={j}
                        className="w-1 rounded-full bg-foreground"
                        style={{ height: `${15 + Math.sin(j * 0.8) * 30 + Math.random() * 20}%` }}
                      />
                    ))}
                  </div>

                  {/* Play button */}
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-card/90 shadow-xl group-hover:scale-110 transition-transform duration-300">
                    <Play className="h-7 w-7 text-accent ml-1" fill="hsl(var(--accent))" />
                  </div>

                  {/* Duration badge */}
                  <span className="absolute bottom-3 right-3 rounded-md bg-foreground/80 px-2 py-0.5 text-[10px] font-bold text-background">
                    {v.duration}
                  </span>
                </div>

                {/* Info */}
                <div className="p-5">
                  <p className="text-sm font-semibold text-foreground leading-snug mb-3">{v.topic}</p>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">
                      {v.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{v.name}</p>
                      <p className="text-[11px] text-muted-foreground">{v.title}, {v.district}</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Written Testimonials */}
        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="group relative rounded-2xl border border-border bg-card p-6 md:p-8 transition-all duration-300 hover:border-accent/40 hover:shadow-[0_0_40px_-12px_hsl(var(--gold)/0.2)]">
                <Quote className="absolute top-6 right-6 h-8 w-8 text-accent/10 group-hover:text-accent/20 transition-colors" />
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <blockquote className="text-foreground leading-relaxed mb-6">
                  "{t.quote}"
                </blockquote>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent">
                      {t.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{t.district}</p>
                    </div>
                  </div>
                  <span className="inline-block rounded-full bg-success/20 px-3 py-1 text-xs font-semibold text-success shrink-0">
                    {t.savings}
                  </span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {playingVideo !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 backdrop-blur-sm p-4"
            onClick={() => setPlayingVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-3xl rounded-2xl bg-card overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPlayingVideo(null)}
                className="absolute top-4 right-4 z-10 rounded-full bg-foreground/20 p-2 hover:bg-foreground/40 transition"
              >
                <X className="h-5 w-5 text-background" />
              </button>
              <div className="aspect-video bg-gradient-to-br from-navy to-navy-mid flex flex-col items-center justify-center p-8 text-center">
                <Play className="h-16 w-16 text-accent mb-4" />
                <p className="font-display text-xl font-bold text-primary-foreground mb-2">
                  {videoTestimonials[playingVideo].topic}
                </p>
                <p className="text-sm text-primary-foreground/60">
                  {videoTestimonials[playingVideo].name} — {videoTestimonials[playingVideo].district}
                </p>
                <p className="mt-6 text-xs text-primary-foreground/30">
                  Video testimonials coming soon. Contact us for a live reference call.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
