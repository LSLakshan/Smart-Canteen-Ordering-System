# Images Folder

This folder contains all the image assets for the Smart Canteen Ordering System frontend.

## Current Files:

### logo1.jpg (TO BE ADDED)
- The main logo for the application (JPG format)
- Used in the login page and other components
- **STATUS**: Please add your actual logo1.jpg file to this folder
- **Requirements**: JPG format, recommended 200x200px or larger

### logo.svg (BACKUP)
- Previous SVG logo (still available as backup)
- Can be used if you prefer SVG format over JPG

## How to Add New Images:

1. **For Logos**: Place logo files here (PNG, SVG, JPG formats supported)
2. **For Other Images**: You can organize by creating subfolders like:
   - `icons/` - for small icons and graphics
   - `backgrounds/` - for background images
   - `products/` - for food/product images

## How to Use Images in Components:

```jsx
// Import the image
import logo from "../assets/images/logo1.jpg";

// Use in JSX
<img src={logo} alt="Logo" className="h-20 w-20 rounded-lg" />
```

## Recommended Image Formats:

- **Logos**: SVG (scalable) or PNG (high quality)
- **Icons**: SVG preferred
- **Photos**: JPG or WebP for smaller file sizes
- **Graphics with transparency**: PNG

## Best Practices:

1. Use descriptive filenames (e.g., `canteen-logo.svg` instead of `logo1.svg`)
2. Optimize images before adding (compress for web)
3. Keep file sizes reasonable (< 1MB for most images)
4. Use consistent naming conventions (kebab-case recommended)
