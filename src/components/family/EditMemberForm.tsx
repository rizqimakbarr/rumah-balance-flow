
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, Mail, UserRound } from "lucide-react";
import { useState, useEffect } from "react";

interface EditMemberFormProps {
  member: any;
  currentUserId: string;
  onSubmit: (member: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function EditMemberForm({ member, currentUserId, onSubmit, onDelete }: EditMemberFormProps) {
  const [editData, setEditData] = useState(member);
  const [memberPassword, setMemberPassword] = useState("");
  const [memberEmail, setMemberEmail] = useState("");

  useEffect(() => {
    setEditData(member);
  }, [member]);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Family Member</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div>
          <Label htmlFor="edit-name">Name</Label>
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-muted-foreground" />
            <Input
              id="edit-name"
              value={editData.name}
              onChange={(e) => setEditData({...editData, name: e.target.value})}
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
          <Select value={editData.role} onValueChange={(value) => setEditData({...editData, role: value})}>
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
      </div>
      <div className="flex justify-between">
        {member.id !== currentUserId && (
          <Button variant="destructive" onClick={() => onDelete(member.id)}>
            Delete
          </Button>
        )}
        <Button onClick={() => onSubmit({ ...editData, password: memberPassword, email: memberEmail })}>
          Save Changes
        </Button>
      </div>
    </DialogContent>
  );
}
