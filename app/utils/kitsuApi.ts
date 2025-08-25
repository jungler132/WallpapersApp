const BASE_URL = 'https://kitsu.io/api/edge';

export interface MangaData {
  id: string;
  type: string;
  attributes: {
    slug?: string;
    titles: {
      en?: string;
      en_jp?: string;
      ja_jp?: string;
      canonicalTitle?: string;
      abbreviatedTitles?: string[];
    };
    posterImage: {
      tiny?: string;
      small?: string;
      medium?: string;
      large?: string;
      original?: string;
    };
    coverImage?: {
      tiny?: string;
      small?: string;
      large?: string;
      original?: string;
    };
    synopsis?: string;
    averageRating?: string;
    status: string;
    chapterCount?: number;
    volumeCount?: number;
    startDate?: string;
    endDate?: string;
    ageRating?: string;
    ageRatingGuide?: string;
    mangaType?: string;
    subtype?: string;
    popularityRank?: number;
    ratingRank?: number;
    userCount?: number;
    favoritesCount?: number;
    serialization?: string;
  };
}

export interface KitsuResponse<T = MangaData> {
  data: T[];
  meta?: {
    count?: number;
  };
  links?: {
    first?: string;
    next?: string;
    last?: string;
  };
}

export const getMangaList = async ({ 
  limit = 10, 
  offset = 0, 
  search = '', 
  category = '',
  status = '',
  sort = ''
}: {
  limit?: number;
  offset?: number;
  search?: string;
  category?: string;
  status?: 'current' | 'finished' | 'tba' | 'unreleased' | 'upcoming' | '';
  sort?: string; // e.g. 'ratingRank' | 'popularityRank'
}): Promise<KitsuResponse> => {
  try {
    let url = `${BASE_URL}/manga?page[limit]=${limit}&page[offset]=${offset}`;
    
    if (search) {
      url += `&filter[text]=${encodeURIComponent(search)}`;
    }
    
    if (category) {
      url += `&filter[categories]=${encodeURIComponent(category)}`;
    }
    if (status) {
      url += `&filter[status]=${encodeURIComponent(status)}`;
    }
    if (sort) {
      url += `&sort=${encodeURIComponent(sort)}`;
    }

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[Kitsu API] Error fetching manga list:', error);
    throw error;
  }
};

export const getMangaDetail = async (id: string): Promise<{ data: MangaData }> => {
  try {
    const response = await fetch(`${BASE_URL}/manga/${id}`, {
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[Kitsu API] Error fetching manga detail:', error);
    throw error;
  }
};

export interface MangaCategory {
  id: string;
  type: string;
  attributes: {
    title?: string;
    slug?: string;
    description?: string;
  };
}

export const getMangaCategories = async (id: string): Promise<KitsuResponse<MangaCategory>> => {
  try {
    const response = await fetch(`${BASE_URL}/manga/${id}/categories?page[limit]=12`, {
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('[Kitsu API] Error fetching manga categories:', error);
    throw error;
  }
};

export interface MangaChapter {
  id: string;
  type: string;
  attributes: {
    titles?: { canonicalTitle?: string };
    number?: number;
    volumeNumber?: number;
    published?: string;
    length?: number;
  };
}

export const getMangaChapters = async (mangaId: string, limit = 5): Promise<KitsuResponse<MangaChapter>> => {
  try {
    const url = `${BASE_URL}/chapters?filter[mangaId]=${encodeURIComponent(mangaId)}&page[limit]=${limit}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('[Kitsu API] Error fetching manga chapters:', error);
    throw error;
  }
};

// Популярные категории манги
export const MANGA_CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Action', value: 'action' },
  { label: 'Adventure', value: 'adventure' },
  { label: 'Comedy', value: 'comedy' },
  { label: 'Drama', value: 'drama' },
  { label: 'Fantasy', value: 'fantasy' },
  { label: 'Horror', value: 'horror' },
  { label: 'Mystery', value: 'mystery' },
  { label: 'Romance', value: 'romance' },
  { label: 'Sci-Fi', value: 'sci-fi' },
  { label: 'Slice of Life', value: 'slice-of-life' },
  { label: 'Sports', value: 'sports' },
  { label: 'Supernatural', value: 'supernatural' },
  { label: 'Thriller', value: 'thriller' },
];
