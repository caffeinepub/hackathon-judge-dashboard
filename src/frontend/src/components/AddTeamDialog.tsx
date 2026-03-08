import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddTeam } from "../hooks/useQueries";

interface AddTeamDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddTeamDialog({ open, onClose }: AddTeamDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const addTeam = useAddTeam();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Team name is required");
      return;
    }
    try {
      await addTeam.mutateAsync({
        name: name.trim(),
        description: description.trim(),
      });
      toast.success(`Team "${name.trim()}" added!`);
      setName("");
      setDescription("");
      onClose();
    } catch {
      toast.error("Failed to add team");
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md" data-ocid="add_team.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Add New Team
          </DialogTitle>
          <DialogDescription>
            Register a new team for the hackathon.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="team-name">Team Name *</Label>
            <Input
              id="team-name"
              placeholder="e.g. Code Wizards"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-ocid="add_team.name.input"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-desc">Description</Label>
            <Textarea
              id="team-desc"
              placeholder="Brief description of what this team is building..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              data-ocid="add_team.description.textarea"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={addTeam.isPending}
              data-ocid="add_team.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addTeam.isPending || !name.trim()}
              data-ocid="add_team.submit_button"
            >
              {addTeam.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Add Team
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
