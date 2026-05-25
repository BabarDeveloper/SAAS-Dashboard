export type StageDeal = {
  id: string;
  company: string;
  contact: string;
  value: string;
  eta: string;
  priority: "Low" | "Medium" | "High";
};

export type PipelineStage = {
  id: string;
  name: string;
  winRate: number;
  value: string;
  deals: StageDeal[];
};

export const pipelineSummary = [
  {
    id: "active-deals",
    label: "Active Deals",
    value: "28",
    change: "+4 this week",
  },
  {
    id: "pipeline-value",
    label: "Pipeline Value",
    value: "$426k",
    change: "+9.2% MoM",
  },
  {
    id: "avg-cycle",
    label: "Avg. Sales Cycle",
    value: "21 days",
    change: "-3 days vs last month",
  },
  {
    id: "forecast-accuracy",
    label: "Forecast Accuracy",
    value: "87%",
    change: "+2.1% this quarter",
  },
] as const;

export const pipelineStages: PipelineStage[] = [
  {
    id: "lead-in",
    name: "Lead In",
    winRate: 18,
    value: "$96k",
    deals: [
      {
        id: "deal-01",
        company: "NovaStack",
        contact: "Areeba Khan",
        value: "$14,500",
        eta: "5 days",
        priority: "High",
      },
      {
        id: "deal-02",
        company: "CloudPeak",
        contact: "Hamza Tariq",
        value: "$9,800",
        eta: "8 days",
        priority: "Medium",
      },
      {
        id: "deal-03",
        company: "PixelOrbit",
        contact: "Mariam Zahid",
        value: "$7,200",
        eta: "12 days",
        priority: "Low",
      },
    ],
  },
  {
    id: "qualified",
    name: "Qualified",
    winRate: 34,
    value: "$122k",
    deals: [
      {
        id: "deal-04",
        company: "Vertex Loop",
        contact: "Usman Riaz",
        value: "$18,000",
        eta: "7 days",
        priority: "High",
      },
      {
        id: "deal-05",
        company: "DataNest",
        contact: "Komal Nasir",
        value: "$12,700",
        eta: "10 days",
        priority: "Medium",
      },
      {
        id: "deal-06",
        company: "BrightCore",
        contact: "Ahsan Ali",
        value: "$11,900",
        eta: "14 days",
        priority: "Low",
      },
    ],
  },
  {
    id: "proposal",
    name: "Proposal",
    winRate: 56,
    value: "$138k",
    deals: [
      {
        id: "deal-07",
        company: "ScaleGrid",
        contact: "Fatima Noor",
        value: "$22,400",
        eta: "6 days",
        priority: "High",
      },
      {
        id: "deal-08",
        company: "Skyframe",
        contact: "Bilal Shah",
        value: "$15,300",
        eta: "9 days",
        priority: "Medium",
      },
      {
        id: "deal-09",
        company: "LaunchSprint",
        contact: "Sana Javed",
        value: "$10,600",
        eta: "11 days",
        priority: "Low",
      },
    ],
  },
  {
    id: "negotiation",
    name: "Negotiation",
    winRate: 73,
    value: "$70k",
    deals: [
      {
        id: "deal-10",
        company: "NimblePath",
        contact: "Rida Waqar",
        value: "$24,900",
        eta: "4 days",
        priority: "High",
      },
      {
        id: "deal-11",
        company: "EchoSoft",
        contact: "Talha Nadeem",
        value: "$16,200",
        eta: "6 days",
        priority: "Medium",
      },
      {
        id: "deal-12",
        company: "AsterLabs",
        contact: "Mehreen Iqbal",
        value: "$12,100",
        eta: "7 days",
        priority: "Low",
      },
    ],
  },
];
