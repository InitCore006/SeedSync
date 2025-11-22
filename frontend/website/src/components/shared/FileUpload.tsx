import React, { useRef, useState } from 'react'
import { Upload, X, File, AlertCircle } from 'lucide-react'
import { cn } from '@lib/utils'
import { formatFileSize } from '@lib/utils'

interface FileUploadProps {
  label?: string
  accept?: string
  maxSize?: number // in bytes
  onChange: (file: File | null) => void
  error?: string
  required?: boolean
  currentFile?: File | null
  helperText?: string
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSize = 5 * 1024 * 1024, // 5MB default
  onChange,
  error,
  required,
  currentFile,
  helperText,
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File size exceeds ${formatFileSize(maxSize)}`
    }

    // Check file type
    const acceptedTypes = accept.split(',').map((type) => type.trim())
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    const isAccepted = acceptedTypes.some((type) => {
      if (type.startsWith('.')) {
        return type === fileExtension
      }
      return file.type.match(type)
    })

    if (!isAccepted) {
      return `File type not accepted. Allowed types: ${accept}`
    }

    return null
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      const error = validateFile(file)
      
      if (error) {
        setUploadError(error)
        return
      }

      setUploadError(null)
      onChange(file)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const error = validateFile(file)
      
      if (error) {
        setUploadError(error)
        return
      }

      setUploadError(null)
      onChange(file)
    }
  }

  const handleRemove = () => {
    onChange(null)
    setUploadError(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const displayError = error || uploadError

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-navy-900 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {!currentFile ? (
        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
            dragActive
              ? 'border-navy-500 bg-navy-50'
              : displayError
              ? 'border-red-500 bg-red-50'
              : 'border-neutral-300 hover:border-navy-400 hover:bg-neutral-50'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />

          <Upload className="h-10 w-10 mx-auto text-neutral-400 mb-3" />
          <p className="text-sm font-medium text-navy-900 mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-neutral-500">
            {accept.replace(/,/g, ', ')} (Max {formatFileSize(maxSize)})
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
          <div className="flex items-center space-x-3 flex-1">
            <File className="h-8 w-8 text-navy-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-navy-900 truncate">
                {currentFile.name}
              </p>
              <p className="text-xs text-neutral-500">
                {formatFileSize(currentFile.size)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="ml-3 p-1 text-neutral-400 hover:text-red-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {displayError && (
        <div className="mt-2 flex items-start space-x-2 text-red-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{displayError}</p>
        </div>
      )}

      {helperText && !displayError && (
        <p className="mt-2 text-sm text-neutral-500">{helperText}</p>
      )}
    </div>
  )
}