import type { FeedGenerator } from "./types.js";
import { bandcampRadioFeed } from "./bandcamp-radio.js";

export const feeds: FeedGenerator[] = [bandcampRadioFeed];
