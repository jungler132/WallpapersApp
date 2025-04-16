я # Anime Wallpapers - Руководство по разработке

## Используемые модули и их назначение

### Навигация
- **@react-navigation/native** - Основной пакет для навигации
- **@react-navigation/stack** - Стековая навигация (для переходов между экранами)
- **@react-navigation/bottom-tabs** - Нижняя навигация (для табов)
- **react-native-screens** - Оптимизация рендеринга экранов
- **react-native-safe-area-context** - Безопасные области экрана

### UI компоненты
- **@expo/vector-icons** - Иконки (используем Ionicons)
- **react-native-reanimated** - Анимации
- **react-native-gesture-handler** - Обработка жестов

### Хранение данных
- **@react-native-async-storage/async-storage** - Локальное хранилище
- **react-native-fs** - Работа с файловой системой

### API и сеть
- **axios** - HTTP запросы
- **react-query** - Кэширование и управление состоянием запросов

### Утилиты
- **date-fns** - Работа с датами
- **lodash** - Утилиты для работы с данными

## Правила использования модулей

### Навигация
- Для основных переходов между экранами используем `@react-navigation/stack`
- Для модальных окон используем `@react-navigation/stack` с `presentation: 'modal'`
- Для нижней навигации используем `@react-navigation/bottom-tabs`

### Модальные окна
```typescript
// Правильно
<Stack.Screen 
  name="ModalScreen" 
  component={ModalScreen}
  options={{ presentation: 'modal' }}
/>

// Неправильно
// Не используем react-native-modal или другие библиотеки для модальных окон
```

### Анимации
```typescript
// Правильно
import Animated from 'react-native-reanimated';

// Неправильно
// Не используем Animated из react-native
```

### Хранение данных
```typescript
// Правильно
import AsyncStorage from '@react-native-async-storage/async-storage';

// Неправильно
// Не используем другие библиотеки для локального хранилища
```

### API запросы
```typescript
// Правильно
import axios from 'axios';
import { useQuery } from 'react-query';

// Неправильно
// Не используем fetch напрямую для сложных запросов
```

## Стиль кодирования

### Именование файлов и компонентов
- Файлы компонентов: PascalCase (например, `AnimeImage.tsx`)
- Файлы утилит: camelCase (например, `api.ts`)
- Файлы типов: camelCase (например, `navigation.ts`)
- Экспорты компонентов: default export
- Экспорты утилит: named exports

### Структура компонента
```typescript
// 1. Импорты
import React from 'react';
import { ... } from 'react-native';
import { ... } from '../types';
import { ... } from '../utils';

// 2. Типы и интерфейсы
interface ComponentProps {
  // ...
}

// 3. Константы
const CONSTANT = 'value';

// 4. Компонент
const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // 4.1. Состояния
  const [state, setState] = React.useState<Type>(initialValue);

  // 4.2. Эффекты
  React.useEffect(() => {
    // ...
  }, []);

  // 4.3. Обработчики
  const handleEvent = () => {
    // ...
  };

  // 4.4. Рендер
  return (
    // ...
  );
};

// 5. Стили
const styles = StyleSheet.create({
  // ...
});

// 6. Экспорт
export default Component;
```

### Навигация

#### Типы навигации
```typescript
// types/navigation.ts
export type RootStackParamList = {
  Home: undefined;
  ImageDetails: { image: ImageData };
};
```

#### Использование навигации в компонентах
```typescript
// 1. Импорт типов
import { RootStackParamList } from '../types/navigation';
import { StackNavigationProp } from '@react-navigation/stack';

// 2. Определение типа навигации
type NavigationProp = StackNavigationProp<RootStackParamList>;

// 3. Использование в компоненте
const navigation = useNavigation<NavigationProp>();

// 4. Навигация
navigation.navigate('ScreenName', { param1: value1 });
```

#### Параметры экрана
```typescript
// Для экрана с параметрами
type Props = StackScreenProps<RootStackParamList, 'ScreenName'>;

// Получение параметров
const { param1, param2 } = route.params;
```

### Работа с API

#### Структура запросов
```typescript
// 1. Базовый URL
const API_BASE_URL = 'https://api.example.com';

// 2. Запрос
const response = await axios.get(`${API_BASE_URL}/endpoint`, {
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'AppName/1.0',
  },
});

// 3. Обработка ответа
const data = response.data;
```

### Обработка ошибок

#### В API запросах
```typescript
try {
  const { data } = await axios.get(url);
} catch (error) {
  console.error('Error fetching data:', error);
  throw error;
}
```

#### В компонентах
```typescript
const [error, setError] = React.useState<string | null>(null);

try {
  // Действие
} catch (error) {
  setError('Описание ошибки');
  console.error('Error:', error);
}
```

### Стилизация

#### Цветовая схема
```typescript
const COLORS = {
  primary: '#1a1a1a',
  secondary: '#2a2a2a',
  accent: '#FF3366',
  text: '#FFFFFF',
  textSecondary: '#888888',
};
```

#### Стили компонентов
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  // ...
});
```

### Комментарии

#### Для компонентов
```typescript
/**
 * Компонент для отображения аниме изображения
 * @param {ImageData} image - Данные изображения
 * @returns {JSX.Element} Компонент изображения
 */
```

#### Для функций
```typescript
/**
 * Получает случайное изображение с API
 * @returns {Promise<ImageData>} Данные изображения
 * @throws {Error} При ошибке запроса
 */
```

### Логирование

#### Уровни логирования
```typescript
// Информация
console.log('Message');

// Предупреждение
console.warn('Warning message');

// Ошибка
console.error('Error message');
```

### Оптимизация

#### Мемоизация
```typescript
const memoizedValue = React.useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = React.useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

#### Условный рендеринг
```typescript
{condition && <Component />}
{condition ? <Component1 /> : <Component2 />}
```

## Структура проекта

```
AnimeWallpapers/
├── App.tsx                    # Корневой компонент приложения
├── app/                       # Основная директория приложения
│   ├── components/            # Переиспользуемые компоненты
│   │   └── AnimeImage.tsx     # Компонент для отображения аниме изображения
│   ├── screens/               # Экранные компоненты
│   │   ├── HomeScreen.tsx     # Главный экран со списком изображений
│   │   └── ImageDetailsScreen.tsx # Экран деталей изображения
│   ├── types/                 # Типы TypeScript
│   │   └── navigation.ts      # Типы для навигации
│   └── utils/                 # Утилиты и вспомогательные функции
│       └── api.ts             # API для работы с изображениями
```

## Навигация

Приложение использует React Navigation для навигации между экранами. Структура навигации:

### Stack Navigator
- **Home** - главный экран со списком изображений
- **ImageDetails** - экран деталей изображения

### Типы навигации
```typescript
export type RootStackParamList = {
  Home: undefined;
  ImageDetails: { image: ImageData };
};
```

## Компоненты

### AnimeImage
Компонент для отображения аниме изображения с возможностью нажатия для перехода к деталям.

**Props:**
```typescript
interface AnimeImageProps {
  image: ImageData; // Данные изображения
}
```

**Функциональность:**
- Отображение изображения
- Индикатор загрузки
- Обработка ошибок
- Навигация к экрану деталей

### HomeScreen
Главный экран приложения, отображающий список аниме изображений.

**Состояния:**
```typescript
const [images, setImages] = React.useState<ImageData[]>([]);
const [loading, setLoading] = React.useState(true);
```

**Функциональность:**
- Загрузка изображений при монтировании
- Отображение списка изображений
- Обработка ошибок загрузки

### ImageDetailsScreen
Экран деталей изображения с дополнительной информацией и действиями.

**Props:**
```typescript
type Props = StackScreenProps<RootStackParamList, 'ImageDetails'>;
```

**Функциональность:**
- Отображение большого изображения
- Информация о разрешении
- Список тегов
- Кнопки действий (избранное, скачать)

## API

### getRandomImage
Получение случайного изображения.

```typescript
export const getRandomImage = async (): Promise<ImageData>
```

### getRandomImages
Получение нескольких случайных изображений.

```typescript
export const getRandomImages = async (count: number): Promise<ImageData[]>
```

## Типы данных

### ImageData
```typescript
export interface ImageData {
  file_url: string;    // URL изображения
  width?: number;      // Ширина изображения
  height?: number;     // Высота изображения
  tags?: string[];     // Теги изображения
}
```

## Стили

Приложение использует единую цветовую схему:
- Основной фон: `#1a1a1a`
- Вторичный фон: `#2a2a2a`
- Акцентный цвет: `#FF3366`
- Текст: `#FFFFFF`
- Вторичный текст: `#888888`

## Разработка

### Установка зависимостей
```bash
npm install
```

### Запуск в режиме разработки
```bash
npm start
```

### Сборка для продакшена
```bash
npm run build
```

## Планы по развитию

1. Добавление функциональности "Избранное"
2. Реализация скачивания изображений
3. Добавление поиска по тегам
4. Кэширование изображений
5. Добавление анимаций переходов 

## Передача данных между экранами

### Передача данных из фида в экран деталей

При переходе из фида в экран деталей изображения необходимо передавать следующие поля:

```typescript
// Объект изображения (ImageData)
{
  _id: number;           // ID изображения
  file_url: string;      // URL изображения
  file_size: number;     // Размер файла в байтах
  md5: string;          // MD5 хеш файла
  tags: string[];       // Массив тегов
  width: number;        // Ширина изображения
  height: number;       // Высота изображения
  source: string;       // Источник изображения
  author: string;       // Автор изображения
  has_children: boolean;// Флаг наличия дочерних изображений
}
```

#### Пример передачи данных:

```typescript
// В компоненте AnimeImage
const handlePress = () => {
  router.push({
    pathname: `/image/${image._id}`,
    params: {
      ...image,
      tags: JSON.stringify(image.tags),        // Преобразуем массив тегов в строку
      _id: image._id.toString(),              // Преобразуем ID в строку
      has_children: image.has_children.toString(), // Преобразуем boolean в строку
      file_size: image.file_size.toString(),   // Преобразуем размер в строку
      width: image.width.toString(),          // Преобразуем ширину в строку
      height: image.height.toString()         // Преобразуем высоту в строку
    }
  });
};
```

#### Получение данных в экране деталей:

```typescript
// В экране деталей ([id].tsx)
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

// Создание объекта изображения
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

#### Важные замечания:

1. Все числовые значения при передаче должны быть преобразованы в строки
2. Массивы (например, теги) должны быть преобразованы в JSON-строку
3. Булевы значения должны быть преобразованы в строки 'true' или 'false'
4. При получении данных необходимо выполнить обратное преобразование:
   - Строки в числа: `parseInt()`
   - JSON-строки в массивы: `JSON.parse()`
   - Строки в булевы значения: `=== 'true'` 

## Работа с избранным

### Общее описание
Функционал избранного позволяет пользователям сохранять понравившиеся изображения для быстрого доступа. Все данные хранятся локально на устройстве с использованием AsyncStorage.

### Реализация

#### Хранение данных
- Избранные изображения хранятся в AsyncStorage в виде массива ID
- Ключ для хранения: 'favorites'
- Формат данных: JSON-строка с массивом чисел (ID изображений)

#### Основные функции

##### Добавление в избранное
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

##### Удаление из избранного
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

### Экран избранного

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