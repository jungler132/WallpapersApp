import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { getMangaDetail, MangaData, getMangaCategories, MangaCategory, getMangaChapters, MangaChapter } from '../../utils/kitsuApi';

const COLORS = {
  primary: '#121212',
  secondary: '#1E1E1E',
  accent: '#FF4081',
  text: '#FFFFFF',
  textSecondary: '#9E9E9E',
  border: '#2C2C2C',
  cardBg: '#1A1A1A',
};

export default function MangaDetailScreen() {
  const { id } = useLocalSearchParams();
  const [manga, setManga] = useState<MangaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<MangaCategory[]>([]);
  const [chapters, setChapters] = useState<MangaChapter[]>([]);

  useEffect(() => {
    const loadMangaDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await getMangaDetail(id as string);
        setManga(response.data);
        
        // Параллельно грузим категории и превью глав
        const [cats, chaps] = await Promise.allSettled([
          getMangaCategories(id as string),
          getMangaChapters(id as string, 5)
        ]);
        if (cats.status === 'fulfilled') setCategories(cats.value.data);
        if (chaps.status === 'fulfilled') setChapters(chaps.value.data);
      } catch (err) {
        console.error('[Manga Detail] Error loading manga:', err);
        setError('Failed to load manga details');
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load manga details. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadMangaDetail();
    }
  }, [id]);

  // Заголовок всегда корректный
  const headerTitle = isLoading || error || !manga ? 'Manga' : 
    (manga.attributes.titles.en || 
     manga.attributes.titles.en_jp || 
     manga.attributes.titles.ja_jp || 
     'Manga');

  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: headerTitle,
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.text,
            headerShadowVisible: false,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      </>
    );
  }

  if (error || !manga) {
    return (
      <>
        <Stack.Screen
          options={{
            title: headerTitle,
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.text,
            headerShadowVisible: false,
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load manga details</Text>
        </View>
      </>
    );
  }

  const title = manga.attributes.titles.en || 
                manga.attributes.titles.en_jp || 
                manga.attributes.titles.ja_jp || 
                'Unknown Title';
  
  const imageUrl = manga.attributes.posterImage?.large || 
                   manga.attributes.posterImage?.medium || 
                   manga.attributes.posterImage?.small || 
                   '';
  
  const rating = manga.attributes.averageRating ? 
                 parseFloat(manga.attributes.averageRating) / 10 : 
                 null;

  return (
    <>
      <Stack.Screen
        options={{
          title: headerTitle,
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.text,
          headerShadowVisible: false,
          headerBackTitleVisible: false,
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.coverImage}
            contentFit="cover"
            transition={300}
            placeholder={require('../../../assets/placeholder/image-placeholder.png')}
            placeholderContentFit="contain"
          />
          <View style={styles.overlay}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{title}</Text>
              {manga.attributes.titles.ja_jp && manga.attributes.titles.ja_jp !== title && (
                <Text style={styles.japaneseTitle}>{manga.attributes.titles.ja_jp}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.adContainer}>
          {/* FeedAdBanner removed as requested */}
        </View>

        <View style={styles.content}>
          {/* Adaptations removed as requested */}
          <View style={styles.statsRow}>
            {rating && (
              <View style={styles.statItem}>
                <Ionicons name="star" size={20} color={COLORS.accent} />
                <Text style={styles.statValue}>{rating.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            )}
            {typeof manga.attributes.popularityRank === 'number' && (
              <View style={styles.statItem}>
                <Ionicons name="trending-up-outline" size={20} color={COLORS.accent} />
                <Text style={styles.statValue}>#{manga.attributes.popularityRank}</Text>
                <Text style={styles.statLabel}>Popularity</Text>
              </View>
            )}
            {typeof manga.attributes.ratingRank === 'number' && (
              <View style={styles.statItem}>
                <Ionicons name="podium-outline" size={20} color={COLORS.accent} />
                <Text style={styles.statValue}>#{manga.attributes.ratingRank}</Text>
                <Text style={styles.statLabel}>Rating Rank</Text>
              </View>
            )}
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>{manga.attributes.status}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type</Text>
              <Text style={styles.infoValue}>{manga.attributes.subtype || manga.attributes.mangaType || '—'}</Text>
            </View>
            {(manga.attributes.ageRating || manga.attributes.ageRatingGuide) && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Age Rating</Text>
                <Text style={styles.infoValue}>
                  {manga.attributes.ageRating || '—'}
                  {manga.attributes.ageRatingGuide ? ` (${manga.attributes.ageRatingGuide})` : ''}
                </Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Start</Text>
              <Text style={styles.infoValue}>{manga.attributes.startDate || '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>End</Text>
              <Text style={styles.infoValue}>{manga.attributes.endDate || '—'}</Text>
            </View>
            {(manga.attributes.chapterCount || manga.attributes.volumeCount) && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Chapters / Volumes</Text>
                <Text style={styles.infoValue}>
                  {manga.attributes.chapterCount || 0} / {manga.attributes.volumeCount || 0}
                </Text>
              </View>
            )}
            {manga.attributes.serialization && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Serialization</Text>
                <Text style={styles.infoValue}>{manga.attributes.serialization}</Text>
              </View>
            )}
          </View>

          {categories.length > 0 && (
            <View style={styles.genresContainer}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <View style={styles.genresList}>
                {categories.map((cat) => (
                  <View key={cat.id} style={styles.genreTag}>
                    <Text style={styles.genreText}>{cat.attributes.title || cat.attributes.slug}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {chapters.length > 0 && (
            (() => {
              const visibleChapters = chapters.filter(
                (ch) => !!ch.attributes.published || !!ch.attributes.titles?.canonicalTitle
              );
              if (visibleChapters.length === 0) return null;
              return (
                <View style={styles.genresContainer}>
                  <Text style={styles.sectionTitle}>Chapters preview</Text>
                  {visibleChapters.map((ch) => {
                    const metaParts: string[] = [];
                    const hasDate = !!ch.attributes.published;
                    // Показываем метаданные, только если есть дата публикации.
                    if (hasDate) {
                      if (
                        typeof ch.attributes.volumeNumber === 'number' ||
                        (typeof (ch as any).attributes.volumeNumber === 'string' && (ch as any).attributes.volumeNumber)
                      ) {
                        metaParts.push(`Vol ${ch.attributes.volumeNumber}`);
                      }
                      metaParts.push(ch.attributes.published as string);
                    }
                    const metaText = metaParts.join(' · ');
                    return (
                      <View key={ch.id} style={styles.chapterRow}>
                        <Text style={styles.chapterText}>
                          {`#${ch.attributes.number ?? '—'} `}
                          {ch.attributes.titles?.canonicalTitle ? `— ${ch.attributes.titles.canonicalTitle}` : ''}
                        </Text>
                        {metaText.length > 0 && (
                          <Text style={styles.chapterMeta}>{metaText}</Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              );
            })()
          )}

          {/* External link to Kitsu removed by request */}

          {manga.attributes.synopsis && (
            <View style={styles.synopsisContainer}>
              <Text style={styles.sectionTitle}>Synopsis</Text>
              <Text style={styles.synopsis}>{manga.attributes.synopsis}</Text>
            </View>
          )}
        </View>
      </ScrollView>
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  errorText: {
    color: COLORS.accent,
    fontSize: 16,
  },
  header: {
    height: 300,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  titleContainer: {
    marginBottom: 8,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  japaneseTitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  adContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  content: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  infoSection: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  synopsisContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  synopsis: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
  genresContainer: {
    marginBottom: 24,
  },
  genresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreTag: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  genreText: {
    color: COLORS.text,
    fontSize: 14,
  },
  chapterRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chapterText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  chapterMeta: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  externalLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  externalLinkText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
