# CampusFlow
"Find your perfect study space at FERI."

CampusFlow is a mobile application developed as a semester project. It goes beyond standard campus maps by allowing students to find, rate, and share real-time study environments based on crucial focus factors.

---

## Project Requirements & Grading Mapping
This project was built to fulfill the comprehensive grading rubric requirements:

* **Core Functionalities (50%):** User profiles (registration, login, logout), real-time location rating (noise, crowds, WiFi, outlets, lighting), and live location viewing.
* **Navigation & Persistence (60%):** Intuitive tab/stack navigation and a cloud database (Firebase Firestore) for robust data persistence.
* **Design Tokens & Location (70%):** Centralized design tokens for consistent UI, plus an interactive map using device location services to display nearby study spots.
* **Animations & API (80%):** Fluid micro-interactions (swipe gestures, toast notifications) and an integration with a live Weather API to suggest indoor locations during rain.
* **Responsiveness & Version Control (90%):** Adaptive UI for different screens, managed entirely via Git/GitHub with structured branches.
* **Advanced Features (100%):** Push notifications for "quiet location" alerts and unit testing for critical rating calculation logic.

---

## Architecture
CampusFlow utilizes a modern, decoupled mobile architecture:
* **Frontend / UI:** React Native (JavaScript/TypeScript), allowing for native iOS compilation and cross-platform Android support.
* **Backend as a Service (BaaS):** Firebase.
    * **Authentication:** Firebase Auth for secure user registration and login.
    * **Database:** Cloud Firestore (NoSQL) structured into `usernames`, `locations`, and rating collections for real-time data syncing.
* **External Data:** Third-party Weather API integration.

---

## Usage
1.  **Register/Login:** Create an account to access the platform.
2.  **Explore the Map:** Use the interactive map to view your location relative to campus study spots.
3.  **Check Live Ratings:** Tap on a location (e.g., "Library") to view the current average ratings for noise, crowdedness, WiFi strength, and available outlets.
4.  **Submit a Rating:** Physically at a location? Submit a new rating to instantly update the averages for all other users.
5.  **Weather Suggestions:** If the Weather API detects rain, the app will prioritize suggesting indoor spaces.
6.  **Library Alerts:** Receive local push notifications for optimal study times.

---

## Setup & Installation Instructions

To run this project locally for development or evaluation:

1. Clone the repository

git clone <your-repository-url>
cd FocusFlow
2. Install Dependencies

npm install
3. Environment Variables (.env) You must configure the Firebase and API keys. Create a .env file in the root directory (do not commit this file to version control):

FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
WEATHER_API_KEY=your_weather_api_key
4. iOS Specific Setup Link the native Apple dependencies using CocoaPods:

cd ios
pod install
cd ..
5. Run the Application Start the Metro Bundler and launch the application on an emulator or physical device:

iOS: npm run ios (or npx react-native run-ios)
