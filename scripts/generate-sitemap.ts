import { blogPosts } from "../src/data/blogPosts";
import fs from "fs";
import path from "path";

const SITE_URL = "https://rideplan-build.lovable.app";

const staticPages = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/blog", changefreq: "weekly", priority: "0.8" },
];

function generateSitemap(): string {
  const urls = [
    ...staticPages,
    ...blogPosts.map((post) => ({
      loc: `/blog/${post.slug}`,
      changefreq: "monthly",
      priority: "0.7",
      lastmod: post.date,
    })),
  ];

  const entries = urls
    .map(
      (u) =>
        `  <url>
    <loc>${SITE_URL}${u.loc}</loc>${
          "lastmod" in u ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""
        }
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

export function writeSitemap(outDir: string) {
  const sitemap = generateSitemap();
  fs.writeFileSync(path.resolve(outDir, "sitemap.xml"), sitemap);
  console.log(`✅ sitemap.xml generated with ${blogPosts.length + staticPages.length} URLs`);
}

// Allow running directly
if (process.argv[1]?.endsWith("generate-sitemap.ts")) {
  writeSitemap(path.resolve(__dirname, "../public"));
}
