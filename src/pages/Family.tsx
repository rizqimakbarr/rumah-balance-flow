
import { useState } from "react";
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
import { Plus, Pencil } from "lucide-react";

const initialFamilyMembers = [
  { id: "1", name: "John Doe", role: "Admin", status: "online", avatarUrl: "" },
  { id: "2", name: "Jane Smith", role: "Member", status: "online", avatarUrl: "" },
  { id: "3", name: "Mike Johnson", role: "Member", status: "offline", avatarUrl: "" }
];

export default function Family() {
  const [members, setMembers] = useState(initialFamilyMembers);
  const [editMember, setEditMember] = useState<any>(null);
  const [newMember, setNewMember] = useState({ name: "", role: "Member", status: "offline" });
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const handleAddMember = () => {
    if (newMember.name) {
      const member = {
        ...newMember,
        id: Date.now().toString(),
        avatarUrl: ""
      };
      setMembers([...members, member]);
      setNewMember({ name: "", role: "Member", status: "offline" });
      setOpenNewDialog(false);
      toast.success("Family member added");
    } else {
      toast.error("Name is required");
    }
  };

  const handleEditMember = () => {
    if (editMember && editMember.name) {
      setMembers(members.map(m => m.id === editMember.id ? editMember : m));
      setOpenEditDialog(false);
      toast.success("Member updated");
    } else {
      toast.error("Name is required");
    }
  };

  const handleDeleteMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
    toast.success("Member removed");
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
                    <Label htmlFor="role">Role</Label>
                    <Select 
                      value={newMember.role} 
                      onValueChange={(value) => setNewMember({...newMember, role: value})}
                    >
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
                    <Select 
                      value={newMember.status} 
                      onValueChange={(value: "online" | "offline") => setNewMember({...newMember, status: value})}
                    >
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
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatarUrl} alt={member.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {member.name.split(' ').map(name => name[0]).join('')}
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
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditMember(member);
                            setOpenEditDialog(true);
                          }}
                        >
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
                              <Input
                                id="edit-name"
                                value={editMember.name}
                                onChange={(e) => setEditMember({...editMember, name: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-role">Role</Label>
                              <Select 
                                value={editMember.role} 
                                onValueChange={(value) => setEditMember({...editMember, role: value})}
                              >
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
                              <Select 
                                value={editMember.status} 
                                onValueChange={(value: "online" | "offline") => setEditMember({...editMember, status: value})}
                              >
                                <SelectTrigger id="edit-status">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="online">Online</SelectItem>
                                  <SelectItem value="offline">Offline</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <Button 
                            variant="destructive" 
                            onClick={() => {
                              handleDeleteMember(member.id);
                              setOpenEditDialog(false);
                            }}
                          >
                            Delete
                          </Button>
                          <Button onClick={handleEditMember}>Save Changes</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
              
              {members.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No family members added yet.</p>
                  <Button 
                    variant="link" 
                    onClick={() => setOpenNewDialog(true)}
                  >
                    Add your first family member
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Dashboard>
  );
}
