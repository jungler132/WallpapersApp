import axios from 'axios';

const API_URL = 'https://api.waifu.im/search';

export interface ImageData {
  _id: number;
  file_url: string;
  file_size: number;
  tags: string[];
  md5: string;
  width: number;
  height: number;
  source: string;
  author: string;
  has_children: boolean;
}

interface ApiResponse {
  images: ImageData[];
}

const api = {
  getImages: async (page: number = 1, limit: number = 10): Promise<ImageData[]> => {
    try {
      const response = await axios.get<ApiResponse>(API_URL, {
        params: {
          included_tags: ['maid'],
          many: true,
          page,
          limit,
        },
      });
      return response.data.images;
    } catch (error) {
      console.error('Error fetching images:', error);
      throw error;
    }
  },

  getImageById: async (id: string): Promise<ImageData> => {
    try {
      const response = await axios.get<ApiResponse>(API_URL, {
        params: {
          included_tags: ['maid'],
          many: true,
        },
      });
      const image = response.data.images.find(img => String(img._id) === String(id));
      if (!image) {
        throw new Error('Image not found');
      }
      return image;
    } catch (error) {
      console.error('Error fetching image by id:', error);
      throw error;
    }
  }
};

export default api; 