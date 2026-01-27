import React from 'react';
import { StyleSheet, View, ActivityIndicator, Platform } from 'react-native';
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
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV" crossorigin="anonymous">
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" integrity="sha384-XjKyOOlGwcjNTAIQHIpgOno0Hl1YQqzUOEleOLALmuqehneUG+vnuzemU38X+039" crossorigin="anonymous"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" integrity="sha384-+VBxd3r6XgURycqtZ117nYw44OOcIax56Z4dCRWbxyPt0Koah1uHoK0o4+/RRE05" crossorigin="anonymous"></script>
        <script>
          document.addEventListener("DOMContentLoaded", function() {
              renderMathInElement(document.body, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\(', right: '\\)', display: false},
                    {left: '\\[', right: '\\]', display: true}
                ],
                throwOnError : false
              });
          });
        </script>
        <style>
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
            padding: 0; 
            margin: 0;
            color: #111827; 
            line-height: 1.6;
            font-size: 16px;
          }
          h1 { font-size: 24px; font-weight: 700; margin-bottom: 16px; color: #111827; }
          h2 { font-size: 20px; font-weight: 600; margin-top: 24px; margin-bottom: 12px; color: #1f2937; }
          h3 { font-size: 18px; font-weight: 600; margin-top: 20px; margin-bottom: 10px; color: #374151; }
          p { margin-bottom: 16px; color: #4b5563; }
          img { max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0; }
          pre { background: #f3f4f6; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 16px 0; }
          code { font-family: monospace; background: #f3f4f6; padding: 2px 4px; border-radius: 4px; font-size: 14px; color: #ef4444; }
          ul, ol { padding-left: 20px; margin-bottom: 16px; }
          li { margin-bottom: 8px; color: #4b5563; }
          blockquote { border-left: 4px solid #4f46e5; padding-left: 16px; margin: 16px 0; color: #4b5563; background: #f9fafb; padding: 12px 16px; border-radius: 0 8px 8px 0; }
          a { color: #4f46e5; text-decoration: none; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
          th { background: #f9fafb; font-weight: 600; }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `;

  if (Platform.OS === 'web') {
      return (
          <View style={styles.container}>
              {React.createElement('iframe', {
                  srcDoc: htmlContent,
                  style: { width: '100%', height: '100%', border: 'none', minHeight: 400 }
              })}
          </View>
      );
  }

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        startInLoadingState
        renderLoading={() => (
            <View style={styles.loading}>
                <ActivityIndicator size="small" color="#4F46E5" />
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
    height: '100%',
    opacity: 0.99, // Fix for android webview sometimes not rendering
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
