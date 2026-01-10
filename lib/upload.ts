import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function saveFile(file: File): Promise<string> {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const uniqueName = `${uuidv4()}-${file.name.replace(/\s/g, '-')}`
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const path = join(uploadDir, uniqueName)

    await writeFile(path, buffer)

    return `/uploads/${uniqueName}`
}
