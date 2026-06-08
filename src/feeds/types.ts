import type { RssItem } from "../lib/rss.js";

export type FeedGenerator = {
  id: string;
  title: string;
  siteUrl: string;
  description: string;
  generate(): Promise<RssItem[]>;
};
