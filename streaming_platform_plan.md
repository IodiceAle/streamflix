# StreamFlix - Complete Implementation Plan
## Netflix-like Streaming Platform (PWA)

---

## Table of Contents
1. [Analysis of Current Streaming Platforms](#analysis)
2. [Project Architecture](#architecture)
3. [Core Features & Pages](#features)
4. [Component Design System](#components)
5. [State Management](#state)
6. [Data Flow & APIs](#apis)
7. [PWA Configuration](#pwa)
8. [Styling Guidelines](#styling)
9. [User Experience Enhancements](#ux)
10. [Routing Structure](#routing)
11. [Development Workflow](#workflow)
12. [Key React Patterns](#patterns)
13. [Testing Strategy](#testing)
14. [Implementation Priority](#priority)

---

## <a name="analysis"></a>1. Analysis of Current Streaming Platforms

Based on modern streaming platforms (Netflix, Disney+, etc.), key characteristics include:

### Navigation Pattern
- Bottom tab navigation (Home, Search, Coming Soon, Downloads, More)
- Clean category filtering (All, TV Shows, Movies, My List)
- Modal-style overlays for filtering and menus

### Visual Design
- Dark theme with high contrast
- Card-based content grids (3 columns on mobile)
- Hero banners with play/info buttons
- Horizontal scrollable rows for content categories
- Minimalist player controls with 10-second skip buttons

### Content Organization
- Personalized homepage with multiple curated rows
- Continue watching section at top
- Category-based browsing (Popular, Trending, Genre-specific)
- Top searches section
- Collection grouping for related content

### User Experience
- Inline video player (not full-screen initially)
- Quick actions on content cards
- Smooth transitions and animations
- Search with trending suggestions
- Progressive Web App capabilities

---

## <a name="architecture"></a>2. Project Architecture

### Technology Stack
- **Frontend Framework:** React router framework mode with hooks most recent
- **Routing:** React Router most recent
- **Styling:** Tailwind CSS
- **Build Tool:** Vite
- **PWA:**
- **Auth & Database:** Supabase
- **Content API:** TMDB API
- **Video Streaming:** VixSrc.to vidit the site to see the docs
- **Data Fetching:** React Query (TanStack Query)

---

## <a name="features"></a>3. Core Features & Pages

### Home Page (`/`)

**Layout Sections:**
1. Hero banner with featured content (auto-rotating every 5 seconds)
2. Continue Watching row (if user has watch history)
3. Multiple content rows:
   - Trending Now
   - Popular on Netflix
   - Top 10 in Nigeria Today (use user location)
   - Genre-based rows (Action, Drama, Comedy, Thriller, Horror, Romance)
   - Netflix Originals
   - New Releases
   - Recently Added
   - Because you watched X (basic recommendations)

**Implementation Details:**
- Hero carousel with 3-5 featured items
- Infinite scroll or "Load More" pagination
- Horizontal scroll with snap points for each row
- Lazy loading for images with blur-up placeholder
- Pull-to-refresh gesture for mobile
- Skeleton loading states for all content
- Each row shows 10-20 items initially
- Smooth scroll animations with momentum

**Data Sources:**
- TMDB `/trending/all/day` for Trending
- TMDB `/movie/popular` and `/tv/popular`
- TMDB `/discover/movie` with genre filters
- Supabase `continue_watching` table

---

### Discover Page (`/discover`)

**Filter Options:**
- Type selector: Movies / TV Shows / All
- Genre chips (multi-select)
- Sort dropdown:
  - Popularity Descending
  - Popularity Ascending
  - Release Date Descending
  - Release Date Ascending
  - Rating Descending
  - Title A-Z

**Advanced Filters (Expandable Panel):**
- Release year range slider
- Rating range slider (0-10)
- Runtime range (for movies)
- Language selector
- Original language toggle

**Layout:**
- Grid view (2 columns mobile, 3 tablet, 4-6 desktop)
- Filter bar at top (sticky)
- Results count display
- Infinite scroll for results
- "Clear all filters" button

**Implementation:**
- Use URL query params for filter state (shareable links)
- Debounce filter changes (500ms)
- Show loading skeleton while fetching
- Empty state when no results

---

### Search Page (`/search`)

**Components:**
1. **Search Input:**
   - Large prominent input with icon
   - Voice search button (optional)
   - Clear button when typing
   - Debounced search (300ms delay)

2. **Top Searches Section** (when input is empty):
   - List of 7-10 popular searches
   - Thumbnail + title + play button
   - Click to go to detail page
   - Updates daily from TMDB trending

3. **Recent Searches:**
   - Stored in localStorage
   - Show last 10 searches
   - Clear all option
   - Click to repeat search

4. **Search Results:**
   - Grouped by type (Movies / TV Shows)
   - Grid layout same as discover
   - Show result count
   - Infinite scroll
   - No results state with suggestions

**Data Flow:**
- TMDB `/search/multi` endpoint
- Filter out people from results
- Cache recent searches locally
- Track search analytics (optional)

---

### My List Page (`/mylist`)

**Features:**
- Grid view of saved content
- Same card style as other pages
- Sort options:
  - Date Added (newest first) - default
  - Date Added (oldest first)
  - Title A-Z
  - Title Z-A
  - Release Date

**Interactions:**
- Long-press on mobile to remove
- Hover actions on desktop (remove button)
- Swipe to delete on mobile (optional)
- Bulk selection mode (optional)

**Empty State:**
- Friendly message: "Your list is empty"
- Call-to-action button to browse
- Suggested content to add

**Data:**
- Synced with Supabase `my_list` table
- Real-time updates across devices
- Optimistic UI updates

---

### Detail Page (`/detail/:type/:id`)

**Hero Section:**
- Full-width backdrop image
- Gradient overlay (bottom to top)
- Logo image if available
- Title (with original title if different)
- Metadata badges:
  - Year
  - Rating (e.g., "TV-MA", "PG-13")
  - Duration (e.g., "2h 15m" or "45m")
  - Match percentage (optional, calculate based on genres)

**Action Buttons:**
- **Play button** (primary, large) → Go to watch page
- **Add to My List** button (toggle, shows checkmark if added)
- **Share button** (native share API)

**Overview Section:**
- Synopsis text (collapsible if > 3 lines)
- "Read More" / "Read Less" toggle
- Genres as clickable chips
- Release date
- Status (Released, Post Production, etc.)

**Trailer Section:**
- "Watch Trailer" button
- Modal overlay with embedded YouTube player
- Use YouTube IFrame API for control
- Multiple trailers in tabs if available
- Don't navigate away from page

**Episodes Section (TV Shows Only):**
- Season selector dropdown at top
- Episode list with:
  - Thumbnail (still image)
  - Episode number + title
  - Duration
  - Overview (collapsible)
  - Progress bar if partially watched
  - Play button overlay
- Load episodes on-demand per season
- Expand/collapse each episode details

**Collection Section:**
- Title: "More in this Collection" or "Related Movies"
- Horizontal scrollable carousel
- Use TMDB `belongs_to_collection` data
- Show sequels, prequels, same franchise
- Falls back to "More Like This" if no collection

**More Like This Section:**
- Horizontal carousel
- Use TMDB `/movie/{id}/similar` or `/tv/{id}/similar`
- Show 20+ similar titles
- Same card style as everywhere

**Additional Metadata:**
- Runtime per episode (TV shows)

**Implementation Notes:**
- Fetch data on mount with React Query
- Cache aggressively (staleTime: 10 minutes)
- Show skeleton loaders for each section
- Lazy load below-the-fold sections
- Handle missing data gracefully

---

### Watch Page (`/watch/:type/:id` or `/watch/tv/:id/:season/:episode`)

**Player Implementation:**
   see the docs of vixsrc.to
3. **Custom Controls Overlay:**
   - Top bar:
     - Back button (go to detail page)
     - Title + season/episode info
     - Settings icon
   - Center:
     - Large play/pause button
     - 10-second skip backward button (left)
     - 10-second skip forward button (right)
   - Bottom bar:
     - Progress bar with scrubbing
     - Current time / Duration
     - Volume slider (desktop only)
     - Quality selector button
     - Subtitles button
     - Fullscreen button
     - Next episode button (TV shows, appears at 90% progress)

4. **Player Behaviors:**
   - Auto-hide controls after 3 seconds of inactivity
   - Show controls on mouse move or tap
   - Tap center to toggle play/pause (mobile)
   - Double-tap left/right to skip (mobile)
   - Swipe up/down for brightness (left side) and volume (right side) - optional
   - Space bar to play/pause
   - Arrow keys to skip
   - F key for fullscreen

5. **Progress Tracking:**
   - Save progress to Supabase every 10 seconds
   - Upsert into `continue_watching` table
   - Include: tmdb_id, type, season, episode, progress_seconds, duration_seconds
   - Resume from saved position on load
   - Show "Resume" or "Play from Beginning" option
   - Mark as complete at 90% watched

6. **Next Episode Logic (TV Shows):**
   - Show "Next Episode" button at 90% progress
   - Auto-play countdown (10 seconds) if enabled in settings
   - Skip intro/credits buttons (optional, requires data)

7. **Settings Panel:**
   - Playback speed: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
   - Quality: Auto, 1080p, 720p, 480p, 360p (based on available)
   - Subtitles: Off, English, Spanish, etc.
   - Subtitle size: Small, Medium, Large
   - Audio track selector (if multiple available)

8. **Error Handling:**
   - Show friendly error message if stream fails
   - "Try Again" button to reload
   - Fallback to alternate source if available
   - Log errors for monitoring

**VixSrc.to Integration Guide:**

According to the VixSrc.to documentation:

1. **Fetching Sources:**
   ```
   GET https://vidsrc.to/embed/movie/{tmdb_id}
   GET https://vidsrc.to/embed/tv/{tmdb_id}/{season}/{episode}
   ```
   - Parse the HTML response to extract stream URLs
   - Look for M3U8 playlist URLs
   - Multiple sources may be available

2. **Stream URL Format:**
   - Usually HLS (M3U8) format
   - May include multiple quality options
   - Use HLS.js to parse and play

3. **Subtitle Handling:**
   - VTT format subtitles may be embedded
   - Extract subtitle tracks from M3U8 manifest
   - Add to video element as `<track>` elements

4. **Quality Selection:**
   - Parse M3U8 master playlist for available qualities
   - Allow user to select manually
   - Default to "Auto" (adaptive bitrate)

---

### Settings Page (`/settings`)

**Sections:**

1. **Profile Section:**
   - Avatar (upload or select from presets)
   - Username (editable)
   - Email (read-only, from Supabase auth)

2. **Appearance:**
   - Theme: Dark (locked for now, future: Light/Auto)
   - Language: English, Spanish, French, etc.

3. **Playback Settings:**
   - Auto-play next episode: Toggle
   - Auto-play previews: Toggle
   - Data saver mode: Toggle (limits quality)
   - Default video quality: Auto, High, Medium, Low

4. **Notifications:**
   - New releases: Toggle (future feature)
   - Recommendations: Toggle (future feature)

5. **Account:**
   - Change password button (Supabase auth)
   - Delete account button (with confirmation)
   - Sign out button

6. **App Information:**
   - Version number
   - Credits and acknowledgments
   - Privacy policy link
   - Terms of service link
   - Contact support

**Implementation:**
- Store preferences in Supabase `profiles` table
- Fallback to localStorage for non-critical settings
- Real-time sync across devices
- Optimistic updates for toggles

---

## <a name="components"></a>4. Component Design System

### ContentCard Component

**Props:**
- `item` (object): Content data from TMDB
- `type` (string): "movie" or "tv"
- `showProgress` (boolean): Show progress bar
- `onCardClick` (function): Navigate to detail page

**Layout:**
- Aspect ratio: 2:3 (portrait poster)
- Rounded corners: 8px
- Shadow on hover/focus
- Transition: all 200ms ease

**Image:**
- Lazy-loaded with IntersectionObserver
- Blur-up placeholder (base64 or solid color)
- Fade-in animation on load
- Alt text with title

**Overlay (on hover/tap):**
- Semi-transparent black background
- Play button icon (center)
- Add to list button (top-right)
- Title (bottom, truncated)
- Genres (bottom, small text)

**Progress Bar (if applicable):**
- Positioned at bottom of card
- Red progress indicator
- Shows percentage watched

**Styling:**
```
Container: relative, overflow-hidden, cursor-pointer
Image: w-full, h-full, object-cover
Overlay: absolute inset-0, bg-black/60, opacity-0 hover:opacity-100
Play button: absolute center, scale-0 hover:scale-100
```

---

### ContentRow Component

**Props:**
- `title` (string): Row heading
- `items` (array): Content items to display
- `type` (string): "movie" or "tv"
- `showSeeAll` (boolean): Show "See All" link
- `onSeeAll` (function): Navigate to filtered discover

**Layout:**
- Row container: flex, overflow-x-auto, snap-x
- Heading with "See All" link on right
- Horizontal scroll with momentum
- Snap to card boundaries
- Hide scrollbar (custom styling)
- Navigation arrows on desktop (hover to show)

**Responsive Card Sizing:**
- Mobile: ~45vw per card, gap-2
- Tablet: ~30vw per card, gap-3
- Desktop: ~18vw per card, gap-4
- Large desktop: fixed 250px, gap-4

**Interactions:**
- Smooth scrolling
- Keyboard navigation (arrow keys when focused)
- Touch/mouse drag to scroll
- Scroll position saved on navigation

---

### HeroCarousel Component

**Props:**
- `items` (array): Featured content (3-5 items)
- `autoPlay` (boolean): Auto-rotate slides
- `interval` (number): Rotation interval in ms (default: 5000)

**Layout:**
- Full-width container
- Large backdrop image (16:9 aspect ratio)
- Gradient overlay: linear-gradient(to top, black, transparent)
- Content positioned bottom-left
- Pagination dots bottom-center

**Content Display:**
- Title (large, bold)
- Overview (2-3 lines, fade at end)
- Metadata: Year, Rating, Duration
- Play button (primary)
- More Info button (secondary) → Navigate to detail
- Mute/Unmute button for trailer (optional)

**Interactions:**
- Auto-rotate slides with smooth transition
- Pause on hover (desktop)
- Swipe gestures (mobile)
- Pagination dots clickable
- Arrow navigation (desktop)
- Fade transition between slides (duration: 500ms)

**Accessibility:**
- ARIA labels for buttons
- Keyboard navigation (arrow keys, space)
- Pause button for auto-play
- Focus indicators

---

### Modal Component

**Props:**
- `isOpen` (boolean): Control visibility
- `onClose` (function): Close handler
- `title` (string): Modal heading
- `children` (ReactNode): Modal content
- `size` (string): "sm", "md", "lg", "xl", "full"

**Layout:**
- Fixed position overlay
- Backdrop: semi-transparent black, blur effect
- Content container: centered, rounded, shadow
- Close button: top-right, X icon

**Animations:**
- Backdrop: fade in (150ms)
- Content: slide up from bottom on mobile (300ms)
- Content: scale + fade on desktop (200ms)
- Exit animations: reverse of entrance

**Behaviors:**
- Click backdrop to close
- Escape key to close
- Trap focus inside modal
- Lock body scroll when open
- Restore focus on close

---

### BottomNav Component

**Items:**
- Home (icon: house)
- Search (icon: magnifying glass)
- My List (icon: bookmark)
- Settings (icon: gear)

**Layout:**
- Fixed bottom position
- Full width
- Blur background: backdrop-blur-md, bg-black/80
- Border top: 1px solid white/10
- Safe area padding for notched devices

**Styling Each Item:**
- Flex column: icon on top, label below
- Active state: primary color (red), font-bold
- Inactive state: white/60
- Tap animation: scale down
- Smooth color transition

**Implementation:**
- Use React Router's `useLocation` for active state
- `NavLink` component for routing
- Badge indicator for notifications (future)

---

### VideoPlayer Component

**Props:**
- `src` (string): Video stream URL (M3U8)
- `poster` (string): Poster image URL
- `title` (string): Video title
- `onProgress` (function): Callback with progress data
- `onEnded` (function): Callback when video ends
- `initialTime` (number): Resume position in seconds

**Player Setup:**
1. Use Plyr.io or Video.js as base player
2. Initialize HLS.js for HLS stream support
3. Add custom control UI overlay
4. Implement event listeners

**State Management:**
- `playing` (boolean): Play/pause state
- `currentTime` (number): Playback position
- `duration` (number): Total duration
- `volume` (number): Volume level (0-1)
- `muted` (boolean): Mute state
- `quality` (string): Selected quality
- `showControls` (boolean): Controls visibility
- `isFullscreen` (boolean): Fullscreen state

**Event Handlers:**
- `onPlay`: Set playing=true, hide controls after delay
- `onPause`: Set playing=false, show controls
- `onTimeUpdate`: Update currentTime, save progress
- `onLoadedMetadata`: Get duration, set initial time
- `onEnded`: Call onEnded callback, show next episode
- `onError`: Show error message, log error

**Control Interactions:**
- Click/tap center → toggle play/pause
- Click progress bar → seek to position
- Drag progress handle → scrub
- Hover controls → show, reset hide timer
- Double-tap left → skip backward 10s
- Double-tap right → skip forward 10s

---

## <a name="state"></a>5. State Management

### Context Providers

**AuthContext:**
- Provides: `user`, `session`, `signIn`, `signOut`, `loading`
- Wraps entire app
- Persists session with Supabase
- Auto-refresh tokens
- Redirect logic for protected routes

**MyListContext:**
- Provides: `myList`, `addToList`, `removeFromList`, `isInList`
- Fetches from Supabase on mount
- Real-time subscription for updates
- Optimistic UI updates
- Syncs across devices

**ContinueWatchingContext:**
- Provides: `continueWatching`, `updateProgress`, `clearItem`
- Fetches from Supabase on mount
- Updates on video progress
- Sorts by last_watched_at desc

**AppSettingsContext:**
- Provides: `settings`, `updateSettings`
- Stored in Supabase profiles table
- Fallback to localStorage
- Default values defined

---

## <a name="apis"></a>6. Data Flow & APIs

### TMDB API Service

**Base Configuration:**
```javascript
VITE_SUPABASE_URL=https://cvhcbhsazfynuvxnsvaf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2aGNiaHNhemZ5bnV2eG5zdmFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDc0NzAsImV4cCI6MjA3OTMyMzQ3MH0.qWWp8bs4RiycTKRsuPeBhf4YTj5LYZAfYlnq3wdHwSU

# TMDB API Key
VITE_TMDB_API_KEY=1029d9bda1a93a8aece8dbb8e6e48950

// Image size options
// poster: w92, w154, w185, w342, w500, w780, original
// backdrop: w300, w780, w1280, original
// still: w92, w185, w300, original
```

**Helper Functions:**
```javascript

**Key Endpoints:**

1. **Trending:**
   - `GET /trending/{media_type}/{time_window}`
   - media_type: all, movie, tv
   - time_window: day, week

2. **Discover:**
   - `GET /discover/movie`
   - `GET /discover/tv`
   - Query params: with_genres, sort_by, year, vote_average.gte, etc.

3. **Search:**
   - `GET /search/multi?query={query}`
   - Returns movies, TV shows, people
   - Filter out people on client side

4. **Details:**
   - `GET /movie/{movie_id}?append_to_response=videos,similar,credits`
   - `GET /tv/{tv_id}?append_to_response=videos,similar,credits`
   - Append multiple responses to reduce requests

5. **TV Season:**
   - `GET /tv/{tv_id}/season/{season_number}`
   - Returns episode list with metadata

6. **Videos:**
   - `GET /movie/{movie_id}/videos`
   - `GET /tv/{tv_id}/videos`
   - Filter for type=Trailer

7. **Similar:**
   - `GET /movie/{movie_id}/similar`
   - `GET /tv/{tv_id}/similar`

8. **Genres:**
   - `GET /genre/movie/list`
   - `GET /genre/tv/list`
   - Fetch once and cache

**Error Handling:**
- Retry logic for network errors (3 attempts)
- Toast notifications for user-facing errors
- Fallback to cached data if available

---

### Supabase Integration

### VixSrc.to Integration
   ```
   For movies: https://vidsrc.to/embed/movie/{tmdb_id}
   For TV: https://vidsrc.to/embed/tv/{tmdb_id}/{season}/{episode}
---

## <a name="pwa"></a>7. PWA

### Manifest.json