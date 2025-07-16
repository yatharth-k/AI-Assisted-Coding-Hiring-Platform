
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  onImageChange?: (newImageUrl: string | null) => void;
  size?: 'sm' | 'md' | 'lg';
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentImageUrl,
  onImageChange,
  size = 'md'
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  
  const { uploadFile, deleteFile, uploading, progress } = useFileUpload({
    bucket: 'profile-pictures',
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  });

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32'
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Upload file
    const fileName = `profile-picture.${file.name.split('.').pop()}`;
    const uploadedUrl = await uploadFile(file, fileName);
    
    // Clean up object URL
    URL.revokeObjectURL(objectUrl);
    
    if (uploadedUrl) {
      setPreviewUrl(uploadedUrl);
      onImageChange?.(uploadedUrl);
    } else {
      // Reset preview on upload failure
      setPreviewUrl(currentImageUrl || null);
    }
  };

  const handleRemoveImage = async () => {
    if (!user) return;
    
    if (currentImageUrl) {
      const filePath = `${user.id}/profile-picture.jpg`; // Assuming jpg extension
      await deleteFile(filePath);
    }
    
    setPreviewUrl(null);
    onImageChange?.(null);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={previewUrl || undefined} alt="Profile picture" />
          <AvatarFallback className="bg-slate-700 text-white">
            {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || 
             user?.email?.charAt(0)?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        
        {!uploading && (
          <Button
            variant="outline"
            size="sm"
            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-white border-2 border-white text-purple-700"
            onClick={triggerFileInput}
          >
            <Camera className="h-4 w-4" />
          </Button>
        )}
      </div>

      {uploading && (
        <div className="w-full max-w-xs">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-slate-400 text-center mt-1">Uploading... {progress}%</p>
        </div>
      )}

      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={triggerFileInput}
          disabled={uploading}
          className="text-slate-300 border-slate-600"
        >
          <Upload className="h-4 w-4 mr-2" />
          {previewUrl ? 'Change' : 'Upload'}
        </Button>
        
        {previewUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemoveImage}
            disabled={uploading}
            className="text-red-400 border-red-600 hover:bg-red-600 hover:text-white"
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-slate-400 text-center max-w-xs">
        Upload a profile picture (JPG, PNG, WebP). Max size: 5MB.
      </p>
    </div>
  );
};

export default ProfilePictureUpload;
