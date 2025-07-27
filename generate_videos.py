# generate_videos.py - Video generator for Mizo Leakout streaming website
import json
import random
import string
from datetime import datetime, timedelta

def generate_random_id(length=11):
    """Generate random YouTube-like video ID"""
    chars = string.ascii_letters + string.digits + '-_'
    return ''.join(random.choices(chars, k=length))

def generate_random_views():
    """Generate random views between 30k-500k"""
    views = random.randint(30, 500)
    return f"{views}k"

def generate_random_duration():
    """Generate random video duration between 1-15 minutes"""
    minutes = random.randint(1, 15)
    seconds = random.randint(0, 59)
    return f"{minutes}:{seconds:02d}"

def generate_random_date():
    """Generate random upload date within last 5 years"""
    start_date = datetime(2019, 1, 1)
    end_date = datetime(2024, 12, 31)
    random_date = start_date + timedelta(
        days=random.randint(0, (end_date - start_date).days)
    )
    return random_date.strftime("%Y-%m-%d")

# Video title templates optimized for your streaming site
video_titles = {
    "Trending": [
        "Viral TikTok Dance Challenge Compilation #{num}",
        "Most Watched Video of the Week #{num}",
        "Breaking: Trending News Update #{num}",
        "Popular Music Video Reaction #{num}",
        "Viral Moment That Broke the Internet #{num}",
        "Trending Comedy Skit #{num}",
        "Most Shared Video Today #{num}",
        "Viral Pet Video Compilation #{num}",
        "Trending Gaming Highlights #{num}",
        "Popular DIY Tutorial #{num}"
    ],
    "Music Videos": [
        "Acoustic Guitar Cover #{num}",
        "Piano Instrumental Version #{num}",
        "Live Concert Performance #{num}",
        "Music Video Reaction #{num}",
        "Electronic Dance Mix #{num}",
        "Hip Hop Beats Collection #{num}",
        "Indie Folk Session #{num}",
        "Rock Band Live #{num}",
        "Jazz Fusion Performance #{num}",
        "Pop Music Remix #{num}"
    ],
    "Gaming": [
        "Epic Gaming Moments #{num}",
        "Game Review and Analysis #{num}",
        "Speedrun World Record #{num}",
        "Gaming Tips and Tricks #{num}",
        "Multiplayer Battle Royale #{num}",
        "Game Strategy Guide #{num}",
        "Retro Gaming Nostalgia #{num}",
        "Gaming Setup Tour #{num}",
        "Esports Tournament #{num}",
        "Game Development Insights #{num}"
    ],
    "Comedy": [
        "Hilarious Comedy Sketch #{num}",
        "Stand-up Comedy Special #{num}",
        "Funny Moments Compilation #{num}",
        "Comedy Roast Session #{num}",
        "Hilarious Prank Video #{num}",
        "Comedy Talk Show #{num}",
        "Funny Animal Videos #{num}",
        "Comedy Movie Review #{num}",
        "Humorous Life Stories #{num}",
        "Comedy Challenge #{num}"
    ],
    "Entertainment": [
        "Celebrity Interview #{num}",
        "Behind the Scenes #{num}",
        "Entertainment News #{num}",
        "Movie Trailer Reaction #{num}",
        "TV Show Discussion #{num}",
        "Celebrity Gossip #{num}",
        "Red Carpet Moments #{num}",
        "Entertainment Review #{num}",
        "Star Interview #{num}",
        "Entertainment Update #{num}"
    ],
    "Sports": [
        "Amazing Sports Highlights #{num}",
        "Athletic Training Session #{num}",
        "Sports News Update #{num}",
        "Championship Moments #{num}",
        "Sports Analysis #{num}",
        "Athlete Interview #{num}",
        "Sports Documentary #{num}",
        "Game Highlights #{num}",
        "Sports Training Tips #{num}",
        "Sports Commentary #{num}"
    ]
}

def generate_videos_for_category(category, count):
    """Generate specified number of videos for a category"""
    videos = []
    templates = video_titles.get(category, ["Video #{num}"])
    
    for i in range(count):
        template = random.choice(templates)
        title = template.replace("#{num}", str(random.randint(1, 9999)))
        
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

def generate_mizo_leakout_videos(videos_per_category=150):
    """Generate videos in the exact format your website expects"""
    
    # Structure matches your existing videos.json format
    streaming_data = {
        "playlists": []
    }
    
    # Generate videos for each category
    categories = list(video_titles.keys())
    
    for category in categories:
        playlist = {
            "name": category,
            "videos": generate_videos_for_category(category, videos_per_category)
        }
        streaming_data["playlists"].append(playlist)
    
    return streaming_data

def main():
    print("🎬 Generating videos for Mizo Leakout...")
    
    # Generate videos (default: 150 per category = 900 total videos)
    videos_per_category = 150
    streaming_data = generate_mizo_leakout_videos(videos_per_category)
    
    # Calculate totals
    total_videos = sum(len(playlist["videos"]) for playlist in streaming_data["playlists"])
    total_categories = len(streaming_data["playlists"])
    
    print(f"📊 Generated {total_videos} videos across {total_categories} categories")
    
    # Save to videos.json (the file your website loads)
    with open('videos.json', 'w', encoding='utf-8') as f:
        json.dump(streaming_data, f, indent=2, ensure_ascii=False)
    
    print("✅ videos.json generated successfully!")
    print("\n📋 Category Summary:")
    for playlist in streaming_data["playlists"]:
        print(f"   {playlist['name']}: {len(playlist['videos'])} videos")
    
    print(f"\n🚀 Your Mizo Leakout website now has {total_videos} videos ready!")

if __name__ == "__main__":
    main()
