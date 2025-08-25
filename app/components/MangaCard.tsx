import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { MangaData } from '../utils/kitsuApi';

const COLORS = {
  primary: '#121212',
  secondary: '#1E1E1E',
  accent: '#FF4081',
  text: '#FFFFFF',
  textSecondary: '#9E9E9E',
  border: '#2C2C2C',
  cardBg: '#1A1A1A',
};

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface MangaCardProps {
  manga: MangaData;
  onPress: (manga: MangaData) => void;
}

export const MangaCard: React.FC<MangaCardProps> = ({ manga, onPress }) => {
  const title = manga.attributes.titles.en || 
                manga.attributes.titles.en_jp || 
                manga.attributes.titles.ja_jp || 
                'Unknown Title';
  
  const imageUrl = manga.attributes.posterImage?.medium || 
                   manga.attributes.posterImage?.small || 
                   '';
  
  const rating = manga.attributes.averageRating ? 
                 parseFloat(manga.attributes.averageRating) / 10 : 
                 null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(manga)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={300}
          placeholder={require('../../assets/placeholder/image-placeholder.png')}
          placeholderContentFit="contain"
        />
        {rating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color={COLORS.accent} />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        
        <View style={styles.statsRow}>
          {manga.attributes.chapterCount != null && manga.attributes.chapterCount > 0 && (
            <View style={styles.statItem}>
              <Ionicons name="book-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.statText}>{manga.attributes.chapterCount} ch</Text>
            </View>
          )}
          {manga.attributes.volumeCount != null && manga.attributes.volumeCount > 0 && (
            <View style={styles.statItem}>
              <Ionicons name="albums-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.statText}>{manga.attributes.volumeCount} vol</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginHorizontal: 8,
    marginBottom: 16,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  ratingContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  infoContainer: {
    padding: 12,
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
