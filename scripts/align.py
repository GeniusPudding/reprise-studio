"""WhisperX wrapper: produce word-level timestamps from a vocals track.

Usage:
    python scripts/align.py data/raw/<song_id>/separated/vocals.wav

Outputs JSON to data/raw/<song_id>/drafts/whisperx.json.

WhisperX is heavy and has thorny CUDA/ctranslate2 dependencies. If setup
fails, consider falling back to `openai-whisper` + `whisper-timestamped`.
"""
from __future__ import annotations

import json
from pathlib import Path

import click


@click.command()
@click.argument("vocals", type=click.Path(exists=True, path_type=Path))
@click.option("--language", default="zh", show_default=True)
@click.option("--model", default="large-v3", show_default=True)
@click.option("--device", default="cuda", show_default=True, type=click.Choice(["cuda", "cpu", "mps"]))
@click.option("--compute-type", default="float16", show_default=True)
def main(vocals: Path, language: str, model: str, device: str, compute_type: str) -> None:
    """Transcribe + align VOCALS with WhisperX; write draft JSON."""
    try:
        import whisperx  # type: ignore
    except ImportError as e:  # pragma: no cover
        raise click.ClickException(
            "whisperx is not installed. `pip install whisperx` (see docs/DATA_PIPELINE.md)."
        ) from e

    out_dir = vocals.parent.parent / "drafts"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "whisperx.json"

    click.echo(f"Loading WhisperX model={model} device={device} compute_type={compute_type} ...")
    asr = whisperx.load_model(model, device, compute_type=compute_type, language=language)

    click.echo(f"Transcribing {vocals} ...")
    audio = whisperx.load_audio(str(vocals))
    result = asr.transcribe(audio, language=language)

    click.echo("Aligning for word-level timestamps ...")
    align_model, metadata = whisperx.load_align_model(language_code=language, device=device)
    aligned = whisperx.align(result["segments"], align_model, metadata, audio, device)

    with out_path.open("w", encoding="utf-8") as f:
        json.dump(aligned, f, ensure_ascii=False, indent=2)

    click.echo(f"✓ Wrote {out_path}")


if __name__ == "__main__":
    main()
