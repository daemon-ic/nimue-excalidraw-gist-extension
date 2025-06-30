# Extension Icons

To add icons to your Chrome extension, place the following PNG files in this directory:

- `icon-16.png` (16x16 pixels)
- `icon-32.png` (32x32 pixels) 
- `icon-48.png` (48x48 pixels)
- `icon-128.png` (128x128 pixels)

Then update the `manifest.json` file to include the icons:

```json
{
  "icons": {
    "16": "assets/icon-16.png",
    "32": "assets/icon-32.png",
    "48": "assets/icon-48.png",
    "128": "assets/icon-128.png"
  }
}
```

## Icon Creation Tips

- Use PNG format for best compatibility
- Make sure icons are square (same width and height)
- Use transparent backgrounds for better appearance
- Test how icons look at different sizes
- You can use online tools like:
  - [Favicon.io](https://favicon.io/)
  - [Canva](https://canva.com/)
  - [Figma](https://figma.com/) 