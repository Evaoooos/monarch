import fs from "node:fs";
import path from "node:path";

const NPC_STYLES = {
  aman:
    "the same recurring woman A'man: a fierce grassland warrior woman, athletic build, sun-browned skin, amber eyes, long black braided hair, a small scar on her left cheek, fur-lined leather armor, bone and bronze ornaments",
  hongsiu:
    "the same recurring woman Hongsleeve: an elegant wealthy young merchant woman, pale skin, clever almond eyes, black hair in a high bun with a gold hairpin, crimson silk robes, holding ledgers or an abacus",
  qingzhao:
    "the same recurring woman Qingzhao: a calm enemy scholar woman, slender, pale, long straight black hair, jade hairpin, white and ink-blue scholar robes, surrounded by scrolls and old books",
  wuyue:
    "the same recurring woman Wuyue: a serene mysterious temple priestess, long black hair, silver crown and tiny silver bells, moon-white ceremonial robes with dark trim, faint crescent mark on her brow",
};

const THEME_HINTS = {
  sha: "military camp, soldiers, weapons, banners, armor, battlefield tension",
  mu: "war tent, advisers, secret letters, maps, candlelit strategy table",
  hong: "quiet palace tent, intimate courtly drama, simple silk curtains",
  bai: "common people, city streets, refugees, fields, hunger and hardship",
  gong: "siege warfare, fortress walls, armies, ladders, smoke and banners",
};

const THEME_SCENES = {
  sha: "a focused military scene with soldiers and weapons in an ancient Chinese war camp",
  mu: "a focused strategy scene inside an ancient Chinese war tent, maps and secret letters on a low table",
  hong: "a focused intimate court scene inside a quiet silk warlord tent",
  bai: "a focused common-people scene in an ancient Chinese city street or village",
  gong: "a focused siege scene with fortress walls, banners, smoke, and distant soldiers",
};

const THEME_BY_TEXT = {
  sha: ["沙场", "点兵", "军", "兵", "战", "刀", "甲", "马", "旗"],
  mu: ["幕", "密", "谋", "报", "信", "账", "印", "谍", "图"],
  hong: ["红袖", "添香", "后宫", "帐", "吻", "发", "簪", "月"],
  bai: ["百姓", "苍生", "民", "粮", "疫", "井", "田", "税", "流"],
  gong: ["攻城", "城", "寨", "关", "殿", "渡", "阁", "台"],
};

const STYLE_TEMPLATE =
  "Ancient Chinese ink-wash painting, vintage scroll art style, {SUBJECT}, muted gold and deep ink-black palette, weathered silk/parchment texture, soft candlelight and mist, dramatic chiaroscuro, faded antique colors, fine brushwork, cinematic composition, no text, no border, no frame";

const SUBJECT_OVERRIDES = {
  c01: "three deserter soldiers kneeling in a military camp at night, a stern military judge waiting for orders",
  c02: "a scout handing a secret letter inside a war tent, lamplight over maps and armor",
  c03: "a crowd of ragged refugees outside a city gate in winter",
  c04: "a surrendered enemy general kneeling before a young warlord, soldiers watching tensely",
  c05: "blacksmiths forging huge siege engines in a military workshop, iron tools and armored soldiers nearby",
  c06: "tax collectors demanding grain from poor farmers during autumn harvest",
  c07: "an enemy spy captured in a sparse interrogation room, guards and a single small lamp",
  c08: "a night raid on enemy grain wagons under a moonless sky",
  c09: "an anxious crowd gathered around a bitter village well, officials testing the water",
  c10: "an old wounded veteran kneeling in a military camp asking to leave service",
  siege_1: "an army storming a crumbling frontier fortress wall at dawn",
  siege_2: "a merchant river city under siege, mercenary guards on golden walls",
  siege_3: "a scholarly city of libraries and courtyards filled with hidden traps and strategists",
  siege_4: "a sacred temple city defended by devoted believers under burning incense",
  siege_5: "a vast royal capital fortress with towering walls and a wide moat before the final battle",
  npc_aman: "a fierce grassland warrior woman captured after battle, still defiant in a war camp",
  npc_hongsiu: "a wealthy young merchant woman holding ledgers in a war tent",
  npc_qingzhao: "an elegant scholar woman burning scrolls in a candlelit library",
  npc_wuyue: "a mysterious temple priestess kneeling before a broken idol in moonlight",
};

function argValue(name, fallback = "") {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function hasArg(name) {
  return process.argv.includes(name);
}

function loadCards(enginePath) {
  const src = fs.readFileSync(enginePath, "utf8");
  const m = src.match(/const CARDS=\[([\s\S]*?)\];\s*\/\/ ─── STATE/);
  if (!m) throw new Error("Could not find CARDS array in engine.js");
  const CARDS = Function(`return [${m[1]}];`)();
  const npcs = ["aman", "hongsiu", "qingzhao", "wuyue"];
  const prefixNpc = { am: "aman", hs: "hongsiu", qz: "qingzhao", wy: "wuyue" };

  return CARDS.map((c) => {
    const raw = JSON.stringify(c);
    const involved = new Set();
    if (npcs.includes(c.ch)) involved.add(c.ch);
    if (npcs.includes(c.npc_req)) involved.add(c.npc_req);
    for (const [prefix, npc] of Object.entries(prefixNpc)) {
      if ((c.id || "").startsWith(prefix)) involved.add(npc);
    }
    for (const npc of npcs) {
      if (raw.includes(`${npc}_aff`)) involved.add(npc);
    }
    return {
      id: c.id,
      ch: c.ch || "",
      tier: c.tier || "base",
      theme: c.theme || "",
      title: c.title || "",
      text: c.t || "",
      left: c.l?.t || "",
      right: c.r?.t || "",
      involvedNpcs: [...involved],
    };
  });
}

function themeHint(theme = "") {
  for (const [key, needles] of Object.entries(THEME_BY_TEXT)) {
    if (needles.some((n) => theme.includes(n))) return THEME_HINTS[key];
  }
  return "ancient warlord court, turbulent war-torn Chinese frontier atmosphere";
}

function themeKey(theme = "") {
  for (const [key, needles] of Object.entries(THEME_BY_TEXT)) {
    if (needles.some((n) => theme.includes(n))) return key;
  }
  return "";
}

function buildSubject(card) {
  const npcClause = card.involvedNpcs.length
    ? ` featuring ${card.involvedNpcs.map((n) => NPC_STYLES[n]).join("; ")}`
    : "";

  let core = SUBJECT_OVERRIDES[card.id];
  if (core) return `${core}${npcClause}`;

  if (card.id.startsWith("siege_")) {
    core = `an army besieging the fortress or city named ${card.title}, smoke, banners, ladders, dawn light`;
  } else if (card.id.startsWith("npc_")) {
    core = `a dramatic first encounter with ${card.title} in a warlord's tent after a city falls`;
  } else {
    const key = themeKey(card.theme);
    core = THEME_SCENES[key] || "a focused ancient Chinese warlord story scene";
  }
  return `${core}${npcClause}`;
}

function buildPrompt(card) {
  return STYLE_TEMPLATE.replace("{SUBJECT}", buildSubject(card));
}

function parseIds(value) {
  if (!value) return null;
  return new Set(value.split(",").map((x) => x.trim()).filter(Boolean));
}

function parseApiKeys(value) {
  return String(value || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function applyStartControls(cards, startAt, startAfter) {
  if (startAt) {
    const idx = cards.findIndex((c) => c.id === startAt);
    if (idx < 0) throw new Error(`--start-at id not found: ${startAt}`);
    cards = cards.slice(idx);
  }
  if (startAfter) {
    const idx = cards.findIndex((c) => c.id === startAfter);
    if (idx < 0) throw new Error(`--start-after id not found: ${startAfter}`);
    cards = cards.slice(idx + 1);
  }
  return cards;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function looksLikeWebp(buf) {
  return buf.length > 12 && buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP";
}

function isUpstreamError(err) {
  return /HTTP 502|upstream_error|temporarily unavailable/i.test(String(err?.message || err));
}

async function generateImage({ baseUrl, apiKey, model, size, prompt, requestOutputFormat, outputCompression }) {
  const body = {
    model,
    prompt,
    size,
    response_format: "b64_json",
  };
  if (requestOutputFormat) body.output_format = "webp";
  if (requestOutputFormat && outputCompression) body.output_compression = outputCompression;

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    if (requestOutputFormat && text.includes("output_format")) {
      return generateImage({ baseUrl, apiKey, model, size, prompt, requestOutputFormat: false, outputCompression });
    }
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  const json = await res.json();
  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) throw new Error("Response did not include data[0].b64_json");
  return Buffer.from(b64, "base64");
}

async function main() {
  const enginePath = argValue("--engine", "engine.js");
  const outDir = argValue("--out-dir", "images");
  const baseUrl = argValue("--base-url", process.env.UNITY2_BASE_URL || "https://unity2.ai/v1");
  const apiKeys = parseApiKeys(
    argValue("--api-keys", "") ||
      argValue("--api-key", "") ||
      process.env.UNITY2_API_KEYS ||
      process.env.UNITY2_API_KEY ||
      process.env.OPENAI_API_KEY ||
      "",
  );
  const model = argValue("--model", "gpt-image-2");
  const size = argValue("--size", "512x384");
  const noCompression = hasArg("--no-compression");
  const outputCompression = noCompression ? 0 : Number(argValue("--output-compression", "70"));
  const dryRun = hasArg("--dry-run");
  const overwrite = hasArg("--overwrite");
  const requestOutputFormat = !hasArg("--no-output-format");
  const skipUpstreamErrors = hasArg("--skip-upstream-errors");
  const ids = parseIds(argValue("--ids", ""));
  const startAt = argValue("--start-at", "");
  const startAfter = argValue("--start-after", "");
  const limit = Number(argValue("--limit", "0"));
  const pauseMs = Number(argValue("--sleep", "10000"));
  const retries = Number(argValue("--retries", "2"));

  let cards = loadCards(enginePath);
  if (ids) cards = cards.filter((c) => ids.has(c.id));
  cards = applyStartControls(cards, startAt, startAfter);
  if (limit > 0) cards = cards.slice(0, limit);

  fs.mkdirSync(outDir, { recursive: true });
  const promptPath = path.join(outDir, "card_image_prompts.jsonl");
  const failPath = path.join(outDir, "card_image_failures.jsonl");
  fs.writeFileSync(
    promptPath,
    cards.map((card) => JSON.stringify({ id: card.id, title: card.title, prompt: buildPrompt(card) })).join("\n") + "\n",
    "utf8",
  );

  if (dryRun) {
    console.log(`Wrote ${cards.length} prompts to ${promptPath}`);
    return;
  }
  if (!apiKeys.length) throw new Error("Missing API key. Pass --api-key, --api-keys, or set UNITY2_API_KEY / UNITY2_API_KEYS / OPENAI_API_KEY.");

  let generated = 0;
  let skipped = 0;
  let failed = 0;
  let keyIndex = 0;

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const outPath = path.join(outDir, `${card.id}.webp`);
    if (fs.existsSync(outPath) && !overwrite) {
      console.log(`[${i + 1}/${cards.length}] skip existing ${outPath}`);
      skipped++;
      continue;
    }

    console.log(`[${i + 1}/${cards.length}] generating ${card.id} ${card.title} -> ${outPath}`);
    for (let attempt = 0; attempt <= retries + apiKeys.length - 1; attempt++) {
      try {
        const apiKey = apiKeys[keyIndex % apiKeys.length];
        const keyLabel = apiKeys.length > 1 ? ` key#${(keyIndex % apiKeys.length) + 1}/${apiKeys.length}` : "";
        if (keyLabel) console.log(`  using${keyLabel}`);
        const buf = await generateImage({
          baseUrl,
          apiKey,
          model,
          size,
          prompt: buildPrompt(card),
          requestOutputFormat,
          outputCompression,
        });
        if (!looksLikeWebp(buf)) {
          console.warn(`  warning: returned file does not look like WebP; saving as .webp anyway`);
        }
        fs.writeFileSync(outPath, buf);
        generated++;
        keyIndex++;
        break;
      } catch (err) {
        if (skipUpstreamErrors && isUpstreamError(err)) {
          failed++;
          console.error(`  skipped upstream error: ${err.message}`);
          fs.appendFileSync(
            failPath,
            JSON.stringify({ id: card.id, title: card.title, error: err.message, time: new Date().toISOString() }) + "\n",
            "utf8",
          );
          break;
        }
        keyIndex++;
        if (attempt >= retries + apiKeys.length - 1) {
          failed++;
          console.error(`  failed: ${err.message}`);
          fs.appendFileSync(
            failPath,
            JSON.stringify({ id: card.id, title: card.title, error: err.message, time: new Date().toISOString() }) + "\n",
            "utf8",
          );
        } else {
          const wait = pauseMs * (attempt + 2);
          console.log(`  retry/switch key after error: ${err.message}; waiting ${wait}ms`);
          await sleep(wait);
        }
      }
    }
    if (pauseMs > 0) await sleep(pauseMs);
  }

  console.log(`Done. generated=${generated}, skipped=${skipped}, failed=${failed}, prompts=${promptPath}`);
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 1;
});
