import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { pipelineSummary } from "../_data/pipeline-stages";

export function PipelineSummary() {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {pipelineSummary.map((item) => (
        <Card key={item.id}>
          <CardHeader className="pb-2">
            <CardDescription>{item.label}</CardDescription>
            <CardTitle className="text-2xl tracking-tight">{item.value}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">{item.change}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
