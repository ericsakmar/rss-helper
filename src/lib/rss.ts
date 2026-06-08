export type RssItem = {
  title: string;
  link: string;
  guid: string;
  pubDate: Date;
  description: string;
};

export type RssChannel = {
  title: string;
  link: string;
  description: string;
  feedUrl: string;
  items: RssItem[];
};

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function formatRfc822(date: Date): string {
  return date.toUTCString();
}

export function buildRss(channel: RssChannel): string {
  const items = channel.items
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="true">${escapeXml(item.guid)}</guid>
      <pubDate>${formatRfc822(item.pubDate)}</pubDate>
      <description><![CDATA[${item.description}]]></description>
    </item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(channel.title)}</title>
    <link>${escapeXml(channel.link)}</link>
    <description>${escapeXml(channel.description)}</description>
    <atom:link href="${escapeXml(channel.feedUrl)}" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom"/>
    <lastBuildDate>${formatRfc822(new Date())}</lastBuildDate>
    <generator>bandcamp-rss</generator>
${items}
  </channel>
</rss>
`;
}
