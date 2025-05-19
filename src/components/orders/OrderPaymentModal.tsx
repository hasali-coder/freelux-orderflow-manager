
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Order } from "@/types";

interface OrderPaymentModalProps {
  order: Order;
  open: boolean;
  onClose: () => void;
  onPaymentComplete: (order: Order, amountPaid: number) => void;
}

export function OrderPaymentModal({ order, open, onClose, onPaymentComplete }: OrderPaymentModalProps) {
  const [paymentType, setPaymentType] = useState<'full' | 'partial'>('full');
  const [partialAmount, setPartialAmount] = useState<string>('');
  const { toast } = useToast();
  const remainingAmount = order.cost - (order.amountPaid || 0);

  const handlePayment = () => {
    let amountPaid = 0;
    
    if (paymentType === 'full') {
      amountPaid = remainingAmount;
    } else {
      const partialAmountNum = parseFloat(partialAmount);
      
      if (isNaN(partialAmountNum) || partialAmountNum <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid payment amount.",
          variant: "destructive"
        });
        return;
      }
      
      if (partialAmountNum > remainingAmount) {
        toast({
          title: "Amount too high",
          description: `Payment amount cannot exceed the remaining balance of $${remainingAmount.toFixed(2)}`,
          variant: "destructive"
        });
        return;
      }
      
      amountPaid = partialAmountNum;
    }
    
    onPaymentComplete(order, amountPaid);
    toast({
      title: "Payment processed",
      description: `Payment of $${amountPaid.toFixed(2)} has been processed.`
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
          <DialogDescription>
            Process a payment for order: {order.title}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Order Total: ${order.cost.toFixed(2)}</p>
            {order.amountPaid ? (
              <p className="text-sm font-medium">Amount Already Paid: ${order.amountPaid.toFixed(2)}</p>
            ) : null}
            <p className="text-sm font-medium">Remaining Balance: ${remainingAmount.toFixed(2)}</p>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                variant={paymentType === 'full' ? 'default' : 'outline'}
                onClick={() => setPaymentType('full')}
                className="flex-1"
              >
                Pay in Full
              </Button>
              <Button 
                type="button" 
                variant={paymentType === 'partial' ? 'default' : 'outline'}
                onClick={() => setPaymentType('partial')}
                className="flex-1"
              >
                Partial Payment
              </Button>
            </div>
            
            {paymentType === 'partial' && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Payment Amount ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={remainingAmount}
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handlePayment}>Process Payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
