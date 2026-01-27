# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server (scan QR with Expo Go)
npm start

# Platform-specific
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser

# EAS builds
npx eas build --profile development  # Development build
npx eas build --profile preview      # Preview build
npx eas update --auto                # Push OTA update
```

## Environment Setup

Create `.env` file with TMDb API token (Bearer token, not API key):
```
EXPO_PUBLIC_TMDB_API_TOKEN=your_token_here
```

For EAS builds, the token is configured in `eas.json` under each build profile's `env` section.

## Architecture

### Navigation Structure
- **AppNavigator** (`src/navigation/AppNavigator.tsx`) - Root navigator
  - Bottom tabs: Discover, Library, Movies, Shows, Search
  - Modal stack: MovieDetail, ShowDetail (slide from bottom)

### State Management
- **Zustand store** (`src/store/libraryStore.ts`) - Persisted with AsyncStorage
  - Movie/Show watchlists and watched lists
  - Custom collections
  - User ratings

### API Layer
- **TMDb service** (`src/api/tmdb.ts`) - Bearer token auth with 30s timeout
  - `movieApi` - Now playing, popular, top rated, upcoming, details, credits, videos
  - `tvApi` - Airing today, on air, popular, top rated, details
  - `trendingApi`, `discoverApi`, `searchMulti`
  - Image helpers: `getPosterUrl()`, `getBackdropUrl()`, `getProfileUrl()`

### Component Patterns
- **MediaCard** - Poster cards with three sizes: small, medium, large
- **MediaCarousel** - Horizontal scrolling list with section header
- **ActionButton** - Pill-shaped buttons with haptic feedback
- **StarRating** - Interactive 5-star rating with haptics

### Screen Structure
Each screen follows the pattern:
1. SafeAreaView with header (title + menu button)
2. ScrollView with RefreshControl
3. Multiple MediaCarousel sections
4. Navigation to detail screens via `navigation.navigate('MovieDetail', { movieId })`

## iOS Native Feel

Key techniques used (see root-level UI spec files for details):
- Dark theme with true black (#000000) background
- BlurView for tab bar and floating buttons
- expo-haptics for tactile feedback
- Pressable with scale/opacity animations
- Modal presentation for detail screens
- iOS typography scale from Apple HIG

## GitHub Actions

PR previews automatically created via `.github/workflows/eas-preview.yml`:
- Requires `EXPO_TOKEN` and `TMDB_API_TOKEN` secrets
- Creates `.env` file and runs `eas update`
- Posts QR code comment for Expo Go scanning
