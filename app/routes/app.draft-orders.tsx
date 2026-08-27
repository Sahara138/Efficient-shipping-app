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
import type { DraftOrder } from "../types/order";
import { FilterPaginationBar } from "../components/shared/FilterPaginationBar";
import { ActionToast } from "../components/shared/ActionToast";

const INITIAL_DRAFTS: DraftOrder[] = [
  {
    id: "gid://shopify/DraftOrder/2001",
    name: "#D2001",
    customerName: "Clark Kent",
    customerEmail: "clark@dailyplanet.com",
    totalPrice: "$320.00",
    status: "OPEN",
    createdAt: "2026-08-26",
    lineItems: [{ id: "1", title: "Custom Bulk Envelopes", quantity: 50, price: "$6.40", sku: "ENV-BLK" }],
  },
  {
    id: "gid://shopify/DraftOrder/2002",
    name: "#D2002",
    customerName: "Diana Prince",
    customerEmail: "diana@themyscira.gov",
    totalPrice: "$1,200.00",
    status: "INVOICE_SENT",
    createdAt: "2026-08-24",
    lineItems: [{ id: "2", title: "Industrial Shipping Container crate", quantity: 2, price: "$600.00", sku: "IND-CRATE" }],
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return json({ drafts: INITIAL_DRAFTS });
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);
  return json({ success: true });
}

export default function DraftOrdersRoute() {
  const data = useLoaderData<typeof loader>();
  const [drafts, setDrafts] = useState<DraftOrder[]>(data.drafts);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [custName, setCustName] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [itemTitle, setItemTitle] = useState("");
  const [itemPrice, setItemPrice] = useState("50.00");
  const [itemQty, setItemQty] = useState("1");

  const filteredDrafts = useMemo(() => {
    return drafts.filter(
      (d) =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.customerName.toLowerCase().includes(search.toLowerCase()) ||
        d.customerEmail.toLowerCase().includes(search.toLowerCase())
    );
  }, [drafts, search]);

  const handleCreateDraft = () => {
    if (!custName || !custEmail || !itemTitle) {
      setToastMessage("Please fill in customer and item details!");
      return;
    }
    const qty = parseInt(itemQty) || 1;
    const price = parseFloat(itemPrice) || 0;
    const total = (qty * price).toFixed(2);

    const newDraft: DraftOrder = {
      id: `gid://shopify/DraftOrder/${Date.now()}`,
      name: `#D${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: custName,
      customerEmail: custEmail,
      totalPrice: `$${total}`,
      status: "OPEN",
      createdAt: new Date().toISOString().split("T")[0],
      lineItems: [
        {
          id: `${Date.now()}`,
          title: itemTitle,
          quantity: qty,
          price: `$${price.toFixed(2)}`,
          sku: `CUSTOM-${Math.floor(Math.random() * 100)}`,
        },
      ],
    };
    setDrafts([newDraft, ...drafts]);
    setIsCreateOpen(false);
    setCustName("");
    setCustEmail("");
    setItemTitle("");
    setToastMessage("Draft Order created successfully!");
  };

  const handleSendInvoice = (id: string) => {
    setDrafts(drafts.map((d) => (d.id === id ? { ...d, status: "INVOICE_SENT" } : d)));
    setToastMessage("Invoice email sent to customer!");
  };

  const handleCompleteOrder = (id: string) => {
    setDrafts(drafts.map((d) => (d.id === id ? { ...d, status: "COMPLETED" } : d)));
    setToastMessage("Draft converted to completed Order!");
  };

  const rows = filteredDrafts.map((d) => [
    <Text as="span" variant="bodyMd" fontWeight="bold" key={d.id}>
      {d.name}
    </Text>,
    d.customerName,
    d.customerEmail,
    d.totalPrice,
    <Badge
      key={d.id}
      tone={d.status === "COMPLETED" ? "success" : d.status === "INVOICE_SENT" ? "info" : "attention"}
    >
      {d.status}
    </Badge>,
    d.createdAt,
    <InlineStack gap="200" key={d.id}>
      {d.status === "OPEN" && (
        <Button size="slim" onClick={() => handleSendInvoice(d.id)}>
          Send Invoice
        </Button>
      )}
      {d.status !== "COMPLETED" && (
        <Button size="slim" variant="primary" onClick={() => handleCompleteOrder(d.id)}>
          Complete Order
        </Button>
      )}
    </InlineStack>,
  ]);

  return (
    <Frame>
      <Page
        title="Draft Orders"
        subtitle="Create custom quotes, send invoices, and convert draft orders"
        primaryAction={{
          content: "Create Draft Order",
          onAction: () => setIsCreateOpen(true),
        }}
      >
        <TitleBar title="Draft Orders" />

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <FilterPaginationBar
                  searchValue={search}
                  onSearchChange={setSearch}
                  searchPlaceholder="Search draft #, customer..."
                />

                <DataTable
                  columnContentTypes={["text", "text", "text", "text", "text", "text", "text"]}
                  headings={["Draft #", "Customer", "Email", "Total", "Status", "Date", "Actions"]}
                  rows={rows}
                />
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Create Draft Modal */}
        <Modal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Create New Draft Order"
          primaryAction={{
            content: "Save Draft",
            onAction: handleCreateDraft,
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
                label="Customer Name"
                value={custName}
                onChange={setCustName}
                autoComplete="off"
              />
              <TextField
                label="Customer Email"
                value={custEmail}
                onChange={setCustEmail}
                type="email"
                autoComplete="off"
              />
              <TextField
                label="Item Title"
                value={itemTitle}
                onChange={setItemTitle}
                autoComplete="off"
              />
              <InlineStack gap="300">
                <TextField
                  label="Unit Price ($)"
                  value={itemPrice}
                  onChange={setItemPrice}
                  type="number"
                  autoComplete="off"
                />
                <TextField
                  label="Quantity"
                  value={itemQty}
                  onChange={setItemQty}
                  type="number"
                  autoComplete="off"
                />
              </InlineStack>
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
