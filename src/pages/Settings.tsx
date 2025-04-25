
import { useState, useEffect } from "react";
import Dashboard from "@/components/layout/Dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>({ name: "", email: "" });
  const [password, setPassword] = useState({ current: "", new: "", confirm: "" });
  const [currency, setCurrency] = useState("IDR");
  const [language, setLanguage] = useState("en");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      // First try to get name from user metadata
      let name = user.user_metadata?.full_name || '';
      let email = user.email || '';
      
      // Then try to get profile data from profiles table
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        
        if (!error && data) {
          // If we found a profile, use its data
          name = data.name || name;
        } else {
          console.log("No profile found for user, creating one");
          // If no profile exists yet, create one with metadata
          const { error: insertError } = await supabase
            .from("profiles")
            .insert([{ 
              id: user.id, 
              name: name || email.split('@')[0],
              role: 'Member'
            }]);
          
          if (insertError) {
            console.error("Failed to create profile:", insertError);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
      
      setProfile({
        name: name || email.split('@')[0],
        email: email,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (e: any) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };
  
  const handleSaveProfile = async () => {
    if (!user) {
      toast.error("You need to be logged in to perform this action");
      return;
    }
    
    try {
      // First update the profile in the database
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ name: profile.name })
        .eq("id", user.id);
      
      if (profileError) throw profileError;
      
      // Also update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { full_name: profile.name }
      });
      
      if (metadataError) {
        console.warn("Could not update user metadata:", metadataError);
      }
      
      // Handle email change if needed
      if (profile.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ 
          email: profile.email 
        });
        
        if (emailError) throw emailError;
        toast.success("Email update initiated. Please check your inbox for verification.");
      } else {
        toast.success("Profile updated successfully!");
      }
    } catch (error: any) {
      toast.error("Failed to update profile: " + error.message);
    }
  };
  
  const handlePasswordChange = (e: any) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };
  
  const handleSavePassword = async () => {
    if (!user) {
      toast.error("You need to be logged in to perform this action");
      return;
    }
    
    if (password.new !== password.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    
    if (!password.current || !password.new) {
      toast.error("Please fill in all password fields");
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: password.new 
      });
      
      if (error) throw error;
      
      toast.success("Password changed successfully!");
      setPassword({ current: "", new: "", confirm: "" });
    } catch (error: any) {
      toast.error("Failed to change password: " + error.message);
    }
  };
  
  const handleSavePreferences = async () => {
    toast.success("Preferences updated successfully!");
  };

  // Function to get user initials from name
  const getUserInitials = (name: string): string => {
    if (!name) return 'U';
    
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0 || parts[0] === '') return 'U';
    
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <Dashboard>
      <div className="max-w-3xl mx-auto space-y-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card className="shadow-md">
              <CardHeader className="bg-gradient-to-br from-background to-muted/30">
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {isLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                    <p>Loading profile...</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={user?.user_metadata?.avatar_url || ""} alt={profile.name} />
                        <AvatarFallback className="bg-primary text-2xl">
                          {getUserInitials(profile.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-lg">{profile.name || 'User'}</h3>
                        <p className="text-sm text-muted-foreground">{profile.email || user?.email || 'No email'}</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Change Photo
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input 
                          id="name" 
                          name="name" 
                          value={profile.name || ""} 
                          onChange={handleProfileChange} 
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          value={profile.email || user?.email || ""} 
                          onChange={handleProfileChange}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Changing your email will require verification.
                        </p>
                      </div>
                      <Button onClick={handleSaveProfile} className="mt-2">Save Profile</Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card className="shadow-md">
              <CardHeader className="bg-gradient-to-br from-background to-muted/30">
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Update your password</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    name="current"
                    type="password"
                    value={password.current}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    name="new"
                    type="password"
                    value={password.new}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    name="confirm"
                    type="password"
                    value={password.confirm}
                    onChange={handlePasswordChange}
                  />
                </div>
                <Button onClick={handleSavePassword} className="mt-2">Change Password</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences">
            <Card className="shadow-md">
              <CardHeader className="bg-gradient-to-br from-background to-muted/30">
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Manage your app preferences</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IDR">Indonesian Rupiah (Rp)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="GBP">British Pound (£)</SelectItem>
                      <SelectItem value="JPY">Japanese Yen (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="id">Bahasa Indonesia</SelectItem>
                      <SelectItem value="zh">中文 (Chinese)</SelectItem>
                      <SelectItem value="es">Español (Spanish)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={handleSavePreferences}>Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Dashboard>
  );
}
