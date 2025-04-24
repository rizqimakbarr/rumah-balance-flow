
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface MembersListProps {
  members: any[];
  onEdit: (member: any) => void;
  isLoading: boolean;
}

export function MembersList({ members, onEdit, isLoading }: MembersListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p>Loading members...</p>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No family members added yet.</p>
      </div>
    );
  }

  return (
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
            <Button variant="outline" size="sm" onClick={() => onEdit(member)}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
