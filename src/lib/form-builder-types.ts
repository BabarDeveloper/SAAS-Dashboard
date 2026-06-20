export type FieldType = "text" | "email" | "textarea" | "select" | "checkbox";

export type FormField = {
  id: string;
  label: string;
  name: string;
  type: FieldType;
  placeholder: string;
  required: boolean;
  options: string;
};

export type FormSubmission = {
  id: string;
  submittedAt: string;
  values: Record<string, string | boolean>;
};

export type SavedForm = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  fields: FormField[];
  submissions: FormSubmission[];
};

export type FieldPaletteItem = {
  label: string;
  type: FieldType;
  description: string;
};
