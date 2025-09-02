import { useState } from 'react';

interface ImageViewerProps {
  imageUrl: string;
  alt: string;
  className?: string;
}

const ImageViewer = ({ imageUrl, alt, className = '' }: ImageViewerProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Image clicked:', imageUrl);
    setIsModalOpen(true);
  };

  const handleCloseModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(false);
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!imageUrl || imageError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center rounded-lg ${className}`}>
        <div className="text-center p-4">
          <svg
            className="mx-auto h-8 w-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xs text-gray-500 mt-1">Tidak ada gambar</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Thumbnail */}
      <div 
        className={`relative cursor-pointer group overflow-hidden rounded-lg ${className}`}
        onClick={handleImageClick}
      >
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
          <svg
            className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
            />
          </svg>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={handleCloseModal}
        >
          <div 
            className="relative max-w-4xl max-h-full"
            onClick={handleModalClick}
          >
            <button
              onClick={handleCloseModal}
              className="absolute -top-4 -right-4 z-10 bg-white text-gray-800 rounded-full p-2 hover:bg-gray-100 transition-all shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={imageUrl}
              alt={alt}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onError={() => setImageError(true)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ImageViewer;
