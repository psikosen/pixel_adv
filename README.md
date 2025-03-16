# Pixel Adventure - Sprite Generation Interface

A web-based sprite generation and animation tool built with Next.js and React.

![Pixel Adventure Screenshot](/public/screenshot.png)

## Features

- **Three-panel Layout**: Intuitive interface with sprite sets, animation preview, and frame management
- **Sprite Animation**: Create and preview pixel art animations with adjustable speed
- **Frame Management**: Add, remove, and reorder frames in your sprite sets
- **Export Options**: Export animations as GIFs or sprite sheets
- **Project Management**: Save and load your sprite projects

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- pnpm (recommended) or npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/pixel-adventure.git
cd pixel-adventure
```

2. Install dependencies
```bash
pnpm install
```

3. Run the development server
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Creating Sprite Sets

1. Use the control panel to select style, object, action, and background
2. Click "Generate Frames" to create a new sprite set
3. View your sprite sets in the left sidebar

### Managing Frames

1. Select a sprite set from the left sidebar
2. View and edit individual frames in the right sidebar
3. Reorder frames using the up/down arrows
4. Delete frames using the trash icon
5. Add new frames with the "Add Frame" button

### Previewing Animations

1. Use the play/pause button to control animation playback
2. Adjust animation speed with the speed slider
3. View current frame information below the preview

### Exporting Your Work

1. Use the "Export Options" button in the right sidebar
2. Choose between GIF or sprite sheet export
3. Configure export settings in the dialog
4. Click "Export" to download your animation

## Technologies Used

- **Next.js**: React framework for server-rendered applications
- **React**: JavaScript library for building user interfaces
- **Tailwind CSS**: Utility-first CSS framework
- **React Konva**: Canvas rendering library for React
- **GIF.js**: JavaScript GIF encoder

## Project Structure

- `src/app`: Next.js application pages
- `src/components`: React components organized by function
  - `layout`: Layout components (Header, MainLayout)
  - `sprites`: Sprite management components (SpriteSetList, FrameList)
  - `animation`: Animation components (AnimationPreview, AnimationControls)
  - `ui`: UI components (ControlPanel, ExportDialog)
- `src/lib`: Utility functions
  - `animation`: Animation utilities (animationUtils, frameManager, exportUtils)
- `public`: Static assets

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by pixel art animation tools and sprite editors
- Uses the glassmorphic UI design pattern for a modern look
