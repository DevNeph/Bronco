import React, { useState, useRef } from 'react';
import { UploadIcon, XIcon, FileIcon, ImageIcon, DocumentIcon } from 'lucide-react';

const FileUploader = ({
  onFileSelect,
  maxFiles = 5,
  maxSize = 5, // in MB
  accept = '*/*',
  multiple = false,
  label = 'Dosya Yükle',
  helpText = 'veya sürükle & bırak',
  className = '',
}) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const validateFiles = (fileList) => {
    if (fileList.length > maxFiles) {
      setError(`En fazla ${maxFiles} dosya yükleyebilirsiniz`);
      return false;
    }

    let valid = true;

    // Convert FileList to array to process it
    const filesArray = Array.from(fileList);

    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      const fileSizeInMB = file.size / (1024 * 1024);

      if (fileSizeInMB > maxSize) {
        setError(`"${file.name}" dosyası çok büyük. Maksimum dosya boyutu ${maxSize}MB`);
        valid = false;
        break;
      }

      // Check if file type is accepted
      if (accept !== '*/*') {
        const acceptedTypes = accept.split(',');
        const fileType = file.type;
        
        const isAccepted = acceptedTypes.some(type => {
          // Handle wildcards like "image/*"
          if (type.endsWith('/*')) {
            const category = type.split('/')[0];
            return fileType.startsWith(category);
          }
          return type === fileType;
        });

        if (!isAccepted) {
          setError(`"${file.name}" dosya türü kabul edilmiyor`);
          valid = false;
          break;
        }
      }
    }

    return valid;
  };

  const handleFileSelect = (e) => {
    const selectedFiles = e.target.files;
    
    if (!selectedFiles || selectedFiles.length === 0) {
      return;
    }

    setError('');
    
    if (validateFiles(selectedFiles)) {
      setFiles(Array.from(selectedFiles));
      onFileSelect(multiple ? Array.from(selectedFiles) : selectedFiles[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    
    if (!droppedFiles || droppedFiles.length === 0) {
      return;
    }
    
    setError('');
    
    if (validateFiles(droppedFiles)) {
      setFiles(Array.from(droppedFiles));
      onFileSelect(multiple ? Array.from(droppedFiles) : droppedFiles[0]);
    }
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onFileSelect(multiple ? newFiles : newFiles[0] || null);
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    } else if (file.type.includes('pdf')) {
      return <DocumentIcon className="w-5 h-5 text-red-500" />;
    } else {
      return <FileIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className={className}>
      <div
        className={`border-2 border-dashed rounded-md ${
          isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50'
        } ${error ? 'border-red-500' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
          <UploadIcon className="w-10 h-10 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">{label}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {helpText}
          </p>
          <div className="mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleClick}
            >
              Dosya Seç
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={accept}
              multiple={multiple}
              onChange={handleFileSelect}
            />
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-500">
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Preview of selected files */}
      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Seçilen Dosyalar:</h4>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded-md bg-white"
              >
                <div className="flex items-center">
                  {getFileIcon(file)}
                  <span className="ml-2 text-sm truncate max-w-xs">{file.name}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  className="text-gray-400 hover:text-red-500"
                  onClick={() => removeFile(index)}
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUploader;