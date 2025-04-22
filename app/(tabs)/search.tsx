import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, ActivityIndicator, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getTags, getRandomImages, ImageData, TagData } from '../../utils/api';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
// Увеличиваем общий отступ до 48px (16px слева + 16px между + 16px справа)
const ITEM_WIDTH = (width - 48) / 2;

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [images, setImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Загрузка тегов
  const { data: tags, isLoading: isLoadingTags } = useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
  });

  // Автоматический поиск при изменении выбранных тегов
  useEffect(() => {
    const searchImages = async () => {
      if (selectedTags.length > 0) {
        setIsLoading(true);
        try {
          console.log('Searching with tags:', selectedTags);
          // Теги должны быть разделены запятыми
          const tagString = selectedTags.join(',');
          console.log('Tag string:', tagString);
          
          // Используем правильные параметры согласно документации API
          const results = await getRandomImages(20, { 
            in: tagString,
            compress: true,
            min_size: 100000 // Минимальный размер файла 100KB
          });
          
          console.log('Raw API response:', results);
          
          if (!results || results.length === 0) {
            console.log('No results returned from API');
            setImages([]);
            return;
          }
          
          // Удаляем дубликаты изображений
          const uniqueResults = results.filter((image, index, self) =>
            index === self.findIndex((t) => t._id === image._id && t.md5 === image.md5)
          );
          
          console.log('Unique results:', uniqueResults);
          setImages(uniqueResults);
        } catch (error: any) {
          console.error('Search error:', error);
          if (error.response) {
            console.error('API response:', error.response.data);
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        setImages([]);
      }
    };

    searchImages();
  }, [selectedTags]);

  const handleTagPress = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleImagePress = (image: ImageData) => {
    router.push({
      pathname: '/image/[id]',
      params: {
        id: image._id,
        file_url: image.file_url,
        tags: JSON.stringify(image.tags),
        md5: image.md5,
        width: image.width,
        height: image.height,
        source: image.source,
        author: image.author,
        has_children: image.has_children.toString(),
        _id: image._id.toString(),
      },
    });
  };

  const renderTag = ({ item }: { item: TagData }) => (
    <TouchableOpacity
      style={[
        styles.tag,
        selectedTags.includes(item.name) && styles.selectedTag,
      ]}
      onPress={() => handleTagPress(item.name)}
    >
      <Text style={[
        styles.tagText,
        selectedTags.includes(item.name) && styles.selectedTagText,
      ]}>
        #{item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderImage = ({ item, index }: { item: ImageData; index: number }) => {
    // Добавляем протокол к URL изображения
    const imageUrl = item.file_url.startsWith('http') 
      ? item.file_url 
      : `https://${item.file_url}`;

    return (
      <TouchableOpacity
        style={[
          styles.imageContainer,
          index % 2 === 1 && styles.rightColumnImage
        ]}
        onPress={() => handleImagePress(item)}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
          placeholder={require('../../assets/placeholder/image-placeholder.png')}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.tagsContainer}>
        <Text style={styles.sectionTitle}>Tags</Text>
        {isLoadingTags ? (
          <ActivityIndicator color="#FF3366" />
        ) : (
          <FlatList
            data={tags}
            renderItem={renderTag}
            keyExtractor={(item) => item.name}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsList}
          />
        )}
      </View>

      <View style={styles.imagesContainer}>
        <Text style={styles.sectionTitle}>Results</Text>
        {isLoading ? (
          <ActivityIndicator color="#FF3366" style={styles.loader} />
        ) : (
          <FlatList
            data={images}
            renderItem={renderImage}
            keyExtractor={(item) => `${item._id}-${item.md5}`}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.imagesList}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  tagsContainer: {
    padding: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tagsList: {
    paddingRight: 16,
  },
  tag: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedTag: {
    backgroundColor: '#FF3366',
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  selectedTagText: {
    fontWeight: 'bold',
  },
  imagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  imagesList: {
    paddingBottom: 16,
    gap: 16, // Добавляем отступ между строками
  },
  imageContainer: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    marginBottom: 16,
    marginRight: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  rightColumnImage: {
    marginRight: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loader: {
    marginTop: 20,
  },
}); 