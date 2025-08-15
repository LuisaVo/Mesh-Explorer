# Planet 3D Mesh Workshop

This interactive web app lets you explore how mesh density and geometry affect the detail of 3D objects. You can adjust mesh settings, toggle wireframes, and focus the camera on any object. Great for educational workshops!

## Features

- **Three Planets**: Smooth, big craters/hills, and small craters/hills.
- **Three Donuts (Torus)**: Each with different surface detail.
- **Three Terrain Patches**: Flat, big hills, and small hills.
- **Global Mesh Density Control**: Change mesh resolution for all objects.
- **Wireframe Toggle**: Show/hide mesh grid overlay.
- **Camera Controls**: Orbit, zoom, and click-to-focus on objects.
- **Modern Neutral Gradient Background**: Keeps focus on the 3D models.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run locally

```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for production

```bash
npm run build
```

### 4. Deploy to GitHub Pages

```bash
npm run deploy
```
See [How to publish as a GitHub Page](#how-to-publish-as-a-github-page) below.

## Usage

- **Mesh Dichte**: Use the slider to change mesh density.
- **Kamera zurücksetzen**: Resets the camera to the default view.
- **Mesh ausblenden/anzeigen**: Toggle wireframe mesh visibility.
- **Click on objects**: Camera smoothly focuses on the selected object.

## How to publish as a GitHub Page

1. Push your project to a GitHub repository.
2. Build the project: `npm run build`
3. Deploy: `npm run deploy`
4. In your repo settings, go to **Pages** and set the source to the `gh-pages` branch.
5. Your app will be available at `https://your-username.github.io/your-repo-name/`

If your repo name is not the root, set the `base` in `vite.config.js`:
```js
export default {
  base: '/your-repo-name/'
}
```

## License

MIT

---

Made with [Three.js](https://threejs.org/) and