import path from 'path'

import { writeFile, mkdir } from 'fs/promises'

import { NextResponse } from 'next/server'

import multer from 'multer'

const upload = multer({
  storage: multer.memoryStorage()
})

const uploadDir = 'C:\\xampp\\htdocs\\basic-laravel11\\public\\dist\\img'

export async function POST(request) {
  const formData = await request.formData()
  const file = formData.get('image')

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const fileExtension = path.extname(file.name)
  const filename = `Background-1${fileExtension}`
  const filepath = path.join(uploadDir, filename)

  try {
    // สร้างโฟลเดอร์ถ้ายังไม่มี
    await mkdir(uploadDir, { recursive: true })

    await writeFile(filepath, buffer)
    console.log('File uploaded to', filepath)

    return NextResponse.json({
      message: 'File uploaded successfully',
      fileName: filename,
      filePath: `/dist/img/test/${filename}`
    })
  } catch (error) {
    console.error('Upload error:', error)

    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}

export const runtime = {
  api: {
    bodyParser: false
  }
}
