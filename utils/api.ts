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

export const getRandomImages = async (tags: string[] = []): Promise<ImageData[]> => {
  console.log('🔍 [API] Starting getRandomImages with tags:', tags);
  try {
    const params: any = {
      compress: true,
    };

    if (tags.length > 0) {
      params.in = tags.join(',');
      console.log('📤 [API] Request params:', params);
    }

    console.log('🌐 [API] Making request to:', `${API_BASE_URL}/image.json`);
    const response = await axios.get(`${API_BASE_URL}/image.json`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AnimeWallpapers/1.0'
      },
      params
    });

    console.log('📥 [API] Response status:', response.status);
    
    if (!response.data) {
      console.error('❌ [API] No data received in response');
      throw new Error('No data received from API');
    }

    console.log('✅ [API] Successfully received image data');
    console.log('📊 [API] Image tags:', response.data.tags);
    console.log('🖼️ [API] Image URL:', response.data.file_url);

    return [response.data];
  } catch (error) {
    console.error('❌ [API] Error in getRandomImages:', error);
    if (axios.isAxiosError(error)) {
      console.error('📡 [API] Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    }
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
  console.log('🔍 [API] Starting getTags request');
  try {
    const response = await axios.get(`${API_BASE_URL}/tags`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AnimeWallpapers/1.0'
      }
    });

    console.log('📥 [API] Tags response status:', response.status);
    console.log('📊 [API] Received tags count:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('📋 [API] First few tags:', response.data.slice(0, 5));
    }

    return response.data;
  } catch (error) {
    console.error('❌ [API] Error fetching tags:', error);
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