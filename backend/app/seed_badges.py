import sys
import os

# Add parent directory to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, Badge
from app.schemas import BadgeLevel

def seed_badges():
    db = SessionLocal()
    try:
        # Define badges with Integer IDs
        # Format: (ID, Slug/Enum, Name, Description, Icon, Days, NextID)
        badges_config = [
            (1, BadgeLevel.NOVICE, "Novice", "Completed your first day!", "🌱", 1, 2),
            (2, BadgeLevel.BEGINNER, "Beginner", "Consistent for 3 days.", "🌿", 3, 3),
            (3, BadgeLevel.INTERMEDIATE, "Intermediate", "Maintained for a week.", "🌳", 7, 4),
            (4, BadgeLevel.ADVANCED, "Advanced", "Consistent for 21 days.", "🔥", 21, 5),
            (5, BadgeLevel.EXPERT, "Expert", "A true habit master (50 days).", "⭐", 50, 6),
            (6, BadgeLevel.MASTER, "Master", "Unstoppable! (90 days).", "👑", 90, None)
        ]

        print("Seeding badges with numeric IDs...")
        for b_id, level, name, description, icon, days, next_id in badges_config:
            slug = level.value
            
            badge = db.query(Badge).filter(Badge.id == b_id).first()
            if not badge:
                print(f"Creating badge: {name} (ID: {b_id}, Slug: {slug})")
                badge = Badge(
                    id=b_id,
                    slug=slug,
                    name=name,
                    description=description,
                    icon=icon,
                    days_required=days,
                    next_badge_id=next_id
                )
                db.add(badge)
            else:
                print(f"Updating badge: {name} (ID: {b_id})")
                badge.slug = slug
                badge.name = name
                badge.description = description
                badge.icon = icon
                badge.days_required = days
                badge.next_badge_id = next_id
        
        db.commit()
        print("Badges seeded successfully!")

    except Exception as e:
        print(f"Error seeding badges: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_badges()
