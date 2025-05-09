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
  preview_url?: string;
  created_at?: string;
}

export const getRandomImage = async (): Promise<ImageData> => {
  try {
    console.log('Fetching image from:', `${API_BASE_URL}/image.json?compress=true`);
    const response = await fetch(`${API_BASE_URL}/image.json?compress=true`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'OtakuWalls/1.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Received image data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching random image:', error);
    throw error;
  }
};

export const getRandomImages = async (count: number = 10): Promise<ImageData[]> => {
  const promises = Array(count).fill(null).map(() => getRandomImage());
  return Promise.all(promises);
}; 