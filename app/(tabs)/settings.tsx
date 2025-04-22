import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useSettings } from '../../hooks/useSettings';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const {
    settings,
    isLoading,
    formattedCacheSize,
    updateSettings,
    clearCache,
    calculateCacheSize,
    reloadSettings
  } = useSettings();
  const router = useRouter();

  const handleColumnChange = async (columns: 1 | 2) => {
    console.log('Changing columns to:', columns);
    if (columns === settings.gridColumns) {
      console.log('Same column count, skipping update');
      return;
    }
    
    await updateSettings({ gridColumns: columns });
    console.log('Settings updated, reloading settings...');
    await reloadSettings();
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear the image cache?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearCache();
            calculateCacheSize();
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3366" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Grid Display</Text>
        <View style={styles.columnsContainer}>
          {[1, 2].map((columns) => (
            <TouchableOpacity
              key={columns}
              style={[
                styles.columnButton,
                settings.gridColumns === columns && styles.columnButtonActive
              ]}
              onPress={() => handleColumnChange(columns as 1 | 2)}
            >
              <Text
                style={[
                  styles.columnButtonText,
                  settings.gridColumns === columns && styles.columnButtonTextActive
                ]}
              >
                {columns}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cache Management</Text>
        <View style={styles.cacheInfo}>
          <View style={styles.cacheSize}>
            <Text style={styles.cacheLabel}>Cache Size:</Text>
            <Text style={styles.cacheValue}>{formattedCacheSize}</Text>
          </View>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearCache}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3366" />
            <Text style={styles.clearButtonText}>Clear Cache</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <TouchableOpacity
          style={styles.aboutButton}
          onPress={() => router.push('/privacy-policy')}
        >
          <Ionicons name="document-text-outline" size={20} color="#FF3366" />
          <Text style={styles.aboutButtonText}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  columnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  columnButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: '#2a2a2a',
  },
  columnButtonActive: {
    backgroundColor: '#FF3366',
  },
  columnButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  columnButtonTextActive: {
    color: '#FFFFFF',
  },
  cacheInfo: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
  },
  cacheSize: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cacheLabel: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  cacheValue: {
    fontSize: 16,
    color: '#FF3366',
    fontWeight: 'bold',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  clearButtonText: {
    color: '#FF3366',
    fontSize: 16,
    fontWeight: 'bold',
  },
  aboutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  aboutButtonText: {
    color: '#FF3366',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 