import { useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  ProgressBar,
  Button,
  Frame,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import type { AnalyticsMetric } from "../types/analytics";
import { ActionToast } from "../components/shared/ActionToast";

const METRICS: AnalyticsMetric[] = [
  { title: "Total Revenue", value: "$48,920.00", change: "+14.2% vs last month", isPositive: true },
  { title: "Total Shipments Executed", value: "1,420", change: "+8.5% vs last month", isPositive: true },
  { title: "Average Delivery Speed", value: "2.4 Days", change: "-0.5 Days faster", isPositive: true },
  { title: "Return & Refund Rate", value: "1.8%", change: "-0.3% reduction", isPositive: true },
];

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return json({ metrics: METRICS });
}

export default function AnalyticsRoute() {
  const { metrics } = useLoaderData<typeof loader>();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  return (
    <Frame>
      <Page
        title="Store Analytics & Reports"
        subtitle="Track logistics efficiency, delivery times, shipping costs, and revenue growth"
        primaryAction={{
          content: "Export PDF Report",
          onAction: () => setToastMessage("Analytics PDF report generated & downloaded!"),
        }}
      >
        <TitleBar title="Store Analytics & Reports" />

        <BlockStack gap="500">
          {/* Top KPI Cards */}
          <Layout>
            {metrics.map((m, idx) => (
              <Layout.Section key={idx} variant="oneHalf">
                <Card>
                  <BlockStack gap="200">
                    <Text as="p" variant="bodySm" tone="subdued">
                      {m.title}
                    </Text>
                    <Text as="h2" variant="heading2xl">
                      {m.value}
                    </Text>
                    <Badge tone={m.isPositive ? "success" : "critical"}>
                      {m.change}
                    </Badge>
                  </BlockStack>
                </Card>
              </Layout.Section>
            ))}
          </Layout>

          {/* Performance Breakdown */}
          <Layout>
            <Layout.Section>
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Carrier Fulfillment Breakdown
                  </Text>

                  <BlockStack gap="300">
                    <div>
                      <InlineStack align="space-between">
                        <Text as="span" variant="bodyMd">DHL Express (On-time 98%)</Text>
                        <Text as="span" variant="bodyMd" fontWeight="semibold">650 Packages</Text>
                      </InlineStack>
                      <ProgressBar progress={98} tone="success" size="small" />
                    </div>

                    <div>
                      <InlineStack align="space-between">
                        <Text as="span" variant="bodyMd">FedEx International (On-time 94%)</Text>
                        <Text as="span" variant="bodyMd" fontWeight="semibold">420 Packages</Text>
                      </InlineStack>
                      <ProgressBar progress={94} tone="success" size="small" />
                    </div>

                    <div>
                      <InlineStack align="space-between">
                        <Text as="span" variant="bodyMd">UPS Ground (On-time 91%)</Text>
                        <Text as="span" variant="bodyMd" fontWeight="semibold">350 Packages</Text>
                      </InlineStack>
                      <ProgressBar progress={91} tone="primary" size="small" />
                    </div>
                  </BlockStack>
                </BlockStack>
              </Card>
            </Layout.Section>

            <Layout.Section variant="oneThird">
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Top Shipping Destinations
                  </Text>
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd">1. 🇺🇸 United States (62%)</Text>
                    <Text as="p" variant="bodyMd">2. 🇬🇧 United Kingdom (15%)</Text>
                    <Text as="p" variant="bodyMd">3. 🇩🇪 Germany (12%)</Text>
                    <Text as="p" variant="bodyMd">4. 🇨🇦 Canada (7%)</Text>
                    <Text as="p" variant="bodyMd">5. 🇯🇵 Japan (4%)</Text>
                  </BlockStack>
                  <Button fullWidth onClick={() => setToastMessage("Detailed geographic report opened.")}>
                    View Destination Map
                  </Button>
                </BlockStack>
              </Card>
            </Layout.Section>
          </Layout>
        </BlockStack>

        {toastMessage && (
          <ActionToast content={toastMessage} onDismiss={() => setToastMessage(null)} />
        )}
      </Page>
    </Frame>
  );
}
