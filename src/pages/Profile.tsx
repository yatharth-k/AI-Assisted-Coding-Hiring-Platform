
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
import { motion, useReducedMotion } from 'framer-motion';
import "@fontsource/manrope/700.css";

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

function SettingsPanel() {
  const [theme, setTheme] = useState('auto');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1200);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-purple-400 mb-2">Theme</h2>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-white">
            <input type="radio" name="theme" value="light" checked={theme === 'light'} onChange={() => setTheme('light')} />
            Light
          </label>
          <label className="flex items-center gap-2 text-white">
            <input type="radio" name="theme" value="dark" checked={theme === 'dark'} onChange={() => setTheme('dark')} />
            Dark
          </label>
          <label className="flex items-center gap-2 text-white">
            <input type="radio" name="theme" value="auto" checked={theme === 'auto'} onChange={() => setTheme('auto')} />
            Auto
          </label>
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-purple-400 mb-2">Notification Preferences</h2>
        <label className="flex items-center gap-2 text-white mb-2">
          <input type="checkbox" checked={emailNotifications} onChange={() => setEmailNotifications(v => !v)} />
          Email Notifications
        </label>
        <label className="flex items-center gap-2 text-white">
          <input type="checkbox" checked={pushNotifications} onChange={() => setPushNotifications(v => !v)} />
          Push Notifications
        </label>
      </div>
      <button
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded transition-colors"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  );
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

  const shouldReduceMotion = useReducedMotion();

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
    } catch (error: unknown) {
      const errMsg = (error instanceof Error) ? error.message : (typeof error === 'object' && error && 'message' in error) ? (error as { message: string }).message : 'Unknown error';
      toast({
        title: "Error",
        description: errMsg,
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
    } catch (error: unknown) {
      const errMsg = (error instanceof Error) ? error.message : (typeof error === 'object' && error && 'message' in error) ? (error as { message: string }).message : 'Unknown error';
      toast({
        title: "Error",
        description: errMsg,
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
    } catch (error: unknown) {
      const errMsg = (error instanceof Error) ? error.message : (typeof error === 'object' && error && 'message' in error) ? (error as { message: string }).message : 'Unknown error';
      toast({
        title: "Error",
        description: errMsg,
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e1b4b] flex items-center justify-center">
        <p className="text-white font-manrope text-lg">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e1b4b] p-4 md:p-8 flex flex-col items-center justify-start font-manrope" style={{ fontFamily: 'Manrope, Poppins, Inter, sans-serif' }}>
      {/* Animated floating shapes */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none select-none">
        <div className="absolute left-[8%] top-[18%] w-56 h-56 rounded-full bg-purple-400/20 blur-3xl animate-float-slow" />
        <div className="absolute right-[10%] top-[8%] w-40 h-40 rounded-full bg-cyan-400/20 blur-2xl animate-float-slower" />
        <div className="absolute left-[45%] bottom-[10%] w-44 h-44 rounded-full bg-indigo-400/20 blur-2xl animate-float-slowest" />
      </div>
      <motion.h1
        initial={shouldReduceMotion ? false : { opacity: 0, y: 32 }}
        animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-3xl md:text-4xl font-extrabold text-white mb-8 drop-shadow-xl mt-8 text-center"
      >
        Profile
      </motion.h1>
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 32 }}
        animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
        className="w-full max-w-5xl mx-auto"
      >
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-xl rounded-2xl mb-8 border border-white/20 shadow-lg">
            <TabsTrigger value="general" className="text-white data-[state=active]:bg-gradient-to-tr data-[state=active]:from-purple-500 data-[state=active]:to-cyan-400 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold font-manrope rounded-2xl transition-all">
              <User className="h-5 w-5 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-white data-[state=active]:bg-gradient-to-tr data-[state=active]:from-purple-500 data-[state=active]:to-cyan-400 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold font-manrope rounded-2xl transition-all">
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="files" className="text-white data-[state=active]:bg-gradient-to-tr data-[state=active]:from-purple-500 data-[state=active]:to-cyan-400 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold font-manrope rounded-2xl transition-all">
              <FileCode className="h-5 w-5 mr-2" />
              Files
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Picture Section */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 32 }}
                animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
              >
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-white font-manrope text-xl">Profile Picture</CardTitle>
                    <CardDescription className="text-indigo-100 font-manrope">
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
              </motion.div>
              {/* Profile Info Section */}
              <div className="lg:col-span-2 space-y-8">
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 32 }}
                  animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: 'easeOut', delay: 0.18 }}
                >
                  <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-white font-manrope text-xl">Profile Information</CardTitle>
                      <CardDescription className="text-indigo-100 font-manrope">
                        Update your personal information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="full_name" className="text-white text-lg font-semibold font-manrope">Full Name</Label>
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => handleInputChange('full_name', e.target.value)}
                            className="bg-white/20 border-white/30 text-white placeholder:text-indigo-200 rounded-xl px-4 py-3 text-base font-manrope focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                            disabled={loading}
                          />
                        </div>
                        <div>
                          <Label htmlFor="username" className="text-white text-lg font-semibold font-manrope">Username</Label>
                          <Input
                            id="username"
                            value={formData.username}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                            className="bg-white/20 border-white/30 text-white placeholder:text-indigo-200 rounded-xl px-4 py-3 text-base font-manrope focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                            disabled={loading}
                          />
                        </div>
                      </div>
                      <Label htmlFor="email" className="text-white text-lg font-semibold font-manrope">Email</Label>
                      <Input
                        id="email"
                        value={user.email || ''}
                        className="bg-white/20 border-white/30 text-indigo-200 rounded-xl px-4 py-3 text-base font-manrope cursor-not-allowed"
                        disabled
                      />
                      <p className="text-xs text-indigo-200 mt-1 font-manrope">Email cannot be changed here</p>
                      <Label htmlFor="country" className="text-white text-lg font-semibold font-manrope">Country</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="bg-white/20 border-white/30 text-white placeholder:text-indigo-200 rounded-xl px-4 py-3 text-base font-manrope focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                        placeholder="Enter your country"
                        disabled={loading}
                      />
                      <Label htmlFor="bio" className="text-white text-lg font-semibold font-manrope">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        className="bg-white/20 border-white/30 text-white placeholder:text-indigo-200 rounded-xl px-4 py-3 text-base font-manrope focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                        placeholder="Tell us about yourself..."
                        rows={4}
                        disabled={loading}
                      />
                      <motion.button
                        whileHover={shouldReduceMotion ? {} : { scale: 1.04, boxShadow: '0 0 32px 0 #38bdf8aa' }}
                        whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="w-full py-3 mt-2 rounded-2xl bg-gradient-to-tr from-purple-500 to-cyan-400 text-white text-lg font-bold font-manrope shadow-xl focus:outline-none focus:ring-4 focus:ring-cyan-300 transition-all duration-200 relative overflow-hidden group"
                      >
                        <span className="relative z-10 flex items-center justify-center"><Save className="h-5 w-5 mr-2" />{loading ? 'Saving...' : 'Save Changes'}</span>
                        <span className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-purple-400/30 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </motion.button>
                    </CardContent>
                  </Card>
                </motion.div>
                {/* Stats Section */}
                {profile && (
                  <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 32 }}
                    animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: 0.22 }}
                  >
                    <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-white font-manrope text-xl">Your Stats</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-400">{profile.total_xp}</div>
                            <div className="text-sm text-indigo-100">Total XP</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-cyan-400">#{profile.current_rank}</div>
                            <div className="text-sm text-indigo-100">Global Rank</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">{profile.problems_solved}</div>
                            <div className="text-sm text-indigo-100">Problems Solved</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-400">{profile.contests_participated}</div>
                            <div className="text-sm text-indigo-100">Contests</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 32 }}
              animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white font-manrope text-xl">Account Settings</CardTitle>
                  <CardDescription className="text-indigo-100 font-manrope">
                    Manage your account preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SettingsPanel />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="files">
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 32 }}
              animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
            >
              <CodeSnapshotUpload />
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Profile;
