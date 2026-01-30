# GitHub Pages Setup Guide

This repository includes a GitHub Pages website. Follow these steps to enable it:

## Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** (in the repository navigation bar)
3. Scroll down to the **Pages** section (in the left sidebar)
4. Under **Source**, select:
   - **Deploy from a branch**
   - Choose **main** (or **master**) branch
   - Select **/ (root)** folder
   - Click **Save**

## Access Your Website

After enabling GitHub Pages, your website will be available at:
```
https://[your-username].github.io/[repository-name]/
```

For example:
```
https://yourusername.github.io/HyperMesh-Firmware/
```

## Custom Domain (Optional)

If you want to use a custom domain:
1. Add a `CNAME` file in the root directory with your domain name
2. Configure DNS settings for your domain to point to GitHub Pages
3. Update the domain settings in GitHub Pages settings

## Files Included

- `index.html` - Main website file
- `.nojekyll` - Prevents Jekyll processing (for faster builds)
- All images and firmware files are referenced correctly

## Troubleshooting

- If the website doesn't load, check that GitHub Pages is enabled in Settings
- Wait a few minutes after enabling - GitHub Pages can take 1-10 minutes to build
- Check the Actions tab for any build errors
- Ensure all file paths are correct (case-sensitive on Linux servers)

## Notes

- The website uses modern CSS and is fully responsive
- All firmware files and images are linked correctly
- The site includes smooth scrolling navigation
- No build process required - GitHub Pages serves the HTML directly
