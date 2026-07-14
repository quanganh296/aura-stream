import sys
import os
import json
import io

# Force UTF-8 encoding for standard output and error streams on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def transcribe_audio(file_path):
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        # Fallback to SpeechRecognition if faster-whisper is not installed yet
        print("faster-whisper not installed. Please wait for installation to finish.", file=sys.stderr)
        sys.exit(1)

    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}", file=sys.stderr)
        sys.exit(1)

    # Use 'base' model for CPU efficiency and decent Vietnamese accuracy.
    # It will auto-download the model files (approx 140MB) on first run.
    model_size = "base"
    
    try:
        # Run on CPU with int8 quantization (highly optimized for CPU)
        model = WhisperModel(model_size, device="cpu", compute_type="int8")
        
        # Transcribe with language set to Vietnamese ('vi') for maximum Vietnamese accuracy.
        # Whisper can also auto-detect, but force-setting it is safer for music.
        segments, info = model.transcribe(file_path, beam_size=5, language="vi")
        
        lyrics = []
        for segment in segments:
            # Clean up text
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
        
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(f"Error during transcription: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python transcribe.py <path_to_audio_or_video>", file=sys.stderr)
        sys.exit(1)
    
    target_file = sys.argv[1]
    transcribe_audio(target_file)
