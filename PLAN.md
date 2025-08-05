# Mood Affirmation App - Development Plan

## 🎯 **App Overview**

A simple mood affirmation app that provides personalized daily affirmations based on user preferences. Users set up their profile once and receive customized affirmations throughout the day.

## 📱 **App Structure**

### **Phase 1: Welcome/Onboarding Flow**

- **Welcome Screen**: New user introduction
- **Profile Setup**: Name, age range, gender, affirmation frequency
- **Data Storage**: Local storage implementation

### **Phase 2: Main App Interface**

- **Header**: Dynamic greeting + profile/notification icons
- **Affirmation Display**: Swipeable affirmation cards
- **Profile Management**: User settings and data

## 🗂️ **File Structure Plan**

```
app/
├── _layout.tsx (existing)
├── (tabs)/
│   ├── _layout.tsx (modify for single tab)
│   └── index.tsx (main affirmation screen)
├── welcome/
│   ├── _layout.tsx
│   ├── index.tsx (welcome screen)
│   └── setup.tsx (profile setup)
└── +not-found.tsx (existing)

components/
├── ThemedView.tsx (existing)
├── ThemedText.tsx (existing)
├── WelcomeCard.tsx (new)
├── ProfileSetup.tsx (new)
├── AffirmationCard.tsx (new)
├── Header.tsx (new)
└── ProfileIcon.tsx (new)

constants/
├── Colors.ts (existing)
├── Affirmations.ts (new - 20 affirmations)
└── UserTypes.ts (new - TypeScript types)

hooks/
├── useColorScheme.ts (existing)
├── useLocalStorage.ts (new)
└── useGreeting.ts (new)

utils/
├── storage.ts (new - AsyncStorage helpers)
└── timeUtils.ts (new - greeting logic)
```

## 🎨 **UI/UX Design**

### **Welcome Screen**

- Clean, welcoming design with app logo
- "Get Started" button
- Brief app description

### **Profile Setup Screen**

- Form with:
  - Name input
  - Age range selector (18-25, 26-35, 36-45, 46+)
  - Gender selector (Male, Female, Non-binary, Prefer not to say)
  - Affirmation frequency (1, 2, 3, 5 times per day)
- "Complete Setup" button

### **Main Screen**

- **Header**:
  - Left: Dynamic greeting ("Good morning, Sarah!")
  - Right: Profile icon + notification bell
- **Center**: Large affirmation card with swipe functionality
- **Bottom**: Progress indicator for daily affirmations

## 💾 **Data Management**

### **User Profile Data**

```typescript
interface UserProfile {
  name: string;
  ageRange: "18-25" | "26-35" | "36-45" | "46+";
  gender: "Male" | "Female" | "Non-binary" | "Prefer not to say";
  affirmationFrequency: 1 | 2 | 3 | 5;
  isFirstTime: boolean;
  lastAffirmationDate?: string;
  dailyAffirmationsShown: number;
}
```

### **Local Storage Keys**

- `@user_profile`
- `@last_affirmation_date`
- `@daily_affirmations_shown`

## 📜 **Affirmations Array (20 Items)**

```typescript
const AFFIRMATIONS = [
  "I am capable of achieving great things",
  "Every day is a new opportunity to grow",
  "I choose to be confident and strong",
  "My potential is limitless",
  "I am worthy of love and respect",
  "I trust in my abilities and decisions",
  "I am becoming better every single day",
  "My thoughts create my reality",
  "I am in control of my happiness",
  "I attract positive energy and good vibes",
  "I am resilient and can handle any challenge",
  "My future is bright and full of possibilities",
  "I am surrounded by love and support",
  "I am exactly where I need to be right now",
  "I radiate confidence and inner peace",
  "Every challenge makes me stronger",
  "I am grateful for all that I have",
  "I am creating the life I want to live",
  "I am enough, just as I am",
  "I believe in myself and my dreams",
];
```

## 🔧 **Technical Implementation**

### **Phase 1: Setup & Storage**

1. Create welcome flow screens
2. Implement AsyncStorage utilities
3. Create user profile types and validation
4. Build profile setup form

### **Phase 2: Main App**

1. Create main affirmation screen
2. Implement swipeable affirmation cards
3. Add dynamic header with greeting
4. Create profile and notification icons

### **Phase 3: Logic & Polish**

1. Implement greeting logic (morning/afternoon/evening)
2. Add daily affirmation tracking
3. Create smooth animations
4. Add haptic feedback

## 🎨 **Styling Approach**

- Use Tailwind CSS for all new components
- Maintain existing theme system
- Create consistent card designs
- Implement smooth transitions

## 📱 **Navigation Flow**

```
Welcome Screen → Profile Setup → Main App
     ↓              ↓              ↓
  New users    Data collection   Daily affirmations
```

## 🚀 **Development Phases**

### **Week 1: Foundation**

- [ ] Welcome screen UI
- [ ] Profile setup form
- [ ] Local storage implementation
- [ ] Basic navigation

### **Week 2: Core Features**

- [ ] Main affirmation screen
- [ ] Swipeable cards
- [ ] Dynamic header
- [ ] Greeting logic

### **Week 3: Polish**

- [ ] Animations and transitions
- [ ] Haptic feedback
- [ ] Daily tracking
- [ ] Error handling

## 🎯 **Success Metrics**

- Smooth onboarding experience
- Intuitive affirmation browsing
- Personalized user experience
- Reliable local data persistence

---

**Ready to start development!** This plan provides a clear roadmap for building your mood affirmation app with modern React Native/Expo practices.
