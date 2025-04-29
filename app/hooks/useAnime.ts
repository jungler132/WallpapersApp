import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import axios from 'axios';

const BASE_URL = 'https://api.jikan.moe/v4';

export type AnimeSeason = 'winter' | 'spring' | 'summer' | 'fall';

export interface Anime {
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
  studios: Array<{
    mal_id: number;
    type: string;
    name: string;
  }>;
  genres: Array<{
    mal_id: number;
    type: string;
    name: string;
  }>;
}

interface ApiResponse<T> {
  data: T[];
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

export const useTopAnime = () => {
  return useInfiniteQuery({
    queryKey: ['topAnime'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axios.get<ApiResponse<Anime>>(`${BASE_URL}/top/anime`, {
        params: {
          page: pageParam,
          limit: 25,
          filter: 'bypopularity'
        }
      });
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.has_next_page) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
  });
};

export const useSeasonalAnime = (season: AnimeSeason, year: number) => {
  return useInfiniteQuery({
    queryKey: ['seasonalAnime', season, year],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axios.get<ApiResponse<Anime>>(`${BASE_URL}/seasons/${year}/${season}`, {
        params: {
          page: pageParam,
          limit: 25,
          sfw: true
        }
      });
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.has_next_page) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
    enabled: !!season && !!year,
  });
};

export const useCurrentSeasonAnime = () => {
  return useInfiniteQuery({
    queryKey: ['currentSeason'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axios.get<ApiResponse<Anime>>(`${BASE_URL}/seasons/now`, {
        params: {
          page: pageParam,
          limit: 25,
          sfw: true
        }
      });
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.has_next_page) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
  });
};

export const useAnimeByStatus = (status: 'airing' | 'complete' | 'upcoming') => {
  return useInfiniteQuery({
    queryKey: ['animeByStatus', status],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axios.get<ApiResponse<Anime>>(`${BASE_URL}/anime`, {
        params: {
          status,
          page: pageParam,
          limit: 25,
          sfw: true,
          order_by: 'popularity',
          sort: 'desc'
        }
      });
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.has_next_page) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
  });
};

export const useAnimeSearch = (query: string) => {
  return useInfiniteQuery({
    queryKey: ['animeSearch', query],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axios.get<ApiResponse<Anime>>(`${BASE_URL}/anime`, {
        params: {
          q: query,
          page: pageParam,
          limit: 25,
          sfw: true,
          order_by: 'popularity',
          sort: 'desc'
        }
      });
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.has_next_page) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
    enabled: query.length > 0,
  });
};

export const useAnimeDetails = (id: number) => {
  return useQuery<Anime>({
    queryKey: ['animeDetails', id],
    queryFn: async () => {
      const response = await axios.get<{ data: Anime }>(`${BASE_URL}/anime/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}; 