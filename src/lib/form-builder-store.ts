import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { FieldType, FormField, FormSubmission, SavedForm } from "@/lib/form-builder-types";

const createField = (index: number, type: FieldType = "text"): FormField => ({
  id: crypto.randomUUID(),
  label: `Field ${index + 1}`,
  name: `field_${index + 1}`,
  type,
  placeholder: type === "textarea" ? "Type your message" : type === "checkbox" ? "Check this box" : "",
  required: false,
  options: type === "select" ? "Option 1, Option 2, Option 3" : "",
});

const createBlankForm = (name: string): SavedForm => {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name,
    createdAt: now,
    updatedAt: now,
    fields: [],
    submissions: [],
  };
};

type FormsState = {
  forms: SavedForm[];
  initializeForm: (name: string) => SavedForm;
  updateForm: (form: Partial<SavedForm> & Pick<SavedForm, "id">) => void;
  deleteForm: (id: string) => void;
  getFormById: (id: string) => SavedForm | undefined;
  addField: (formId: string, type?: FieldType) => void;
  updateField: (formId: string, fieldId: string, updates: Partial<FormField>) => void;
  deleteField: (formId: string, fieldId: string) => void;
  addSubmission: (formId: string, submission: FormSubmission) => void;
  ensureForm: (formId: string) => SavedForm | undefined;
};

const syncForm = (forms: SavedForm[], form: SavedForm): SavedForm[] =>
  forms.map((currentForm) => (currentForm.id === form.id ? form : currentForm));

export const useFormBuilderStore = create<FormsState>()(
  persist(
    (set, get) => ({
      forms: [],
      initializeForm: (name: string) => {
        const form = createBlankForm(name);
        set((state) => ({ forms: [...state.forms, form] }));
        return form;
      },
      updateForm: (form) => {
        set((state) => {
          const existingForm = state.forms.find((item) => item.id === form.id);
          if (!existingForm) {
            return state;
          }

          const updatedForm: SavedForm = {
            ...existingForm,
            ...form,
            updatedAt: new Date().toISOString(),
          };
          return { forms: syncForm(state.forms, updatedForm) };
        });
      },
      deleteForm: (id: string) => {
        set((state) => ({
          forms: state.forms.filter((form) => form.id !== id),
        }));
      },
      getFormById: (id: string) => get().forms.find((form) => form.id === id),
      addField: (formId: string, type = "text") => {
        set((state) => {
          const existingForm = state.forms.find((form) => form.id === formId);
          if (!existingForm) {
            return state;
          }

          const form = {
            ...existingForm,
            fields: [...existingForm.fields, createField(existingForm.fields.length, type)],
            updatedAt: new Date().toISOString(),
          };

          return { forms: syncForm(state.forms, form) };
        });
      },
      updateField: (formId: string, fieldId: string, updates: Partial<FormField>) => {
        set((state) => {
          const existingForm = state.forms.find((form) => form.id === formId);
          if (!existingForm) {
            return state;
          }

          const form = {
            ...existingForm,
            fields: existingForm.fields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)),
            updatedAt: new Date().toISOString(),
          };

          return { forms: syncForm(state.forms, form) };
        });
      },
      deleteField: (formId: string, fieldId: string) => {
        set((state) => {
          const existingForm = state.forms.find((form) => form.id === formId);
          if (!existingForm) {
            return state;
          }

          const form = {
            ...existingForm,
            fields: existingForm.fields.filter((field) => field.id !== fieldId),
            updatedAt: new Date().toISOString(),
          };

          return { forms: syncForm(state.forms, form) };
        });
      },
      addSubmission: (formId: string, submission: FormSubmission) => {
        set((state) => {
          const existingForm = state.forms.find((form) => form.id === formId);
          if (!existingForm) {
            return state;
          }

          const form = {
            ...existingForm,
            submissions: [submission, ...existingForm.submissions],
            updatedAt: new Date().toISOString(),
          };

          return { forms: syncForm(state.forms, form) };
        });
      },
      ensureForm: (formId: string) => get().forms.find((form) => form.id === formId),
    }),
    {
      name: "dashboard-form-builder",
    },
  ),
);

export const createDefaultField = (index: number) => ({
  id: crypto.randomUUID(),
  label: `Field ${index + 1}`,
  name: `field_${index + 1}`,
  type: "text" as FieldType,
  placeholder: "",
  required: false,
  options: "",
});
