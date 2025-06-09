"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface PaymentEntry {
  phoneNumber: string;
  amount: number;
}

export default function MpesaPage() {
  const [entries, setEntries] = useState<PaymentEntry[]>([
    { phoneNumber: "", amount: 0 },
  ]);
  const [baseFileName, setBaseFileName] = useState("");
  const [paymentXml, setPaymentXml] = useState("");
  const [validationXml, setValidationXml] = useState("");
  const [bulkPaste, setBulkPaste] = useState("");

  const addEntry = () => {
    setEntries([...entries, { phoneNumber: "", amount: 0 }]);
  };

  const updateEntry = (
    index: number,
    field: keyof PaymentEntry,
    value: string | number
  ) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handleBulkPaste = (text: string) => {
    setBulkPaste(text);

    // Split by newlines and filter out empty lines
    const lines = text.split(/[\n,]/).filter((line) => line.trim());

    const newEntries = lines.map((line) => {
      // Split by tab, space, or multiple spaces
      const [phone, amount] = line.trim().split(/[\t\s]+/);

      // Format phone number to ensure it starts with 254
      let formattedPhone = phone.replace(/\D/g, "");
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "254" + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith("254")) {
        formattedPhone = "254" + formattedPhone;
      }

      return {
        phoneNumber: formattedPhone,
        amount: parseFloat(amount) || 0,
      };
    });

    if (newEntries.length > 0) {
      setEntries(newEntries);
    }
  };

  const generateXml = () => {
    const paymentContent = `<?xml version="1.0" encoding="UTF-8"?>
<BulkPaymentRequest>
${entries
  .map(
    (entry, index) => `
  <!--Bulk Payment ${index + 1}-->
  <Customer>
    <Identifier IdentifierType="MSISDN" IdentifierValue="${
      entry.phoneNumber
    }"></Identifier>
    <Amount Value="${entry.amount.toFixed(2)}"></Amount>
  </Customer>`
  )
  .join("")}
</BulkPaymentRequest>`;

    const validationContent = `<?xml version="1.0" encoding="UTF-8"?>
<BulkPaymentValidationRequest>
${entries
  .map(
    (entry, index) => `
  <!--Bulk Payment ${index + 1}-->
  <Customer>
    <Identifier IdentifierType="MSISDN" IdentifierValue="${
      entry.phoneNumber
    }"></Identifier>
    <Amount Value="${entry.amount.toFixed(2)}"></Amount>
  </Customer>`
  )
  .join("")}
</BulkPaymentValidationRequest>`;

    setPaymentXml(paymentContent);
    setValidationXml(validationContent);
  };

  const downloadFile = (content: string, type: "payment" | "validation") => {
    const blob = new Blob([content], { type: "text/xml" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseFileName}_${type}.xml`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>M-Pesa Bulk Payment Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="filename">Base Filename</Label>
              <Input
                id="filename"
                value={baseFileName}
                onChange={(e) => setBaseFileName(e.target.value)}
                placeholder="Enter base filename"
              />
            </div>

            <div>
              <Label>Bulk Paste Numbers and Amounts</Label>
              <Textarea
                value={bulkPaste}
                onChange={(e) => handleBulkPaste(e.target.value)}
                placeholder="Paste numbers and amounts here (one per line or comma-separated)
Format: 254XXXXXXXXX 1000.50
Example:
254715795138 1500.50
254722991706 500.75"
                className="h-32"
              />
            </div>

            {entries.map((entry, index) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label>Phone Number</Label>
                  <Input
                    value={entry.phoneNumber}
                    onChange={(e) =>
                      updateEntry(index, "phoneNumber", e.target.value)
                    }
                    placeholder="254XXXXXXXXX"
                  />
                </div>
                <div className="flex-1">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={entry.amount}
                    onChange={(e) =>
                      updateEntry(
                        index,
                        "amount",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="Amount"
                  />
                </div>
                <Button
                  variant="destructive"
                  onClick={() => removeEntry(index)}
                  disabled={entries.length === 1}
                >
                  Remove
                </Button>
              </div>
            ))}

            <Button onClick={addEntry} variant="outline">
              Add Entry
            </Button>

            <Button onClick={generateXml} className="w-full">
              Generate XML
            </Button>

            {(paymentXml || validationXml) && (
              <div className="flex gap-4">
                <Button
                  onClick={() => downloadFile(paymentXml, "payment")}
                  className="flex-1"
                  disabled={!paymentXml}
                >
                  Download Payment XML
                </Button>
                <Button
                  onClick={() => downloadFile(validationXml, "validation")}
                  className="flex-1"
                  disabled={!validationXml}
                >
                  Download Validation XML
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
