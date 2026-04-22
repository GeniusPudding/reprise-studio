"""Coarse song structure segmentation (intro / verse / chorus / ...).

Uses librosa recurrence-matrix segmentation as a first pass — the result
is a draft. Human review in Aegisub is still required.
"""
from __future__ import annotations

import json
from pathlib import Path

import click
import librosa
import numpy as np


@click.command()
@click.argument("audio", type=click.Path(exists=True, path_type=Path))
@click.option("--output", "-o", type=click.Path(path_type=Path), default=None)
@click.option("--k", default=6, show_default=True,
              help="Approximate number of segments to find.")
def main(audio: Path, output: Path | None, k: int) -> None:
    """Emit a draft sections list by recurrence-matrix segmentation."""
    click.echo(f"Loading {audio} ...")
    y, sr = librosa.load(str(audio), sr=None, mono=True)
    duration = float(len(y) / sr)

    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    bounds = librosa.segment.agglomerative(chroma, k=k)
    bound_times = librosa.frames_to_time(bounds, sr=sr).tolist()
    bound_times = sorted(set([0.0] + [round(float(t), 2) for t in bound_times] + [round(duration, 2)]))

    # Heuristic labelling — alternate verse/chorus after intro.
    sections = []
    for i in range(len(bound_times) - 1):
        t0, t1 = bound_times[i], bound_times[i + 1]
        if i == 0:
            label = "intro"
            mood = "still"
        elif i == len(bound_times) - 2:
            label = "outro"
            mood = "fin"
        elif i % 2 == 1:
            label = "verse1" if i == 1 else "verse2"
            mood = "soft"
        else:
            label = "chorus1" if i == 2 else "chorus2"
            mood = "open"
        sections.append({"t": t0, "end": t1, "type": label, "mood": mood})

    if output is None:
        output = audio.parent / "drafts" / "structure.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8") as f:
        json.dump({"duration": duration, "sections": sections}, f, ensure_ascii=False, indent=2)

    click.echo(f"✓ Wrote {output}  ({len(sections)} draft sections — review by hand!)")


if __name__ == "__main__":
    main()
