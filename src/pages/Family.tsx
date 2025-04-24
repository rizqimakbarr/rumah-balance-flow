import { useState, useEffect } from "react";
import Dashboard from "@/components/layout/Dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AddMemberForm } from "@/components/family/AddMemberForm";
import { EditMemberForm } from "@/components/family/EditMemberForm";
import { MembersList } from "@/components/family/MembersList";
import { PasswordChangeForm } from "@/components/family/PasswordChangeForm";

export default function Family() {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [editMember, setEditMember] = useState<any>(null);
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleAddMember = async (newMember: any) => {
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
        setOpenNewDialog(false);
        toast.success("Family member added successfully");
      }, 1000); // Give some time for the trigger to work
    } catch (error: any) {
      toast.error("Failed to add family member: " + error.message);
    }
  };

  const handleEditMember = async (updatedMember: any) => {
    if (!user || !updatedMember?.id) {
      toast.error("You need to be logged in to perform this action");
      return;
    }
    
    if (!updatedMember.name) {
      toast.error("Name is required");
      return;
    }
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: updatedMember.name,
          role: updatedMember.role,
          status: updatedMember.status,
        })
        .eq("id", updatedMember.id);
        
      if (error) throw error;
      
      // Update password if provided
      if (updatedMember.password && updatedMember.password.length >= 6 && updatedMember.email) {
        try {
          // Try admin update first
          const { error: adminError } = await supabase.auth.admin.updateUserById(
            updatedMember.id,
            { password: updatedMember.password }
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
      setMembers(prev => prev.map(m => m.id === updatedMember.id ? {
        ...updatedMember,
        // Don't save password or email in profiles table for security
      } : m));
      
      setOpenEditDialog(false);
      toast.success("Member updated successfully");
    } catch (error: any) {
      toast.error("Failed to update member: " + error.message);
    }
  };

  const handleChangePassword = async (passwords: { current: string; new: string; confirm: string }) => {
    if (!user) {
      toast.error("You need to be logged in to perform this action");
      return;
    }
    
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    
    if (!passwords.current || !passwords.new) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: passwords.new 
      });
      
      if (error) throw error;
      
      toast.success("Password changed successfully!");
    } catch (error: any) {
      toast.error("Failed to change password: " + error.message);
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
                <AddMemberForm onSubmit={handleAddMember} />
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <MembersList
              members={members}
              onEdit={(member) => { setEditMember(member); setOpenEditDialog(true); }}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Edit Member Dialog */}
      <Dialog open={openEditDialog} onOpenChange={(open) => {
        setOpenEditDialog(open);
        if (!open) setEditMember(null);
      }}>
        {editMember && (
          <EditMemberForm
            member={editMember}
            currentUserId={user?.id || ""}
            onSubmit={handleEditMember}
            onDelete={handleDeleteMember}
          />
        )}
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog>
        <PasswordChangeForm onSubmit={handleChangePassword} />
      </Dialog>
    </Dashboard>
  );
}
