import type { RssItem } from "../lib/rss.js";
import type { FeedGenerator } from "./types.js";

const LIST_URL =
  "https://reverb.com/api/listings?product_type=bass-guitars&sort=published_at%7Cdesc&per_page=50";
const SITE_URL =
  "https://reverb.com/marketplace?product_type=bass-guitars&sort=published_at%7Cdesc";

type ReverbPrice = {
  display: string;
};

type ReverbPhoto = {
  _links: {
    large_crop: {
      href: string;
    };
  };
};

type ReverbListing = {
  id: number;
  title: string;
  make: string;
  model: string;
  condition: string;
  shop_name: string;
  description: string;
  published_at: string;
  price: ReverbPrice;
  photos: ReverbPhoto[];
  _links: {
    web: {
      href: string;
    };
  };
};

type ListResponse = {
  listings: ReverbListing[];
};

function parseDate(raw: string): Date {
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date from Reverb API: ${raw}`);
  }
  return parsed;
}

function primaryPhoto(listing: ReverbListing): string | undefined {
  return listing.photos[0]?._links.large_crop.href;
}

function buildDescription(listing: ReverbListing): string {
  const parts: string[] = [];

  const photo = primaryPhoto(listing);
  if (photo) {
    parts.push(`<p><img src="${photo}" alt="" /></p>`);
  }

  parts.push(
    `<p><strong>${listing.price.display}</strong> · ${listing.condition} · ${listing.shop_name}</p>`,
  );

  if (listing.description) {
    parts.push(listing.description);
  }

  return parts.join("\n");
}

function buildTitle(listing: ReverbListing): string {
  const name =
    listing.title ||
    [listing.make, listing.model].filter(Boolean).join(" ") ||
    "Bass guitar";
  return `${name} — ${listing.price.display}`;
}

function toRssItem(listing: ReverbListing): RssItem {
  const link = listing._links.web.href;
  return {
    title: buildTitle(listing),
    link,
    guid: link,
    pubDate: parseDate(listing.published_at),
    description: buildDescription(listing),
  };
}

async function fetchListings(): Promise<ReverbListing[]> {
  const response = await fetch(LIST_URL, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(
      `Reverb listings request failed: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ListResponse;
  if (!Array.isArray(data.listings) || data.listings.length === 0) {
    throw new Error("Reverb listings returned no results");
  }

  return data.listings;
}

export const reverbBassGuitarsFeed: FeedGenerator = {
  id: "reverb-bass-guitars",
  title: "Reverb — New Bass Guitars",
  siteUrl: SITE_URL,
  description: "Recently listed bass guitars on Reverb",
  async generate() {
    const listings = await fetchListings();
    return listings.map(toRssItem);
  },
};
