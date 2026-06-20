import React, { Suspense } from "react";

import FormBuilderClient from "./FormBuilderClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <FormBuilderClient />
    </Suspense>
  );
}
