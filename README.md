# bandcamp-rss

Personal RSS feeds for sites that do not publish their own. Generated on a schedule by GitHub Actions and served as static XML files.

## Feeds

| Feed | Source | URL pattern |
|------|--------|-------------|
| Bandcamp Radio | [bandcamp.com/radio](https://bandcamp.com/radio) | `feeds/bandcamp-radio.xml` |
| Reverb Bass Guitars | [reverb.com/marketplace](https://reverb.com/marketplace?product_type=bass-guitars&sort=published_at%7Cdesc) | `feeds/reverb-bass-guitars.xml` |

After pushing to GitHub and running the workflow once, subscribe in Miniflux using the raw file URL:

```
https://raw.githubusercontent.com/<your-username>/bandcamp-rss/main/feeds/bandcamp-radio.xml
```

Set Miniflux to refresh every 6 hours or so — matching the GitHub Actions schedule is enough.

## Setup

1. Create a public GitHub repository and push this project.
2. Go to **Actions** and run **Update feeds** manually once (or wait for the next scheduled run).
3. Add the raw feed URL to Miniflux.

No GitHub Pages or other hosting setup is required.

## Local development

```bash
npm install
npm run generate
```

Generated files are written to `feeds/`.

To preview with your real GitHub username:

```bash
FEED_BASE_URL=https://raw.githubusercontent.com/you/bandcamp-rss/main/feeds npm run generate
```

## Adding another feed

1. Add `src/feeds/your-feed.ts` implementing `FeedGenerator`.
2. Register it in `src/feeds/index.ts`.
3. Run `npm run generate` — output appears at `feeds/your-feed.xml`.

## License

Personal use. Bandcamp data is fetched from undocumented public endpoints and linked back to Bandcamp; audio is not re-hosted.
