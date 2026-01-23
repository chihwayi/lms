import { View, Text, StyleSheet, FlatList, Image, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth-store';
import { Feather } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/Toast';

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
    { icon: 'award', title: 'Achievements', subtitle: 'View your badges and certificates' },
    { icon: 'settings', title: 'Settings', subtitle: 'App preferences and account' },
    { icon: 'help-circle', title: 'Help & Support', subtitle: 'FAQs and contact support' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Text>
          </View>
          <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleTag}>
            <Text style={styles.roleText}>{user?.role || 'Student'}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Courses</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>85%</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Certificates</Text>
          </Card>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <Card key={index} style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Feather name={item.icon as any} size={20} color={Colors.light.primary} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={Colors.light.icon} />
            </Card>
          ))}
        </View>

        <Button 
          title="Logout" 
          onPress={handleLogout} 
          variant="destructive"
          style={styles.logoutButton}
          icon={<Feather name="log-out" size={18} color="white" />}
        />
        
        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  roleTag: {
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  menuContainer: {
    gap: 12,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
  logoutButton: {
    marginBottom: 16,
  },
  version: {
    textAlign: 'center',
    color: Colors.light.textMuted,
    fontSize: 12,
  },
});
