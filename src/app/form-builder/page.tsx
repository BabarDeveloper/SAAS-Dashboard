"use client";

import { type FormEvent, useEffect, useMemo } from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useFormBuilderStore } from "@/lib/form-builder-store";
import type { FieldPaletteItem, FieldType, FormField, FormSubmission } from "@/lib/form-builder-types";

const fieldTypes: FieldType[] = ["text", "email", "textarea", "select", "checkbox"];

const fieldPalette: FieldPaletteItem[] = [
  {
    label: "Text",
    type: "text",
    description: "A simple single-line text input.",
  },
  {
    label: "Email",
    type: "email",
    description: "Collect an email address.",
  },
  {
    label: "Textarea",
    type: "textarea",
    description: "Collect longer responses.",
  },
  {
    label: "Select",
    type: "select",
    description: "Choose from a list of options.",
  },
  {
    label: "Checkbox",
    type: "checkbox",
    description: "A yes/no toggle field.",
  },
];

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const parseOptions = (options: string) =>
  options
    .split(",")
    .map((option) => option.trim())
    .filter(Boolean);

const createSubmission = (values: Record<string, string | boolean>): FormSubmission => ({
  id: crypto.randomUUID(),
  submittedAt: new Date().toISOString(),
  values,
});

function FieldEditor({
  formId,
  field,
  onChange,
  onDelete,
}: {
  formId: string;
  field: FormField;
  onChange: (updates: Partial<FormField>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="space-y-4 rounded-lg border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-medium text-sm">Field</p>
          <p className="text-muted-foreground text-xs">{field.id.slice(0, 8)}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Delete field">
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${formId}-${field.id}-label`}>Label</Label>
          <Input
            id={`${formId}-${field.id}-label`}
            value={field.label}
            onChange={(event) => onChange({ label: event.target.value })}
            placeholder="Full name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-${field.id}-name`}>Name</Label>
          <Input
            id={`${formId}-${field.id}-name`}
            value={field.name}
            onChange={(event) => onChange({ name: event.target.value })}
            placeholder="full_name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-${field.id}-type`}>Type</Label>
          <select
            id={`${formId}-${field.id}-type`}
            value={field.type}
            onChange={(event) => onChange({ type: event.target.value as FieldType })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {fieldTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-${field.id}-placeholder`}>Placeholder</Label>
          <Input
            id={`${formId}-${field.id}-placeholder`}
            value={field.placeholder}
            onChange={(event) => onChange({ placeholder: event.target.value })}
            placeholder="Type here"
          />
        </div>
      </div>

      {field.type === "select" && (
        <div className="space-y-2">
          <Label htmlFor={`${formId}-${field.id}-options`}>Options</Label>
          <Textarea
            id={`${formId}-${field.id}-options`}
            value={field.options}
            onChange={(event) => onChange({ options: event.target.value })}
            placeholder="Option 1, Option 2, Option 3"
            rows={3}
          />
        </div>
      )}

      <div className="flex items-center gap-2 text-sm">
        <Checkbox checked={field.required} onCheckedChange={(checked) => onChange({ required: checked === true })} />
        <span>Required</span>
      </div>
    </div>
  );
}

function FieldPalette({ formId, onAddField }: { formId: string; onAddField: (type: FieldType) => void }) {
  return (
    <Card className="h-fit">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base">Field Elements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {fieldPalette.map((item) => (
          <Button
            key={item.type}
            type="button"
            variant="outline"
            className="h-auto w-full justify-start gap-3 py-3"
            onClick={() => onAddField(item.type)}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-dashed bg-muted/40 font-medium text-sm">
              {item.label.slice(0, 1)}
            </div>
            <div className="min-w-0 text-left">
              <p className="font-medium text-sm">{item.label}</p>
              <p className="text-muted-foreground text-xs">{item.description}</p>
            </div>
          </Button>
        ))}
        <p className="pt-2 text-muted-foreground text-xs">
          Click any field to add it to <span className="font-medium">{formId}</span>.
        </p>
      </CardContent>
    </Card>
  );
}

function LivePreviewCard({
  formId,
  fields,
  onSubmit,
}: {
  formId: string;
  fields: FormField[];
  onSubmit: (submission: FormSubmission) => void;
}) {
  return (
    <Card className="h-fit xl:sticky xl:top-4">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base">Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <PreviewRenderer formId={formId} fields={fields} onSubmit={onSubmit} />
      </CardContent>
    </Card>
  );
}

function PreviewRenderer({
  formId,
  fields,
  onSubmit,
}: {
  formId: string;
  fields: FormField[];
  onSubmit: (submission: FormSubmission) => void;
}) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values: Record<string, string | boolean> = {};

    fields.forEach((field) => {
      if (field.type === "checkbox") {
        values[field.name] = formData.get(field.name) === "on";
        return;
      }

      values[field.name] = String(formData.get(field.name) ?? "");
    });

    onSubmit(createSubmission(values));
    event.currentTarget.reset();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.length ? (
        fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={`${formId}-preview-${field.id}`}>
              {field.label}
              {field.required && <span className="text-destructive"> *</span>}
            </Label>

            {field.type === "textarea" ? (
              <Textarea
                id={`${formId}-preview-${field.id}`}
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
              />
            ) : field.type === "select" ? (
              <select
                id={`${formId}-preview-${field.id}`}
                name={field.name}
                required={field.required}
                defaultValue=""
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="" disabled>
                  Select an option
                </option>
                {parseOptions(field.options).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : field.type === "checkbox" ? (
              <label className="flex items-center gap-2 text-sm">
                <input
                  id={`${formId}-preview-${field.id}`}
                  name={field.name}
                  type="checkbox"
                  className="size-4 rounded border-border"
                />
                {field.placeholder || "Check this box"}
              </label>
            ) : (
              <Input
                id={`${formId}-preview-${field.id}`}
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                required={field.required}
              />
            )}
          </div>
        ))
      ) : (
        <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center text-muted-foreground text-sm">
          Add a field in the Edit tab to preview the form here.
        </div>
      )}

      {fields.length > 0 && <Button type="submit">Submit sample response</Button>}
    </form>
  );
}

export default function FormBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = searchParams.get("id") ?? "";

  const forms = useFormBuilderStore((state) => state.forms);
  const updateForm = useFormBuilderStore((state) => state.updateForm);
  const addField = useFormBuilderStore((state) => state.addField);
  const updateField = useFormBuilderStore((state) => state.updateField);
  const deleteField = useFormBuilderStore((state) => state.deleteField);
  const addSubmission = useFormBuilderStore((state) => state.addSubmission);
  const localFormsStore = useFormBuilderStore as typeof useFormBuilderStore & {
    persist?: { hasHydrated: () => boolean };
  };
  const hasHydrated = localFormsStore.persist?.hasHydrated?.() ?? true;

  const selectedForm = useMemo(() => forms.find((form) => form.id === formId), [forms, formId]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!formId || !selectedForm) {
      router.replace("/dashboard/form-builder");
    }
  }, [formId, hasHydrated, router, selectedForm]);

  if (!hasHydrated || !formId || !selectedForm) {
    return null;
  }

  const handleRename = (name: string) => {
    updateForm({ id: formId, name });
  };

  const handleAddField = () => {
    addField(formId);
  };

  const handleFieldChange = (fieldId: string, updates: Partial<FormField>) => {
    updateField(formId, fieldId, updates);
  };

  const handleAddPaletteField = (type: FieldType) => {
    addField(formId, type);
  };

  const handleSubmission = (submission: FormSubmission) => {
    addSubmission(formId, submission);
    toast.success("Submission saved");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <Button asChild variant="outline" size="sm" className="shrink-0 gap-2">
            <Link href="/dashboard/form-builder">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>

          <div className="min-w-0 flex-1 text-center">
            <h1 className="truncate font-semibold text-2xl tracking-tight sm:text-3xl">{selectedForm.name}</h1>
            <p className="text-muted-foreground text-sm">Last updated {formatDate(selectedForm.updatedAt)}</p>
          </div>

          <div className="w-20" />
        </div>

        <Tabs defaultValue="edit" className="space-y-4">
          <TabsList className="grid w-full max-w-xl grid-cols-3">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-[18rem_minmax(0,1fr)_24rem]">
              <FieldPalette formId={formId} onAddField={handleAddPaletteField} />

              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle>Form settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor={`${formId}-form-name`}>Form name</Label>
                    <Input
                      id={`${formId}-form-name`}
                      value={selectedForm.name}
                      onChange={(event) => handleRename(event.target.value)}
                      placeholder="Untitled Form"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="font-medium text-lg">Builder</h2>
                      <p className="text-muted-foreground text-sm">Add and customize the inputs shown in your form.</p>
                    </div>
                    <Button onClick={handleAddField} className="gap-2">
                      <Plus className="size-4" />
                      Add field
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {selectedForm.fields.length ? (
                      selectedForm.fields.map((field) => (
                        <FieldEditor
                          key={field.id}
                          formId={formId}
                          field={field}
                          onChange={(updates) => handleFieldChange(field.id, updates)}
                          onDelete={() => deleteField(formId, field.id)}
                        />
                      ))
                    ) : (
                      <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center text-muted-foreground text-sm">
                        No fields yet. Add one from the left panel to start building your form.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <LivePreviewCard formId={formId} fields={selectedForm.fields} onSubmit={handleSubmission} />
            </div>
          </TabsContent>

          <TabsContent value="submissions">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle>Submissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedForm.submissions.length ? (
                  <div className="space-y-3">
                    {selectedForm.submissions.map((submission) => (
                      <div key={submission.id} className="rounded-lg border p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <p className="font-medium text-sm">Submitted {formatDate(submission.submittedAt)}</p>
                        </div>
                        <pre className="overflow-auto rounded-md bg-muted/30 p-3 text-xs">
                          {JSON.stringify(submission.values, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center text-muted-foreground text-sm">
                    Submit the preview form to see saved responses here.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <PreviewRenderer formId={formId} fields={selectedForm.fields} onSubmit={handleSubmission} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
