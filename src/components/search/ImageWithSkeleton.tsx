import React, { useState } from 'react';

interface ImageWithSkeletonProps {
  src: string;
  alt: string;
}

const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({ src, alt }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="card-image">
      {!isLoaded && <div className="image-skeleton" />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        className={isLoaded ? 'loaded' : ''}
        style={{ display: hasError ? 'none' : 'block' }}
      />
      {hasError && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#999',
            fontSize: '0.9rem',
          }}
        >
          이미지 로드 실패
        </div>
      )}
    </div>
  );
};

export default ImageWithSkeleton;


