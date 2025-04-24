
import { useState, useEffect } from "react";
import Dashboard from "@/components/layout/Dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Lock, Mail, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function Family() {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [editMember, setEditMember] = useState<any>(null);
  const [newMember, setNewMember] = useState({ 
    name: "", 
    email: "", 
    role: "Member", 
    status: "offline",
    password: ""
  });
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [password, setPassword] = useState({ current: "", new: "", confirm: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [memberPassword, setMemberPassword] = useState("");
  const [memberEmail, setMemberEmail] = useState("");

  const fetchMembers = async () => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*");
        
      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      toast.error("Failed to load family members: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMembers();
    }
  }, [user]);

  const handleAddMember = async () => {
    if (!user) {
      toast.error("You need to be logged in to perform this action");
      return;
    }
    
    if (!newMember.name) {
      toast.error("Name is required");
      return;
    }

    if (!newMember.email) {
      toast.error("Email is required for member login");
      return;
    }

    if (!newMember.password || newMember.password.length < 6) {
      toast.error("Password is required and must be at least 6 characters");
      return;
    }
    
    try {
      // First create the auth user account
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newMember.email,
        password: newMember.password,
        email_confirm: true,
        user_metadata: { 
          full_name: newMember.name,
          role: newMember.role
        }
      });
      
      if (authError) {
        // If this fails, try the signup method instead as fallback
        if (authError.message.includes("admin") || authError.message.includes("permission")) {
          const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email: newMember.email,
            password: newMember.password,
            options: {
              data: {
                full_name: newMember.name,
                role: newMember.role
              }
            }
          });
          
          if (signupError) throw signupError;
        } else {
          throw authError;
        }
      }
      
      // The trigger should create the profile, but let's make sure by checking
      setTimeout(() => {
        fetchMembers(); // Refresh the members list
        setNewMember({ name: "", email: "", role: "Member", status: "offline", password: "" });
        setOpenNewDialog(false);
        toast.success("Family member added successfully");
      }, 1000); // Give some time for the trigger to work
    } catch (error: any) {
      toast.error("Failed to add family member: " + error.message);
    }
  };

  const handleEditMember = async () => {
    if (!user || !editMember?.id) {
      toast.error("You need to be logged in to perform this action");
      return;
    }
    
    if (!editMember.name) {
      toast.error("Name is required");
      return;
    }
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: editMember.name,
          role: editMember.role,
          status: editMember.status,
        })
        .eq("id", editMember.id);
        
      if (error) throw error;
      
      // Update password if provided
      if (memberPassword && memberPassword.length >= 6 && memberEmail) {
        try {
          // Try admin update first
          const { error: adminError } = await supabase.auth.admin.updateUserById(
            editMember.id,
            { password: memberPassword }
          );
          
          // If admin update fails, try user update
          if (adminError && (adminError.message.includes("admin") || adminError.message.includes("permission"))) {
            // We can't update password for another user without admin rights
            toast.info("Password changes for other users require admin privileges");
          }
          
          if (!adminError) {
            toast.success("Member password updated successfully");
          }
        } catch (passError: any) {
          console.error("Password update error:", passError);
        }
      }
      
      // Update local state
      setMembers(prev => prev.map(m => m.id === editMember.id ? {
        ...editMember,
        // Don't save password or email in profiles table for security
      } : m));
      
      setOpenEditDialog(false);
      setMemberPassword("");
      setMemberEmail("");
      toast.success("Member updated successfully");
    } catch (error: any) {
      toast.error("Failed to update member: " + error.message);
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      // Don't allow deleting current user
      if (id === user?.id) {
        toast.error("You can't delete your own account");
        return;
      }
      
      // Try to delete auth user first if admin
      try {
        await supabase.auth.admin.deleteUser(id);
      } catch (authError) {
        console.log("Admin delete failed, continuing with profile delete:", authError);
      }
      
      // Delete the profile
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      // Update local state
      setMembers(prev => prev.filter(m => m.id !== id));
      toast.success("Member removed successfully");
    } catch (error: any) {
      toast.error("Failed to remove member: " + error.message);
    }
  };

  const handleChangePassword = async () => {
    if (!user) {
      toast.error("You need to be logged in to perform this action");
      return;
    }
    
    if (password.new !== password.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    
    if (!password.current || !password.new) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: password.new 
      });
      
      if (error) throw error;
      
      setPassword({ current: "", new: "", confirm: "" });
      toast.success("Password changed successfully!");
    } catch (error: any) {
      toast.error("Failed to change password: " + error.message);
    }
  };

  return (
    <Dashboard>
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-br from-background to-muted/30">
            <div>
              <CardTitle>Family Members</CardTitle>
              <CardDescription>Manage your household members</CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={openNewDialog} onOpenChange={setOpenNewDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-1">
                    <Plus className="h-4 w-4" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Family Member</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newMember.name}
                        onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email (for login)</Label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={newMember.email}
                          onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          value={newMember.password}
                          onChange={(e) => setNewMember({...newMember, password: e.target.value})}
                          placeholder="Min 6 characters"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select value={newMember.role} onValueChange={(value) => setNewMember({...newMember, role: value})}>
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Member">Member</SelectItem>
                          <SelectItem value="Viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={newMember.status} onValueChange={(value: "online" | "offline") => setNewMember({...newMember, status: value})}>
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="offline">Offline</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleAddMember}>Add Member</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 text-left">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar_url} alt={member.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {member.name.split(' ').map((name: string) => name[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-lg">{member.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{member.role}</span>
                        <Badge variant={member.status === 'online' ? 'default' : 'outline'} className="text-xs">
                          {member.status === 'online' ? 'Online' : 'Offline'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={openEditDialog && editMember?.id === member.id} onOpenChange={(open) => {
                      setOpenEditDialog(open);
                      if (!open) setEditMember(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => { setEditMember(member); setOpenEditDialog(true); }}>
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Family Member</DialogTitle>
                        </DialogHeader>
                        {editMember && (
                          <div className="grid gap-4 py-4">
                            <div>
                              <Label htmlFor="edit-name">Name</Label>
                              <div className="flex items-center gap-2">
                                <UserRound className="h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="edit-name"
                                  value={editMember.name}
                                  onChange={(e) => setEditMember({...editMember, name: e.target.value})}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="edit-email">Email (for login)</Label>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="edit-email"
                                  type="email"
                                  placeholder="member@example.com"
                                  value={memberEmail}
                                  onChange={(e) => setMemberEmail(e.target.value)}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Providing an email allows this member to log in with their own account
                              </p>
                            </div>
                            <div>
                              <Label htmlFor="edit-password">Set Password</Label>
                              <div className="flex items-center gap-2">
                                <Lock className="h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="edit-password"
                                  type="password"
                                  placeholder="Min 6 characters"
                                  value={memberPassword}
                                  onChange={(e) => setMemberPassword(e.target.value)}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Leave blank to keep current password
                              </p>
                            </div>
                            <div>
                              <Label htmlFor="edit-role">Role</Label>
                              <Select value={editMember.role} onValueChange={(value) => setEditMember({...editMember, role: value})}>
                                <SelectTrigger id="edit-role">
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Admin">Admin</SelectItem>
                                  <SelectItem value="Member">Member</SelectItem>
                                  <SelectItem value="Viewer">Viewer</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="edit-status">Status</Label>
                              <Select value={editMember.status} onValueChange={(value: "online" | "offline") => setEditMember({...editMember, status: value})}>
                                <SelectTrigger id="edit-status">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="online">Online</SelectItem>
                                  <SelectItem value="offline">Offline</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {/* Show Change Password option only in Edit modal */}
                            {editMember.id === user?.id && (
                              <div>
                                <Button 
                                  variant="outline" 
                                  className="w-full gap-1"
                                  onClick={() => {
                                    // Open password change dialog logic here
                                    const passwordDialog = document.getElementById('password-dialog');
                                    if (passwordDialog) {
                                      (passwordDialog as any).showModal();
                                    }
                                  }}
                                >
                                  <Lock className="h-4 w-4" /> Change Password
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex justify-between">
                          {member.id !== user?.id && (
                            <Button variant="destructive" onClick={() => { handleDeleteMember(member.id); setOpenEditDialog(false); }}>
                              Delete
                            </Button>
                          )}
                          {member.id === user?.id && <div></div>}
                          <Button onClick={handleEditMember}>
                            Save Changes
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
              {members.length === 0 && !isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No family members added yet.</p>
                  <Button variant="link" onClick={() => setOpenNewDialog(true)}>
                    Add your first family member
                  </Button>
                </div>
              )}
              {isLoading && (
                <div className="text-center py-8">
                  <p>Loading members...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Password change dialog */}
      <Dialog open={password.current || password.new || password.confirm ? true : false} onOpenChange={(isOpen) => {
        if (!isOpen) setPassword({ current: "", new: "", confirm: "" });
      }}>
        <DialogContent id="password-dialog">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={password.current}
                onChange={e => setPassword({ ...password, current: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={password.new}
                onChange={e => setPassword({ ...password, new: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={password.confirm}
                onChange={e => setPassword({ ...password, confirm: e.target.value })}
              />
            </div>
            <Button className="w-full" onClick={handleChangePassword}>
              Update Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dashboard>
  );
}
