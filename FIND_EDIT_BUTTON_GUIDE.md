# How to Find the Edit Lesson Details Button

## 📍 Where to Find It

You're on the right page: **Manage Lessons** for Capital market investment course

### Visual Location

On each lesson card, you should see **4 icon buttons** on the right side:

```
┌─────────────────────────────────────────────────────┐
│  Introduction to Capital Markets           Published│
│  Learn the fundamentals of capital markets...       │
│  Duration: Not set • Video: youtube                 │
│                                                      │
│  [📄] [📤] [✏️] [🗑️]  ← These 4 buttons           │
└─────────────────────────────────────────────────────┘
```

### The 4 Buttons (Left to Right):

1. **📄 FileText Icon** ← THIS ONE! Opens "Edit Lesson Details" modal
   - Tooltip: "Edit lesson details, objectives & resources"
   - Opens modal with:
     - Description editor
     - Learning objectives
     - Resources manager
     - **Duration input field**

2. **📤 Upload Icon** - Add/Change video

3. **✏️ Edit Icon** - Edit lesson title only

4. **🗑️ Trash Icon** - Delete lesson

## 🔍 If You Don't See the Buttons

### Possibility 1: Scroll Right
The buttons might be cut off on the right side of the screen. Try:
- Scrolling right on the lesson card
- Making your browser window wider
- Zooming out (Ctrl + Mouse Wheel Down)

### Possibility 2: CSS Issue
The buttons might be hidden due to styling. Let me check and fix this.

### Possibility 3: Different Screen Size
On smaller screens, buttons might wrap or be hidden. Try:
- Full screen (F11)
- Wider browser window
- Different zoom level

## 🎯 What the Button Opens

When you click the **📄 FileText** button, you'll see:

```
┌──────────────────────────────────────────────┐
│  Edit Lesson Details - [Lesson Name]    [X] │
├──────────────────────────────────────────────┤
│                                              │
│  Video Duration (in minutes)                 │
│  [___15___] minutes (15:00)                  │
│                                              │
│  Lesson Description                          │
│  [___________________________________]       │
│                                              │
│  Learning Objectives                         │
│  • Understand market dynamics                │
│  • Analyze risk factors                      │
│  [+ Add Objective]                           │
│                                              │
│  Downloadable Resources                      │
│  [+ Add Resource]                            │
│                                              │
│  [Cancel]  [Save Changes]                    │
└──────────────────────────────────────────────┘
```

## 🐛 Troubleshooting

### I still don't see the buttons!

Run this in your browser console (F12 → Console tab):

```javascript
console.log('Checking for buttons...');
document.querySelectorAll('.lesson-actions button').forEach((btn, i) => {
  console.log(`Button ${i+1}:`, btn.title, btn.style.display);
});
```

This will show if buttons exist but are hidden.

## ✅ Quick Test

1. **Look at your first lesson**: "Introduction to Capital Markets"
2. **Look to the right** of the "Published" green button
3. **You should see 4 small square buttons** with icons
4. **Hover over the first one** - tooltip should say "Edit lesson details, objectives & resources"
5. **Click it** - modal should open

## 🆘 If Still Can't Find It

I'll add a more prominent button or check the CSS to make sure buttons are visible. Let me know and I'll fix it!
