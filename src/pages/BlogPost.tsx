import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, Clock, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getBlogPost, formatBlogDate, blogPosts } from "@/data/blogPosts";
import { SEOHead } from "@/components/SEOHead";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useState, useEffect } from "react";
import { ContactFormModal } from "@/components/ContactFormModal";

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [contactOpen, setContactOpen] = useState(false);
  const post = getBlogPost(slug || "");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) return <Navigate to="/blog" replace />;

  const currentIndex = blogPosts.findIndex((p) => p.slug === post.slug);
  const nextPost = blogPosts[currentIndex + 1];
  const prevPost = blogPosts[currentIndex - 1];

  return (
    <div className="min-h-screen">
      <SEOHead
        title={post.title}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        type="article"
        article={{
          publishedTime: post.date,
          author: post.author,
          section: post.category,
        }}
      />
      <Navigation onGetAudit={() => setContactOpen(true)} />
      <main>
        {/* Header */}
        <section className="bg-navy py-16 md:py-20">
          <div className="mx-auto max-w-[800px] px-4 md:px-6">
            <ScrollReveal>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-accent transition-colors mb-8"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Blog
              </Link>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                  {post.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-primary-foreground/50">
                  <Clock className="h-3 w-3" /> {post.readTime}
                </span>
                <span className="text-xs text-primary-foreground/50">
                  {formatBlogDate(post.date)}
                </span>
              </div>
              <h1 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl lg:text-5xl leading-tight">
                {post.title}
              </h1>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-accent">
                  {post.author.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium text-primary-foreground">{post.author}</p>
                  <p className="text-xs text-primary-foreground/50">{post.authorRole}</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Content */}
        <section className="bg-background py-12 md:py-16">
          <div className="mx-auto max-w-[800px] px-4 md:px-6">
            <ScrollReveal>
              <article className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground prose-blockquote:border-accent prose-blockquote:text-muted-foreground prose-a:text-accent">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </article>
            </ScrollReveal>

            {/* CTA inline */}
            <ScrollReveal delay={0.1}>
              <div className="mt-12 rounded-2xl border border-accent/30 bg-navy p-8 text-center">
                <h3 className="font-display text-xl font-bold text-primary-foreground md:text-2xl">
                  See how much your district could save
                </h3>
                <p className="mt-2 text-primary-foreground/60 text-sm">
                  Get a free, no-obligation route audit with personalized savings estimates.
                </p>
                <button
                  onClick={() => setContactOpen(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-7 py-3 text-sm font-bold text-accent-foreground hover:bg-gold-light transition shadow-lg shadow-accent/20"
                >
                  Start Your Free Route Audit <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </ScrollReveal>

            {/* Prev / Next */}
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {prevPost && (
                <Link
                  to={`/blog/${prevPost.slug}`}
                  className="group rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:border-accent/30"
                >
                  <span className="text-xs text-muted-foreground">← Previous</span>
                  <p className="mt-1 font-display text-sm font-bold text-foreground group-hover:text-accent transition-colors line-clamp-2">
                    {prevPost.title}
                  </p>
                </Link>
              )}
              {nextPost && (
                <Link
                  to={`/blog/${nextPost.slug}`}
                  className={`group rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:border-accent/30 ${!prevPost ? "sm:col-start-2" : ""}`}
                >
                  <span className="text-xs text-muted-foreground text-right block">Next →</span>
                  <p className="mt-1 font-display text-sm font-bold text-foreground group-hover:text-accent transition-colors line-clamp-2">
                    {nextPost.title}
                  </p>
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ContactFormModal open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
};

export default BlogPostPage;
