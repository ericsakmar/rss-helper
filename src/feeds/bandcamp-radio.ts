import type { RssItem } from "../lib/rss.js";
import type { FeedGenerator } from "./types.js";

const LIST_URL = "https://bandcamp.com/api/bcweekly/3/list";
const SITE_URL = "https://bandcamp.com/radio";
const MAX_EPISODES = 50;
const MAX_ATTEMPTS = 3;

// Fastly answers Node's default User-Agent with an HTML client challenge
// (HTTP 200). An identified client receives the JSON episode list.
const REQUEST_HEADERS = {
  Accept: "application/json",
  "User-Agent":
    "rss-helper/1.0 (+https://github.com/ericsakmar/rss-helper)",
};

type BandcampRadioEpisode = {
  id: number;
  title: string;
  subtitle: string;
  date: string;
  published_date: string;
  desc: string;
  image_caption: string;
  image_id: number;
};

type ListResponse = {
  results: BandcampRadioEpisode[];
};

function episodeUrl(id: number): string {
  return `${SITE_URL}?show=${id}`;
}

function imageUrl(imageId: number): string {
  return `https://f4.bcbits.com/img/${imageId}_0.jpg`;
}

function parseDate(raw: string): Date {
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date from Bandcamp Radio API: ${raw}`);
  }
  return parsed;
}

function buildDescription(episode: BandcampRadioEpisode): string {
  const parts = [
    `<p><img src="${imageUrl(episode.image_id)}" alt="" /></p>`,
    `<p>${episode.desc}</p>`,
    `<p>${episode.image_caption}</p>`,
  ];
  return parts.join("\n");
}

function toRssItem(episode: BandcampRadioEpisode): RssItem {
  const link = episodeUrl(episode.id);
  return {
    title: `${episode.subtitle} — ${episode.title}`,
    link,
    guid: link,
    pubDate: parseDate(episode.published_date || episode.date),
    description: buildDescription(episode),
  };
}

function responsePreview(body: string): string {
  return body.slice(0, 120).replace(/\s+/g, " ").trim();
}

async function requestEpisodeList(): Promise<ListResponse> {
  const response = await fetch(LIST_URL, { headers: REQUEST_HEADERS });
  const body = await response.text();

  if (!response.ok || !body.startsWith("{")) {
    throw new Error(
      `Bandcamp Radio list request failed: ${response.status} ${response.statusText}. Body starts with: ${responsePreview(body)}`,
    );
  }

  try {
    return JSON.parse(body) as ListResponse;
  } catch (error) {
    throw new Error(
      `Bandcamp Radio list returned invalid JSON (${response.status}). Body starts with: ${responsePreview(body)}`,
      { cause: error },
    );
  }
}

async function fetchEpisodes(): Promise<BandcampRadioEpisode[]> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const data = await requestEpisodeList();
      if (!Array.isArray(data.results) || data.results.length === 0) {
        throw new Error("Bandcamp Radio list returned no episodes");
      }
      return data.results.slice(0, MAX_EPISODES);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt === MAX_ATTEMPTS) break;
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }

  throw lastError;
}

export const bandcampRadioFeed: FeedGenerator = {
  id: "bandcamp-radio",
  title: "Bandcamp Radio",
  siteUrl: SITE_URL,
  description: "New episodes from Bandcamp Radio",
  async generate() {
    const episodes = await fetchEpisodes();
    return episodes.map(toRssItem);
  },
};
