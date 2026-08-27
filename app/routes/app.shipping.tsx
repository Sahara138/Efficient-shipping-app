import { useState, useMemo } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  DataTable,
  Button,
  Modal,
  TextField,
  Select,
  Badge,
  BlockStack,
  InlineStack,
  Text,
  Frame,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import type { ShippingRateRule } from "../types/inventory";
import { FilterPaginationBar } from "../components/shared/FilterPaginationBar";
import { ActionToast } from "../components/shared/ActionToast";

const INITIAL_SHIPPING: ShippingRateRule[] = [
  {
    id: "gid://shopify/ShippingRate/8001",
    name: "Standard Ground Delivery",
    carrier: "UPS",
    basePrice: "$12.00",
    minWeightKg: 0,
    maxWeightKg: 5,
    deliveryTimeDays: "3-5 Business Days",
    isActive: true,
  },
  {
    id: "gid://shopify/ShippingRate/8002",
    name: "Express International Air",
    carrier: "DHL",
    basePrice: "$45.00",
    minWeightKg: 0,
    maxWeightKg: 20,
    deliveryTimeDays: "1-2 Business Days",
    isActive: true,
  },
  {
    id: "gid://shopify/ShippingRate/8003",
    name: "Heavy Freight Rate",
    carrier: "FEDEX",
    basePrice: "$150.00",
    minWeightKg: 20,
    maxWeightKg: 100,
    deliveryTimeDays: "5-7 Business Days",
    isActive: true,
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return json({ shippingRules: INITIAL_SHIPPING });
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);
  return json({ success: true });
}

export default function ShippingRoute() {
  const data = useLoaderData<typeof loader>();
  const [rules, setRules] = useState<ShippingRateRule[]>(data.shippingRules);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [carrier, setCarrier] = useState<"DHL" | "FEDEX" | "UPS" | "USPS" | "CUSTOM">("DHL");
  const [basePrice, setBasePrice] = useState("15.00");
  const [deliveryTimeDays, setDeliveryTimeDays] = useState("2-3 Days");

  const filteredRules = useMemo(() => {
    return rules.filter(
      (r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.carrier.toLowerCase().includes(search.toLowerCase())
    );
  }, [rules, search]);

  const handleCreateRule = () => {
    if (!name) {
      setToastMessage("Rate rule name is required!");
      return;
    }
    const newRule: ShippingRateRule = {
      id: `gid://shopify/ShippingRate/${Date.now()}`,
      name,
      carrier,
      basePrice: `$${parseFloat(basePrice).toFixed(2)}`,
      minWeightKg: 0,
      maxWeightKg: 10,
      deliveryTimeDays,
      isActive: true,
    };
    setRules([newRule, ...rules]);
    setIsCreateOpen(false);
    setName("");
    setToastMessage("New Shipping Rate Rule added!");
  };

  const handleToggle = (id: string) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)));
    setToastMessage("Shipping rule status updated.");
  };

  const rows = filteredRules.map((r) => [
    <Text as="span" variant="bodyMd" fontWeight="bold" key={r.id}>
      {r.name}
    </Text>,
    <Badge key={r.id} tone="info">
      {r.carrier}
    </Badge>,
    r.basePrice,
    `${r.minWeightKg} - ${r.maxWeightKg} kg`,
    r.deliveryTimeDays,
    <Badge key={r.id} tone={r.isActive ? "success" : "critical"}>
      {r.isActive ? "Active" : "Disabled"}
    </Badge>,
    <Button key={r.id} size="slim" onClick={() => handleToggle(r.id)}>
      Toggle
    </Button>,
  ]);

  return (
    <Frame>
      <Page
        title="Shipping & Carrier Rates"
        subtitle="Configure live shipping rate rules, carrier integrations, and packaging rules"
        primaryAction={{
          content: "Add Shipping Rate",
          onAction: () => setIsCreateOpen(true),
        }}
      >
        <TitleBar title="Shipping & Carrier Rates" />

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <FilterPaginationBar
                  searchValue={search}
                  onSearchChange={setSearch}
                  searchPlaceholder="Search shipping rule or carrier..."
                />

                <DataTable
                  columnContentTypes={["text", "text", "text", "text", "text", "text", "text"]}
                  headings={["Rate Name", "Carrier", "Base Price", "Weight Bracket", "Est. Delivery", "Status", "Actions"]}
                  rows={rows}
                />
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Modal */}
        <Modal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Add Shipping Rate Rule"
          primaryAction={{
            content: "Save Rate Rule",
            onAction: handleCreateRule,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: () => setIsCreateOpen(false),
            },
          ]}
        >
          <Modal.Section>
            <BlockStack gap="300">
              <TextField label="Rate Rule Name" value={name} onChange={setName} autoComplete="off" />
              <Select
                label="Carrier Service"
                options={[
                  { label: "DHL Express", value: "DHL" },
                  { label: "FedEx Priority", value: "FEDEX" },
                  { label: "UPS Ground", value: "UPS" },
                  { label: "USPS Mail", value: "USPS" },
                  { label: "Custom Courier", value: "CUSTOM" },
                ]}
                value={carrier}
                onChange={(val) => setCarrier(val as any)}
              />
              <TextField
                label="Base Shipping Price ($)"
                value={basePrice}
                onChange={setBasePrice}
                type="number"
                autoComplete="off"
              />
              <TextField
                label="Estimated Delivery Time"
                value={deliveryTimeDays}
                onChange={setDeliveryTimeDays}
                autoComplete="off"
              />
            </BlockStack>
          </Modal.Section>
        </Modal>

        {toastMessage && (
          <ActionToast content={toastMessage} onDismiss={() => setToastMessage(null)} />
        )}
      </Page>
    </Frame>
  );
}
