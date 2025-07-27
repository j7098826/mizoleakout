# generate_videos.py
import json
import random
import string
from datetime import datetime, timedelta
import os

def generate_random_id(length=11):
    """Generate random YouTube-like video ID"""
    chars = string.ascii_letters + string.digits + '-_'
    return ''.join(random.choices(chars, k=length))

def generate_random_views():
    """Generate random views between 30k-500k"""
    views = random.randint(30, 500)
    return f"{views}k"

def generate_random_duration():
    """Generate random video duration"""
    minutes = random.randint(1, 15)
    seconds = random.randint(0, 59)
    return f"{minutes}:{seconds:02d}"

def generate_random_date():
    """Generate random upload date within last 10 years"""
    start_date = datetime(2014, 1, 1)
    end_date = datetime(2024, 12, 31)
    random_date = start_date + timedelta(
        days=random.randint(0, (end_date - start_date).days)
    )
    return random_date.strftime("%Y-%m-%d")

# Video title templates by category
video_templates = {
    "Trending": [
        "Viral Dance Challenge #{num}",
        "Amazing Talent Show Performance #{num}",
        "Trending Music Cover #{num}",
        "Popular Comedy Skit #{num}",
        "Viral Pet Video #{num}"
    ],
    "Music Videos": [
        "Guitar Solo Performance #{num}",
        "Piano Cover #{num}",
        "Acoustic Session #{num}",
        "Electronic Mix #{num}",
        "Live Concert #{num}"
    ],
    "Gaming": [
        "Epic Gaming Moments #{num}",
        "Game Review #{num}",
        "Speedrun Attempt #{num}",
        "Gaming Tips #{num}",
        "Multiplayer Highlights #{num}"
    ],
    "Education": [
        "Science Explained #{num}",
        "History Lesson #{num}",
        "Math Tutorial #{num}",
        "Programming Guide #{num}",
        "Physics Concepts #{num}"
    ],
    "Entertainment": [
        "Comedy Sketch #{num}",
        "Magic Tricks #{num}",
        "Movie Review #{num}",
        "Celebrity Interview #{num}",
        "Viral Reaction #{num}"
    ],
    "Sports": [
        "Sports Highlights #{num}",
        "Training Session #{num}",
        "Game Analysis #{num}",
        "Championship Moments #{num}",
        "Athletic Performance #{num}"
    ],
    "Technology": [
        "Tech Review #{num}",
        "Gadget Unboxing #{num}",
        "Programming Tutorial #{num}",
        "Tech News #{num}",
        "Device Comparison #{num}"
    ],
    "Comedy": [
        "Stand-up Comedy #{num}",
        "Funny Compilation #{num}",
        "Comedy Sketch #{num}",
        "Humorous Stories #{num}",
        "Comedic Performance #{num}"
    ]
}

def generate_videos_for_category(category, count):
    """Generate specified number of videos for a category"""
    videos = []
    templates = video_templates.get(category, ["Generic Video #{num}"])
    
    for i in range(count):
        template = random.choice(templates)
        title = template.replace("#{num}", str(i + 1))
        
        video = {
            "id": generate_random_id(),
            "title": title,
            "duration": generate_random_duration(),
            "views": generate_random_views(),
            "uploadDate": generate_random_date(),
            "thumbnail": f"https://picsum.photos/320/180?random={generate_random_id(6)}"
        }
        videos.append(video)
    
    return videos

def generate_streaming_json(videos_per_category=200):
    """Generate complete streaming JSON with specified videos per category"""
    
    streaming_data = {
        "playlists": []
    }
    
    categories = list(video_templates.keys())
    
    for category in categories:
        playlist = {
            "name": category,
            "videos": generate_videos_for_category(category, videos_per_category)
        }
        streaming_data["playlists"].append(playlist)
    
    return streaming_data

def main():
    # Get number of videos per category from environment variable or default to 200
    videos_per_category = int(os.environ.get('VIDEOS_PER_CATEGORY', 200))
    
    print(f"Generating {videos_per_category} videos per category...")
    
    # Generate the JSON data
    streaming_data = generate_streaming_json(videos_per_category)
    
    # Calculate total videos
    total_videos = sum(len(playlist["videos"]) for playlist in streaming_data["playlists"])
    print(f"Generated {total_videos} total videos across {len(streaming_data['playlists'])} categories")
    
    # Save to file
    with open('streaming_data.json', 'w', encoding='utf-8') as f:
        json.dump(streaming_data, f, indent=2, ensure_ascii=False)
    
    print("✅ streaming_data.json generated successfully!")
    
    # Generate summary
    print("\n📊 Summary:")
    for playlist in streaming_data["playlists"]:
        print(f"  {playlist['name']}: {len(playlist['videos'])} videos")

if __name__ == "__main__":
    main()
