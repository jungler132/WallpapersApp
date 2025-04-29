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
        'User-Agent': 'OtakuWalls/1.0'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching random image:', error);
    throw error;
  }
};

export const getRandomImages = async (tags?: string[]): Promise<ImageData[]> => {
  try {
    console.log('🌐 [API] Fetching images with tags:', tags);
    // Создаем массив промисов для параллельной загрузки изображений
    const promises = Array(10).fill(null).map(async () => {
      const params: any = {
        compress: true
      };
      
      if (tags && tags.length > 0) {
        // Используем параметр in для включения тегов
        params.in = tags.join(',');
        console.log('🌐 [API] Request params:', params);
      }

      const response = await axios.get(`${API_BASE_URL}/image.json`, {
        params,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'OtakuWalls/1.0'
        }
      });

      console.log('🌐 [API] Received response:', {
        hasData: !!response.data,
        tags: response.data?.tags,
        id: response.data?._id
      });

      // Фильтруем результаты на клиенте, чтобы убедиться, что изображение содержит все выбранные теги
      if (tags && tags.length > 0 && response.data) {
        const imageTags = response.data.tags || [];
        const hasAllTags = tags.every(tag => imageTags.includes(tag));
        console.log('🔍 [API] Image tag check:', {
          requiredTags: tags,
          imageTags,
          hasAllTags
        });
        if (!hasAllTags) {
          // Если изображение не содержит все теги, возвращаем null
          return null;
        }
      }

      return response.data;
    });

    // Ждем выполнения всех запросов и фильтруем null результаты
    const results = await Promise.all(promises);
    const filteredResults = results.filter(result => result !== null);
    console.log('📊 [API] Final results:', {
      total: results.length,
      filtered: filteredResults.length
    });
    return filteredResults;
  } catch (error) {
    console.error('❌ [API] Error fetching random images:', error);
    throw error;
  }
};

export const getImageById = async (id: number): Promise<ImageData> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/image.json`, {
      params: { id },
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'OtakuWalls/1.0'
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
        'User-Agent': 'OtakuWalls/1.0'
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
        'User-Agent': 'OtakuWalls/1.0'
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