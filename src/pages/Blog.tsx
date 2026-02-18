import { Link } from "react-router-dom";
import { ArrowRight, Clock, MapPin, DollarSign, Users, TrendingUp, Shield, Cpu, BookOpen, Briefcase, FileText, Heart } from "lucide-react";
import { blogPosts, formatBlogDate } from "@/data/blogPosts";
import { SEOHead } from "@/components/SEOHead";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useState } from "react";
import { ContactFormModal } from "@/components/ContactFormModal";

const categoryColors: Record<string, string> = {
  "Cost Savings": "bg-success/15 text-success",
  "Parent Experience": "bg-accent/15 text-accent",
  "Industry Trends": "bg-primary/15 text-primary",
  "Behind the Scenes": "bg-destructive/15 text-destructive",
  Leadership: "bg-accent/15 text-accent",
  Operations: "bg-primary/15 text-primary",
  "Case Studies": "bg-success/15 text-success",
  Technology: "bg-primary/15 text-primary",
  Safety: "bg-destructive/15 text-destructive",
  Policy: "bg-accent/15 text-accent",
};

const categoryThumbnails: Record<string, { gradient: string; icon: React.ElementType }> = {
  "Cost Savings": { gradient: "from-emerald-600 to-teal-700", icon: DollarSign },
  "Parent Experience": { gradient: "from-amber-500 to-orange-600", icon: Heart },
  "Industry Trends": { gradient: "from-blue-600 to-indigo-700", icon: TrendingUp },
  "Behind the Scenes": { gradient: "from-rose-500 to-pink-600", icon: Briefcase },
  Leadership: { gradient: "from-amber-500 to-yellow-600", icon: Users },
  Operations: { gradient: "from-slate-600 to-slate-800", icon: MapPin },
  "Case Studies": { gradient: "from-emerald-500 to-green-700", icon: FileText },
  Technology: { gradient: "from-violet-600 to-purple-700", icon: Cpu },
  Safety: { gradient: "from-red-500 to-rose-700", icon: Shield },
  Policy: { gradient: "from-sky-500 to-blue-600", icon: BookOpen },
};

const defaultThumbnail = { gradient: "from-primary to-primary/80", icon: BookOpen };

const BlogThumbnail = ({ category, className = "", large = false }: { category: string; className?: string; large?: boolean }) => {
  const { gradient, icon: Icon } = categoryThumbnails[category] || defaultThumbnail;
  return (
    <div className={`relative overflow-hidden rounded-lg bg-gradient-to-br ${gradient} ${className}`}>
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full border-4 border-white/30" />
        <div className="absolute -left-2 -bottom-2 h-16 w-16 rounded-full border-4 border-white/20" />
        <div className="absolute right-1/4 bottom-1/4 h-12 w-12 rounded-full bg-white/10" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon className={`text-white/25 ${large ? "h-20 w-20" : "h-12 w-12"}`} strokeWidth={1.5} />
      </div>
      {/* Category label */}
      <div className="absolute bottom-2 left-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">{category}</span>
      </div>
    </div>
  );
};

const Blog = () => {
  const [contactOpen, setContactOpen] = useState(false);
  const featured = blogPosts[0];
  const rest = blogPosts.slice(1);

  return (
    <div className="min-h-screen">
      <SEOHead
        title="Blog — Insights on School Transportation"
        description="Expert analysis on school transportation costs, operations, parent experience, and the technology transforming K–12 districts."
        path="/blog"
      />
      <Navigation onGetAudit={() => setContactOpen(true)} />
      <main>
        {/* Hero */}
        <section className="bg-navy py-16 md:py-24">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6">
            <ScrollReveal>
              <div className="text-center">
                <p className="text-sm font-bold uppercase tracking-widest text-accent mb-3">
                  Insights & Resources
                </p>
                <h1 className="font-display text-4xl font-bold text-primary-foreground md:text-5xl lg:text-6xl">
                  The RideLine <span className="italic text-accent">Blog</span>
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-primary-foreground/60 text-lg">
                  Expert analysis on school transportation costs, operations, parent experience, and the technology transforming K–12 districts.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Featured post */}
        <section className="bg-background py-12 md:py-16">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6">
            <ScrollReveal>
              <Link
                to={`/blog/${featured.slug}`}
                className="group grid md:grid-cols-[1fr_1.2fr] gap-6 rounded-2xl border bg-card p-6 md:p-8 transition-all duration-300 hover:shadow-xl hover:border-accent/30"
              >
                <BlogThumbnail category={featured.category} className="aspect-[16/9] md:aspect-auto md:min-h-[260px]" large />
                <div className="flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${categoryColors[featured.category] || "bg-muted text-muted-foreground"}`}>
                      {featured.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {featured.readTime}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatBlogDate(featured.date)}
                    </span>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl group-hover:text-accent transition-colors">
                    {featured.title}
                  </h2>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    {featured.excerpt}
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent group-hover:gap-3 transition-all">
                    Read Article <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          </div>
        </section>

        {/* Grid */}
        <section className="bg-background pb-20 md:pb-28">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post, i) => (
                <ScrollReveal key={post.slug} delay={i * 0.06}>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group flex flex-col h-full rounded-xl border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-accent/30 hover:-translate-y-1"
                  >
                    <BlogThumbnail category={post.category} className="aspect-[16/9] w-full" />
                    <div className="flex flex-col flex-grow p-6">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryColors[post.category] || "bg-muted text-muted-foreground"}`}>
                          {post.category}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" /> {post.readTime}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-foreground mb-2 group-hover:text-accent transition-colors line-clamp-3">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3 flex-grow">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                        <span className="text-xs text-muted-foreground">
                          {formatBlogDate(post.date)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent group-hover:gap-2 transition-all">
                          Read <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-navy py-16">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6 text-center">
            <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
              Ready to See Your <span className="italic text-accent">Savings?</span>
            </h2>
            <p className="mt-4 text-primary-foreground/60 max-w-xl mx-auto">
              Get a free route audit and discover exactly how much your district could save with RideLine.
            </p>
            <button
              onClick={() => setContactOpen(true)}
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-7 py-3.5 text-sm font-bold text-accent-foreground hover:bg-gold-light transition shadow-lg shadow-accent/20"
            >
              Start Your Free Route Audit <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>
      <Footer />
      <ContactFormModal open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
};

export default Blog;
