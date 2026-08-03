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
   THE GARAGE — your bikes.
   `specs` rows are free-form: [label, value]. Add/remove as you like.
   `video` is the YouTube ID of the build video (used for the "watch build" link).
   ------------------------------------------------------------------------- */
export const GARAGE = [
  {
    name: "The Purple One",
    model: "Sur-Ron Light Bee X",
    status: "PRIMARY",
    blurb:
      "The bike the channel is built on. Ten grand deep, de-restricted, and " +
      "wearing the paint everyone recognises before they know the name.",
    specs: [
      ["Battery", "72V"],
      ["Peak Output", "19,000W"],
      ["Controller", "EBMX 9000"],
      ["Build Cost", "$10,000"],
      ["State", "Unclapped"],
    ],
    video: "BfXaJy-ZVh4",
    thumb: "assets/thumbs/TXUDZ30YCbA.jpg",
  },
  {
    name: "Dream Build",
    model: "Super73-style / OUTS",
    status: "STREET",
    blurb:
      "A five-thousand-dollar street build, done properly — fat tyres, " +
      "moto bars, and a seat long enough to carry a passenger who regrets it.",
    specs: [
      ["Class", "Street / Moped"],
      ["Build Cost", "$5,000"],
      ["Tyres", "Fat knobby"],
      ["Use", "Daily + city"],
    ],
    video: "Iq8F5kjKG1A",
    thumb: "assets/thumbs/Iq8F5kjKG1A.jpg",
  },
  {
    name: "The Successor",
    model: "Rixoc GT19",
    status: "TESTING",
    blurb:
      "The bike that made me say Sur-Ron is finished. Track-tested, " +
      "commuted on, and put through everyday life to see if it actually holds up.",
    specs: [
      ["Role", "Long-term test"],
      ["Tested", "Track + street"],
      ["Verdict", "On the channel"],
    ],
    video: "1Kdz5zEyCDk",
    thumb: "assets/thumbs/JQ5EkSQsy34.jpg",
  },
];

/* ---------------------------------------------------------------------------
   KIT — what you ride in and film with.
   ⚠️  THESE ARE PLACEHOLDERS based on what's visible in your videos.
   Swap in the real makes/models (and affiliate links if you have them).
   `link` is optional — leave it as "" and the card won't be clickable.
   ------------------------------------------------------------------------- */
export const KIT = [
  { group: "Protection", name: "Full-face MX helmet", detail: "Blacked out. Always on. No face reveal.", link: "" },
  { group: "Protection", name: "Iridescent goggles",  detail: "Blue/violet mirror lens — the signature.",  link: "" },
  { group: "Protection", name: "Gloves + knee",       detail: "Because Texas taught me a lesson.",         link: "" },
  { group: "Power",      name: "EBMX 9000 controller", detail: "Installed and reviewed on the channel.",   link: "" },
  { group: "Power",      name: "72V battery pack",     detail: "The reason it pulls 19,000W.",             link: "" },
  { group: "Capture",    name: "Action cam",           detail: "Helmet + chase angles.",                   link: "" },
  { group: "Capture",    name: "Mirrorless body",      detail: "B-roll, static beauty shots, thumbnails.", link: "" },
  { group: "Capture",    name: "Drone",                detail: "Trail chases and the wide reveal shots.",  link: "" },
  { group: "Garage",     name: "Bike stand",           detail: "Every build video starts here.",           link: "" },
  { group: "Garage",     name: "Torque wrench + bits", detail: "Nothing goes back on guessed.",            link: "" },
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
    name: "Dedicated Review",
    lede: "Your bike or part gets the whole video.",
    items: [
      "5–15 min long-form review",
      "Real riding, real verdict",
      "Custom thumbnail + title",
      "Pinned comment + description links",
      "Cut-downs for Shorts",
    ],
    flag: "MOST REQUESTED",
  },
  {
    code: "02",
    name: "Integration",
    lede: "Woven into a build or ride video.",
    items: [
      "60–90 sec dedicated segment",
      "Placed inside proven formats",
      "On-bike product in B-roll",
      "Link + discount code",
    ],
    flag: "",
  },
  {
    code: "03",
    name: "Shorts Package",
    lede: "Where the volume is. 200+ Shorts deep.",
    items: [
      "3–5 vertical Shorts",
      "Hook-first, algorithm-tuned",
      "Cross-posted vertical assets",
      "Fastest turnaround",
    ],
    flag: "BEST VALUE",
  },
  {
    code: "04",
    name: "Long-Term Test",
    lede: "Months on the bike, not minutes.",
    items: [
      "Multi-video durability arc",
      "Honest failure reporting",
      "Track + street + daily use",
      "Photo assets you can reuse",
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
