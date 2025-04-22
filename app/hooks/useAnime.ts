import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import axios from 'axios';

const BASE_URL = 'https://api.jikan.moe/v4';

export type AnimeSeason = 'winter' | 'spring' | 'summer' | 'fall';

export interface Anime {
  mal_id: number;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  title: string;
  score: number;
  season?: string;
  year?: number;
  status: string;
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
  return useQuery<Anime[]>({
    queryKey: ['topAnime'],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<Anime>>(`${BASE_URL}/top/anime`, {
        params: {
          limit: 20,
        }
      });
      return response.data.data;
    }
  });
};

export const useSeasonalAnime = (season: AnimeSeason, year: number) => {
  return useQuery<Anime[]>({
    queryKey: ['seasonalAnime', season, year],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<Anime>>(`${BASE_URL}/seasons/${year}/${season}`);
      return response.data.data;
    },
    enabled: !!season && !!year,
  });
};

export const useCurrentSeasonAnime = () => {
  return useQuery<Anime[]>({
    queryKey: ['currentSeason'],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<Anime>>(`${BASE_URL}/seasons/now`);
      return response.data.data;
    }
  });
};

export const useAnimeByStatus = (status: 'airing' | 'complete' | 'upcoming') => {
  return useQuery<Anime[]>({
    queryKey: ['animeByStatus', status],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<Anime>>(`${BASE_URL}/anime`, {
        params: {
          status,
          limit: 20,
        }
      });
      return response.data.data;
    }
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
          limit: 20,
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