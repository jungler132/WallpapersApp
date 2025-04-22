# Anime Wallpapers - Development Guide

## Used Modules and Their Purpose

### Navigation
- **@react-navigation/native** - Main navigation package
- **@react-navigation/stack** - Stack navigation (for screen transitions)
- **@react-navigation/bottom-tabs** - Bottom navigation (for tabs)
- **react-native-screens** - Screen rendering optimization
- **react-native-safe-area-context** - Safe screen areas

### UI Components
- **@expo/vector-icons** - Icons (using Ionicons)
- **react-native-reanimated** - Animations
- **react-native-gesture-handler** - Gesture handling

### Data Storage
- **@react-native-async-storage/async-storage** - Local storage
- **react-native-fs** - File system operations

### API and Network
- **axios** - HTTP requests
- **react-query** - Caching and request state management

### Utilities
- **date-fns** - Date handling
- **lodash** - Data manipulation utilities

## Module Usage Rules

### Navigation
- Use `@react-navigation/stack` for main screen transitions
- Use `@react-navigation/stack` with `presentation: 'modal'` for modal windows
- Use `@react-navigation/bottom-tabs` for bottom navigation

### Modal Windows
```typescript
// Correct
<Stack.Screen 
  name="ModalScreen" 
  component={ModalScreen}
  options={{ presentation: 'modal' }}
/>

// Incorrect
// Do not use react-native-modal or other libraries for modal windows
```

### Animations
```typescript
// Correct
import Animated from 'react-native-reanimated';

// Incorrect
// Do not use Animated from react-native
```

### Data Storage
```typescript
// Correct
import AsyncStorage from '@react-native-async-storage/async-storage';

// Incorrect
// Do not use other libraries for local storage
```

### API Requests
```typescript
// Correct
import axios from 'axios';
import { useQuery } from 'react-query';

// Incorrect
// Do not use fetch directly for complex requests
```

## Coding Style

### File and Component Naming
- Component files: PascalCase (e.g., `AnimeImage.tsx`)
- Utility files: camelCase (e.g., `api.ts`)
- Type files: camelCase (e.g., `navigation.ts`)
- Component exports: default export
- Utility exports: named exports

### Component Structure
```typescript
// 1. Imports
import React from 'react';
import { ... } from 'react-native';
import { ... } from '../types';
import { ... } from '../utils';

// 2. Types and Interfaces
interface ComponentProps {
  // ...
}

// 3. Constants
const CONSTANT = 'value';

// 4. Component
const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // 4.1. States
  const [state, setState] = React.useState<Type>(initialValue);

  // 4.2. Effects
  React.useEffect(() => {
    // ...
  }, []);

  // 4.3. Handlers
  const handleEvent = () => {
    // ...
  };

  // 4.4. Render
  return (
    // ...
  );
};

// 5. Styles
const styles = StyleSheet.create({
  // ...
});

// 6. Export
export default Component;
```

### Navigation

#### Navigation Types
```typescript
// types/navigation.ts
export type RootStackParamList = {
  Home: undefined;
  ImageDetails: { image: ImageData };
};
```

#### Using Navigation in Components
```typescript
// 1. Import types
import { RootStackParamList } from '../types/navigation';
import { StackNavigationProp } from '@react-navigation/stack';

// 2. Define navigation type
type NavigationProp = StackNavigationProp<RootStackParamList>;

// 3. Use in component
const navigation = useNavigation<NavigationProp>();

// 4. Navigation
navigation.navigate('ScreenName', { param1: value1 });
```

#### Screen Parameters
```typescript
// For screen with parameters
type Props = StackScreenProps<RootStackParamList, 'ScreenName'>;

// Get parameters
const { param1, param2 } = route.params;
```

### API Work

#### Request Structure
```typescript
// 1. Base URL
const API_BASE_URL = 'https://api.example.com';

// 2. Request
const response = await axios.get(`${API_BASE_URL}/endpoint`, {
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'AppName/1.0',
  },
});

// 3. Response handling
const data = response.data;
```

### Error Handling

#### In API Requests
```typescript
try {
  const { data } = await axios.get(url);
} catch (error) {
  console.error('Error fetching data:', error);
  throw error;
}
```

#### In Components
```typescript
const [error, setError] = React.useState<string | null>(null);

try {
  // Action
} catch (error) {
  setError('Error description');
  console.error('Error:', error);
}
```

### Styling

#### Color Scheme
```typescript
const COLORS = {
  primary: '#1a1a1a',
  secondary: '#2a2a2a',
  accent: '#FF3366',
  text: '#FFFFFF',
  textSecondary: '#888888',
};
```

#### Component Styles
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  // ...
});
```

### Comments

#### For Components
```typescript
/**
 * Component for displaying anime image
 * @param {ImageData} image - Image data
 * @returns {JSX.Element} Image component
 */
```

#### For Functions
```typescript
/**
 * Gets a random image from API
 * @returns {Promise<ImageData>} Image data
 */
```

## Structure of the Project

```
AnimeWallpapers/
├── App.tsx                    # Root component of the application
├── app/                       # Main application directory
│   ├── components/            # Reusable components
│   │   └── AnimeImage.tsx     # Component for displaying anime image
│   ├── screens/               # Screen components
│   │   ├── HomeScreen.tsx     # Main screen with image list
│   │   └── ImageDetailsScreen.tsx # Image details screen
│   ├── types/                 # TypeScript types
│   │   └── navigation.ts      # Types for navigation
│   └── utils/                 # Utilities and helper functions
│       └── api.ts             # API for working with images
```

## Navigation

The application uses React Navigation for navigating between screens. Navigation structure:

### Stack Navigator
- **Home** - main screen with image list
- **ImageDetails** - image details screen

### Navigation Types
```typescript
export type RootStackParamList = {
  Home: undefined;
  ImageDetails: { image: ImageData };
};
```

## Components

### AnimeImage
Component for displaying anime image with the ability to press for transition to details.

**Props:**
```typescript
interface AnimeImageProps {
  image: ImageData; // Image data
}
```

**Functionality:**
- Display image
- Loading indicator
- Error handling
- Navigation to details screen

### HomeScreen
Main screen of the application, displaying a list of anime images.

**States:**
```typescript
const [images, setImages] = React.useState<ImageData[]>([]);
const [loading, setLoading] = React.useState(true);
```

**Functionality:**
- Load images on mount
- Display image list
- Error handling on load

### ImageDetailsScreen
Screen with image details and additional information and actions.

**Props:**
```typescript
type Props = StackScreenProps<RootStackParamList, 'ImageDetails'>;
```

**Functionality:**
- Display large image
- Information about resolution
- Tag list
- Action buttons (favorite, download)

## API

## Data Types

### ImageData
```typescript
export interface ImageData {
  file_url: string;    // Image URL
  width?: number;      // Image width
  height?: number;     // Image height
  tags?: string[];     // Image tags
}
```

## Styling

The application uses a single color scheme:
- Main background: `#1a1a1a`
- Secondary background: `#2a2a2a`
- Accent color: `#FF3366`
- Text: `#FFFFFF`
- Secondary text: `#888888`

## Development

### Installing Dependencies
```bash
npm install
```

### Running in Development Mode
```bash
npm start
```

### Building for Production
```bash
npm run build
```

## Future Development Plans

1. Adding "Favorite" Functionality
2. Implementing Image Downloading
3. Adding Tag Search
4. Image Caching
5. Adding Transition Animations 

## Passing Data Between Screens

### Passing Data from Feed to Details Screen

When transitioning from feed to image details screen, the following fields need to be passed:

```typescript
// Image object (ImageData)
{
  _id: number;           // Image ID
  file_url: string;      // Image URL
  file_size: number;     // Image file size in bytes
  md5: string;          // MD5 hash of the file
  tags: string[];       // Array of tags
  width: number;        // Image width
  height: number;       // Image height
  source: string;       // Image source
  author: string;       // Image author
  has_children: boolean;// Flag for presence of child images
}
```

#### Example Passing Data:

```typescript
// In AnimeImage component
const handlePress = () => {
  router.push({
    pathname: `/image/${image._id}`,
    params: {
      ...image,
      tags: JSON.stringify(image.tags),        // Convert array to string
      _id: image._id.toString(),              // Convert ID to string
      has_children: image.has_children.toString(), // Convert boolean to string
      file_size: image.file_size.toString(),   // Convert size to string
      width: image.width.toString(),          // Convert width to string
      height: image.height.toString()         // Convert height to string
    }
  });
};
```

#### Getting Data in Details Screen:

```typescript
// In details screen ([id].tsx)
const params = useLocalSearchParams<{
  id: string;
  file_url: string;
  file_size: string;
  tags: string;
  md5: string;
  width: string;
  height: string;
  source: string;
  author: string;
  has_children: string;
  _id: string;
}>();

// Create image object
const image: ImageData = {
  _id: parseInt(params._id),
  file_url: params.file_url,
  file_size: parseInt(params.file_size),
  tags: JSON.parse(params.tags || '[]'),
  md5: params.md5,
  width: parseInt(params.width),
  height: parseInt(params.height),
  source: params.source,
  author: params.author,
  has_children: params.has_children === 'true'
};
```

#### Important Notes:

1. All numeric values must be converted to strings when passing
2. Arrays (e.g., tags) must be converted to JSON string
3. Boolean values must be converted to strings 'true' or 'false'
4. When getting data, reverse conversion must be performed:
   - Strings to numbers: `parseInt()`
   - JSON strings to arrays: `JSON.parse()`
   - Strings to boolean values: `=== 'true'` 

## Working with Favorites

### General Description
The favorite functionality allows users to save liked images for quick access. All data is stored locally on the device using AsyncStorage.

### Implementation

#### Data Storage
- Liked images are stored in AsyncStorage as an array of IDs
- Storage key: 'favorites'
- Data format: JSON string with array of numbers (IDs of images)

#### Main Functions

##### Adding to Favorites
```typescript
const addToFavorites = async (imageId: number) => {
  try {
    const favoritesData = await AsyncStorage.getItem('favorites');
    const favoritesArray = favoritesData ? JSON.parse(favoritesData) : [];
    
    if (!favoritesArray.includes(imageId)) {
      favoritesArray.push(imageId);
      await AsyncStorage.setItem('favorites', JSON.stringify(favoritesArray));
    }
  } catch (error) {
    console.error('Error adding to favorites:', error);
  }
};
```

##### Removing from Favorites
```typescript
const removeFromFavorites = async (imageId: number) => {
  try {
    const favoritesData = await AsyncStorage.getItem('favorites');
    const favoritesArray = favoritesData ? JSON.parse(favoritesData) : [];
    
    const updatedFavorites = favoritesArray.filter((id: number) => id !== imageId);
    await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  } catch (error) {
    console.error('Error removing from favorites:', error);
  }
};
```

### Favorites Screen

#### Data Loading
1. When opening favorites screen:
   - Load list of favorite image IDs from AsyncStorage
   - For each ID, perform API request to get full image data
   - Data is cached in component state

2. Use `useFocusEffect` hook to update data on each screen focus

#### Display
- Images are displayed in grid (2 columns)
- Each image has 1:1 aspect ratio
- Pressing on image performs transition to details screen

#### States
- Loading: Display loading indicator
- Empty list: Display message "No favorite images"
- Error: Logged to console

### Restrictions
1. Local Storage:
   - Data is stored only on device
   - No synchronization between devices
   - Data will be lost on app reinstallation

2. API Dependency:
   - If image is deleted from API, it will remain in favorites
   - If trying to load deleted image, it will be skipped

3. Performance:
   - May experience delay on load with large number of favorite images
   - All images are loaded at once

### Recommendations for Use
1. Regularly check for image presence in API
2. Limit favorite images
3. Implement mechanism to clean non-existing images
4. Add progress indicator when loading large number of images 

## Image Loading Optimization

### Problem
When working with images in the application, the following problems occurred:
- Slow image loading in feed
- Repeat loading on transition to detailed view
- Delays on full-screen mode opening
#### Загрузка данных
1. При открытии экрана избранного:
   - Загружается список ID избранных изображений из AsyncStorage
   - Для каждого ID выполняется запрос к API для получения полных данных изображения
   - Данные кэшируются в состоянии компонента

2. Используется хук `useFocusEffect` для обновления данных при каждом фокусе на экране

#### Отображение
- Изображения отображаются в сетке (2 колонки)
- Каждое изображение имеет соотношение сторон 1:1
- При нажатии на изображение происходит переход на экран деталей

#### Состояния
- Загрузка: отображается индикатор загрузки
- Пустой список: отображается сообщение "Нет избранных изображений"
- Ошибка: логируется в консоль

### Ограничения
1. Локальное хранение:
   - Данные хранятся только на устройстве
   - Нет синхронизации между устройствами
   - При переустановке приложения данные будут потеряны

2. Зависимость от API:
   - Если изображение удалено с API, оно останется в избранном
   - При попытке загрузки удаленного изображения оно будет пропущено

3. Производительность:
   - При большом количестве избранных изображений может наблюдаться задержка при загрузке
   - Все изображения загружаются одновременно

### Рекомендации по использованию
1. Регулярно проверять наличие изображений в API
2. Ограничивать количество избранных изображений
3. Реализовать механизм очистки несуществующих изображений
4. Добавить индикатор прогресса при загрузке большого количества изображений 

## Оптимизация загрузки изображений

### Проблема
При работе с изображениями в приложении возникали следующие проблемы:
- Медленная загрузка изображений в фиде
- Повторная загрузка при переходе к детальному просмотру
- Задержки при открытии полноэкранного режима
- Неэффективное использование памяти

### Решение
Реализована система кеширования изображений с использованием хука `useImageLoader`:

```typescript
// hooks/useImageLoader.ts
export const useImageLoader = (originalUrl: string) => {
  // Состояние загрузки изображения
  const [state, setState] = useState<ImageState>({
    isLoading: true,
    thumbnailUri: null,
    fullUri: null,
    error: null
  });

  // Форматирование URL и кеширование
  const formattedUrl = formatImageUrl(originalUrl);
  // ... логика кеширования
};
```

### Основные компоненты решения

1. **Кеширование изображений**:
   - Использование `FileSystem` для постоянного хранения
   - Единый кеш для всех размеров изображений
   - Проверка наличия в кеше перед загрузкой

2. **Обработка URL**:
   ```typescript
   const formatImageUrl = (url: string): string => {
     if (!url) return '';
     return url.startsWith('http') ? url : `https://${url}`;
   };
   ```

3. **Использование в компонентах**:
   ```typescript
   // В фиде
   const { isLoading, thumbnailUri } = useImageLoader(image.file_url);

   // В детальном просмотре
   const { fullUri } = useImageLoader(imageUrl);
   ```

### Преимущества реализации

1. **Производительность**:
   - Загрузка изображения происходит только один раз
   - Кеш сохраняется между сессиями
   - Быстрый доступ к ранее загруженным изображениям

2. **Пользовательский опыт**:
   - Мгновенное отображение кешированных изображений
   - Плавные переходы между экранами
   - Индикация загрузки новых изображений

3. **Управление ресурсами**:
   - Эффективное использование памяти
   - Предотвращение повторных загрузок
   - Оптимизация сетевого трафика

### Использование

1. Установка зависимостей:
   ```bash
   npx expo install expo-file-system
   ```

2. Подключение в компоненте:
   ```typescript
   import { useImageLoader } from '../hooks/useImageLoader';

   export default function ImageComponent({ imageUrl }) {
     const { isLoading, thumbnailUri, fullUri } = useImageLoader(imageUrl);
     // ... использование в компоненте
   }
   ```

### Дальнейшие улучшения

1. Предварительная загрузка следующих изображений в фиде
2. Управление размером кеша
3. Оптимизация качества для разных экранов
4. Добавление анимаций при переходах

### Важные заметки

- Убедитесь, что URL изображений содержат протокол (http/https)
- При первой загрузке изображения может быть небольшая задержка
- Кеш сохраняется в локальном хранилище устройства
- Для очистки кеша можно использовать функцию `clearImageCache` 

## API Documentation

### Base URL
```
https://pic.re
```

### Endpoints

#### 1. Random Image File [GET]
- **Endpoint**: `/image`
- **Method**: GET
- **Response**: Image file
- **Headers**:
  - `image_id`: Unique image identifier
  - `image_source`: Original source URL
  - `image_tags`: Comma-separated list of tags

#### 2. Random Image File (CDN) [GET]
- **Endpoint**: `/images`
- **Method**: GET
- **Response**: Image file (redirects to CDN)
- **Note**: Recommended for production use

#### 3. Random Image Metadata [POST/GET]
- **Endpoint**: `/image` (POST) or `/images.json` (GET)
- **Method**: POST/GET
- **Response**: JSON object containing:
  ```json
  {
    "file_url": "string",
    "md5": "string",
    "tags": ["string"],
    "width": number,
    "height": number,
    "source": "string",
    "author": "string",
    "has_children": boolean,
    "_id": number
  }
  ```

#### 4. Tags List [GET]
- **Endpoint**: `/tags`
- **Method**: GET
- **Response**: JSON array of tags with counts
  ```json
  [
    {
      "name": "string",
      "count": number
    }
  ]
  ```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| nin | string | - | Excluded tags (comma-separated) |
| in | string | - | Included tags (comma-separated) |
| id | number | - | Specific image ID |
| compress | boolean | true | Use WebP format |
| min_size | number | - | Minimum image size |
| max_size | number | 6144 | Maximum image size (6144x6144) |

### Common Tags
- long_hair
- original
- blush
- brown_hair
- animal_ears
- thighhighs
- short_hair
- twintails
- blonde_hair
- navel
- purple_eyes
- panties
- red_eyes
- cleavage
- tail

### CORS Support
API supports Cross-Origin Resource Sharing (CORS) for web applications.

### Example Usage
```typescript
// Fetch random image
const response = await axios.get('https://pic.re/image', {
  params: {
    in: 'girl,short_hair',
    compress: true
  }
});

// Get image metadata
const metadata = await axios.get('https://pic.re/images.json', {
  params: {
    in: 'original',
    max_size: 4096
  }
});
``` 