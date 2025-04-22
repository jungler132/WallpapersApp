import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = 'https://api.jikan.moe/v4';

// Типы данных
export interface Anime {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
  score: number;
}

export interface AnimeDetails {
  title: string;
  title_japanese: string;
  images: {
    jpg: {
      large_image_url: string;
    };
  };
  synopsis: string;
  score: number;
  episodes: number;
  status: string;
  aired: {
    string: string;
  };
  genres: Array<{
    name: string;
  }>;
}

export interface AnimeSearchResponse {
  data: Anime[];
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
  };
}

export type AnimeStatus = 'airing' | 'complete' | 'upcoming';
export type AnimeSeason = 'winter' | 'spring' | 'summer' | 'fall';

// API функции
const fetchTopAnime = async (): Promise<Anime[]> => {
  const { data } = await axios.get(`${API_BASE_URL}/top/anime`);
  return data.data;
};

const fetchAnimeDetails = async (id: string | number): Promise<AnimeDetails> => {
  const { data } = await axios.get(`${API_BASE_URL}/anime/${id}/full`);
  return data.data;
};

const fetchAnimeSearch = async ({ pageParam = 1, queryKey }: any): Promise<AnimeSearchResponse> => {
  const [_, searchQuery] = queryKey;
  const { data } = await axios.get(`${API_BASE_URL}/anime`, {
    params: {
      q: searchQuery,
      page: pageParam,
      limit: 20,
    },
  });
  return data;
};

const fetchSeasonalAnime = async (season: AnimeSeason, year: number): Promise<Anime[]> => {
  const { data } = await axios.get(`${API_BASE_URL}/seasons/${year}/${season}`);
  return data.data;
};

const fetchCurrentSeasonAnime = async (): Promise<Anime[]> => {
  const { data } = await axios.get(`${API_BASE_URL}/seasons/now`);
  return data.data;
};

const fetchAnimeByStatus = async (status: AnimeStatus): Promise<Anime[]> => {
  const { data } = await axios.get(`${API_BASE_URL}/anime`, {
    params: {
      status,
      limit: 20,
    },
  });
  return data.data;
};

// React Query хуки
export function useTopAnime() {
  return useQuery({
    queryKey: ['topAnime'],
    queryFn: fetchTopAnime,
    staleTime: 1000 * 60 * 5, // 5 минут
    gcTime: 1000 * 60 * 30, // 30 минут
  });
}

export function useAnimeDetails(id: string | number) {
  return useQuery({
    queryKey: ['anime', id],
    queryFn: () => fetchAnimeDetails(id),
    staleTime: 1000 * 60 * 5, // 5 минут
    gcTime: 1000 * 60 * 30, // 30 минут
    enabled: !!id,
  });
}

export function useAnimeSearch(searchQuery: string) {
  return useInfiniteQuery({
    queryKey: ['animeSearch', searchQuery],
    queryFn: fetchAnimeSearch,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.has_next_page) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
    enabled: !!searchQuery,
    staleTime: 1000 * 60 * 5, // 5 минут
    gcTime: 1000 * 60 * 30, // 30 минут
  });
}

export function useSeasonalAnime(season: AnimeSeason, year: number) {
  return useQuery({
    queryKey: ['seasonalAnime', season, year],
    queryFn: () => fetchSeasonalAnime(season, year),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

export function useCurrentSeasonAnime() {
  return useQuery({
    queryKey: ['currentSeasonAnime'],
    queryFn: fetchCurrentSeasonAnime,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

export function useAnimeByStatus(status: AnimeStatus) {
  return useQuery({
    queryKey: ['animeByStatus', status],
    queryFn: () => fetchAnimeByStatus(status),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
} 