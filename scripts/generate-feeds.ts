import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { feeds } from "../src/feeds/index.js";
import { buildRss } from "../src/lib/rss.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, "feeds");

// Set via repo settings or workflow; used in RSS self-link when known.
const feedBaseUrl =
  process.env.FEED_BASE_URL ??
  "https://raw.githubusercontent.com/OWNER/bandcamp-rss/main/feeds";

async function main(): Promise<void> {
  await mkdir(outputDir, { recursive: true });

  for (const feed of feeds) {
    const items = await feed.generate();
    const feedUrl = `${feedBaseUrl}/${feed.id}.xml`;

    const xml = buildRss({
      title: feed.title,
      link: feed.siteUrl,
      description: feed.description,
      feedUrl,
      items,
    });

    const outputPath = path.join(outputDir, `${feed.id}.xml`);
    await writeFile(outputPath, xml, "utf8");
    console.log(`Wrote ${outputPath} (${items.length} items)`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
