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
  Badge,
  BlockStack,
  Text,
  Frame,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import type { Market } from "../types/analytics";
import { FilterPaginationBar } from "../components/shared/FilterPaginationBar";
import { ActionToast } from "../components/shared/ActionToast";

const INITIAL_MARKETS: Market[] = [
  {
    id: "gid://shopify/Market/9601",
    name: "United States (Primary)",
    regions: ["United States"],
    currency: "USD",
    primary: true,
    enabled: true,
  },
  {
    id: "gid://shopify/Market/9602",
    name: "European Union & UK",
    regions: ["Germany", "France", "United Kingdom", "Netherlands"],
    currency: "EUR / GBP",
    primary: false,
    enabled: true,
  },
  {
    id: "gid://shopify/Market/9603",
    name: "Asia Pacific",
    regions: ["Japan", "Australia", "Singapore"],
    currency: "JPY / AUD / SGD",
    primary: false,
    enabled: false,
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return json({ markets: INITIAL_MARKETS });
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);
  return json({ success: true });
}

export default function MarketsRoute() {
  const data = useLoaderData<typeof loader>();
  const [markets, setMarkets] = useState<Market[]>(data.markets);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("CAD");
  const [regions, setRegions] = useState("Canada");

  const filteredMarkets = useMemo(() => {
    return markets.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));
  }, [markets, search]);

  const handleCreate = () => {
    if (!name) {
      setToastMessage("Market name is required!");
      return;
    }
    const newMarket: Market = {
      id: `gid://shopify/Market/${Date.now()}`,
      name,
      regions: regions.split(",").map((r) => r.trim()),
      currency,
      primary: false,
      enabled: true,
    };
    setMarkets([...markets, newMarket]);
    setIsCreateOpen(false);
    setName("");
    setToastMessage("New International Market added!");
  };

  const handleToggle = (id: string) => {
    setMarkets(
      markets.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
    setToastMessage("Market status updated.");
  };

  const rows = filteredMarkets.map((m) => [
    <Text as="span" variant="bodyMd" fontWeight="bold" key={m.id}>
      {m.name}
    </Text>,
    m.currency,
    m.regions.join(", "),
    <Badge key={m.id} tone={m.primary ? "info" : "attention"}>
      {m.primary ? "Primary Market" : "Regional"}
    </Badge>,
    <Badge key={m.id} tone={m.enabled ? "success" : "critical"}>
      {m.enabled ? "Active" : "Disabled"}
    </Badge>,
    !m.primary ? (
      <Button key={m.id} size="slim" onClick={() => handleToggle(m.id)}>
        Toggle
      </Button>
    ) : (
      <Text key={m.id} as="span" variant="bodySm" tone="subdued">Default</Text>
    ),
  ]);

  return (
    <Frame>
      <Page
        title="Global Markets & Localization"
        subtitle="Manage international markets, currency exchange, and localized shipping strategies"
        primaryAction={{
          content: "Add Market",
          onAction: () => setIsCreateOpen(true),
        }}
      >
        <TitleBar title="Global Markets & Localization" />

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <FilterPaginationBar
                  searchValue={search}
                  onSearchChange={setSearch}
                  searchPlaceholder="Search market name..."
                />

                <DataTable
                  columnContentTypes={["text", "text", "text", "text", "text", "text"]}
                  headings={["Market Name", "Currencies", "Target Regions", "Type", "Status", "Actions"]}
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
          title="Add International Market"
          primaryAction={{
            content: "Save Market",
            onAction: handleCreate,
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
              <TextField label="Market Name" value={name} onChange={setName} placeholder="e.g. North America - Canada" autoComplete="off" />
              <TextField label="Target Currency" value={currency} onChange={setCurrency} placeholder="e.g. CAD" autoComplete="off" />
              <TextField label="Regions (comma separated)" value={regions} onChange={setRegions} placeholder="Canada, Mexico" autoComplete="off" />
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
