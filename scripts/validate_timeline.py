"""Schema + semantic validation for timeline.json.

Checks enforced (per docs/DATA_PIPELINE.md):
  1. Required top-level keys present
  2. Section type / mood values are in allowed enums
  3. Lyric timestamps are non-decreasing and end <= meta.duration
  4. Sections do not overlap (gaps are allowed for instrumental passages)
  5. Every cue's timestamp falls inside some section
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import click

ALLOWED_SECTION_TYPES = {
    "intro", "verse1", "verse2", "verse3", "pre_chorus",
    "chorus1", "chorus2", "chorus_last", "bridge", "solo", "outro",
}
ALLOWED_MOODS = {"still", "soft", "ache", "open", "defy", "fin"}
ALLOWED_CUE_TYPES = {
    "flash-warm", "flash-cold", "color-flip", "shake-subtle",
    "iris-open", "iris-close", "static-burst",
}


@click.command()
@click.argument("timeline_file", type=click.Path(exists=True, path_type=Path))
def main(timeline_file: Path) -> None:
    """Validate TIMELINE_FILE. Exits 1 on first error."""
    try:
        data = json.loads(timeline_file.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        click.secho(f"✗ Invalid JSON: {e}", fg="red")
        sys.exit(1)

    errors: list[str] = []

    for key in ("meta", "sections", "lyrics", "cues"):
        if key not in data:
            errors.append(f"missing top-level key: {key}")
    if errors:
        _fail(errors)

    meta = data["meta"]
    duration = float(meta.get("duration", 0))
    if duration <= 0:
        errors.append("meta.duration must be > 0")

    for i, s in enumerate(data["sections"]):
        if s.get("type") not in ALLOWED_SECTION_TYPES:
            errors.append(f"sections[{i}].type={s.get('type')!r} not in allowed enum")
        if s.get("mood") not in ALLOWED_MOODS:
            errors.append(f"sections[{i}].mood={s.get('mood')!r} not in allowed enum")
        if s["end"] <= s["t"]:
            errors.append(f"sections[{i}] end <= t ({s['end']} <= {s['t']})")

    for i in range(1, len(data["sections"])):
        prev = data["sections"][i - 1]
        cur = data["sections"][i]
        if cur["t"] < prev["end"] - 1e-6:
            errors.append(f"sections[{i}] overlaps sections[{i-1}]")

    prev_end = -1.0
    for i, l in enumerate(data["lyrics"]):
        if l["t"] < prev_end - 1e-6:
            errors.append(f"lyrics[{i}].t overlaps previous line end")
        if l["end"] > duration + 1e-6:
            errors.append(f"lyrics[{i}].end exceeds meta.duration")
        if l["end"] < l["t"]:
            errors.append(f"lyrics[{i}].end < t")
        prev_end = l["end"]

    def in_any_section(t: float) -> bool:
        return any(s["t"] <= t <= s["end"] for s in data["sections"])

    for i, c in enumerate(data["cues"]):
        if c.get("type") not in ALLOWED_CUE_TYPES:
            errors.append(f"cues[{i}].type={c.get('type')!r} not in allowed enum")
        if not in_any_section(c["t"]):
            errors.append(f"cues[{i}] timestamp {c['t']} is outside every section")

    if errors:
        _fail(errors)

    click.secho(f"✓ {timeline_file} passed "
                f"({len(data['sections'])} sections, "
                f"{len(data['lyrics'])} lyrics, "
                f"{len(data['cues'])} cues)", fg="green")


def _fail(errors: list[str]) -> None:
    for e in errors:
        click.secho(f"  ✗ {e}", fg="red")
    sys.exit(1)


if __name__ == "__main__":
    main()
