import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>Privacy Policy</Text>
        <Text style={styles.text}>
          Last updated: {new Date().toLocaleDateString()}
          {'\n\n'}This Privacy Policy describes how Anime Wallpapers ("we", "us", or "our") handles your information when you use our mobile application.
        </Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.text}>
          Anime Wallpapers collects the following types of information:
          {'\n\n'}• Favorite Images: When you mark an image as favorite, we store it locally on your device.
          {'\n'}• Cache Data: To improve performance, we temporarily store viewed images in your device's cache.
          {'\n'}• App Settings: Your preferences for grid layout and other app settings are stored locally.
          {'\n\n'}We do not collect any personal information such as your name, email address, or location.
        </Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.text}>
          The information we collect is used for the following purposes:
          {'\n\n'}• To provide you with the ability to save and access your favorite images
          {'\n'}• To improve app performance through local caching
          {'\n'}• To remember your preferred settings and display preferences
          {'\n\n'}All data is processed locally on your device and is not transmitted to any external servers.
        </Text>

        <Text style={styles.sectionTitle}>3. Data Storage and Security</Text>
        <Text style={styles.text}>
          • All data is stored locally on your device
          {'\n'}• We do not use any external servers or cloud storage
          {'\n'}• You can clear the cache at any time through the app settings
          {'\n'}• Your favorite images are stored in your device's local storage
          {'\n\n'}We implement appropriate security measures to protect your data, but please be aware that no method of electronic storage is 100% secure.
        </Text>

        <Text style={styles.sectionTitle}>4. Image Sources and Copyright</Text>
        <Text style={styles.text}>
          • Images are sourced from public APIs
          {'\n'}• We do not claim ownership of any images displayed in the app
          {'\n'}• Images are provided for personal use only
          {'\n'}• If you believe any image infringes copyright, please contact us
        </Text>

        <Text style={styles.sectionTitle}>5. Children's Privacy</Text>
        <Text style={styles.text}>
          Our app is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13.
        </Text>

        <Text style={styles.sectionTitle}>6. Changes to This Policy</Text>
        <Text style={styles.text}>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
        </Text>

        <Text style={styles.sectionTitle}>7. Contact Us</Text>
        <Text style={styles.text}>
          If you have any questions about this Privacy Policy, please contact us at:
          {'\n\n'}Email: jungler145@gmail.com
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
}); 