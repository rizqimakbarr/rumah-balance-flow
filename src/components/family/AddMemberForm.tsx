
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, Mail, UserRound } from "lucide-react";
import { useState } from "react";

interface AddMemberFormProps {
  onSubmit: (member: any) => Promise<void>;
}

export function AddMemberForm({ onSubmit }: AddMemberFormProps) {
  const [newMember, setNewMember] = useState({ 
    name: "", 
    email: "", 
    role: "Member", 
    status: "offline",
    password: ""
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Family Member</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              value={newMember.name}
              onChange={(e) => setNewMember({...newMember, name: e.target.value})}
            />
          </div>
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
      </div>
      <div className="flex justify-end">
        <Button onClick={() => onSubmit(newMember)}>Add Member</Button>
      </div>
    </DialogContent>
  );
}
