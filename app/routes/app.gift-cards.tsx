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
  InlineStack,
  Text,
  Frame,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import type { GiftCard } from "../types/discount";
import { FilterPaginationBar } from "../components/shared/FilterPaginationBar";
import { ActionToast } from "../components/shared/ActionToast";

const INITIAL_GIFTCARDS: GiftCard[] = [
  {
    id: "gid://shopify/GiftCard/9101",
    codeMasked: "•••• •••• •••• 4912",
    initialValue: "$100.00",
    balance: "$75.00",
    customerName: "Sarah Connor",
    status: "ACTIVE",
    createdAt: "2026-08-01",
  },
  {
    id: "gid://shopify/GiftCard/9102",
    codeMasked: "•••• •••• •••• 8821",
    initialValue: "$250.00",
    balance: "$250.00",
    customerName: "Bruce Wayne",
    status: "ACTIVE",
    createdAt: "2026-08-15",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return json({ giftCards: INITIAL_GIFTCARDS });
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);
  return json({ success: true });
}

export default function GiftCardsRoute() {
  const data = useLoaderData<typeof loader>();
  const [giftCards, setGiftCards] = useState<GiftCard[]>(data.giftCards);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [initialVal, setInitialVal] = useState("100.00");
  const [customerName, setCustomerName] = useState("");

  const filteredCards = useMemo(() => {
    return giftCards.filter(
      (g) =>
        g.codeMasked.includes(search) ||
        (g.customerName && g.customerName.toLowerCase().includes(search.toLowerCase()))
    );
  }, [giftCards, search]);

  const handleIssue = () => {
    const valStr = `$${parseFloat(initialVal).toFixed(2)}`;
    const newCard: GiftCard = {
      id: `gid://shopify/GiftCard/${Date.now()}`,
      codeMasked: `•••• •••• •••• ${Math.floor(1000 + Math.random() * 9000)}`,
      initialValue: valStr,
      balance: valStr,
      customerName: customerName || "Guest",
      status: "ACTIVE",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setGiftCards([newCard, ...giftCards]);
    setIsCreateOpen(false);
    setCustomerName("");
    setToastMessage(`Gift Card of ${valStr} issued!`);
  };

  const rows = filteredCards.map((g) => [
    <Text as="span" variant="bodyMd" fontWeight="bold" key={g.id}>
      {g.codeMasked}
    </Text>,
    g.customerName || "N/A",
    g.initialValue,
    g.balance,
    <Badge key={g.id} tone={g.status === "ACTIVE" ? "success" : "critical"}>
      {g.status}
    </Badge>,
    g.createdAt,
    <Button key={g.id} size="slim" onClick={() => setToastMessage("Resent gift card notification email.")}>
      Resend Code
    </Button>,
  ]);

  return (
    <Frame>
      <Page
        title="Gift Cards"
        subtitle="Issue digital gift cards, track remaining balances, and resend codes"
        primaryAction={{
          content: "Issue Gift Card",
          onAction: () => setIsCreateOpen(true),
        }}
      >
        <TitleBar title="Gift Cards" />

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <FilterPaginationBar
                  searchValue={search}
                  onSearchChange={setSearch}
                  searchPlaceholder="Search customer or card digit..."
                />

                <DataTable
                  columnContentTypes={["text", "text", "text", "text", "text", "text", "text"]}
                  headings={["Card Code", "Recipient", "Initial Value", "Balance", "Status", "Issued", "Actions"]}
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
          title="Issue Digital Gift Card"
          primaryAction={{
            content: "Issue Card",
            onAction: handleIssue,
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
              <TextField
                label="Initial Gift Card Value ($)"
                value={initialVal}
                onChange={setInitialVal}
                type="number"
                autoComplete="off"
              />
              <TextField
                label="Recipient Customer Name"
                value={customerName}
                onChange={setCustomerName}
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
