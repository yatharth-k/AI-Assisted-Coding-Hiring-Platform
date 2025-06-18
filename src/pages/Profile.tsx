
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Settings, FileCode, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';
import CodeSnapshotUpload from '@/components/CodeSnapshotUpload';

interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  email: string;
  bio: string | null;
  country: string | null;
  profile_picture_url: string | null;
  total_xp: number;
  current_rank: number;
  problems_solved: number;
  contests_participated: number;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    country: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        username: data.username || '',
        bio: data.bio || '',
        country: data.country || ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch profile data",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          bio: formData.bio,
          country: formData.country,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      fetchProfile(); // Refresh profile data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = async (newImageUrl: string | null) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          profile_picture_url: newImageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, profile_picture_url: newImageUrl } : null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update profile picture",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <p className="text-white">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Profile</h1>
        
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="general" className="text-white data-[state=active]:bg-purple-600">
              <User className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-white data-[state=active]:bg-purple-600">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="files" className="text-white data-[state=active]:bg-purple-600">
              <FileCode className="h-4 w-4 mr-2" />
              Files
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Picture Section */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Profile Picture</CardTitle>
                  <CardDescription className="text-slate-400">
                    Upload or change your profile picture
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <ProfilePictureUpload
                    currentImageUrl={profile?.profile_picture_url || undefined}
                    onImageChange={handleProfilePictureChange}
                    size="lg"
                  />
                </CardContent>
              </Card>

              {/* Profile Info Section */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Profile Information</CardTitle>
                    <CardDescription className="text-slate-400">
                      Update your personal information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="full_name" className="text-white">Full Name</Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => handleInputChange('full_name', e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="username" className="text-white">Username</Label>
                        <Input
                          id="username"
                          value={formData.username}
                          onChange={(e) => handleInputChange('username', e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        value={user.email || ''}
                        className="bg-slate-700 border-slate-600 text-slate-400"
                        disabled
                      />
                      <p className="text-xs text-slate-400 mt-1">Email cannot be changed here</p>
                    </div>

                    <div>
                      <Label htmlFor="country" className="text-white">Country</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="Enter your country"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="bio" className="text-white">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="Tell us about yourself..."
                        rows={4}
                        disabled={loading}
                      />
                    </div>

                    <Button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Stats Section */}
                {profile && (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Your Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">{profile.total_xp}</div>
                          <div className="text-sm text-slate-400">Total XP</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-cyan-400">#{profile.current_rank}</div>
                          <div className="text-sm text-slate-400">Global Rank</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{profile.problems_solved}</div>
                          <div className="text-sm text-slate-400">Problems Solved</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-400">{profile.contests_participated}</div>
                          <div className="text-sm text-slate-400">Contests</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Account Settings</CardTitle>
                <CardDescription className="text-slate-400">
                  Manage your account preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">Settings panel coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files">
            <CodeSnapshotUpload />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
