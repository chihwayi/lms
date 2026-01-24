
import { View, StyleSheet, FlatList, Image, ScrollView, RefreshControl, StatusBar, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Shadows, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth-store';
import { Feather } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/Toast';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
      showToast({ type: 'success', title: 'Logged out successfully' });
    } catch (error) {
      showToast({ type: 'error', title: 'Failed to logout' });
    }
  };

  const menuItems = [
    { icon: 'award', title: 'Certificates', subtitle: 'View your course certificates', route: '/certificates' },
    { icon: 'settings', title: 'Settings', subtitle: 'App preferences and account', route: '/settings' },
    { icon: 'help-circle', title: 'Help & Support', subtitle: 'FAQs and contact support' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.light.gradientStart, Colors.light.gradientEnd]}
        style={styles.headerBackground}
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.headerTitle}>My Profile</Text>
              <TouchableOpacity onPress={() => router.push('/settings')}>
                <Feather name="settings" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
              <View style={styles.avatarContainer}>
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </Text>
                )}
              </View>
              <View style={styles.profileText}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
                  <TouchableOpacity onPress={() => router.push('/profile/edit')}>
                    <Feather name="edit-2" size={16} color="rgba(255,255,255,0.8)" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.email}>{user?.email}</Text>
                <View style={styles.roleTag}>
                  <Text style={styles.roleText}>{user?.role || 'Student'}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <Card style={styles.statCard} variant="elevated">
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </Card>
            <Card style={styles.statCard} variant="elevated">
              <Text style={styles.statValue}>85%</Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </Card>
            <Card style={styles.statCard} variant="elevated">
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Certificates</Text>
            </Card>
          </View>

          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Account</Text>
            <Card style={styles.menuContainer} variant="elevated">
              {menuItems.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.menuItem, index !== menuItems.length - 1 && styles.menuItemBorder]}
                  onPress={() => item.route && router.push(item.route as any)}
                >
                  <View style={styles.menuIcon}>
                    <Feather name={item.icon as any} size={20} color={Colors.light.primary} />
                  </View>
                  <View style={styles.menuText}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color={Colors.light.icon} />
                </TouchableOpacity>
              ))}
            </Card>
          </View>

          <View style={styles.footer}>
            <Button 
              title="Logout" 
              onPress={handleLogout} 
              variant="destructive"
              style={styles.logoutButton}
              icon={<Feather name="log-out" size={18} color="white" />}
              fullWidth
            />
            <Text style={styles.version}>Version 1.0.0</Text>
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
    left: 0,
    right: 0,
    top: 0,
    height: 220,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    ...Shadows.md,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: Colors.light.primary,
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileText: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  roleTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginTop: -20, // Overlap with header
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: '600',
  },
  menuSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.md,
    marginLeft: 4,
  },
  menuContainer: {
    padding: 0, // Reset padding for custom list items
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.light.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
  },
  logoutButton: {
    marginBottom: Spacing.lg,
  },
  version: {
    textAlign: 'center',
    color: Colors.light.textMuted,
    fontSize: 12,
  },
});
