"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { Upload, Plus } from "lucide-react";

interface FileUploadButtonProps {
  onUploadSuccess: () => void;
}

export function FileUploadButton({ onUploadSuccess }: FileUploadButtonProps) {
  const { token } = useAuth();
  const [fileUploadOpen, setFileUploadOpen] = useState(false);
  const [rowUploadOpen, setRowUploadOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // File upload state
  const [file, setFile] = useState<File | null>(null);

  // Row upload state
  const [id, setId] = useState("");
  const [weight, setWeight] = useState("");
  const [destination, setDestination] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  const resetRowForm = () => {
    setId("");
    setWeight("");
    setDestination("");
    setCreatedAt("");
    setError("");
  };

  const resetFileForm = () => {
    setFile(null);
    setError("");
  };

  // ============ FILE UPLOAD HANDLER ============
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!file) {
      setError("Please select a file");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("manifest", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message || "Failed to upload file");
        return;
      }

      resetFileForm();
      setFileUploadOpen(false);
      onUploadSuccess();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ============ ROW UPLOAD HANDLER ============
  const handleRowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/add-cargo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: id.trim(),
          weight: parseFloat(weight),
          destination: destination.trim(),
          createdAt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to add cargo");
        return;
      }

      resetRowForm();
      setRowUploadOpen(false);
      onUploadSuccess();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      {/* ROW UPLOAD BUTTON */}
      <Dialog open={rowUploadOpen} onOpenChange={setRowUploadOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Row Upload
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Cargo Row</DialogTitle>
            <DialogDescription>
              Add a single cargo entry to the database.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRowSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="row-id">Cargo ID</Label>
                <Input
                  id="row-id"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="e.g., CRG-012"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="row-weight">Weight (KG)</Label>
                <Input
                  id="row-weight"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g., 500"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="row-destination">Destination</Label>
                <Input
                  id="row-destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g., Mars"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="row-created-at">Created Date (YYYY-MM-DD)</Label>
                <Input
                  id="row-created-at"
                  type="date"
                  value={createdAt}
                  onChange={(e) => setCreatedAt(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              {error && (
                <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
                  {error}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Cargo"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* FILE UPLOAD BUTTON */}
      <Dialog open={fileUploadOpen} onOpenChange={setFileUploadOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            File Upload
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Upload Manifest File</DialogTitle>
            <DialogDescription>
              Upload a .txt file with cargo manifest data.<br />
              Format: [YYYY-MM-DD] || CARGO-ID :: Weight {'>>'} Destination<br />
              Example: [2026-03-29] || CRG-012 :: 100 {'>>'} Sector-7 Command Center
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFileUpload}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="manifest-file">Select File (.txt)</Label>
                <Input
                  id="manifest-file"
                  type="file"
                  accept=".txt"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                  disabled={isLoading}
                />
              </div>
              {file && (
                <div className="p-2 bg-secondary/20 rounded text-sm">
                  File: <strong>{file.name}</strong>
                </div>
              )}
              {error && (
                <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
                  {error}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading || !file}>
                {isLoading ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
