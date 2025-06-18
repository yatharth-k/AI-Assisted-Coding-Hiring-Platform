
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseFileUploadOptions {
  bucket: 'profile-pictures' | 'code-snapshots';
  maxSizeBytes?: number;
  allowedTypes?: string[];
}

export const useFileUpload = ({ bucket, maxSizeBytes = 5 * 1024 * 1024, allowedTypes = ['image/*'] }: UseFileUploadOptions) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const uploadFile = async (file: File, fileName?: string): Promise<string | null> => {
    try {
      setUploading(true);
      setProgress(0);

      // Validate file size
      if (file.size > maxSizeBytes) {
        throw new Error(`File size must be less than ${maxSizeBytes / (1024 * 1024)}MB`);
      }

      // Validate file type
      const fileType = file.type;
      const isValidType = allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          return fileType.startsWith(type.slice(0, -1));
        }
        return fileType === type;
      });

      if (!isValidType) {
        throw new Error(`File type ${fileType} is not allowed`);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Generate file path: userId/fileName or userId/timestamp-originalName
      const fileExtension = file.name.split('.').pop();
      const uploadFileName = fileName || `${Date.now()}-${file.name}`;
      const filePath = `${user.id}/${uploadFileName}`;

      // Upload file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: bucket === 'profile-pictures' // Allow overwriting profile pictures
        });

      if (error) {
        throw error;
      }

      setProgress(100);

      // Get public URL for profile pictures, or signed URL for private files
      let publicUrl: string;
      if (bucket === 'profile-pictures') {
        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);
        publicUrl = publicUrlData.publicUrl;
      } else {
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from(bucket)
          .createSignedUrl(filePath, 3600); // 1 hour expiry
        if (signedUrlError) throw signedUrlError;
        publicUrl = signedUrlData.signedUrl;
      }

      toast({
        title: "Success",
        description: "File uploaded successfully!",
      });

      return publicUrl;
    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const deleteFile = async (filePath: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "File deleted successfully!",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Delete Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    uploadFile,
    deleteFile,
    uploading,
    progress
  };
};
