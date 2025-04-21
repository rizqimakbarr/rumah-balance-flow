
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  status: 'online' | 'offline';
}

interface FamilyMembersProps {
  members: FamilyMember[];
}

export default function FamilyMembers({ members }: FamilyMembersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Family Members</CardTitle>
        <CardDescription>Currently sharing this budget</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={member.avatarUrl} alt={member.name} />
                <AvatarFallback>
                  {member.name.split(' ').map(name => name[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.role}</p>
              </div>
            </div>
            <Badge variant={member.status === 'online' ? 'default' : 'outline'}>
              {member.status === 'online' ? 'Online' : 'Offline'}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
