import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Platform, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/auth-store';
import { useConfigStore } from '@/stores/config-store';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { getOfflineFileUrl, isFileOffline } from '@/lib/offline-content';
import { offlineStorage } from '@/lib/offline-storage';

interface Props {
  fileId: string;
  lessonId?: string;
}

export function PdfViewer({ fileId, lessonId }: Props) {
  const { accessToken } = useAuthStore();
  const { instanceUrl } = useConfigStore();
  const webviewRef = useRef<WebView>(null);
  
  const baseUrl = instanceUrl?.replace(/\/$/, '');
  const onlineUrl = `${baseUrl}/api/v1/files/${fileId}/stream?token=${accessToken}`;

  const [loading, setLoading] = useState(true);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [resumeRatio, setResumeRatio] = useState<number | null>(null);

  useEffect(() => {
    const checkOffline = async () => {
        try {
            if (await isFileOffline(fileId, 'pdf')) {
                const path = await getOfflineFileUrl(fileId, 'pdf');
                setLocalUrl(path);
            }
        } catch (e) {
            console.log('Error checking offline PDF', e);
        }
    };
    checkOffline();
  }, [fileId]);

  useEffect(() => {
    const fetchResume = async () => {
      if (!lessonId) return;
      const rec = await offlineStorage.getPdfScrollProgress(lessonId);
      if (rec?.ratio != null) {
        setResumeRatio(rec.ratio);
      }
    };
    fetchResume();
  }, [lessonId]);

  const pdfUrl = localUrl || onlineUrl;

  if (Platform.OS === 'android') {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <View style={styles.iconContainer}>
            <Feather name="file-text" size={48} color={Colors.light.primary} />
          </View>
          <Text style={styles.text}>PDF Document</Text>
          <Text style={styles.subtext}>
            {localUrl ? 'Document is downloaded.' : 'To view this document, please open it in your device\'s PDF viewer.'}
          </Text>
          <Button 
            title={localUrl ? "Open Downloaded PDF" : "Open PDF"} 
            onPress={async () => {
                if (localUrl) {
                    try {
                        const canOpen = await Linking.canOpenURL(localUrl);
                        if (canOpen) {
                            await Linking.openURL(localUrl);
                        } else {
                            // Fallback or specific error
                             Alert.alert('Info', 'Please locate the file in your downloads/files app.');
                        }
                    } catch (e) {
                        Alert.alert('Error', 'Could not open file');
                    }
                } else {
                    WebBrowser.openBrowserAsync(pdfUrl);
                }
            }}
            icon={<Feather name={localUrl ? "file" : "external-link"} size={18} color="white" />}
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
        ref={webviewRef}
        source={{ uri: pdfUrl }}
        style={styles.webview}
        startInLoadingState
        renderLoading={() => (
           <View style={styles.loading}>
               <ActivityIndicator size="small" color={Colors.light.primary} />
           </View>
        )}
        onLoadEnd={async () => {
          setLoading(false);
          if (lessonId && resumeRatio != null && webviewRef.current) {
            const js = `
              (function() {
                var h = document.body.scrollHeight - window.innerHeight;
                var y = h > 0 ? h * ${resumeRatio} : 0;
                window.scrollTo(0, y);
              })();
              true;
            `;
            webviewRef.current.injectJavaScript(js);
          }
        }}
        injectedJavaScript={`
          (function() {
            function sendRatio() {
              var h = document.body.scrollHeight - window.innerHeight;
              var y = window.scrollY || window.pageYOffset || 0;
              var r = h > 0 ? (y / h) : 0;
              window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'scrollRatio', value: r }));
            }
            window.addEventListener('scroll', function() {
              if (typeof requestAnimationFrame !== 'undefined') {
                requestAnimationFrame(sendRatio);
              } else {
                setTimeout(sendRatio, 250);
              }
            }, { passive: true });
          })();
          true;
        `}
        onMessage={async (event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data?.type === 'scrollRatio' && typeof data.value === 'number' && lessonId) {
              await offlineStorage.savePdfScrollProgress(lessonId, data.value);
            }
          } catch {}
        }}
        originWhitelist={['*']}
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
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
