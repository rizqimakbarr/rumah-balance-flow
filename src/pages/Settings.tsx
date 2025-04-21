import { useState } from "react";
import Dashboard from "@/components/layout/Dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const userMock = {
  name: "Alice Tan",
  email: "alice@demo.com"
};

export default function Settings() {
  const [profile, setProfile] = useState({ ...userMock });
  const [password, setPassword] = useState("");
  const [currency, setCurrency] = useState("IDR");

  const handleProfileChange = (e: any) => setProfile({ ...profile, [e.target.name]: e.target.value });
  const handleSaveProfile = () => toast.success("Profile updated!");
  const handlePasswordChange = (e: any) => setPassword(e.target.value);
  const handleSavePassword = () => {
    toast.success("Password changed!");
    setPassword("");
  };
  const handleSaveCurrency = () => toast.success("Currency updated!");

  return (
    <Dashboard>
      <div className="max-w-lg mx-auto w-full space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" value={profile.name} onChange={handleProfileChange} />
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" value={profile.email} onChange={handleProfileChange} />
            <Button onClick={handleSaveProfile}>Save Profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
            />
            <Button onClick={handleSavePassword}>Change Password</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Currency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IDR">IDR (Rp)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSaveCurrency}>Save Currency</Button>
          </CardContent>
        </Card>
      </div>
    </Dashboard>
  );
}
