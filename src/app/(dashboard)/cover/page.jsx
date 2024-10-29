'use client'

import { useState, useEffect } from 'react'

import axios from 'axios'

import styles from '/src/assets/Upload.module.css'

import Alert from '@mui/material/Alert'
import CheckIcon from '@mui/icons-material/Check'

export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [error, setError] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileChange = e => {
    const selectedFile = e.target.files[0]

    setFile(selectedFile)
    setError(null)
    setUploadProgress(0)

    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile)

      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (!file) {
      setError('กรุณาเลือกไฟล์')

      return
    }

    setUploading(true)
    setError(null)

    const formData = new FormData()

    formData.append('image', file)

    try {
      const response = await axios.post('/api/cover/background', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: progressEvent => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)

          setUploadProgress(percentCompleted)
        }
      })

      console.log('Upload successful:', response.data)
      setUploadedFile(response.data)
      setShowAlert(true)

      // ซ่อน Alert หลังจาก 5 วินาที
      setTimeout(() => setShowAlert(false), 5000)
    } catch (error) {
      console.error('Upload failed:', error)
      setError('เกิดข้อผิดพลาดในการอัปโหลด')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className='text-center'>อัพโหลดรูปภาพ</h1>
      {showAlert && (
        <Alert icon={<CheckIcon fontSize='inherit' />} severity='success' onClose={() => setShowAlert(false)}>
          อัพโหลดสำเร็จแล้ว
        </Alert>
      )}
      {previewUrl && (
        <div className={styles.previewContainer}>
          <img src={previewUrl} alt='Preview' className={styles.previewImage} />
        </div>
      )}
      <form onSubmit={handleSubmit} className={styles.form}>
        <input type='file' onChange={handleFileChange} accept='image/*' className={styles.fileInput} />
        <button type='submit' disabled={uploading || !file} className={styles.submitButton}>
          {uploading ? 'กำลังอัพโหลด...' : 'อัพโหลด'}
        </button>
      </form>
      {uploading && (
        <div className={styles.progressContainer}>
          <div className={styles.progressBar} style={{ width: `${uploadProgress}%` }}></div>
          <span className={styles.progressText}>{uploadProgress}%</span>
        </div>
      )}
      {error && <p className={styles.error}>{error}</p>}
      {uploadedFile && (
        <div className={styles.uploadedFile}>
          <p>ไฟล์ถูกอัพโหลดเรียบร้อยแล้ว:</p>
          <p>ชื่อไฟล์: {uploadedFile.fileName}</p>
        </div>
      )}
    </div>
  )
}
