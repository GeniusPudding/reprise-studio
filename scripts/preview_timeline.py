"""Quick visual preview of a timeline.json against its audio waveform.

Produces a single PNG: sections as shaded bands, lyric lines as ticks,
cues as vertical lines, on top of a librosa-decoded RMS envelope.
"""
from __future__ import annotations

import json
from pathlib import Path

import click
import librosa
import matplotlib.pyplot as plt
import numpy as np


@click.command()
@click.argument("timeline_file", type=click.Path(exists=True, path_type=Path))
@click.option("--audio", type=click.Path(exists=True, path_type=Path), required=False,
              help="Optional audio file for waveform overlay.")
@click.option("--output", "-o", type=click.Path(path_type=Path), default=None)
def main(timeline_file: Path, audio: Path | None, output: Path | None) -> None:
    data = json.loads(timeline_file.read_text(encoding="utf-8"))
    duration = float(data["meta"]["duration"])

    fig, ax = plt.subplots(figsize=(18, 4))

    if audio is not None:
        y, sr = librosa.load(str(audio), sr=None, mono=True)
        rms = librosa.feature.rms(y=y, hop_length=512)[0]
        rms = rms / (np.max(rms) + 1e-8)
        t_axis = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=512)
        ax.fill_between(t_axis, 0, rms, color="#6b8ca8", alpha=0.4, label="RMS")

    palette = {
        "still": "#0b0f14", "soft": "#dce4ea", "ache": "#3a1e24",
        "open":  "#ffd27d", "defy": "#f2a65a", "fin":  "#f5efe3",
    }
    for s in data["sections"]:
        ax.axvspan(s["t"], s["end"], color=palette.get(s["mood"], "#888"), alpha=0.18)
        ax.text((s["t"] + s["end"]) / 2, 1.05, s["type"],
                ha="center", fontsize=8, color="#333")

    for l in data["lyrics"]:
        if l["text"].strip():
            ax.plot([l["t"], l["t"]], [0, 1.0], color="#333", linewidth=0.5, alpha=0.4)

    for c in data["cues"]:
        ax.axvline(c["t"], color="#c33", linewidth=1.0, alpha=0.7)
        ax.text(c["t"], 1.15, c["type"], rotation=35,
                fontsize=7, color="#c33", ha="left")

    ax.set_xlim(0, duration)
    ax.set_ylim(0, 1.3)
    ax.set_xlabel("time (s)")
    ax.set_yticks([])
    ax.set_title(f"{data['meta']['title']} — timeline preview")

    if output is None:
        output = timeline_file.with_suffix(".preview.png")
    plt.tight_layout()
    plt.savefig(output, dpi=120)
    click.echo(f"✓ Wrote {output}")


if __name__ == "__main__":
    main()
