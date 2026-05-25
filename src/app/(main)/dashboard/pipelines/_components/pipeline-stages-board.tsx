import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { pipelineStages, type StageDeal } from "../_data/pipeline-stages";

function priorityBadgeClass(priority: StageDeal["priority"]) {
  if (priority === "High") {
    return "border-destructive/30 bg-destructive/10 text-destructive";
  }

  if (priority === "Medium") {
    return "border-primary/25 bg-primary/10 text-primary";
  }

  return "border-muted-foreground/25 bg-muted text-foreground";
}

export function PipelineStagesBoard() {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl tracking-tight">Pipeline Stages</h2>
        <p className="text-muted-foreground text-sm">Track stage-wise movement and priority across all active deals.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {pipelineStages.map((stage) => (
          <Card key={stage.id} className="min-h-72">
            <CardHeader className="space-y-3 pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{stage.name}</CardTitle>
                <Badge variant="secondary">{stage.deals.length} deals</Badge>
              </div>

              <CardDescription className="flex items-center justify-between text-sm">
                <span>Stage value: {stage.value}</span>
                <span>{stage.winRate}% win rate</span>
              </CardDescription>

              <Progress value={stage.winRate} className="h-2" />
            </CardHeader>

            <CardContent className="space-y-3">
              {stage.deals.map((deal) => (
                <div key={deal.id} className="space-y-2 rounded-lg border border-border/60 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm leading-none">{deal.company}</p>
                      <p className="text-muted-foreground text-xs">{deal.contact}</p>
                    </div>
                    <Badge variant="outline" className={priorityBadgeClass(deal.priority)}>
                      {deal.priority}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{deal.value}</span>
                    <span className="text-muted-foreground">ETA {deal.eta}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
