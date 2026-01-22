'use client';

import { useState, useEffect } from 'react';
import { Download, ExternalLink, FileText, Image as ImageIcon, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface DocumentViewerProps {
  fileId: string;
  fileName: string;
  fileType: string;
  title?: string;
}

export function DocumentViewer({ fileId, fileName, fileType, title }: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) setToken(t);
  }, []);

  const streamUrl = token ? `/api/v1/files/${fileId}/stream?token=${token}` : '';
  const downloadUrl = token ? `/api/v1/files/${fileId}/download?token=${token}` : '';

  const isPDF = fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
  const isImage = fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
  const isDocument = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(fileType);

  const getFileIcon = () => {
    if (isPDF || isDocument) return <FileText className="w-6 h-6" />;
    if (isImage) return <ImageIcon className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openInNewTab = () => {
    window.open(streamUrl, '_blank');
  };

  return (
    <div className="relative w-full bg-white/30 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100/70 rounded-lg">
            {getFileIcon()}
          </div>
          <div>
            <h3 className="font-medium text-gray-800">{title || fileName}</h3>
            <p className="text-sm text-gray-600">{fileType}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={openInNewTab}
            className="bg-white/70 hover:bg-white/90"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="bg-white/70 hover:bg-white/90"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        {isPDF && (
          <div className="w-full h-96">
            <iframe
              src={`${streamUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-full border-0"
              onLoad={() => setIsLoading(false)}
              title={title || fileName}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
        )}

        {isImage && (
          <div className="p-4 relative w-full flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={streamUrl}
              alt={title || fileName}
              className="w-full h-auto max-h-96 object-contain rounded-lg"
              onLoad={() => setIsLoading(false)}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
        )}

        {!isPDF && !isImage && (
          <div className="p-8 text-center">
            <div className="p-4 bg-gray-100/70 rounded-lg inline-block mb-4">
              {getFileIcon()}
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Preview not available</h3>
            <p className="text-gray-600 mb-4">This file type cannot be previewed in the browser.</p>
            <div className="flex justify-center space-x-3">
              <Button onClick={openInNewTab} className="bg-gradient-to-r from-blue-500 to-purple-500">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download File
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}