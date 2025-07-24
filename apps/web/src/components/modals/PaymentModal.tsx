"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

type PaymentMethod = {
  id: string;
  name: string;
};

type PaymentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  paymentMethod: string;
  setPaymentMethod: (val: string) => void;
};

export default function PaymentModal({
  open,
  onOpenChange,
  onConfirm,
  paymentMethod,
  setPaymentMethod,
}: PaymentModalProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      const { data, error } = await supabase
        .from("payment_method")
        .select("id, name");

      if (error) {
        toast.error("Failed to fetch payment methods");
        console.error(error);
      } else {
        setMethods(data || []);
      }
    };

    if (open) fetchPaymentMethods();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md transition-all duration-300 bg-white">
        <DialogHeader>
          <DialogTitle>Select Payment Method</DialogTitle>
          <DialogDescription>
            Choose how the customer wants to pay.
          </DialogDescription>
        </DialogHeader>

        <Select
          value={paymentMethod}
          onValueChange={(value) => setPaymentMethod(value)}
        >
          <SelectTrigger className="w-full mt-4">
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectGroup>
              <SelectLabel>Available Methods</SelectLabel>
              {methods.map((method) => (
                <SelectItem key={method.id} value={method.id}>
                  {method.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <div className="mt-6 flex flex-col gap-2">
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={onConfirm}
          >
            Confirm Payment
          </Button>
          <DialogClose asChild>
            <Button variant="ghost" className="w-full">
              Cancel
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
