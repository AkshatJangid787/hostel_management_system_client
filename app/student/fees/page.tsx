"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function StudentFeesPage() {
  const [fees, setFees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFees = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/fees/my");
      setFees(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch fees");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Fee Receipts</h1>
      
      {isLoading ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Loading fee records...</CardContent></Card>
      ) : fees.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No fee records found.</CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees.map((fee: any) => {
                  const balance = fee.totalAmount - fee.paidAmount;
                  return (
                    <TableRow key={fee._id}>
                      <TableCell className="font-medium">{fee.feeType}</TableCell>
                      <TableCell>₹{fee.totalAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-green-600">₹{fee.paidAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-red-600">₹{balance.toLocaleString()}</TableCell>
                      <TableCell>{new Date(fee.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={fee.status === "PAID" ? "default" : fee.status === "PARTIAL" ? "secondary" : "destructive"}>
                          {fee.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
