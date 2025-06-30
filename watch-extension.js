import { build } from 'vite'
import { resolve, dirname } from 'path'
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, rmSync, watch } from 'fs'
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
      return false
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
    console.log('🔄 Reload the extension in Chrome to see changes')
    console.log('   (Right-click extension icon → "Reload extension")')
    return true
    
  } catch (error) {
    console.error('❌ Build failed:', error)
    return false
  }
}

async function startWatchMode() {
  console.log('🚀 Starting watch mode for Chrome Extension...')
  console.log('📁 Watching for changes in src/ directory...')
  console.log('')
  console.log('📋 Instructions:')
  console.log('1. Make sure your extension is loaded in Chrome')
  console.log('2. Make changes to your code in the src/ directory')
  console.log('3. The extension will automatically rebuild')
  console.log('4. Right-click the extension icon and select "Reload extension"')
  console.log('')
  console.log('⏹️  Press Ctrl+C to stop watch mode')
  console.log('')
  
  // Initial build
  await buildExtension()
  
  // Watch for changes
  const srcDir = resolve(__dirname, 'src')
  let isBuilding = false
  
  watch(srcDir, { recursive: true }, async (eventType, filename) => {
    // Ignore certain files and directories
    if (!filename || 
        filename.includes('node_modules') || 
        filename.includes('.git') ||
        filename.endsWith('.log')) {
      return
    }
    
    // Prevent multiple simultaneous builds
    if (isBuilding) {
      console.log('⏳ Build already in progress, skipping...')
      return
    }
    
    console.log(`🔄 File changed: ${filename}`)
    console.log('🔨 Rebuilding extension...')
    
    isBuilding = true
    try {
      await buildExtension()
    } finally {
      isBuilding = false
    }
  })
  
  console.log('👀 Watching for changes...')
}

// Check if we're in watch mode
const isWatchMode = process.argv.includes('--watch')

if (isWatchMode) {
  startWatchMode()
} else {
  buildExtension().then((success) => {
    if (success) {
      console.log('📁 Extension files are in the dist/ folder')
      console.log('')
      console.log('📋 Next steps:')
      console.log('1. Open Chrome and go to chrome://extensions/')
      console.log('2. Enable "Developer mode" (toggle in top right)')
      console.log('3. Click "Load unpacked"')
      console.log('4. Select the "dist" folder from this project')
      console.log('')
      console.log('🔄 To enable watch mode, run: node watch-extension.js --watch')
    }
  })
} 