"""Convert an Aegisub .ass / .srt corrected subtitle file + structure JSON
into the canonical timeline.json format.

Usage:
    python scripts/ass_to_timeline.py corrected.ass structure.json \
        --song-id seeing-farthest \
        --title "看得最遠的地方" \
        --artist "Cover by YOU" \
        --output data/songs/seeing-farthest/timeline.json
"""
from __future__ import annotations

import json
from datetime import date
from pathlib import Path

import click
import pysubs2


@click.command()
@click.argument("subs_file", type=click.Path(exists=True, path_type=Path))
@click.argument("structure_file", type=click.Path(exists=True, path_type=Path))
@click.option("--song-id", required=True)
@click.option("--title", required=True)
@click.option("--artist", default="Unknown")
@click.option("--bpm", type=float, default=0.0)
@click.option("--key", default="")
@click.option("--output", "-o", type=click.Path(path_type=Path), required=True)
def main(
    subs_file: Path,
    structure_file: Path,
    song_id: str,
    title: str,
    artist: str,
    bpm: float,
    key: str,
    output: Path,
) -> None:
    """Merge subtitle timings + song structure into a timeline.json."""
    subs = pysubs2.load(str(subs_file))
    structure = json.loads(structure_file.read_text(encoding="utf-8"))

    lyrics = []
    for line in subs:
        if not line.text.strip():
            continue
        lyrics.append({
            "t": round(line.start / 1000, 2),
            "end": round(line.end / 1000, 2),
            "text": line.plaintext.strip(),
        })

    timeline = {
        "meta": {
            "song_id": song_id,
            "title": title,
            "artist": artist,
            "duration": structure.get("duration", 0.0),
            "bpm": bpm,
            "key": key,
            "created_at": date.today().isoformat(),
            "version": 1,
        },
        "sections": structure.get("sections", []),
        "lyrics": lyrics,
        "cues": [],
        "beats": [],
    }

    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8") as f:
        json.dump(timeline, f, ensure_ascii=False, indent=2)

    click.echo(f"✓ Wrote {output}  ({len(lyrics)} lyric lines)")


if __name__ == "__main__":
    main()
