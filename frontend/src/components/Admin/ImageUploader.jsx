// ImageUploader Component for Cloudinary Integration with Multi-file Support
import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import http from '../../api/http.js';

const UploaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const DropZone = styled.div`
  border: 2px dashed ${({ theme, $isDragging, $hasError }) => 
    $hasError ? theme.colors.danger : 
    $isDragging ? theme.colors.primary : 
    theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  padding: ${({ theme }) => theme.spacing[6]};
  text-align: center;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.base};
  background: ${({ theme, $isDragging }) => 
    $isDragging ? `${theme.colors.primary}10` : theme.colors.light};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => `${theme.colors.primary}05`};
  }

  ${({ $disabled }) => $disabled && `
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  `}
`;

const DropZoneContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const UploadIcon = styled.div`
  font-size: 48px;
  opacity: 0.5;
`;

const DropZoneText = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.text.secondary};
  
  strong {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
  }
`;

const DropZoneHint = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const PreviewContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => theme.colors.light};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const PreviewImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  flex-shrink: 0;
`;

const PreviewInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const PreviewName = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  word-break: break-word;
`;

const PreviewSize = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: ${({ theme }) => theme.colors.neutral[200]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.colors.primary};
  transition: width ${({ theme }) => theme.transitions.base};
  width: ${({ $progress }) => $progress}%;
`;

const RemoveButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.danger};
  border: 1px solid ${({ theme }) => theme.colors.danger};
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  transition: all ${({ theme }) => theme.transitions.fast};
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => theme.colors.danger};
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => `${theme.colors.danger}10`};
  border: 1px solid ${({ theme }) => theme.colors.danger};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  display: flex;
  align-items: start;
  gap: ${({ theme }) => theme.spacing[2]};

  &::before {
    content: '⚠️';
    flex-shrink: 0;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const SuccessMessage = styled.div`
  padding: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => `${theme.colors.success}10`};
  border: 1px solid ${({ theme }) => theme.colors.success};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  color: ${({ theme }) => theme.colors.success};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  display: flex;
  align-items: start;
  gap: ${({ theme }) => theme.spacing[2]};

  &::before {
    content: '✓';
    flex-shrink: 0;
    font-weight: bold;
  }
`;

const UploadSummary = styled.div`
  padding: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => theme.colors.light};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  
  strong {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

export default function ImageUploader({ 
  onUploadComplete, 
  onUploadError,
  disabled = false,
  maxSizeMB = 10,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png'],
  showPreview = true,
  allowMultiple = false,
  mode = 'single' // 'single' or 'multiple'
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [completedUploads, setCompletedUploads] = useState(0);
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validateFile = (file) => {
    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      return 'Only JPG and PNG files are allowed';
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    return null;
  };

  const handleFilesSelect = async (files) => {
    setErrors([]);
    setCompletedUploads(0);

    const fileArray = Array.from(files);
    const validFiles = [];
    const newErrors = [];

    // Validate all files
    fileArray.forEach((file, index) => {
      const validationError = validateFile(file);
      if (validationError) {
        newErrors.push(`${file.name}: ${validationError}`);
      } else {
        validFiles.push(file);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      if (onUploadError) {
        onUploadError(newErrors.join('; '));
      }
    }

    if (validFiles.length === 0) {
      return;
    }

    // Create preview objects
    const fileObjects = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      uploading: false,
      uploaded: false,
      error: null
    }));

    setSelectedFiles(fileObjects);

    // Upload files
    if (mode === 'multiple' || allowMultiple) {
      // Upload all files
      for (const fileObj of fileObjects) {
        await uploadFile(fileObj);
      }
    } else {
      // Single mode - only upload first file
      await uploadFile(fileObjects[0]);
    }
  };

  const uploadFile = async (fileObj) => {
    const { file } = fileObj;
    
    // Update state to show uploading
    setSelectedFiles(prev => 
      prev.map(f => 
        f.file === file ? { ...f, uploading: true, progress: 0 } : f
      )
    );

    try {
      const formData = new FormData();
      formData.append('image', file);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setSelectedFiles(prev => 
          prev.map(f => 
            f.file === file && f.progress < 90
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          )
        );
      }, 200);

      const response = await http.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(progressInterval);

      if (response.data.success && response.data.url) {
        // Update state to show completed
        setSelectedFiles(prev => 
          prev.map(f => 
            f.file === file 
              ? { ...f, uploading: false, uploaded: true, progress: 100, url: response.data.url }
              : f
          )
        );

        setCompletedUploads(prev => prev + 1);
        
        if (onUploadComplete) {
          onUploadComplete({
            url: response.data.url,
            optimizedUrl: response.data.optimizedUrl,
            publicId: response.data.publicId,
            width: response.data.width,
            height: response.data.height,
            format: response.data.format,
            filename: file.name
          });
        }
      } else {
        throw new Error('Upload failed - no URL returned');
      }

    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.details || 
                          err.message || 
                          'Failed to upload image';
      
      setSelectedFiles(prev => 
        prev.map(f => 
          f.file === file 
            ? { ...f, uploading: false, error: errorMessage }
            : f
        )
      );

      setErrors(prev => [...prev, `${file.name}: ${errorMessage}`]);
      
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFilesSelect(files);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFilesSelect(files);
    }
  };

  const handleRemove = (fileToRemove) => {
    setSelectedFiles(prev => prev.filter(f => f.file !== fileToRemove));
    setCompletedUploads(prev => Math.max(0, prev - 1));
  };

  const handleClearAll = () => {
    selectedFiles.forEach(f => URL.revokeObjectURL(f.preview));
    setSelectedFiles([]);
    setErrors([]);
    setCompletedUploads(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isUploading = selectedFiles.some(f => f.uploading);
  const showUploadZone = selectedFiles.length === 0 || (mode === 'multiple' && !isUploading);

  return (
    <UploaderContainer>
      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleInputChange}
        disabled={disabled}
        multiple={mode === 'multiple' || allowMultiple}
      />

      {showUploadZone && (
        <DropZone
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          $isDragging={isDragging}
          $disabled={disabled}
          $hasError={errors.length > 0}
        >
          <DropZoneContent>
            <UploadIcon>📸</UploadIcon>
            <DropZoneText>
              <strong>Click to upload</strong> or drag and drop
            </DropZoneText>
            <DropZoneHint>
              JPG or PNG (max {maxSizeMB}MB){mode === 'multiple' && ' • Select multiple with Ctrl/Cmd+Click'}
            </DropZoneHint>
          </DropZoneContent>
        </DropZone>
      )}

      {selectedFiles.length > 0 && showPreview && (
        <>
          {selectedFiles.map((fileObj, index) => (
            <PreviewContainer key={index}>
              <PreviewImage src={fileObj.preview} alt={`Upload preview ${index + 1}`} />
              <PreviewInfo>
                <PreviewName>{fileObj.file.name}</PreviewName>
                <PreviewSize>{formatFileSize(fileObj.file.size)}</PreviewSize>
                {fileObj.uploading && (
                  <>
                    <ProgressBar>
                      <ProgressFill $progress={fileObj.progress} />
                    </ProgressBar>
                    <PreviewSize>Uploading... {fileObj.progress}%</PreviewSize>
                  </>
                )}
                {fileObj.uploaded && (
                  <PreviewSize style={{ color: '#10b981' }}>✓ Uploaded successfully</PreviewSize>
                )}
                {fileObj.error && (
                  <PreviewSize style={{ color: '#ef4444' }}>✗ {fileObj.error}</PreviewSize>
                )}
              </PreviewInfo>
              <RemoveButton 
                type="button" 
                onClick={() => handleRemove(fileObj.file)} 
                disabled={fileObj.uploading}
              >
                Remove
              </RemoveButton>
            </PreviewContainer>
          ))}
        </>
      )}

      {selectedFiles.length > 1 && (
        <UploadSummary>
          <strong>{completedUploads}</strong> of <strong>{selectedFiles.length}</strong> files uploaded
        </UploadSummary>
      )}

      {errors.length > 0 && (
        <ErrorMessage>
          <div>
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        </ErrorMessage>
      )}

      {completedUploads > 0 && completedUploads === selectedFiles.length && errors.length === 0 && (
        <SuccessMessage>
          {selectedFiles.length === 1 
            ? 'Image uploaded successfully to Cloudinary'
            : `All ${selectedFiles.length} images uploaded successfully to Cloudinary`}
        </SuccessMessage>
      )}
    </UploaderContainer>
  );
}
