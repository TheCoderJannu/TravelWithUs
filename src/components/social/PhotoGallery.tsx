import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Camera, Heart, Star, Upload, X } from 'lucide-react';

interface Photo {
  id: string;
  user_id: string;
  storage_path: string;
  caption: string | null;
  total_likes: number;
  avg_rating: number;
  upload_date: string;
}

export function PhotoGallery() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadCaption, setUploadCaption] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('upload_date', { ascending: false });

    if (!error && data) {
      setPhotos(data);
    }
    setLoading(false);
  };

  const handlePhotoUpload = async () => {
    if (!user) return;

    const photoUrls = [
      'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg',
      'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg',
      'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg',
      'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg',
      'https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg',
    ];

    const randomPhoto = photoUrls[Math.floor(Math.random() * photoUrls.length)];

    const { error } = await supabase.from('photos').insert({
      user_id: user.id,
      storage_path: randomPhoto,
      caption: uploadCaption,
    });

    if (!error) {
      setUploadCaption('');
      setShowUpload(false);
      loadPhotos();
    }
  };

  const handleRating = async (photoId: string, ratingValue: number) => {
    if (!user) return;

    const { error } = await supabase.from('photo_ratings').insert({
      photo_id: photoId,
      user_id: user.id,
      rating: ratingValue,
    });

    if (!error) {
      loadPhotos();
      setSelectedPhoto(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
          <Camera className="w-8 h-8 mr-3 text-blue-600" />
          Travel Gallery
        </h2>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          <Upload className="w-5 h-5" />
          <span>Upload Photo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer group"
            onClick={() => setSelectedPhoto(photo)}
          >
            <div className="relative h-64 overflow-hidden">
              <img
                src={photo.storage_path}
                alt={photo.caption || 'Travel photo'}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition" />
            </div>

            <div className="p-4">
              {photo.caption && (
                <p className="text-gray-700 text-sm mb-3 line-clamp-2">{photo.caption}</p>
              )}

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center text-red-500">
                    <Heart className="w-4 h-4 mr-1 fill-red-500" />
                    {photo.total_likes}
                  </span>
                  <span className="flex items-center text-yellow-500">
                    <Star className="w-4 h-4 mr-1 fill-yellow-500" />
                    {photo.avg_rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Upload Photo</h3>
              <button onClick={() => setShowUpload(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
              <textarea
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Share your travel story..."
              />
            </div>

            <p className="text-sm text-gray-500 mb-6">A sample travel photo will be added to your gallery.</p>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowUpload(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePhotoUpload}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Rate this photo</h3>
              <button onClick={() => setSelectedPhoto(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <img
              src={selectedPhoto.storage_path}
              alt={selectedPhoto.caption || 'Photo'}
              className="w-full h-96 object-cover rounded-lg mb-4"
            />

            {selectedPhoto.caption && (
              <p className="text-gray-700 mb-4">{selectedPhoto.caption}</p>
            )}

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <span className="flex items-center text-red-500">
                  <Heart className="w-5 h-5 mr-1 fill-red-500" />
                  {selectedPhoto.total_likes} likes
                </span>
                <span className="flex items-center text-yellow-500">
                  <Star className="w-5 h-5 mr-1 fill-yellow-500" />
                  {selectedPhoto.avg_rating.toFixed(1)} rating
                </span>
              </div>
            </div>

            <div className="border-t pt-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Rate this photo:</p>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleRating(selectedPhoto.id, value)}
                    className="p-2 hover:scale-110 transition"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        value <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                      }`}
                      onMouseEnter={() => setRating(value)}
                      onMouseLeave={() => setRating(0)}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
