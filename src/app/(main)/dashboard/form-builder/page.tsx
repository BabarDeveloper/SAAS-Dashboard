"use client";

import { useMemo } from "react";

import { useRouter } from "next/navigation";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFormBuilderStore } from "@/lib/form-builder-store";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export default function FormBuilderListPage() {
  const router = useRouter();
  const forms = useFormBuilderStore((state) => state.forms);
  const initializeForm = useFormBuilderStore((state) => state.initializeForm);
  const deleteForm = useFormBuilderStore((state) => state.deleteForm);

  const sortedForms = useMemo(
    () => [...forms].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()),
    [forms],
  );

  const openBuilder = (formId: string) => {
    router.push(`/form-builder?id=${encodeURIComponent(formId)}`);
  };

  const handleCreateForm = () => {
    const newForm = initializeForm("Untitled Form");
    toast.success("Form created");
    openBuilder(newForm.id);
  };

  const handleDeleteForm = (formId: string) => {
    deleteForm(formId);
    toast.success("Form deleted");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-row flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <h1 className="font-semibold text-3xl tracking-tight">Form Builder</h1>
          <p className="text-muted-foreground">Manage your saved forms, edit them, or create a new one.</p>
        </div>
        <Button onClick={handleCreateForm} className="gap-2">
          <Plus className="size-4" />
          Create Form
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>All Forms</CardTitle>
          <CardDescription>Each row can be edited or deleted.</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedForms.length ? (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Form</TableHead>
                    <TableHead>Fields</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedForms.map((form) => (
                    <TableRow key={form.id}>
                      <TableCell className="font-medium">{form.name}</TableCell>
                      <TableCell>{form.fields.length}</TableCell>
                      <TableCell>{formatDate(form.createdAt)}</TableCell>
                      <TableCell>{formatDate(form.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openBuilder(form.id)}>
                            <Pencil className="size-4" />
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteForm(form.id)}>
                            <Trash2 className="size-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed bg-muted/30 p-8 text-center">
              <div className="max-w-sm space-y-3">
                <h2 className="font-semibold text-lg">No forms yet</h2>
                <p className="text-muted-foreground text-sm">
                  Create your first form to start building and saving it here.
                </p>
                <Button onClick={handleCreateForm} className="gap-2">
                  <Plus className="size-4" />
                  Create Form
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
