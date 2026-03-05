import { schedule } from "@netlify/functions";
import Parser from "rss-parser";

const RSS_FEEDS = [
  "https://www.baltimoresun.com/food-drink/feed/",
  "https://vegnews.com/feed",
  "https://yupitsvegan.com/feed",
  "https://www.baltimoremagazine.com/feed/",
];

const LOCATION_KEYWORDS = [
  "baltimore",
  "bmore",
  "charm city",
  "fells point",
  "federal hill",
  "hampden",
  "mount vernon",
  "mt vernon",
  "canton",
  "remington",
  "station north",
  "inner harbor",
  "locust point",
  "pigtown",
  "charles village",
  "roland park",
  "woodberry",
  "harbor east",
  "highlandtown",
  "waverly",
  "cross street",
  "lexington market",
  "broadway market",
];

const FOOD_KEYWORDS = [
  "restaurant",
  "food",
  "dining",
  "cafe",
  "bakery",
  "brunch",
  "vegan",
  "vegetarian",
  "plant-based",
  "eatery",
  "kitchen",
  "bistro",
  "tavern",
  "pizza",
  "taco",
  "sushi",
  "coffee",
  "bar & grill",
  "foodie",
  "chef",
  "menu",
  "opens",
  "opened",
  "opening",
  "new spot",
];

function matchesFilters(text) {
  const lower = text.toLowerCase();
  const hasLocation = LOCATION_KEYWORDS.some((kw) => lower.includes(kw));
  const hasFood = FOOD_KEYWORDS.some((kw) => lower.includes(kw));
  return hasLocation && hasFood;
}

async function fetchArticles() {
  const parser = new Parser({ timeout: 10000 });
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const matches = [];

  for (const url of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(url);
      for (const item of feed.items || []) {
        const pubDate = item.pubDate ? new Date(item.pubDate) : null;
        if (pubDate && pubDate < oneWeekAgo) continue;

        const searchText = [
          item.title || "",
          item.contentSnippet || item.content || "",
          item.categories ? item.categories.join(" ") : "",
        ].join(" ");

        if (matchesFilters(searchText)) {
          matches.push({
            title: item.title || "Untitled",
            link: item.link || "",
            source: feed.title || url,
            date: pubDate ? pubDate.toLocaleDateString() : "Unknown",
            snippet: (item.contentSnippet || "").slice(0, 200),
          });
        }
      }
    } catch (err) {
      console.log(`Failed to fetch ${url}: ${err.message}`);
    }
  }

  return matches;
}

function buildEmailHTML(articles) {
  const rows = articles
    .map(
      (a) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
        <a href="${a.link}" style="color: #2D5A27; font-weight: 600; font-size: 16px; text-decoration: none;">${a.title}</a>
        <br><span style="color: #888; font-size: 13px;">${a.source} &middot; ${a.date}</span>
        ${a.snippet ? `<br><span style="color: #555; font-size: 14px;">${a.snippet}...</span>` : ""}
      </td>
    </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #2D5A27; font-size: 24px; border-bottom: 3px solid #F5794A; padding-bottom: 8px;">
    bmoreveg Weekly Digest
  </h1>
  <p style="color: #666;">Here's what's new in Baltimore food this week:</p>
  <table style="width: 100%; border-collapse: collapse;">
    ${rows}
  </table>
  <p style="color: #999; font-size: 12px; margin-top: 24px; border-top: 1px solid #eee; padding-top: 12px;">
    Sent by <a href="https://bmoreveg.com" style="color: #2D5A27;">bmoreveg</a> blog monitor.
    ${articles.length} article${articles.length === 1 ? "" : "s"} matched this week.
  </p>
</body>
</html>`;
}

async function sendEmail(articles) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;

  if (!apiKey || !to) {
    console.log("RESEND_API_KEY or NOTIFY_EMAIL not set — skipping email.");
    console.log(`Would have sent ${articles.length} article(s).`);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "bmoreveg <onboarding@resend.dev>",
      to: [to],
      subject: `bmoreveg digest: ${articles.length} new article${articles.length === 1 ? "" : "s"} this week`,
      html: buildEmailHTML(articles),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend API error ${response.status}: ${text}`);
  }

  console.log(`Email sent to ${to} with ${articles.length} articles.`);
}

const handler = schedule("0 0 * * 0", async () => {
  console.log("Blog monitor running...");

  const articles = await fetchArticles();
  console.log(`Found ${articles.length} matching articles.`);

  if (articles.length === 0) {
    console.log("No matches this week — no email sent.");
    return { statusCode: 200 };
  }

  await sendEmail(articles);
  return { statusCode: 200 };
});

export { handler };
