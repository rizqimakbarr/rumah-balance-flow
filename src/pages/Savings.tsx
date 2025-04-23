
import { useState, useEffect } from "react";
import Dashboard from "@/components/layout/Dashboard";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface SavingGoal {
  id?: string;
  title: string;
  target_amount: number;
  current_amount: number;
  due_date?: string;
  user_id?: string;
}

export default function Savings() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [currentGoal, setCurrentGoal] = useState<SavingGoal>({
    title: "",
    target_amount: 0,
    current_amount: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSavingsGoals = async () => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setGoals(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch savings goals: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSavingsGoals();
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) {
      toast.error("You need to be logged in to perform this action");
      return;
    }
    
    try {
      if (!currentGoal.title || currentGoal.target_amount <= 0) {
        toast.error("Please provide a title and target amount greater than zero");
        return;
      }
      
      // Prepare the goal data with user_id
      const goalData = {
        ...currentGoal,
        user_id: user.id,
      };
      
      if (isEditing && currentGoal.id) {
        // Update existing goal
        const { error } = await supabase
          .from('savings_goals')
          .update({
            title: goalData.title,
            target_amount: goalData.target_amount,
            current_amount: goalData.current_amount,
            due_date: goalData.due_date
          })
          .eq('id', currentGoal.id);
        
        if (error) throw error;
        toast.success("Goal updated successfully");
      } else {
        // Create new goal
        const { id, ...newGoal } = goalData;
        const { error } = await supabase
          .from('savings_goals')
          .insert([newGoal]);
        
        if (error) throw error;
        toast.success("Goal created successfully");
      }
      
      // Refresh goals list
      fetchSavingsGoals();
      setDialogOpen(false);
      setCurrentGoal({ title: "", target_amount: 0, current_amount: 0 });
    } catch (error: any) {
      toast.error("Failed to save goal: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setGoals(goals.filter(g => g.id !== id));
      toast.success("Goal deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete goal: " + error.message);
    }
  };

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

  return (
    <Dashboard>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Savings Goals</h1>
            <p className="text-muted-foreground">
              Create savings goals and track your progress. Use transactions with category "Saving" and include goal name in description to update progress.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setIsEditing(false);
                setCurrentGoal({ title: "", target_amount: 0, current_amount: 0 });
              }}>
                <Plus className="mr-2" /> Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isEditing ? "Edit Goal" : "New Savings Goal"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    value={currentGoal.title}
                    onChange={(e) => setCurrentGoal({...currentGoal, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="target">Target Amount</Label>
                  <Input
                    id="target"
                    type="number"
                    value={currentGoal.target_amount}
                    onChange={(e) => setCurrentGoal({...currentGoal, target_amount: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="current">Current Saved</Label>
                  <Input
                    id="current"
                    type="number"
                    value={currentGoal.current_amount}
                    onChange={(e) => setCurrentGoal({...currentGoal, current_amount: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="due_date">Due Date (Optional)</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={currentGoal.due_date || ''}
                    onChange={(e) => setCurrentGoal({...currentGoal, due_date: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave}>
                  {isEditing ? "Update Goal" : "Create Goal"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {isLoading ? (
          <div className="text-center py-8">
            <p>Loading savings goals...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle>{goal.title}</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={() => {
                        setCurrentGoal(goal);
                        setIsEditing(true);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="destructive"
                      onClick={() => handleDelete(goal.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round((goal.current_amount / goal.target_amount) * 100)}%</span>
                    </div>
                    <Progress 
                      value={Math.min((goal.current_amount / goal.target_amount) * 100, 100)} 
                      className="h-2" 
                    />
                    <div className="flex justify-between text-sm">
                      <div>
                        <p className="text-muted-foreground">Current</p>
                        <p className="font-medium">{formatRupiah(goal.current_amount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Target</p>
                        <p className="font-medium">{formatRupiah(goal.target_amount)}</p>
                      </div>
                    </div>
                    {goal.due_date && (
                      <div className="text-sm text-muted-foreground">
                        Due: {new Date(goal.due_date).toLocaleDateString()}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      <p>To update progress, add a transaction with:</p>
                      <ul className="list-disc pl-4 mt-1">
                        <li>Category: "Saving"</li>
                        <li>Description: Include "{goal.title}"</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {goals.length === 0 && !isLoading && (
              <div className="col-span-full text-center py-8 bg-muted/20 rounded-lg">
                <p className="text-muted-foreground">No savings goals yet.</p>
                <Button variant="link" onClick={() => setDialogOpen(true)}>
                  Create your first savings goal
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Dashboard>
  );
}
