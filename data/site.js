/* ============================================================================
   SITE CONFIG — this is the file you edit.
   Everything the site says about you lives here. Change the text, save, done.
   (data/channel.js is auto-generated from YouTube — don't hand-edit that one.)
   ========================================================================== */

export const CHANNEL = {
  name: "OPERATOR",
  surname: "SURRON",
  handle: "@OperatorSurron",
  url: "https://www.youtube.com/@OperatorSurron",
  channelId: "UCwRWz4olcoeTOFedX2918xQ",
  email: "OperatorSurron@gmail.com",
  location: "United States",
  since: "MAR 2025",
  tagline: "Electric dirt bikes, over-built and ridden hard.",
};

/* ---------------------------------------------------------------------------
   LIVE STATS (optional)

   Off by default — the site shows the figures in STATS below.

   To switch it on you need a YouTube Data API v3 key:
     1. console.cloud.google.com → new project → enable "YouTube Data API v3"
     2. Credentials → Create credentials → API key
     3. IMPORTANT: restrict the key. Under "Application restrictions" pick
        "Websites" and add your domain. Under "API restrictions" allow only
        the YouTube Data API. The key ships in client-side JS, so the referrer
        restriction is what stops other sites spending your quota.
     4. Paste it below and set enabled: true

   A poll costs 1 quota unit against a 10,000/day allowance, so a 5-minute
   interval is comfortable even with steady traffic.
   ------------------------------------------------------------------------- */
export const LIVE = {
  enabled: false,
  apiKey: "",
  intervalMs: 5 * 60 * 1000,
};

/* Pulled from the channel on the date below. Re-run scripts/refresh.py to update. */
export const STATS = {
  updated: "Aug 2026",
  subs:   { value: 4810,    label: "Subscribers", display: "4.81K" },
  views:  { value: 1357836, label: "Total Views",  display: "1.36M" },
  videos: { value: 223,     label: "Videos",       display: "223"   },
  best:   { value: 65000,   label: "Top Video",    display: "65K"   },
};

/* ---------------------------------------------------------------------------
   THE BIKE. One entry is intentional: the site is about this bike.
   `specs` rows are free-form: [label, value]. Add/remove as you like.
   `video` is the YouTube ID of the build video (used for the "watch build" link).
   ------------------------------------------------------------------------- */
export const GARAGE = [
  {
    name: "The Purple One",
    model: "Sur-Ron Light Bee X",
    status: "Main bike",
    blurb:
      "This is the bike basically every video is about. Something like " +
      "$10,000 in parts on top of a bare frame, a 72V pack, and an EBMX 9000 " +
      "controller. Still riding it every week.",
    specs: [
      ["Battery", "72V"],
      ["Peak output", "19,000W"],
      ["Controller", "EBMX 9000"],
      ["Build cost", "$10,000"],
      ["Finish", "Powder coat and carbon"],
    ],
    video: "BfXaJy-ZVh4",
    thumb: "assets/hero/h07.jpg",
  },
];

/* ---------------------------------------------------------------------------
   KIT — what you ride in and film with.
   ⚠️  THESE ARE PLACEHOLDERS based on what's visible in your videos.
   Swap in the real makes/models (and affiliate links if you have them).
   `link` is optional — leave it as "" and the card won't be clickable.
   ------------------------------------------------------------------------- */
export const KIT = [
  { group: "Protection", name: "Full-face MX helmet", detail: "Blacked out. On in every video.", link: "" },
  { group: "Protection", name: "Mirrored goggles",    detail: "Blue lens. Part of the look now.", link: "" },
  { group: "Protection", name: "Gloves and knee pads", detail: "Learned this one the hard way.", link: "" },
  { group: "Power",      name: "EBMX 9000 controller", detail: "Put it in myself and made a whole video out of it.", link: "" },
  { group: "Power",      name: "72V battery pack",     detail: "Runs the bike to 19,000 watts.", link: "" },
  { group: "Capture",    name: "Action cam",           detail: "Helmet and chase shots.", link: "" },
  { group: "Capture",    name: "Mirrorless body",      detail: "B-roll and thumbnails.", link: "" },
  { group: "Capture",    name: "Drone",                detail: "Trail chases and wide shots.", link: "" },
  { group: "Garage",     name: "Bike stand",           detail: "First thing that comes out for any build.", link: "" },
  { group: "Garage",     name: "Torque wrench",        detail: "Nothing goes back on by feel.", link: "" },
];

/* Brands that have appeared on the channel — pulled from real video titles.
   This is "featured", not "endorsed by". Keep it honest; it sells better. */
export const BRANDS = [
  "SUR-RON", "SUPER73", "RIXOC", "MACFOX", "TST", "VICTRIP",
  "EBMX", "TALARIA", "YOZMA", "OUTS", "D10",
];

/* ---------------------------------------------------------------------------
   WHAT SPONSORS GET. Rates deliberately left off — quote per deal.
   ------------------------------------------------------------------------- */
export const PACKAGES = [
  {
    code: "01",
    name: "Dedicated review",
    lede: "I make a full video about your product.",
    items: [
      "5 to 15 minutes, long form",
      "Real riding and a straight verdict",
      "Custom thumbnail and title",
      "Links in the description, pinned comment",
      "Short cut-downs for Shorts",
    ],
    flag: "Most requested",
  },
  {
    code: "02",
    name: "Integration",
    lede: "Your product shows up inside one of my regular videos.",
    items: [
      "60 to 90 seconds",
      "Goes in whatever format's already pulling views",
      "Product on the bike through the B-roll",
      "Link and discount code",
    ],
    flag: "",
  },
  {
    code: "03",
    name: "Shorts package",
    lede: "Shorts, since that's where most of my views actually come from.",
    items: [
      "3 to 5 vertical Shorts",
      "Written hook first",
      "Vertical files you keep and reuse",
      "Fastest turnaround",
    ],
    flag: "Best value",
  },
  {
    code: "04",
    name: "Long-term test",
    lede: "I actually use it for months, not just one afternoon.",
    items: [
      "Several videos over time",
      "I report failures if they happen",
      "Track, street and daily riding",
      "Photos you can reuse",
    ],
    flag: "",
  },
];

/* Dropdown options on the sponsor form. */
export const ENQUIRY_TYPES = [
  "Dedicated Review",
  "Integration",
  "Shorts Package",
  "Long-Term Test",
  "Product seeding / sample",
  "Something else",
];
