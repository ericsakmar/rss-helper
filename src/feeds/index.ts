import type { FeedGenerator } from "./types.js";
import { bandcampRadioFeed } from "./bandcamp-radio.js";
import { reverbBassGuitarsFeed } from "./reverb-bass-guitars.js";

export const feeds: FeedGenerator[] = [
  bandcampRadioFeed,
  // reverbBassGuitarsFeed,
];
