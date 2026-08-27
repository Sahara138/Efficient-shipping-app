import { useState } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  DataTable,
  Button,
  Badge,
  BlockStack,
  Text,
  Frame,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import type { PaymentGateway } from "../types/analytics";
import { ActionToast } from "../components/shared/ActionToast";

const INITIAL_GATEWAYS: PaymentGateway[] = [
  {
    id: "1",
    name: "Shopify Payments (Credit Card & Shop Pay)",
    type: "CREDIT_CARD",
    enabled: true,
    testMode: false,
  },
  {
    id: "2",
    name: "PayPal Express Checkout",
    type: "WALLET",
    enabled: true,
    testMode: false,
  },
  {
    id: "3",
    name: "Cash on Delivery (COD) / Carrier Collect",
    type: "MANUAL",
    enabled: true,
    testMode: true,
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return json({ gateways: INITIAL_GATEWAYS });
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);
  return json({ success: true });
}

export default function PaymentsRoute() {
  const data = useLoaderData<typeof loader>();
  const [gateways, setGateways] = useState<PaymentGateway[]>(data.gateways);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleToggleEnable = (id: string) => {
    setGateways(
      gateways.map((g) => (g.id === id ? { ...g, enabled: !g.enabled } : g))
    );
    setToastMessage("Payment gateway status updated.");
  };

  const handleToggleTest = (id: string) => {
    setGateways(
      gateways.map((g) => (g.id === id ? { ...g, testMode: !g.testMode } : g))
    );
    setToastMessage("Test mode toggled.");
  };

  const rows = gateways.map((g) => [
    <Text as="span" variant="bodyMd" fontWeight="bold" key={g.id}>
      {g.name}
    </Text>,
    <Badge key={g.id} tone="info">
      {g.type}
    </Badge>,
    <Badge key={g.id} tone={g.enabled ? "success" : "critical"}>
      {g.enabled ? "Enabled" : "Disabled"}
    </Badge>,
    <Badge key={g.id} tone={g.testMode ? "warning" : "success"}>
      {g.testMode ? "Test Mode Active" : "Live Production"}
    </Badge>,
    <Button key={g.id} size="slim" onClick={() => handleToggleEnable(g.id)}>
      {g.enabled ? "Disable" : "Enable"}
    </Button>,
    <Button key={g.id} size="slim" onClick={() => handleToggleTest(g.id)}>
      Toggle Test Mode
    </Button>,
  ]);

  return (
    <Frame>
      <Page
        title="Payment Gateways & Methods"
        subtitle="Manage accepted checkout payment methods and test configurations"
      >
        <TitleBar title="Payment Gateways & Methods" />

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <DataTable
                  columnContentTypes={["text", "text", "text", "text", "text", "text"]}
                  headings={["Gateway Name", "Payment Type", "Status", "Mode", "Actions", "Test Toggle"]}
                  rows={rows}
                />
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {toastMessage && (
          <ActionToast content={toastMessage} onDismiss={() => setToastMessage(null)} />
        )}
      </Page>
    </Frame>
  );
}
