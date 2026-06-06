import fs from "node:fs";
import path from "node:path";

const BASE_URL = process.env.UNITY2_BASE_URL || "https://unity2.ai/v1";
const MODEL = process.env.ENDING_IMAGE_MODEL || "gpt-image-2";
const SIZE = process.env.ENDING_IMAGE_SIZE || "1024x1536";
const OUT_DIR = process.env.ENDING_IMAGE_OUT_DIR || "images/endings";
const PROMPT_LOG = process.env.ENDING_PROMPT_LOG || "images/ending_image_prompts.jsonl";
const DELAY_MS = Number(process.env.ENDING_IMAGE_DELAY_MS || 10000);

const STYLE =
  "Chinese ancient ink-wash and meticulous gongbi illustration, vintage silk scroll texture, muted gilded gold and deep ink-black dominant palette, slight aged yellow patina, smoky candlelit glow, dramatic chiaroscuro, cinematic vertical composition, clean large shapes, not overly detailed, no clutter, no text, no characters or readable writing, no watermark, with an ornate vintage game-card border integrated into the artwork";

const ENDING_PROMPTS = [
  {
    id: "end_mil_0",
    title: "兵变",
    subject:
      "inside a dark military camp at midnight, abandoned command seat, the warlord's fallen tiger tally on the ground, soldiers turning their spears toward the central tent, a trusted deputy general's shadow rising behind the war banner",
  },
  {
    id: "end_mil_100",
    title: "军阀",
    subject:
      "a young ruler sitting alone in the command tent while oversized generals' war banners crowd around him like walls, armored commanders looming outside the lamplight, the central command seal small and powerless on the table",
  },
  {
    id: "end_food_0",
    title: "饥荒",
    subject:
      "a snow-covered army camp after famine, empty grain sacks, a dead warhorse beside a cold cooking pot, scattered soldiers disappearing into white fog, the command flag half-buried in snow",
  },
  {
    id: "end_food_100",
    title: "腐粮",
    subject:
      "an overfilled granary in a warlord city, swollen grain sacks splitting open, dark mold creeping like ink, corrupt officials' silhouettes behind hanging account scrolls, a distant imperial investigator entering through mist",
  },
  {
    id: "end_mor_0",
    title: "暴动",
    subject:
      "city gates forced open from within by furious common people, farming tools and broken banners raised in smoke, the warlord's protective flag torn down, palace lanterns falling into muddy streets",
  },
  {
    id: "end_mor_100",
    title: "圣人",
    subject:
      "a warlord elevated on a high shrine-like platform beneath countless prayer banners, adoring civilians below, distant coalition armies gathering outside the city, the holy glow becoming a cold prison",
  },
  {
    id: "end_int_0",
    title: "中伏",
    subject:
      "a lone army trapped in a mountain pass, false maps scattered in mud, enemy flags appearing from every ridge through black fog, the safe road collapsing into an ambush",
  },
  {
    id: "end_int_100",
    title: "众叛",
    subject:
      "an empty strategy tent filled with hanging surveillance slips and extinguished lamps, advisers fleeing into the night, the ruler's shadow alone over a table crowded with unread secret reports",
  },
  {
    id: "end_defeat_1",
    title: "溃败",
    subject:
      "beneath the first fortress wall after a failed assault, broken ladders, trampled war banner in mud, retreating soldiers swallowed by dawn mist, the fortress looming impossibly tall",
  },
  {
    id: "end_defeat_2",
    title: "断粮",
    subject:
      "a long siege camp with cold cooking fires, empty supply carts, thin soldiers watching a distant merchant city remain bright and well-fed, the grain road fading into dust",
  },
  {
    id: "end_defeat_3",
    title: "计中计",
    subject:
      "a siege map becoming a trap, ink lines curling around the warlord's army like chains, scholar strategists hidden behind layered screens, fortress gates open but leading into darkness",
  },
  {
    id: "end_defeat_4",
    title: "圣战",
    subject:
      "a sacred temple city under incense smoke, unarmed believers standing like an unbreakable wall before the gate, soldiers hesitating below, golden ritual fire overpowering steel",
  },
  {
    id: "end_defeat_5",
    title: "功败垂成",
    subject:
      "the royal capital visible beyond a wide moat at dusk, exhausted army collapsed before the final wall, a torn imperial banner almost within reach, victory shining far away and unreachable",
  },
  {
    id: "end_aman_sub",
    title: "驯马",
    subject:
      "a fierce grassland warrior woman kneeling beneath the warlord's banner, offering a short curved blade across her palms, wild horses and grassland wind merging with the central plains camp",
  },
  {
    id: "end_aman_fall",
    title: "反噬",
    subject:
      "a grassland warrior woman riding away at dawn with stolen warhorses and loyal soldiers, laughing against the wind, the abandoned command tent behind her with a cut bridle on the ground",
  },
  {
    id: "end_hongsiu_sub",
    title: "金屋",
    subject:
      "an elegant merchant woman beside a vast war table covered with ledgers, grain routes, gold seals, and city maps, her hand calmly measuring the cost of the new kingdom",
  },
  {
    id: "end_hongsiu_fall",
    title: "债主",
    subject:
      "a quiet palace chamber after betrayal, treasury seals and city defense maps transferred to another owner, an elegant merchant woman drinking tea behind a silk curtain while the command seal lies out of reach",
  },
  {
    id: "end_qingzhao_sub",
    title: "折笔",
    subject:
      "a calm scholar woman breaking an old bamboo letter tube over a brazier, fragments of enemy-state correspondence turning to ash, firelight reflecting in her restrained eyes",
  },
  {
    id: "end_qingzhao_fall",
    title: "间谍",
    subject:
      "an empty bedside chamber at dawn, half a poem left beside a blank military map, a scholar woman's silhouette vanishing beyond paper screens, secret letters drifting like snow",
  },
  {
    id: "end_wuyue_sub",
    title: "破戒",
    subject:
      "a temple priestess removing a silver crown and placing it into the warlord's palm, broken idols behind her, moonlight falling from the shrine into the human world",
  },
  {
    id: "end_wuyue_fall",
    title: "献祭",
    subject:
      "a vast night altar with ritual flames rising around a warlord's name tablet, a serene priestess standing in smoke, the coronation fire slowly becoming a sacrificial pyre",
  },
  {
    id: "end_tyrant",
    title: "暴君",
    subject:
      "a ruthless ruler before a silent conquered land, black banners over burned cities, historians scraping a name from a stone stele, victory monuments casting cruel shadows",
  },
  {
    id: "end_saint",
    title: "仁君",
    subject:
      "a benevolent ruler standing alone on a road paved with petitions and broken promises, gentle lanterns extinguishing behind him, betrayers' silhouettes closing in from the fog",
  },
  {
    id: "end_lustking",
    title: "酒池肉林",
    subject:
      "a decadent silk chamber with overturned wine vessels, soft cushions, and neglected military reports, distant city walls already under siege beyond the curtains, beauty and ruin sharing the same lamplight",
  },
  {
    id: "end_abandoned",
    title: "空帐",
    subject:
      "an empty command tent after everyone has left, farewell letters pressed beneath a cold tiger tally, four fading silhouettes walking away in different directions through dim lantern smoke",
  },
  {
    id: "end_unify",
    title: "一统天下",
    subject:
      "five conquered city banners standing before the command tent, a ruler on a high wall looking over a scarred but peaceful land, dawn breaking through smoke and old battlefield mist",
  },
  {
    id: "end_warlord",
    title: "割据一方",
    subject:
      "a weary warlord guarding one surviving frontier city at sunset, patched banners, repaired walls, soldiers and civilians sharing the same narrow light, survival instead of glory",
  },
  {
    id: "end_emperor",
    title: "千古一帝",
    subject:
      "a wise emperor standing before a unified realm, five roads leading into a balanced and restored land, war banners transformed into ceremonial standards, calm golden dawn over black ink mountains",
  },
  {
    id: "end_harem_king",
    title: "后宫之主",
    subject:
      "a ruler seated in a peaceful palace garden surrounded by four elegant female silhouettes, each beautiful yet emotionally distant, perfect order with hidden loneliness behind silk screens",
  },
  {
    id: "end_retire",
    title: "弃甲归田",
    subject:
      "a warlord leaving armor and tiger tally on an old map, walking into spring rain toward soft green fields, distant followers calling from behind while the muddy path quietly accepts him",
  },
];

function argValue(name, fallback = "") {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function hasArg(name) {
  return process.argv.includes(name);
}

function parseKeys(value) {
  return String(value || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function promptFor(item) {
  return `${STYLE}, ${item.subject}, vertical 2:3 ending card artwork, 1024x1536 pixels`;
}

function writePromptLog(items) {
  fs.mkdirSync(path.dirname(PROMPT_LOG), { recursive: true });
  const lines = items.map((item) =>
    JSON.stringify({
      id: item.id,
      title: item.title,
      size: SIZE,
      output: path.join(OUT_DIR, `${item.id}.webp`).replaceAll("\\", "/"),
      prompt: promptFor(item),
    })
  );
  fs.writeFileSync(PROMPT_LOG, `${lines.join("\n")}\n`, "utf8");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateOne({ apiKey, prompt }) {
  const response = await fetch(`${BASE_URL.replace(/\/$/, "")}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      size: SIZE,
      response_format: "b64_json",
      output_format: "webp",
      output_compression: 72,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  const json = await response.json();
  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) throw new Error("Response did not include data[0].b64_json");
  return Buffer.from(b64, "base64");
}

async function main() {
  const ids = argValue("--ids");
  const idSet = ids ? new Set(ids.split(",").map((x) => x.trim()).filter(Boolean)) : null;
  const dryRun = hasArg("--dry-run");
  const overwrite = hasArg("--overwrite");
  const apiKeys = parseKeys(argValue("--api-keys") || process.env.UNITY2_API_KEYS || process.env.UNITY2_API_KEY);
  const items = idSet ? ENDING_PROMPTS.filter((item) => idSet.has(item.id)) : ENDING_PROMPTS;

  writePromptLog(items);
  console.log(`Prompts written: ${PROMPT_LOG}`);
  console.log(`Count: ${items.length}, size: ${SIZE}`);

  if (dryRun) {
    items.forEach((item) => console.log(`${item.id} ${item.title} -> ${path.join(OUT_DIR, `${item.id}.webp`)}`));
    return;
  }

  if (!apiKeys.length) {
    console.log("No API key found. Set UNITY2_API_KEY or UNITY2_API_KEYS, or run with --dry-run to only write prompts.");
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const outPath = path.join(OUT_DIR, `${item.id}.webp`);
    if (!overwrite && fs.existsSync(outPath)) {
      console.log(`[${i + 1}/${items.length}] skip existing ${item.id}`);
      continue;
    }

    const apiKey = apiKeys[i % apiKeys.length];
    console.log(`[${i + 1}/${items.length}] generating ${item.id} ${item.title} -> ${outPath}`);
    const image = await generateOne({ apiKey, prompt: promptFor(item) });
    fs.writeFileSync(outPath, image);
    if (i < items.length - 1 && DELAY_MS > 0) await sleep(DELAY_MS);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
