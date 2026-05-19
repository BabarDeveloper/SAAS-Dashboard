import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "SAAS Dashboard",
  version: packageJson.version,
  copyright: `© ${currentYear}, SAAS Dashboard.`,
  meta: {
    title: "SAAS Dashboard - Modern Next.js Dashboard Starter Template",
    description:
      "SAAS Dashboard is a modern, open-source dashboard starter template built with Next.js 16, Tailwind CSS v4, and shadcn/ui. Perfect for SaaS apps, admin panels, and internal tools—fully customizable and production-ready.",
  },
};
