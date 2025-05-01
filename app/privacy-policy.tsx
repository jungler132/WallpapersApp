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
          Last updated: 2024-04-30
          {'\n\n'}This Privacy Policy describes how OtakuWalls ("we", "us", or "our") handles your information when you use our mobile application.
          {'\n\n'}You can also view our full Privacy Policy at: https://jungler132.github.io/otakuwalls-privacy-policy/
        </Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.text}>
          Anime Wallpapers collects the following types of information:
          {'\n\n'}• Favorite Images: When you mark an image as favorite, we store it locally on your device.
          {'\n'}• Cache Data: To improve performance, we temporarily store viewed images in your device's cache.
          {'\n'}• App Settings: Your preferences for grid layout and other app settings are stored locally.
          {'\n'}• Advertising ID: We collect your device's advertising identifier to serve personalized ads through Google AdMob.
          {'\n'}• Usage Data: We collect information about how you interact with ads to improve ad relevance.
          {'\n\n'}We do not collect any personal information such as your name, email address, or location.
        </Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.text}>
          The information we collect is used for the following purposes:
          {'\n\n'}• To provide you with the ability to save and access your favorite images
          {'\n'}• To improve app performance through local caching
          {'\n'}• To remember your preferred settings and display preferences
          {'\n'}• To serve personalized advertisements through Google AdMob
          {'\n'}• To analyze and improve the effectiveness of advertisements
          {'\n\n'}All data is processed locally on your device, except for advertising-related data which is processed by Google AdMob.
        </Text>

        <Text style={styles.sectionTitle}>3. Data Storage and Security</Text>
        <Text style={styles.text}>
          • All app data is stored locally on your device
          {'\n'}• Advertising data is processed and stored by Google AdMob
          {'\n'}• We do not use any external servers or cloud storage for app data
          {'\n'}• You can clear the cache at any time through the app settings
          {'\n'}• Your favorite images are stored in your device's local storage
          {'\n'}• You can reset your advertising ID through your device settings
          {'\n\n'}We implement appropriate security measures to protect your data, but please be aware that no method of electronic storage is 100% secure.
        </Text>

        <Text style={styles.sectionTitle}>4. Advertising</Text>
        <Text style={styles.text}>
          • We use Google AdMob to display advertisements in our app
          {'\n'}• AdMob may collect and use your device's advertising identifier
          {'\n'}• AdMob uses cookies and similar technologies to serve personalized ads
          {'\n'}• You can opt out of personalized advertising in your device settings
          {'\n'}• We do not control the content of third-party advertisements
          {'\n\n'}For more information about how Google uses the data collected through AdMob, please visit: https://policies.google.com/privacy
        </Text>

        <Text style={styles.sectionTitle}>5. Image Sources and Copyright</Text>
        <Text style={styles.text}>
          • Images are sourced from public APIs
          {'\n'}• We do not claim ownership of any images displayed in the app
          {'\n'}• Images are provided for personal use only
          {'\n'}• If you believe any image infringes copyright, please contact us
        </Text>

        <Text style={styles.sectionTitle}>6. Children's Privacy</Text>
        <Text style={styles.text}>
          Our app is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13. Our app uses Google AdMob with content rating set to PG (Parental Guidance) and includes appropriate content filters for younger audiences.
        </Text>

        <Text style={styles.sectionTitle}>7. Changes to This Policy</Text>
        <Text style={styles.text}>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
        </Text>

        <Text style={styles.sectionTitle}>8. Contact Us</Text>
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