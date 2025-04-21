
import { useState } from "react";
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

const userMock = {
  name: "Alice Tan",
  email: "alice@demo.com"
};

export default function Settings() {
  const [profile, setProfile] = useState({ ...userMock });
  const [password, setPassword] = useState({ current: "", new: "", confirm: "" });
  const [currency, setCurrency] = useState("IDR");
  const [language, setLanguage] = useState("en");

  const handleProfileChange = (e: any) => setProfile({ ...profile, [e.target.name]: e.target.value });
  
  const handleSaveProfile = () => {
    // In a real app with Supabase:
    // supabase
    //   .from('profiles')
    //   .update({ name: profile.name })
    //   .eq('email', profile.email)
    //   .then(({ error }) => {
    //     if (!error) toast.success("Profile updated!");
    //     else toast.error("Failed to update profile");
    //   });
    toast.success("Profile updated!");
  };
  
  const handlePasswordChange = (e: any) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };
  
  const handleSavePassword = () => {
    if (password.new !== password.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    
    if (!password.current || !password.new) {
      toast.error("Please fill in all password fields");
      return;
    }
    
    // In a real app with Supabase:
    // supabase.auth.updateUser({
    //   password: password.new
    // }).then(({ error }) => {
    //   if (!error) {
    //     toast.success("Password changed!");
    //     setPassword({ current: "", new: "", confirm: "" });
    //   } else {
    //     toast.error("Failed to change password");
    //   }
    // });
    toast.success("Password changed!");
    setPassword({ current: "", new: "", confirm: "" });
  };
  
  const handleSavePreferences = () => {
    toast.success("Preferences updated!");
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
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="" alt={profile.name} />
                    <AvatarFallback className="bg-primary text-2xl">
                      {profile.name.split(' ').map(name => name[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-lg">{profile.name}</h3>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
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
                      value={profile.name} 
                      onChange={handleProfileChange} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      value={profile.email} 
                      onChange={handleProfileChange}
                      disabled
                      className="bg-muted/50"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Email cannot be changed. Contact support for assistance.
                    </p>
                  </div>
                  <Button onClick={handleSaveProfile} className="mt-2">Save Profile</Button>
                </div>
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
