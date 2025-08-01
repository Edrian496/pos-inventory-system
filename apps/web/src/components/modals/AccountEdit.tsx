"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import React from "react";

type Props = {
  trigger: React.ReactNode;
  form: {
    first_name: string;
    last_name: string;
    email: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
};

export default function EditUserInfoDialog({
  trigger,
  form,
  onChange,
  onSave,
}: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">First Name</label>
            <input
              name="first_name"
              value={form.first_name}
              onChange={onChange}
              className="border rounded-md px-3 py-2"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Last Name</label>
            <input
              name="last_name"
              value={form.last_name}
              onChange={onChange}
              className="border rounded-md px-3 py-2"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Email</label>
            <input
              name="email"
              value={form.email}
              disabled
              className="bg-gray-100 border rounded-md px-3 py-2"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
