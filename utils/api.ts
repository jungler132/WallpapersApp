import axios from 'axios';

const API_BASE_URL = 'https://pic.re';

export interface ImageData {
  file_url: string;
  file_size: number;
  md5: string;
  tags: string[];
  width: number;
  height: number;
  source: string;
  author: string;
  has_children: boolean;
  _id: number;
}

export interface TagData {
  name: string;
  count: number;
}

export interface ApiError {
  message: string;
  status: number;
}

export const getRandomImage = async (params?: {
  nin?: string;
  in?: string;
  id?: number;
  compress?: boolean;
  min_size?: number;
  max_size?: number;
}): Promise<ImageData> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/image.json`, {
      params: {
        compress: true,
        ...params
      },
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AnimeWallpapers/1.0'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching random image:', error);
    throw error;
  }
};

export const getRandomImages = async (count: number = 10, params?: {
  nin?: string;
  in?: string;
  compress?: boolean;
  min_size?: number;
  max_size?: number;
}): Promise<ImageData[]> => {
  try {
    const promises = Array(count).fill(null).map(() => getRandomImage(params));
    return Promise.all(promises);
  } catch (error) {
    console.error('Error fetching random images:', error);
    throw error;
  }
};

export const getImageById = async (id: number): Promise<ImageData> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/image.json`, {
      params: { id },
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AnimeWallpapers/1.0'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching image by id:', error);
    throw error;
  }
};

export const getTags = async (): Promise<TagData[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tags`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AnimeWallpapers/1.0'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
};

export const getImageFile = async (params?: {
  nin?: string;
  in?: string;
  id?: number;
  compress?: boolean;
  min_size?: number;
  max_size?: number;
}): Promise<{
  data: Blob;
  headers: {
    image_id: string;
    image_source: string;
    image_tags: string;
  };
}> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/image`, {
      params: {
        compress: true,
        ...params
      },
      responseType: 'blob',
      headers: {
        'Accept': 'image/*',
        'User-Agent': 'AnimeWallpapers/1.0'
      }
    });
    return {
      data: response.data,
      headers: {
        image_id: response.headers['image_id'],
        image_source: response.headers['image_source'],
        image_tags: response.headers['image_tags']
      }
    };
  } catch (error) {
    console.error('Error fetching image file:', error);
    throw error;
  }
}; 