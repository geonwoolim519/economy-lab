import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public')
const source = path.join(publicDir, 'logo-source.jpg')

async function writeIcon(size, filename, padding = 0) {
  const inner = Math.round(size * (1 - padding * 2))
  const resized = await sharp(source)
    .resize(inner, inner, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toBuffer()

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([{ input: resized, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, filename))
}

await writeIcon(32, 'favicon-32.png')
await writeIcon(180, 'apple-touch-icon.png')
await writeIcon(192, 'icon-192.png')
await writeIcon(512, 'icon-512.png')
await writeIcon(512, 'icon-512-maskable.png', 0.12)

console.log('App icons generated in public/')
