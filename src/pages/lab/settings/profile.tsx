import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, Upload } from "lucide-react";
import { useCurrentLab, useMutation, useMyPermissions } from "@/hooks/use-api";
import { useStore } from "@/hooks/use-store";
import { useToast } from "@/hooks/use-toast";
import endpoint from "@/api/endpoints";
import type { Lab, UpdateLabPayload, UpdateLabLogoResponse } from "@/api/types/lab";
import { cn } from "@/lib/utils";

const emptyLabForm: LabFormState = {
  name: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  country: "NG",
};

interface LabFormState {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  country: string;
}

const ALLOWED_LOGO_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/svg+xml",
]);
const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2 MB

function validateLogoFile(file: File): string | null {
  if (!ALLOWED_LOGO_TYPES.has(file.type)) {
    return "Only PNG, JPG, or SVG images are allowed.";
  }
  if (file.size > MAX_LOGO_BYTES) {
    return "Logo must be 2 MB or smaller.";
  }
  return null;
}

function LabLogoUpload({
  lab,
  canUpdate,
}: {
  lab: Lab | null;
  canUpdate: boolean;
}) {
  const { toast } = useToast();
  const { setLab } = useStore();
  const { trigger: uploadLogo, isLoading: isUploadingLogo } = useMutation<
    UpdateLabLogoResponse,
    FormData
  >(endpoint.lab.updateLogo, {
    method: "PATCH",
    successToast: "Logo updated successfully",
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const processLogoFile = async (file: File) => {
    const validationError = validateLogoFile(file);
    if (validationError) {
      toast({
        title: "Invalid logo file",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    const formData = new FormData();
    formData.append("logo", file);

    const result = await uploadLogo(formData);
    if (!result?.data?.logo || !lab) {
      URL.revokeObjectURL(localPreview);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setLab({ ...lab, logo: result.data.logo });
    URL.revokeObjectURL(localPreview);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleLogoFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processLogoFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!canUpdate || isUploadingLogo) return;
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processLogoFile(file);
  };

  const displayLogo = previewUrl ?? lab?.logo;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-base">Laboratory Logo</CardTitle>
        <CardDescription>
          Upload your laboratory logo for reports and invoices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "flex flex-col sm:flex-row sm:items-center gap-5 rounded-xl transition-colors",
            canUpdate && "border-2 border-dashed border-muted-foreground/20 p-4",
            isDragging && "border-primary bg-primary/5",
          )}
          onDragOver={(e) => {
            if (!canUpdate) return;
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="w-20 h-20 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center border-2 border-dashed border-primary/30 overflow-hidden">
            {displayLogo ? (
              <img
                src={displayLogo}
                alt="Lab logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="w-8 h-8 text-primary/50" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            {canUpdate ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Label htmlFor="logo-upload">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      disabled={isUploadingLogo}
                    >
                      <span>
                        {isUploadingLogo ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        {isUploadingLogo ? "Uploading…" : "Upload Logo"}
                      </span>
                    </Button>
                  </Label>
                  <input
                    ref={fileInputRef}
                    id="logo-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml,.png,.jpg,.jpeg,.svg"
                    className="hidden"
                    disabled={isUploadingLogo}
                    onChange={handleLogoFileSelected}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  PNG, JPG, or SVG · max 2 MB. Drag and drop supported.
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                {lab?.logo
                  ? "You don’t have permission to change the lab logo."
                  : "No logo uploaded. Contact a lab admin to add one."}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Profile() {
  const { toast } = useToast();
  const { setLab } = useStore();
  const { can } = useMyPermissions();
  const canUpdateLab = can("lab.update");
  const { lab, isLoading: isLabLoading } = useCurrentLab();
  const { trigger: updateLab, isLoading: isSaving } = useMutation<
    Lab,
    UpdateLabPayload
  >(endpoint.lab.update, { method: "PATCH", successToast: "Lab updated" });
  const [labForm, setLabForm] = useState<LabFormState>(emptyLabForm);

  useEffect(() => {
    if (!lab) return;
    setLabForm({
      name: lab.name ?? "",
      email: lab.email ?? "",
      phone: lab.phone ?? "",
      line1: lab.address?.line1 ?? "",
      line2: lab.address?.line2 ?? "",
      city: lab.address?.city ?? "",
      state: lab.address?.state ?? "",
      country: lab.address?.country ?? "NG",
    });
  }, [lab]);

  const handleSaveProfile = async () => {
    if (!labForm.name || !labForm.email || !labForm.phone) {
      toast({
        title: "Required fields missing",
        description: "Name, email, and phone are required.",
        variant: "destructive",
      });
      return;
    }

    const payload: UpdateLabPayload = {
      name: labForm.name,
      email: labForm.email,
      phone: labForm.phone,
      address: {
        line1: labForm.line1,
        line2: labForm.line2,
        city: labForm.city,
        state: labForm.state,
        country: labForm.country,
      },
    };

    const updated = await updateLab(payload);
    if (!updated?.data) return;
    setLab(updated.data);
  };

  return (
    <TabsContent value="profile" className="mt-6 space-y-6">
      <LabLogoUpload lab={lab} canUpdate={canUpdateLab} />

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Laboratory Information</CardTitle>
          {lab?.code && (
            <CardDescription>Lab code: {lab.code}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isLabLoading ? (
            <p className="text-sm text-muted-foreground">
              Loading lab profile…
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Laboratory Name *</Label>
                  <Input
                    value={labForm.name}
                    onChange={(e) =>
                      setLabForm((p) => ({ ...p, name: e.target.value }))
                    }
                    disabled={!canUpdateLab}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={labForm.email}
                    onChange={(e) =>
                      setLabForm((p) => ({ ...p, email: e.target.value }))
                    }
                    disabled={!canUpdateLab}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone *</Label>
                  <Input
                    value={labForm.phone}
                    onChange={(e) =>
                      setLabForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    disabled={!canUpdateLab}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Country</Label>
                  <Input
                    value={labForm.country}
                    onChange={(e) =>
                      setLabForm((p) => ({ ...p, country: e.target.value }))
                    }
                    disabled={!canUpdateLab}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Address Line 1</Label>
                  <Input
                    value={labForm.line1}
                    onChange={(e) =>
                      setLabForm((p) => ({ ...p, line1: e.target.value }))
                    }
                    disabled={!canUpdateLab}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Address Line 2</Label>
                  <Input
                    value={labForm.line2}
                    onChange={(e) =>
                      setLabForm((p) => ({ ...p, line2: e.target.value }))
                    }
                    disabled={!canUpdateLab}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>City</Label>
                  <Input
                    value={labForm.city}
                    onChange={(e) =>
                      setLabForm((p) => ({ ...p, city: e.target.value }))
                    }
                    disabled={!canUpdateLab}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>State</Label>
                  <Input
                    value={labForm.state}
                    onChange={(e) =>
                      setLabForm((p) => ({ ...p, state: e.target.value }))
                    }
                    disabled={!canUpdateLab}
                  />
                </div>
              </div>
              {canUpdateLab && (
                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    ) : null}
                    Save Changes
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
