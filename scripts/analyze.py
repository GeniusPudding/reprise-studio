"""librosa-based audio feature extraction.

Emits BPM, duration, onset/beat frames, and a downsampled RMS envelope that
the engine can use for coarse energy curves (separate from the real-time
AnalyserNode that drives live visuals).
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
@click.option("--hop-ms", default=50, show_default=True,
              help="Hop size for RMS curve, in milliseconds.")
def main(audio: Path, output: Path | None, hop_ms: int) -> None:
    """Analyze AUDIO and write features JSON."""
    click.echo(f"Loading {audio} ...")
    y, sr = librosa.load(str(audio), sr=None, mono=True)

    duration = float(len(y) / sr)
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
    beat_times = librosa.frames_to_time(beat_frames, sr=sr).tolist()

    hop_length = int(sr * hop_ms / 1000)
    rms = librosa.feature.rms(y=y, frame_length=hop_length * 2, hop_length=hop_length)[0]
    rms = rms / (np.max(rms) + 1e-8)
    rms_times = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop_length)

    features = {
        "sr": sr,
        "duration": duration,
        "bpm": float(tempo),
        "beats": [round(t, 3) for t in beat_times],
        "rms_curve": {
            "hop_ms": hop_ms,
            "times": [round(t, 3) for t in rms_times.tolist()],
            "values": [round(float(v), 4) for v in rms.tolist()],
        },
    }

    if output is None:
        output = audio.parent / "drafts" / "features.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8") as f:
        json.dump(features, f, ensure_ascii=False, indent=2)

    click.echo(f"✓ Wrote {output}  (duration={duration:.1f}s, bpm={tempo:.1f})")


if __name__ == "__main__":
    main()
