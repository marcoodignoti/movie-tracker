# Movie Tracker

A beautiful iOS movie and TV show tracking app built with Expo and React Native. Track movies and shows you want to watch, have watched, and organize them into custom collections.

## Features

- **Discover** - Browse trending, popular, and top-rated movies and TV shows
- **Movies** - Explore theatrical releases, streaming content, and upcoming films
- **Shows** - Track TV shows airing today, currently on air, and popular series
- **Library** - Organize your watchlist, watched content, and custom collections
- **Search** - Find any movie or TV show from TMDb's extensive database
- **Details** - View comprehensive information including cast, trailers, ratings, and similar content
- **Personal Ratings** - Rate content with a 5-star system
- **Offline Support** - Your library is persisted locally

## Tech Stack

- **Expo** - React Native framework
- **TypeScript** - Type-safe development
- **React Navigation** - Native navigation
- **Zustand** - State management with persistence
- **Expo Image** - Optimized image loading
- **TMDb API** - Movie and TV show data

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Expo Go app on your iOS device (for testing)
- TMDb API key (free at https://www.themoviedb.org/settings/api)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. Add your TMDb API key to `.env`:
   ```
   EXPO_PUBLIC_TMDB_API_KEY=your_api_key_here
   ```

5. Start the development server:
   ```bash
   npx expo start
   ```

6. Scan the QR code with Expo Go on your iOS device

## Project Structure

```
src/
├── api/          # TMDb API service
├── components/   # Reusable UI components
├── constants/    # Theme and configuration
├── navigation/   # App navigation setup
├── screens/      # Screen components
├── store/        # Zustand store for state management
├── types/        # TypeScript type definitions
└── utils/        # Utility functions
```

## EAS Preview

This project includes a GitHub workflow that automatically creates Expo Go previews for pull requests. To enable:

1. Create an Expo account at https://expo.dev
2. Create a new project and get your project ID
3. Update `app.json` with your project ID
4. Add `EXPO_TOKEN` to your GitHub repository secrets
5. Open a PR to see the preview link

## Scripts

- `npm start` - Start the Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run in web browser

## License

MIT
