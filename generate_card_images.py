import argparse
import base64
import json
import os
import subprocess
import sys
import time
from io import BytesIO
from pathlib import Path
from typing import Dict, List, Optional, Set


NPC_STYLES = {
    "aman": (
        "the same recurring woman A'man: a fierce grassland warrior woman, "
        "athletic build, sun-browned skin, amber eyes, long black braided hair, "
        "a small scar on her left cheek, fur-lined leather armor, bone and bronze ornaments"
    ),
    "hongsiu": (
        "the same recurring woman Hongsleeve: an elegant wealthy young merchant woman, "
        "pale skin, clever almond eyes, black hair in a high bun with a gold hairpin, "
        "crimson silk robes, holding ledgers or an abacus"
    ),
    "qingzhao": (
        "the same recurring woman Qingzhao: a calm enemy scholar woman, slender, pale, "
        "long straight black hair, jade hairpin, white and ink-blue scholar robes, "
        "surrounded by scrolls and old books"
    ),
    "wuyue": (
        "the same recurring woman Wuyue: a serene mysterious temple priestess, "
        "long black hair, silver crown and tiny silver bells, moon-white ceremonial robes "
        "with dark trim, faint crescent mark on her brow"
    ),
}

THEME_HINTS = {
    "sha": "military camp, soldiers, weapons, banners, armor, battlefield tension",
    "mu": "war tent, advisers, secret letters, maps, candlelit strategy table",
    "hong": "quiet palace tent, intimate courtly drama, simple silk curtains",
    "bai": "common people, city streets, refugees, fields, hunger and hardship",
    "gong": "siege warfare, fortress walls, armies, ladders, smoke and banners",
}

THEME_SCENES = {
    "sha": "a focused military scene with soldiers and weapons in an ancient Chinese war camp",
    "mu": "a focused strategy scene inside an ancient Chinese war tent, maps and secret letters on a low table",
    "hong": "a focused intimate court scene inside a quiet silk warlord tent",
    "bai": "a focused common-people scene in an ancient Chinese city street or village",
    "gong": "a focused siege scene with fortress walls, banners, smoke, and distant soldiers",
}

THEME_BY_TEXT = {
    "sha": ["沙场", "点兵", "军", "兵", "战", "刀", "甲", "马", "旗"],
    "mu": ["幕", "密", "谋", "报", "信", "账", "印", "谍", "图"],
    "hong": ["红袖", "添香", "后宫", "帐", "吻", "发", "簪", "月"],
    "bai": ["百姓", "苍生", "民", "粮", "疫", "井", "田", "税", "流"],
    "gong": ["攻城", "城", "寨", "关", "殿", "渡", "阁", "台"],
}

STYLE_TEMPLATE = (
    "Ancient Chinese ink-wash painting, vintage scroll art style, {subject}, "
    "muted gold and deep ink-black palette, weathered silk/parchment texture, "
    "soft candlelight and mist, dramatic chiaroscuro, faded antique colors, "
    "fine brushwork, cinematic composition, no text, no border, no frame"
)

SUBJECT_OVERRIDES = {
    "c01": "three deserter soldiers kneeling in a military camp at night, a stern military judge waiting for orders",
    "c02": "a scout handing a secret letter inside a war tent, lamplight over maps and armor",
    "c03": "a crowd of ragged refugees outside a city gate in winter",
    "c04": "a surrendered enemy general kneeling before a young warlord, soldiers watching tensely",
    "c05": "blacksmiths forging huge siege engines in a military workshop, iron tools and armored soldiers nearby",
    "c06": "tax collectors demanding grain from poor farmers during autumn harvest",
    "c07": "an enemy spy captured in a sparse interrogation room, guards and a single small lamp",
    "c08": "a night raid on enemy grain wagons under a moonless sky",
    "c09": "an anxious crowd gathered around a bitter village well, officials testing the water",
    "c10": "an old wounded veteran kneeling in a military camp asking to leave service",
    "siege_1": "an army storming a crumbling frontier fortress wall at dawn",
    "siege_2": "a merchant river city under siege, mercenary guards on golden walls",
    "siege_3": "a scholarly city of libraries and courtyards filled with hidden traps and strategists",
    "siege_4": "a sacred temple city defended by devoted believers under burning incense",
    "siege_5": "a vast royal capital fortress with towering walls and a wide moat before the final battle",
    "npc_aman": "a fierce grassland warrior woman captured after battle, still defiant in a war camp",
    "npc_hongsiu": "a wealthy young merchant woman holding ledgers in a war tent",
    "npc_qingzhao": "an elegant scholar woman burning scrolls in a candlelit library",
    "npc_wuyue": "a mysterious temple priestess kneeling before a broken idol in moonlight",
}


def theme_hint(theme: str) -> str:
    theme = theme or ""
    for key, needles in THEME_BY_TEXT.items():
        if any(n in theme for n in needles):
            return THEME_HINTS[key]
    return "ancient warlord court, turbulent war-torn Chinese frontier atmosphere"


def theme_key(theme: str) -> str:
    theme = theme or ""
    for key, needles in THEME_BY_TEXT.items():
        if any(n in theme for n in needles):
            return key
    return ""


def load_cards(engine_path: Path) -> List[Dict]:
    node_code = r"""
const fs = require('fs');
const src = fs.readFileSync(process.argv[1], 'utf8');
const m = src.match(/const CARDS=\[([\s\S]*?)\];\s*\/\/ ─── STATE/);
if (!m) throw new Error('Could not find CARDS array in engine.js');
const CARDS = Function('return [' + m[1] + '];')();
const npcs = ['aman', 'hongsiu', 'qingzhao', 'wuyue'];
const prefixNpc = {am:'aman', hs:'hongsiu', qz:'qingzhao', wy:'wuyue'};
const out = CARDS.map(c => {
  const raw = JSON.stringify(c);
  const involved = new Set();
  if (npcs.includes(c.ch)) involved.add(c.ch);
  if (npcs.includes(c.npc_req)) involved.add(c.npc_req);
  for (const [prefix, npc] of Object.entries(prefixNpc)) {
    if ((c.id || '').startsWith(prefix)) involved.add(npc);
  }
  for (const npc of npcs) {
    if (raw.includes(npc + '_aff')) involved.add(npc);
  }
  return {
    id: c.id,
    ch: c.ch || '',
    tier: c.tier || 'base',
    theme: c.theme || '',
    title: c.title || '',
    text: c.t || '',
    left: c.l && c.l.t || '',
    right: c.r && c.r.t || '',
    involved_npcs: Array.from(involved)
  };
});
console.log(JSON.stringify(out, null, 2));
"""
    try:
        result = subprocess.run(
            ["node", "-e", node_code, str(engine_path)],
            check=True,
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
    except FileNotFoundError as exc:
        raise SystemExit("Node.js is required so this script can read engine.js card data.") from exc
    except subprocess.CalledProcessError as exc:
        raise SystemExit(exc.stderr or exc.stdout) from exc
    return json.loads(result.stdout)


def build_subject(card: Dict) -> str:
    npc_clause = ""
    if card["involved_npcs"]:
        npc_clause = " featuring " + "; ".join(NPC_STYLES[n] for n in card["involved_npcs"])

    override = SUBJECT_OVERRIDES.get(card["id"])
    if override:
        return f"{override}{npc_clause}"

    if card["id"].startswith("siege_"):
        core = f"an army besieging the fortress or city named {card['title']}, smoke, banners, ladders, dawn light"
    elif card["id"].startswith("npc_"):
        core = f"a dramatic first encounter with {card['title']} in a warlord's tent after a city falls"
    else:
        core = THEME_SCENES.get(theme_key(card["theme"]), "a focused ancient Chinese warlord story scene")

    return f"{core}{npc_clause}"


def build_prompt(card: Dict) -> str:
    return STYLE_TEMPLATE.format(subject=build_subject(card))


def detect_format(data: bytes) -> str:
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if data.startswith(b"\xff\xd8\xff"):
        return "jpg"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "webp"
    return "unknown"


def save_webp(data: bytes, out_path: Path, quality: int) -> None:
    fmt = detect_format(data)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    if fmt == "webp":
        out_path.write_bytes(data)
        return

    try:
        from PIL import Image
    except ImportError as exc:
        raise RuntimeError(
            f"The API returned {fmt}, not WebP. Install Pillow to convert it: pip install pillow"
        ) from exc

    with Image.open(BytesIO(data)) as img:
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGBA")
        img.save(out_path, "WEBP", quality=quality, method=6)


def generate_one(client, args: argparse.Namespace, prompt: str) -> bytes:
    payload = {
        "model": args.model,
        "prompt": prompt,
        "size": args.size,
        "response_format": "b64_json",
    }
    if args.request_output_format:
        payload["output_format"] = "webp"
        payload["output_compression"] = args.output_compression

    try:
        response = client.images.generate(**payload)
    except Exception as exc:
        if args.request_output_format and "output_format" in str(exc):
            payload.pop("output_format", None)
            response = client.images.generate(**payload)
        else:
            raise

    b64 = response.data[0].b64_json
    if not b64:
        raise RuntimeError("The API response did not include b64_json image data.")
    return base64.b64decode(b64)


def parse_ids(value: str) -> Optional[Set[str]]:
    if not value:
        return None
    return {x.strip() for x in value.split(",") if x.strip()}


def parse_api_keys(value: str) -> List[str]:
    return [x.strip() for x in (value or "").split(",") if x.strip()]


def apply_start_controls(cards: List[Dict], start_at: str, start_after: str) -> List[Dict]:
    if start_at:
        ids = [c["id"] for c in cards]
        if start_at not in ids:
            raise SystemExit(f"--start-at id not found: {start_at}")
        cards = cards[ids.index(start_at):]
    if start_after:
        ids = [c["id"] for c in cards]
        if start_after not in ids:
            raise SystemExit(f"--start-after id not found: {start_after}")
        cards = cards[ids.index(start_after) + 1:]
    return cards


def main() -> int:
    parser = argparse.ArgumentParser(description="Batch-generate WebP images for all cards in engine.js.")
    parser.add_argument("--engine", default="engine.js", help="Path to engine.js")
    parser.add_argument("--out-dir", default="images", help="Output image directory")
    parser.add_argument("--base-url", default=os.getenv("UNITY2_BASE_URL", "https://unity2.ai/v1"))
    parser.add_argument("--api-key", default=os.getenv("UNITY2_API_KEY") or os.getenv("OPENAI_API_KEY") or "")
    parser.add_argument("--api-keys", default=os.getenv("UNITY2_API_KEYS", ""), help="Comma-separated API keys; script switches keys on failure")
    parser.add_argument("--model", default="gpt-image-2")
    parser.add_argument("--size", default="512x384")
    parser.add_argument("--ids", default="", help="Comma-separated card ids to generate, e.g. c01,c02,npc_aman")
    parser.add_argument("--start-at", default="", help="Start from this card id in engine order")
    parser.add_argument("--start-after", default="", help="Start after this card id in engine order")
    parser.add_argument("--limit", type=int, default=0, help="Generate only the first N selected cards")
    parser.add_argument("--overwrite", action="store_true", help="Regenerate files that already exist")
    parser.add_argument("--dry-run", action="store_true", help="Do not call the API; write prompts JSONL only")
    parser.add_argument("--sleep", type=float, default=10, help="Seconds to wait between API calls")
    parser.add_argument("--retries", type=int, default=2)
    parser.add_argument("--webp-quality", type=int, default=86)
    parser.add_argument("--output-compression", type=int, default=70)
    parser.add_argument(
        "--no-request-output-format",
        dest="request_output_format",
        action="store_false",
        help="Do not send output_format=webp; convert returned image to WebP locally with Pillow.",
    )
    parser.set_defaults(request_output_format=True)
    args = parser.parse_args()

    root = Path.cwd()
    cards = load_cards(root / args.engine)
    wanted = parse_ids(args.ids)
    if wanted:
        cards = [c for c in cards if c["id"] in wanted]
    cards = apply_start_controls(cards, args.start_at, args.start_after)
    if args.limit:
        cards = cards[: args.limit]

    out_dir = root / args.out_dir
    prompt_log = out_dir / "card_image_prompts.jsonl"
    out_dir.mkdir(parents=True, exist_ok=True)

    with prompt_log.open("w", encoding="utf-8") as f:
        for card in cards:
            prompt = build_prompt(card)
            f.write(json.dumps({"id": card["id"], "title": card["title"], "prompt": prompt}, ensure_ascii=False) + "\n")

    if args.dry_run:
        print(f"Wrote {len(cards)} prompts to {prompt_log}")
        return 0

    api_keys = parse_api_keys(args.api_keys or args.api_key)
    if not api_keys:
        raise SystemExit("Missing API key. Pass --api-key, --api-keys, or set UNITY2_API_KEY / UNITY2_API_KEYS / OPENAI_API_KEY.")

    try:
        from openai import OpenAI
    except ImportError as exc:
        raise SystemExit("Missing dependency. Install it with: pip install openai") from exc

    generated = 0
    skipped = 0
    failed = 0
    key_index = 0
    fail_log = out_dir / "card_image_failures.jsonl"

    for i, card in enumerate(cards, 1):
        out_path = out_dir / f"{card['id']}.webp"
        if out_path.exists() and not args.overwrite:
            print(f"[{i}/{len(cards)}] skip existing {out_path}")
            skipped += 1
            continue

        prompt = build_prompt(card)
        print(f"[{i}/{len(cards)}] generating {card['id']} {card['title']} -> {out_path}")
        for attempt in range(args.retries + len(api_keys)):
            try:
                client = OpenAI(api_key=api_keys[key_index % len(api_keys)], base_url=args.base_url)
                if len(api_keys) > 1:
                    print(f"  using key#{(key_index % len(api_keys)) + 1}/{len(api_keys)}")
                data = generate_one(client, args, prompt)
                save_webp(data, out_path, args.webp_quality)
                generated += 1
                key_index += 1
                break
            except Exception as exc:
                key_index += 1
                if attempt >= args.retries + len(api_keys) - 1:
                    failed += 1
                    print(f"  failed: {exc}", file=sys.stderr)
                    with fail_log.open("a", encoding="utf-8") as f:
                        f.write(json.dumps({"id": card["id"], "title": card["title"], "error": str(exc), "time": time.strftime("%Y-%m-%dT%H:%M:%S")}, ensure_ascii=False) + "\n")
                else:
                    wait = args.sleep * (attempt + 2)
                    print(f"  retry/switch key after error: {exc}; waiting {wait:.1f}s")
                    time.sleep(wait)

        if args.sleep > 0:
            time.sleep(args.sleep)

    print(f"Done. generated={generated}, skipped={skipped}, failed={failed}, prompts={prompt_log}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
