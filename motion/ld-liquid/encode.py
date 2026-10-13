"""Composite the transparent render onto the site's background and encode for Safari."""
from pathlib import Path
import subprocess
import imageio_ffmpeg

root = Path(__file__).resolve().parents[2]
output = root / 'public/media/ld-liquid.mp4'
output.parent.mkdir(parents=True, exist_ok=True)
subprocess.run([
    imageio_ffmpeg.get_ffmpeg_exe(), '-y',
    '-f', 'lavfi', '-i', 'color=c=0x101010:s=720x926:r=24',
    '-framerate', '24', '-i', '/tmp/ld-liquid-frames/%04d.png',
    '-filter_complex', '[0:v][1:v]overlay=shortest=1:format=auto,format=yuv420p[v]',
    '-map', '[v]', '-c:v', 'libx264', '-crf', '18', '-preset', 'medium',
    '-movflags', '+faststart', '-an', str(output),
], check=True)
