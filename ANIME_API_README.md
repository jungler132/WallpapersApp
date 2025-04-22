# Jikan API Documentation for Anime App

## Base URL
```
https://api.jikan.moe/v4
```

## Rate Limiting
- Per Minute: 60 requests
- Per Second: 3 requests
- Daily: Unlimited

## Authentication
- No authentication required
- All endpoints are public
- Only GET requests are supported

## Common Response Format
```typescript
interface ApiResponse<T> {
  data: T;
  pagination?: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
    items: {
      count: number;
      total: number;
      per_page: number;
    };
  };
}
```

## Main Endpoints

### 1. Get Top Anime List
```typescript
GET /top/anime

Parameters:
- type?: "tv" | "movie" | "ova" | "special" | "ona" | "music"
- filter?: "airing" | "upcoming" | "bypopularity" | "favorite"
- rating?: "g" | "pg" | "pg13" | "r17" | "r" | "rx"
- page?: number
- limit?: number
- sfw?: boolean

Example:
GET /top/anime?type=tv&filter=airing&page=1&limit=20
```

### 2. Get Anime Details
```typescript
GET /anime/{id}

Parameters:
- id: number (required)

Example:
GET /anime/1
```

### 3. Search Anime
```typescript
GET /anime

Parameters:
- q?: string (search query)
- type?: "tv" | "movie" | "ova" | "special" | "ona" | "music"
- score?: number
- min_score?: number
- max_score?: number
- status?: "airing" | "complete" | "upcoming"
- rating?: "g" | "pg" | "pg13" | "r17" | "r" | "rx"
- sfw?: boolean
- genres?: string (comma separated genre IDs)
- order_by?: "mal_id" | "title" | "start_date" | "end_date" | "episodes" | "score" | "rank" | "popularity"
- sort?: "desc" | "asc"
- page?: number
- limit?: number

Example:
GET /anime?q=naruto&type=tv&status=complete
```

### 4. Get Seasonal Anime
```typescript
GET /seasons/{year}/{season}

Parameters:
- year: number (required)
- season: "winter" | "spring" | "summer" | "fall"
- filter?: "tv" | "movie" | "ova" | "special" | "ona" | "music"
- sfw?: boolean
- page?: number
- limit?: number

Example:
GET /seasons/2024/winter
```

### 5. Get Currently Airing Anime
```typescript
GET /seasons/now

Parameters:
- filter?: "tv" | "movie" | "ova" | "special" | "ona" | "music"
- sfw?: boolean
- page?: number
- limit?: number

Example:
GET /seasons/now?filter=tv
```

### 6. Get Anime Characters
```typescript
GET /anime/{id}/characters

Parameters:
- id: number (required)

Example:
GET /anime/1/characters
```

### 7. Get Anime Statistics
```typescript
GET /anime/{id}/statistics

Parameters:
- id: number (required)

Example:
GET /anime/1/statistics
```

## Response Types

### Anime Object
```typescript
interface Anime {
  mal_id: number;
  url: string;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
    webp: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  trailer: {
    youtube_id: string;
    url: string;
    embed_url: string;
  };
  title: string;
  title_english: string;
  title_japanese: string;
  type: string;
  source: string;
  episodes: number;
  status: string;
  airing: boolean;
  duration: string;
  rating: string;
  score: number;
  scored_by: number;
  rank: number;
  popularity: number;
  members: number;
  favorites: number;
  synopsis: string;
  background: string;
  season: string;
  year: number;
  genres: Array<{
    mal_id: number;
    type: string;
    name: string;
  }>;
}
```

### Character Object
```typescript
interface Character {
  mal_id: number;
  url: string;
  images: {
    jpg: {
      image_url: string;
    };
    webp: {
      image_url: string;
    };
  };
  name: string;
  name_kanji: string;
  nicknames: string[];
  favorites: number;
  about: string;
}
```

## Error Handling

### Error Response Format
```typescript
interface ErrorResponse {
  status: number;
  type: string;
  message: string;
  error: string;
  report_url?: string;
}
```

### HTTP Status Codes
- 200: Success
- 400: Bad Request
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error
- 503: Service Unavailable

## Usage Examples

### Get Top Anime
```typescript
const getTopAnime = async () => {
  try {
    const response = await axios.get('https://api.jikan.moe/v4/top/anime', {
      params: {
        type: 'tv',
        filter: 'airing',
        limit: 20
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top anime:', error);
    throw error;
  }
};
```

### Search Anime
```typescript
const searchAnime = async (query: string) => {
  try {
    const response = await axios.get('https://api.jikan.moe/v4/anime', {
      params: {
        q: query,
        sfw: true,
        limit: 20
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching anime:', error);
    throw error;
  }
};
```

### Get Anime Details
```typescript
const getAnimeDetails = async (id: number) => {
  try {
    const response = await axios.get(`https://api.jikan.moe/v4/anime/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching anime details:', error);
    throw error;
  }
};
```

## Best Practices

1. **Rate Limiting**
   - Implement delay between requests (at least 333ms)
   - Use queue for multiple requests
   - Handle 429 errors with exponential backoff

2. **Caching**
   - Cache responses for 24 hours
   - Use local storage or state management
   - Check 'Last-Modified' headers

3. **Error Handling**
   - Always wrap API calls in try-catch
   - Handle network errors gracefully
   - Show user-friendly error messages

4. **Data Validation**
   - Validate input parameters
   - Check for null/undefined values
   - Use TypeScript interfaces

## Common Issues and Solutions

1. **Rate Limiting**
   ```typescript
   const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

   const fetchWithRetry = async (url: string, retries = 3) => {
     for (let i = 0; i < retries; i++) {
       try {
         const response = await axios.get(url);
         return response.data;
       } catch (error) {
         if (error.response?.status === 429) {
           await delay(Math.pow(2, i) * 1000);
           continue;
         }
         throw error;
       }
     }
   };
   ```

2. **Caching Implementation**
   ```typescript
   const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

   const getCachedData = async (key: string) => {
     const cached = localStorage.getItem(key);
     if (cached) {
       const { data, timestamp } = JSON.parse(cached);
       if (Date.now() - timestamp < CACHE_DURATION) {
         return data;
       }
     }
     return null;
   };

   const setCachedData = (key: string, data: any) => {
     localStorage.setItem(key, JSON.stringify({
       data,
       timestamp: Date.now()
     }));
   };
   ```

## Additional Resources

- [Official Jikan API Documentation](https://docs.api.jikan.moe/)
- [MyAnimeList API Guidelines](https://myanimelist.net/apiconfig/references/api/v2)
- [Rate Limiting Documentation](https://docs.api.jikan.moe/#section/Information/Rate-Limiting)
- [GitHub Issues](https://github.com/jikan-me/jikan/issues) 