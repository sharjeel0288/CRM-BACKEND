from moviepy.video.io.VideoFileClip import VideoFileClip
from moviepy.audio.io.AudioFileClip import AudioFileClip
import os

def split_files(video_path, audio_path, chunk_duration):
    # Load video and audio clips
    video_clip = VideoFileClip(video_path)
    audio_clip = AudioFileClip(audio_path)

    # Calculate the total duration of the video
    total_duration = min(video_clip.duration, audio_clip.duration)

    # Create a directory to store the chunks
    os.makedirs("output_chunks", exist_ok=True)

    # Split the video and audio into chunks of chunk_duration seconds each
    for start_time in range(0, int(total_duration), chunk_duration):
        end_time = min(start_time + chunk_duration, total_duration)
        
        # Generate chunk filenames
        video_chunk_filename = f"output_chunks/video_chunk_{start_time}_{end_time}.mp4"
        audio_chunk_filename = f"output_chunks/audio_chunk_{start_time}_{end_time}.mp3"

        # Extract video and audio segments
        video_segment = video_clip.subclip(start_time, end_time)
        audio_segment = audio_clip.subclip(start_time, end_time)

        # Save video and audio chunks
        video_segment.write_videofile(video_chunk_filename, codec="libx264")
        audio_segment.write_audiofile(audio_chunk_filename)

    # Close the video and audio clips
    video_clip.close()
    audio_clip.close()

if __name__ == "__main__":
    video_path = "video.mp4"  # Replace with your input video file path
    audio_path = "audio.mp3"  # Replace with your input audio file path
    chunk_duration = 50  # Chunk duration in seconds

    split_files(video_path, audio_path, chunk_duration)
