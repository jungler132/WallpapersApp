import { useQuery } from '@tanstack/react-query';
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

// API функции
const fetchTopAnime = async (): Promise<Anime[]> => {
  const { data } = await axios.get(`${API_BASE_URL}/top/anime`);
  return data.data;
};

const fetchAnimeDetails = async (id: string | number): Promise<AnimeDetails> => {
  const { data } = await axios.get(`${API_BASE_URL}/anime/${id}/full`);
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