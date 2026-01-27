import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Colors, Spacing } from '@/constants/theme';
import { apiClient } from '@/lib/api-client';
import * as Network from 'expo-network';
import { offlineStorage } from '@/lib/offline-storage';

interface LessonNotesModalProps {
  visible: boolean;
  onClose: () => void;
  lessonId: string;
}

export function LessonNotesModal({ visible, onClose, lessonId }: LessonNotesModalProps) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      loadNote();
    }
  }, [visible, lessonId]);

  const loadNote = async () => {
    setLoading(true);
    try {
      const status = await Network.getNetworkStateAsync();
      const isOnline = !!status.isConnected && !!status.isInternetReachable;
      if (isOnline) {
        const res = await apiClient(`/lessons/${lessonId}/note`);
        if (res.ok) {
          const data = await res.json();
          setNote(data?.content || '');
          return;
        }
      }
      const offline = await offlineStorage.getNoteOffline(lessonId);
      setNote(offline?.content || '');
    } catch (error) {
      console.error('Failed to load note', error);
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async () => {
    setSaving(true);
    try {
      const status = await Network.getNetworkStateAsync();
      const isOnline = !!status.isConnected && !!status.isInternetReachable;
      if (isOnline) {
        const res = await apiClient(`/lessons/${lessonId}/note`, {
          method: 'PUT',
          body: JSON.stringify({ content: note }),
        });
        if (res.ok) {
          await offlineStorage.markNoteSynced(lessonId);
          onClose();
          return;
        }
      }
      await offlineStorage.saveNoteOffline(lessonId, note);
      onClose();
    } catch (error) {
      console.error('Failed to save note', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Lesson Notes</Text>
          <Button variant="ghost" title="Close" onPress={onClose} />
        </View>

        <View style={styles.content}>
            {loading ? (
                <ActivityIndicator size="large" color={Colors.light.primary} />
            ) : (
                <TextInput
                    style={styles.input}
                    multiline
                    placeholder="Write your notes here..."
                    value={note}
                    onChangeText={setNote}
                    textAlignVertical="top"
                />
            )}
        </View>

        <View style={styles.footer}>
            <Button 
                title={saving ? "Saving..." : "Save Note"} 
                onPress={saveNote}
                disabled={loading || saving}
                fullWidth
            />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.md,
  },
});
