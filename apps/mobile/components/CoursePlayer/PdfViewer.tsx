import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/auth-store';
import { useConfigStore } from '@/stores/config-store';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { Button } from '@/components/ui/Button';

interface Props {
  fileId: string;
}

export function PdfViewer({ fileId }: Props) {
  const { accessToken } = useAuthStore();
  const { instanceUrl } = useConfigStore();
  
  const baseUrl = instanceUrl?.replace(/\/$/, '');
  const pdfUrl = `${baseUrl}/api/v1/files/${fileId}/stream?token=${accessToken}`;

  const [loading, setLoading] = useState(true);

  if (Platform.OS === 'android') {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <View style={styles.iconContainer}>
            <Feather name="file-text" size={48} color={Colors.light.primary} />
          </View>
          <Text style={styles.text}>PDF Document</Text>
          <Text style={styles.subtext}>
            To view this document, please open it in your device's PDF viewer.
          </Text>
          <Button 
            title="Open PDF" 
            onPress={() => WebBrowser.openBrowserAsync(pdfUrl)}
            icon={<Feather name="external-link" size={18} color="white" />}
            style={styles.button}
          />
        </View>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return React.createElement('iframe', {
      src: pdfUrl,
      style: { width: '100%', height: '100%', border: 'none' }
    });
  }

  // iOS renders PDF natively in WebView
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: pdfUrl }}
        style={styles.webview}
        startInLoadingState
        renderLoading={() => (
           <View style={styles.loading}>
               <ActivityIndicator size="small" color={Colors.light.primary} />
           </View>
        )}
        onLoadEnd={() => setLoading(false)}
        originWhitelist={['*']}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 500, // Fixed height for PDF viewer or flex
    backgroundColor: '#F3F4F6',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  subtext: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  button: {
    minWidth: 200,
  }
});
