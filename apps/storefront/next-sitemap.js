// Generates robots.txt + sitemap.xml on `postbuild` (next-sitemap).
// Robots policy explicitly welcomes AI/answer-engine crawlers — a core GEO
// signal so ChatGPT, Perplexity, Google AI Overviews/Gemini and Claude can
// discover, cite and recommend the catalog. Sensitive flows stay disallowed.

const excludedPaths = ["/checkout", "/account", "/account/*"]

// AI / answer-engine crawlers we explicitly allow for visibility & citations.
const aiCrawlers = [
  "OAI-SearchBot", // OpenAI search (ChatGPT citations)
  "ChatGPT-User", // ChatGPT browsing on user request
  "GPTBot", // OpenAI crawler
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended", // Gemini & Google AI Overviews
  "ClaudeBot",
  "Claude-SearchBot",
  "anthropic-ai",
  "Applebot-Extended",
  "CCBot", // Common Crawl (feeds many LLMs)
  "meta-externalagent",
]

module.exports = {
  siteUrl:
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    "http://localhost:8000",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: [...excludedPaths, "/[sitemap]"],
  robotsTxtOptions: {
    policies: [
      // Explicitly welcome each AI crawler (allow everything but sensitive flows)
      ...aiCrawlers.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: excludedPaths,
      })),
      // Default for all other bots
      {
        userAgent: "*",
        allow: "/",
        disallow: excludedPaths,
      },
    ],
  },
}
