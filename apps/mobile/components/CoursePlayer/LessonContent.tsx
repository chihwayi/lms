import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

interface Props {
  content?: string;
}

export function LessonContent({ content }: Props) {
  if (!content) {
      return null;
  }

  // Basic HTML wrapper for styling
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
            padding: 16px; 
            color: #111827; 
            line-height: 1.6;
            font-size: 16px;
          }
          h1 { font-size: 24px; font-weight: 700; margin-bottom: 16px; }
          h2 { font-size: 20px; font-weight: 600; margin-top: 24px; margin-bottom: 12px; }
          p { margin-bottom: 16px; }
          img { max-width: 100%; height: auto; border-radius: 8px; }
          pre { background: #f3f4f6; padding: 12px; border-radius: 8px; overflow-x: auto; }
          code { font-family: monospace; background: #f3f4f6; padding: 2px 4px; border-radius: 4px; }
          ul, ol { padding-left: 20px; margin-bottom: 16px; }
          li { margin-bottom: 8px; }
          blockquote { border-left: 4px solid #e5e7eb; padding-left: 16px; margin: 16px 0; color: #4b5563; }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        startInLoadingState
        renderLoading={() => (
            <View style={styles.loading}>
                <ActivityIndicator size="small" color="#2563EB" />
            </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 200, 
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
  }
});
