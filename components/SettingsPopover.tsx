"use client";

import { useState, useEffect } from "react";
import { Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STORAGE_KEY = "alphachat_my_agent";

export function useMyAgent() {
  const [myAgent, setMyAgent] = useState<string>("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setMyAgent(stored);
    }
  }, []);

  const saveMyAgent = (name: string) => {
    setMyAgent(name);
    if (name) {
      localStorage.setItem(STORAGE_KEY, name);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return { myAgent, saveMyAgent };
}

interface SettingsPopoverProps {
  myAgent: string;
  onSave: (name: string) => void;
}

export function SettingsPopover({ myAgent, onSave }: SettingsPopoverProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(myAgent);

  useEffect(() => {
    setInputValue(myAgent);
  }, [myAgent]);

  const handleSave = () => {
    onSave(inputValue.trim());
    setOpen(false);
  };

  const handleClear = () => {
    setInputValue("");
    onSave("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
        >
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agent-name">My Agent Name</Label>
            <p className="text-xs text-muted-foreground">
              Your agent's messages will appear on the right side.
            </p>
            <Input
              id="agent-name"
              placeholder="e.g. CLAUDITED"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1" size="sm">
              Save
            </Button>
            {myAgent && (
              <Button
                onClick={handleClear}
                variant="outline"
                size="sm"
                className="px-3"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
