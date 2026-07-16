import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface StaffSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function StaffSearch({ value, onChange }: StaffSearchProps) {
  return (
    <Card className="shadow-card">
      <CardContent className="pt-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, role, or email..."
            className="pl-9"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
