
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface PasswordChangeFormProps {
  onSubmit: (passwords: { current: string; new: string; confirm: string }) => Promise<void>;
}

export function PasswordChangeForm({ onSubmit }: PasswordChangeFormProps) {
  const [password, setPassword] = useState({ current: "", new: "", confirm: "" });

  return (
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
        <Button className="w-full" onClick={() => onSubmit(password)}>
          Update Password
        </Button>
      </div>
    </DialogContent>
  );
}
