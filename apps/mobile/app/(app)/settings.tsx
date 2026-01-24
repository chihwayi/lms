import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Text } from '@/components/ui/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Shadows, BorderRadius, Fonts } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth-store';
import { useConfigStore } from '@/stores/config-store';
import { useSettingsStore } from '@/stores/settings-store';
import { offlineStorage } from '@/lib/offline-storage';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Application from 'expo-application';
import { useToast } from '@/components/ui/Toast';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { instanceUrl, reset } = useConfigStore();
  const { showToast } = useToast();
  
  const { 
    notificationsEnabled, 
    setNotificationsEnabled,
    darkMode,
    setDarkMode,
    downloadOverWifi,
    setDownloadOverWifi
  } = useSettingsStore();

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace('/login');
          }
        }
      ]
    );
  };

  const handleChangeInstance = () => {
    Alert.alert(
      "Change Instance",
      "This will log you out and clear your session. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Proceed", 
          style: "destructive",
          onPress: async () => {
            await logout();
            reset(); // Use reset instead of setInstanceUrl(null)
            router.replace('/');
          }
        }
      ]
    );
  };

  const handleClearDownloads = () => {
    Alert.alert(
      "Clear Downloads",
      "This will remove all downloaded courses and content from your device. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear All", 
          style: "destructive",
          onPress: async () => {
            try {
              await offlineStorage.clearAllContent();
              showToast({
                type: 'success',
                title: 'Success',
                message: 'All downloads have been cleared'
              });
            } catch (error) {
              console.error(error);
              showToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to clear downloads'
              });
            }
          }
        }
      ]
    );
  };

  const renderSettingItem = (icon: string, title: string, subtitle?: string, action?: React.ReactNode) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Feather name={icon as any} size={20} color={Colors.light.primary} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {action}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.light.gradientStart, Colors.light.gradientEnd]}
        style={styles.headerBackground}
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>App Preferences</Text>
            <Card variant="elevated" style={styles.card}>
              {renderSettingItem(
                'bell', 
                'Notifications', 
                'Receive push notifications',
                <Switch 
                  value={notificationsEnabled} 
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#767577', true: Colors.light.primary }}
                />
              )}
              <View style={styles.separator} />
              {renderSettingItem(
                'moon', 
                'Dark Mode', 
                'Use dark theme',
                <Switch 
                  value={darkMode} 
                  onValueChange={setDarkMode}
                  trackColor={{ false: '#767577', true: Colors.light.primary }}
                />
              )}
            </Card>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Downloads</Text>
            <Card variant="elevated" style={styles.card}>
              {renderSettingItem(
                'wifi', 
                'Download over Wi-Fi only', 
                'Save mobile data',
                <Switch 
                  value={downloadOverWifi} 
                  onValueChange={setDownloadOverWifi}
                  trackColor={{ false: '#767577', true: Colors.light.primary }}
                />
              )}
              <View style={styles.separator} />
              <TouchableOpacity onPress={handleClearDownloads}>
                {renderSettingItem(
                  'trash-2', 
                  'Clear Downloads', 
                  'Remove all offline content',
                  <Feather name="chevron-right" size={20} color={Colors.light.textMuted} />
                )}
              </TouchableOpacity>
            </Card>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Connection</Text>
            <Card variant="elevated" style={styles.card}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <Feather name="globe" size={20} color={Colors.light.primary} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Instance URL</Text>
                    <Text style={styles.settingSubtitle} numberOfLines={1}>{instanceUrl || 'Not connected'}</Text>
                  </View>
                </View>
              </View>
              <View style={{ padding: Spacing.sm }}>
                <Button 
                  title="Change Instance" 
                  variant="outline" 
                  onPress={handleChangeInstance}
                  size="sm"
                />
              </View>
            </Card>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>About</Text>
            <Card variant="elevated" style={styles.card}>
              {renderSettingItem(
                'info', 
                'Version', 
                `${Application.nativeApplicationVersion} (${Application.nativeBuildVersion})`,
                null
              )}
              <View style={styles.separator} />
              <TouchableOpacity onPress={handleLogout}>
                <View style={[styles.settingItem, { paddingVertical: Spacing.md }]}>
                  <Text style={[styles.settingTitle, { color: Colors.light.destructive }]}>Log Out</Text>
                  <Feather name="log-out" size={20} color={Colors.light.destructive} />
                </View>
              </TouchableOpacity>
            </Card>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>LMS Mobile App</Text>
            <Text style={styles.footerText}>© 2024 All Rights Reserved</Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    fontFamily: Fonts.bold,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  content: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textMuted,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: Fonts.semiBold,
  },
  card: {
    padding: 0, // Override default padding for list items
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    fontFamily: Fonts.medium,
  },
  settingSubtitle: {
    fontSize: 13,
    color: Colors.light.textMuted,
    marginTop: 2,
    fontFamily: Fonts.regular,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginLeft: 60, // Align with text
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  footerText: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontFamily: 'Inter_400Regular',
  },
});
