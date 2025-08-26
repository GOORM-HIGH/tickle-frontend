import React, { useState, useRef } from 'react';
import { chatService } from '../../services/chatService';

interface Props {
  onFileUploaded: (fileInfo: {fileId: string; fileName: string; fileUrl: string}) => void;
  onError: (error: string) => void;
}

export const FileUpload: React.FC<Props> = ({ onFileUploaded, onError }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 크기 제한 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      onError('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    // 허용된 파일 타입
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      onError('지원하지 않는 파일 형식입니다.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 업로드 진행률 시뮬레이션
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const fileInfo = await chatService.uploadFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        onFileUploaded(fileInfo);
        setIsUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 500);

    } catch (error) {
      console.error('파일 업로드 실패:', error);
      onError('파일 업로드에 실패했습니다.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // 파일 입력 시뮬레이션
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
        handleFileSelect({ target: { files: dataTransfer.files } } as any);
      }
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return '🖼️';
      case 'pdf':
        return '📄';
      case 'txt':
        return '📝';
      case 'doc':
      case 'docx':
        return '📋';
      default:
        return '📎';
    }
  };

  return (
    <div style={{ marginBottom: '10px' }}>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept="image/*,.pdf,.txt,.doc,.docx"
        style={{ display: 'none' }}
      />
      
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          border: '2px dashed #ddd',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: '#f8f9fa',
          transition: 'all 0.2s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#007bff';
          e.currentTarget.style.backgroundColor = '#f0f8ff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#ddd';
          e.currentTarget.style.backgroundColor = '#f8f9fa';
        }}
      >
        {isUploading ? (
          <div>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>📤</div>
            <div style={{ marginBottom: '10px' }}>파일 업로드 중...</div>
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#e9ecef',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${uploadProgress}%`,
                height: '100%',
                backgroundColor: '#007bff',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              {uploadProgress}%
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>📎</div>
            <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>
              파일 첨부
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              클릭하거나 파일을 여기에 드래그하세요
            </div>
            <div style={{ fontSize: '11px', color: '#999', marginTop: '5px' }}>
              이미지, PDF, 텍스트 파일 (최대 10MB) - NAS 저장
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 