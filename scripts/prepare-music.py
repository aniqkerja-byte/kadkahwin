"""Export only the selected wedding excerpt. Requires PyAV and NumPy."""
import argparse
from fractions import Fraction
from pathlib import Path

import av
import numpy as np

START = 43.0
END = 83.0
FADE_IN = 1.4
FADE_OUT = 3.0
RATE = 44100


def export_excerpt(source, target):
    resampler = av.AudioResampler(format="fltp", layout="stereo", rate=RATE)
    blocks = []
    with av.open(str(source)) as recording:
        for frame in recording.decode(audio=0):
            blocks.extend(block.to_ndarray() for block in resampler.resample(frame))
        blocks.extend(block.to_ndarray() for block in resampler.resample(None))
    samples = np.concatenate(blocks, axis=1)
    if samples.shape[1] < round(END * RATE):
        raise ValueError("The source recording is shorter than the selected excerpt.")
    excerpt = samples[:, round(START * RATE):round(END * RATE)].copy()
    intro, outro = round(FADE_IN * RATE), round(FADE_OUT * RATE)
    excerpt[:, :intro] *= np.linspace(0, 1, intro, dtype=np.float32)
    excerpt[:, -outro:] *= np.linspace(1, 0, outro, dtype=np.float32)
    target.parent.mkdir(parents=True, exist_ok=True)
    with av.open(str(target), "w", format="mp3") as output:
        output.metadata.update(title="Teman Hidup — Wedding excerpt", artist="TULUS")
        stream = output.add_stream("libmp3lame", rate=RATE)
        stream.bit_rate = 128000
        stream.layout = "stereo"
        for offset in range(0, excerpt.shape[1], 1152):
            frame = av.AudioFrame.from_ndarray(np.ascontiguousarray(excerpt[:, offset:offset + 1152]), format="fltp", layout="stereo")
            frame.sample_rate = RATE
            frame.pts = offset
            frame.time_base = Fraction(1, RATE)
            for packet in stream.encode(frame):
                output.mux(packet)
        for packet in stream.encode():
            output.mux(packet)
    print(f"Exported {END - START:.0f}s ({START:.0f}s–{END:.0f}s), {target.stat().st_size:,} bytes: {target}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parents[1] / "public/assets/teman-hidup-wedding.mp3")
    args = parser.parse_args()
    export_excerpt(args.source, args.output)
