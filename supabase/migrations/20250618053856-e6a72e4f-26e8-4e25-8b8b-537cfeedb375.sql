
-- Create storage buckets for different file types
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('profile-pictures', 'profile-pictures', true),
  ('code-snapshots', 'code-snapshots', false);

-- Create RLS policies for profile pictures bucket (public access)
CREATE POLICY "Public can view profile pictures" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can upload their own profile pictures" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile pictures" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile pictures" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create RLS policies for code snapshots bucket (private access)
CREATE POLICY "Users can view their own code snapshots" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'code-snapshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own code snapshots" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'code-snapshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own code snapshots" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'code-snapshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own code snapshots" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'code-snapshots' AND auth.uid()::text = (storage.foldername(name))[1]);
