import React, { useRef, useEffect } from 'react';
import { Image as KonvaImage, ImageConfig } from 'react-konva';
import Konva from 'konva';

interface PixelPerfectImageProps extends ImageConfig {
  image: HTMLImageElement;
  pixelSize?: number;
  containerWidth?: number;
  containerHeight?: number;
}

/**
 * A component that renders pixel art images with proper scaling and no anti-aliasing
 */
const PixelPerfectImage: React.FC<PixelPerfectImageProps> = ({
  image,
  pixelSize = 3,
  containerWidth = 300,
  containerHeight = 300,
  ...props
}) => {
  const imageRef = useRef<Konva.Image>(null);
  
  useEffect(() => {
    if (imageRef.current) {
      // Disable image smoothing to maintain pixel crispness
      const canvas = imageRef.current.getCanvas()._canvas;
      const context = canvas.getContext('2d');
      
      if (context) {
        context.imageSmoothingEnabled = false;
        context.webkitImageSmoothingEnabled = false;
        context.mozImageSmoothingEnabled = false;
        context.msImageSmoothingEnabled = false;
        context.oImageSmoothingEnabled = false;
      }
    }
  }, [image]);

  // Calculate the scaling to fit the image within the container
  const calculateScaling = () => {
    if (!image) return { scale: pixelSize, x: 0, y: 0 };
    
    // Calculate the scaling factor to fit within container
    const scaleX = containerWidth / image.width;
    const scaleY = containerHeight / image.height;
    const scale = Math.min(scaleX, scaleY) * 0.8; // 80% of the container size for padding
    
    // Calculate centered position
    const x = (containerWidth - (image.width * scale)) / 2;
    const y = (containerHeight - (image.height * scale)) / 2;
    
    return { scale, x, y };
  };
  
  const { scale, x, y } = calculateScaling();
  
  return (
    <KonvaImage
      ref={imageRef}
      image={image}
      width={image ? image.width * scale : 0}
      height={image ? image.height * scale : 0}
      x={x}
      y={y}
      imageSmoothingEnabled={false}
      {...props}
    />
  );
};

export default PixelPerfectImage;
