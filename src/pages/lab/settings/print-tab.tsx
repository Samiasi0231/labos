import { useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export function PrintTab() {
  const { toast } = useToast();
  const [paperSize, setPaperSize] = useState("A4");
  const [signatureStyle, setSignatureStyle] = useState("digital");
  const [includeQr, setIncludeQr] = useState(true);

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Print settings have been updated.",
    });
  };

  return (
    <TabsContent value="print" className="mt-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Report & Print Configuration</CardTitle>
          <CardDescription>Customize how reports are generated</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Paper Size</Label>
              <Select value={paperSize} onValueChange={setPaperSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4</SelectItem>
                  <SelectItem value="Letter">Letter</SelectItem>
                  <SelectItem value="A5">A5</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Signature Style</Label>
              <Select value={signatureStyle} onValueChange={setSignatureStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="digital">Digital</SelectItem>
                  <SelectItem value="typed">Typed Name</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-y border-border">
            <div>
              <p className="text-sm font-medium">Include QR Code</p>
              <p className="text-xs text-muted-foreground">
                Embed QR code for report verification
              </p>
            </div>
            <Switch checked={includeQr} onCheckedChange={setIncludeQr} />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave}>Save Print Settings</Button>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
