# Sample Goals for Abhyatus (अभ्यास)

**Discipline Through Practice** - Sample habit data to help you experience the power of consistent practice.

This directory contains sample habit data that you can import into your Abhyatus application to test features and see how the app works with different types of goals. Each sample reflects the Sanskrit philosophy of **abhyāsa** - the transformative power of consistent practice.

## 📁 Available Sample Files

### 1. `sample-goals.json` - Foundation Practices
A balanced set of 8 core habits embodying the principles of disciplined practice:
- **🧘 Morning Meditation** (30 days, 5 check-ins) - *"Through practice and detachment, the mind can be controlled"*
- **💧 Drink 8 Glasses of Water** (21 days, 7 check-ins) - *Nurturing the body as the temple*
- **📚 Read for 30 Minutes** (50 days, 12 check-ins) - *Knowledge through consistent study*
- **💪 Exercise for 45 Minutes** (30 days, 5 check-ins) - *Strength through disciplined training*
- **📝 Practice Gratitude Journal** (21 days, 11 check-ins) - *Mindfulness through daily reflection*
- **🗣️ Learn Spanish** (100 days, 18 check-ins) - *Skill development through repetition*
- **📱 No Social Media Before 9 AM** (30 days, 4 check-ins) - *Digital discipline for mental clarity*
- **🚶 Take 10,000 Steps** (21 days, 8 check-ins) - *Movement as a daily practice*

### 2. `sample-goals-advanced.json` - Mastery Practices
A comprehensive set of 10 habits representing advanced discipline:
- **🌅 Morning Sunlight Exposure** (30 days, 20 check-ins) - *Aligning with natural rhythms*
- **🏋️ Strength Training** (50 days, 10 check-ins) - *Building physical and mental fortitude*
- **📖 Read Technical Books** (100 days, 22 check-ins) - *Deep learning through sustained effort*
- **🥗 Eat 5 Servings of Vegetables** (21 days, 6 check-ins) - *Nourishing the body mindfully*
- **🧘‍♀️ 10-Minute Meditation** (30 days, 11 check-ins) - *Inner stillness through practice*
- **📔 Daily Journaling** (50 days, 25 check-ins) - *Self-reflection as a discipline*
- **🎸 Practice Guitar** (100 days, 20 check-ins) - *Artistic expression through repetition*
- **😴 Sleep by 11 PM** (30 days, 8 check-ins) - *Rest as a sacred practice*
- **📞 Call Family Member** (7 days, 3 check-ins) - *Connection through consistent effort*

### 3. `sample-goals-beginner.json` - First Steps
Perfect for beginning your journey of disciplined practice:
- **🛏️ Make Bed Every Morning** (7 days, 3 check-ins) - *Starting the day with intention*
- **💧 Drink Water First Thing** (7 days, 3 check-ins) - *Hydration as morning ritual*
- **🚶 Take a 5-Minute Walk** (7 days, 2 check-ins) - *Movement as daily medicine*

## 🚀 How to Import Sample Goals

### Method 1: Using the App Interface
1. Open your Abhyatus application
2. Click the **"Import JSON"** button in the sidebar
3. Select one of the sample JSON files
4. Click **"Open"** to import the habits
5. You'll see a success message and be redirected to the Goals page

### Method 2: Manual Import (Advanced)
1. Copy the contents of a sample JSON file
2. Paste it into a new file and save with `.json` extension
3. Use the app's import functionality to load the file

## 📊 What You'll Experience After Import

### Goals Page
- All imported habits will appear as habit cards
- Progress bars showing your journey of disciplined practice
- Streak information celebrating your consistency
- Check-in buttons for today's practices

### Calendar Page
- Visual representation of your practice journey
- Color-coded dots showing your commitment
- Ability to view individual habit calendars

### Stats Page
- Completion percentages showing your dedication
- Weekly trend charts reflecting your growth
- Habit-specific statistics measuring your progress

### Reminders Page
- All habits with reminder settings
- Reminder time and frequency information
- Ability to edit reminder settings

## 🎯 Testing Different Scenarios

### Test Import Functionality
- Try importing different sample files
- Test with invalid JSON to see error handling
- Verify data persistence after page refresh

### Test Reminder System
- Check notification permissions
- Verify reminder times and frequencies
- Test reminder window functionality

### Test Check-in System
- Add new check-ins for today
- Verify streak calculations
- Test anti-cheat features

### Test Export Functionality
- Export your current habits
- Compare exported data with original
- Test importing exported data

## 🔧 Customizing Sample Goals

You can modify the sample files to test specific scenarios:

### Change Habit Properties
- Modify `title` to test different habit names
- Adjust `daysTarget` for different goal lengths
- Change `color` for visual customization
- Update `categoryId` for different categories

### Modify Check-ins
- Add or remove check-in dates
- Change check-in hash values
- Test different date patterns

### Adjust Reminders
- Modify `time` for different reminder schedules
- Change `days` array for different frequencies
- Adjust `window` for different reminder windows

## 📝 Sample Data Structure

Each habit follows this structure:
```json
{
  "id": "unique-habit-id",
  "title": "Habit Name",
  "daysTarget": 30,
  "categoryId": "30",
  "color": "#10B981",
  "createdAt": "2024-01-01",
  "checkIns": {
    "2024-01-01": "hash-value",
    "2024-01-02": "hash-value"
  },
  "reminder": {
    "time": "09:00",
    "days": [1, 2, 3, 4, 5],
    "window": 30
  }
}
```

## 🚨 Important Notes

- Sample data uses realistic date ranges (January 2024)
- All check-in hashes are placeholder values
- Habit IDs are unique across all sample files
- Colors are chosen for good visual distinction
- Reminder times are set for reasonable hours

## 🎉 Begin Your Journey of Disciplined Practice!

These sample goals embody the ancient wisdom of **abhyāsa** - the transformative power of consistent practice. As the Bhagavad Gita teaches us, through practice and detachment, we can control the mind and achieve our highest potential.

*"The mind is everything. What you think you become."* - Buddha

Start with these samples to experience how Abhyatus can help you build the discipline needed to achieve your goals through the power of consistent practice.
