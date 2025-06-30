import { build } from 'vite'
import { resolve, dirname } from 'path'
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, rmSync } from 'fs'
import { fileURLToPath } from 'url'

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function buildExtension() {
  console.log('🔨 Building Chrome Extension...')
  
  try {
    // Build with Vite
    await build()
    
    // Ensure manifest.json is copied
    const manifestSrc = resolve(__dirname, 'src/manifest.json')
    const manifestDest = resolve(__dirname, 'dist/manifest.json')
    
    if (existsSync(manifestSrc)) {
      copyFileSync(manifestSrc, manifestDest)
      console.log('✅ Manifest.json copied to dist/')
    } else {
      console.error('❌ Manifest.json not found in src/')
      process.exit(1)
    }
    
    // Move HTML files from dist/src/ to dist/
    const srcDir = resolve(__dirname, 'dist/src')
    if (existsSync(srcDir)) {
      const files = readdirSync(srcDir)
      files.forEach(file => {
        const srcPath = resolve(srcDir, file)
        const destPath = resolve(__dirname, 'dist', file)
        
        if (statSync(srcPath).isFile()) {
          copyFileSync(srcPath, destPath)
          console.log(`✅ Moved ${file} to dist/`)
        }
      })
      
      // Remove the src directory
      rmSync(srcDir, { recursive: true, force: true })
    }
    
    // Create assets directory if it doesn't exist
    const assetsDir = resolve(__dirname, 'dist/assets')
    if (!existsSync(assetsDir)) {
      mkdirSync(assetsDir, { recursive: true })
    }
    
    console.log('✅ Build completed successfully!')
    console.log('📁 Extension files are in the dist/ folder')
    console.log('')
    console.log('📋 Next steps:')
    console.log('1. Open Chrome and go to chrome://extensions/')
    console.log('2. Enable "Developer mode" (toggle in top right)')
    console.log('3. Click "Load unpacked"')
    console.log('4. Select the "dist" folder from this project')
    console.log('')
    console.log('📝 Note: Add icon files to src/assets/ if you want extension icons')
    
  } catch (error) {
    console.error('❌ Build failed:', error)
    process.exit(1)
  }
}

buildExtension() 