import { KpiCards } from "../crm/_components/kpi-cards";
import { OpportunitiesSection } from "../crm/_components/opportunities-section";
import { PipelineActivity } from "../crm/_components/pipeline-activity";
import { MetricCards } from "./_components/metric-cards";
import { PerformanceOverview } from "./_components/performance-overview";
import { SubscriberOverview } from "./_components/subscriber-overview";

export default function Page() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <KpiCards />
      <PipelineActivity />
      <PerformanceOverview />
      {/* <SubscriberOverview /> */}
      <OpportunitiesSection />
    </div>
  );
}
