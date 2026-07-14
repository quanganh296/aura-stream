import sys
import os
import json
import io
import time
import subprocess

# Force UTF-8 encoding for standard output and error streams on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def transcribe_audio(file_path, model_size="small"):
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print("faster-whisper not installed. Please install it using pip install faster-whisper", file=sys.stderr)
        sys.exit(1)

    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}", file=sys.stderr)
        sys.exit(1)

    # Generate a unique temp file path in the same directory
    dir_name = os.path.dirname(file_path) or "."
    temp_vocals_path = os.path.join(dir_name, f"temp_vocals_{int(time.time())}.wav")

    print(f"Pre-processing audio with FFmpeg bandpass vocal filter...", file=sys.stderr)
    try:
        # Run FFmpeg command to isolate vocal range:
        # - highpass=f=150: removes low-frequency beat rumble (bass/kick drum)
        # - lowpass=f=3000: removes high-frequency instrument noise (synth/guitar)
        # - volume=1.8: boosts vocal volume
        # - ac 1: downmixes to 1 channel (mono)
        # - ar 16000: resamples to 16kHz (native Whisper input rate)
        ffmpeg_cmd = [
            "ffmpeg", "-y", "-i", file_path,
            "-af", "highpass=f=150, lowpass=f=3000, volume=1.8",
            "-ac", "1", "-ar", "16000", temp_vocals_path
        ]
        
        # Execute FFmpeg silently
        subprocess.run(ffmpeg_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        transcribe_target = temp_vocals_path
        print(f"Vocal pre-filtering complete. Cleaned file: {temp_vocals_path}", file=sys.stderr)
    except Exception as e:
        print(f"Warning: FFmpeg filtering failed ({str(e)}). Falling back to raw file.", file=sys.stderr)
        transcribe_target = file_path

    try:
        print(f"Loading Whisper model '{model_size}' on CPU...", file=sys.stderr)
        # Run on CPU with int8 quantization (highly optimized for CPU)
        model = WhisperModel(model_size, device="cpu", compute_type="int8")
        
        print(f"Transcribing vocal tracks...", file=sys.stderr)
        # Transcribe with language set to Vietnamese ('vi')
        segments, info = model.transcribe(transcribe_target, beam_size=5, language="vi")
        
        lyrics = []
        for segment in segments:
            txt = segment.text.strip()
            if txt:
                lyrics.append({
                    "time": int(segment.start),
                    "text": txt
                })
        
        result = {
            "duration_seconds": int(info.duration),
            "lyrics_json": json.dumps(lyrics, ensure_ascii=False)
        }
        
        # Print JSON result to stdout
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        print(f"Error during transcription: {str(e)}", file=sys.stderr)
        sys.exit(1)
    finally:
        # Clean up temp file
        if os.path.exists(temp_vocals_path):
            try:
                os.remove(temp_vocals_path)
                print(f"Cleaned up temp file: {temp_vocals_path}", file=sys.stderr)
            except Exception as e:
                print(f"Warning: Failed to delete temp file {temp_vocals_path} ({str(e)})", file=sys.stderr)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python transcribe.py <path_to_audio_or_video> [--model <model_size>]", file=sys.stderr)
        sys.exit(1)
    
    # Parse arguments
    target_file = None
    model_size = "small"  # Upgraded default model
    
    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] == "--model" and i + 1 < len(args):
            model_size = args[i+1]
            i += 2
        else:
            target_file = args[i]
            i += 1
            
    if not target_file:
        print("Error: Target audio/video file path is required", file=sys.stderr)
        sys.exit(1)
        
    transcribe_audio(target_file, model_size)
