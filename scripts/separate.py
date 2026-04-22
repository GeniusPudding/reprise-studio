"""Wrapper around Demucs for vocals / no-vocals split.

Usage:
    python scripts/separate.py data/raw/<song_id>/song.wav

Output goes under data/raw/<song_id>/separated/.
Requires `demucs` installed in the active Python environment.
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import click


@click.command()
@click.argument("audio", type=click.Path(exists=True, path_type=Path))
@click.option(
    "--model",
    default="htdemucs",
    show_default=True,
    help="Demucs model name (htdemucs, htdemucs_ft, mdx_extra, ...).",
)
@click.option(
    "--two-stems",
    "two_stems",
    default="vocals",
    show_default=True,
    help="Run in two-stems mode targeting this stem (usually vocals).",
)
def main(audio: Path, model: str, two_stems: str) -> None:
    """Run Demucs on AUDIO and dump stems next to it under ./separated/."""
    out_dir = audio.parent / "separated"
    out_dir.mkdir(parents=True, exist_ok=True)

    cmd = [
        sys.executable,
        "-m",
        "demucs",
        "--two-stems",
        two_stems,
        "-n",
        model,
        "-o",
        str(out_dir),
        str(audio),
    ]
    click.echo(f"$ {' '.join(cmd)}")
    subprocess.run(cmd, check=True)
    click.echo(f"✓ Stems written under {out_dir}")


if __name__ == "__main__":
    main()
