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
import type { InventoryItem } from "../types/inventory";
import { FilterPaginationBar } from "../components/shared/FilterPaginationBar";
import { ActionToast } from "../components/shared/ActionToast";

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: "gid://shopify/InventoryItem/6001",
    sku: "BOX-HD-01",
    productTitle: "Heavy Duty Shipping Box",
    variantTitle: "Large (40x40x40cm)",
    available: 450,
    onHand: 500,
    committed: 50,
    locationName: "Main Warehouse - Portland",
    updatedAt: "2026-08-27",
  },
  {
    id: "gid://shopify/InventoryItem/6002",
    sku: "PRN-TH-99",
    productTitle: "Thermal Label Printer",
    variantTitle: "Wi-Fi + USB Model",
    available: 12,
    onHand: 15,
    committed: 3,
    locationName: "Main Warehouse - Portland",
    updatedAt: "2026-08-26",
  },
  {
    id: "gid://shopify/InventoryItem/6003",
    sku: "BBL-50M",
    productTitle: "Bubble Wrap Roll",
    variantTitle: "50 Meters Heavy Duty",
    available: 3,
    onHand: 5,
    committed: 2,
    locationName: "East Coast Logistics Hub",
    updatedAt: "2026-08-24",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return json({ inventory: INITIAL_INVENTORY });
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);
  return json({ success: true });
}

export default function InventoryRoute() {
  const data = useLoaderData<typeof loader>();
  const [items, setItems] = useState<InventoryItem[]>(data.inventory);
  const [search, setSearch] = useState("");
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("0");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return items.filter(
      (item) =>
        item.productTitle.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase()) ||
        item.locationName.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const handleAdjustStock = () => {
    if (!activeItem) return;
    const delta = parseInt(adjustAmount) || 0;
    setItems(
      items.map((item) =>
        item.id === activeItem.id
          ? {
              ...item,
              available: Math.max(0, item.available + delta),
              onHand: Math.max(0, item.onHand + delta),
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : item
      )
    );
    setActiveItem(null);
    setAdjustAmount("0");
    setToastMessage(`Adjusted stock by ${delta > 0 ? "+" : ""}${delta} units.`);
  };

  const rows = filteredItems.map((item) => [
    <Text as="span" variant="bodyMd" fontWeight="bold" key={item.id}>
      {item.productTitle}
    </Text>,
    item.variantTitle,
    item.sku,
    item.locationName,
    <Badge key={item.id} tone={item.available < 10 ? "warning" : "success"}>
      {item.available.toString()}
    </Badge>,
    item.onHand.toString(),
    item.committed.toString(),
    <Button key={item.id} size="slim" variant="primary" onClick={() => setActiveItem(item)}>
      Adjust Stock
    </Button>,
  ]);

  return (
    <Frame>
      <Page title="Inventory & Stock" subtitle="Manage stock levels across warehouses and fulfillment centers">
        <TitleBar title="Inventory & Stock" />

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <FilterPaginationBar
                  searchValue={search}
                  onSearchChange={setSearch}
                  searchPlaceholder="Search product title, SKU, or location..."
                />

                <DataTable
                  columnContentTypes={["text", "text", "text", "text", "numeric", "numeric", "numeric", "text"]}
                  headings={["Product", "Variant", "SKU", "Location", "Available", "On Hand", "Committed", "Actions"]}
                  rows={rows}
                />
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Adjust Stock Modal */}
        {activeItem && (
          <Modal
            open={Boolean(activeItem)}
            onClose={() => setActiveItem(null)}
            title={`Adjust Stock: ${activeItem.productTitle} (${activeItem.sku})`}
            primaryAction={{
              content: "Save Stock Adjustment",
              onAction: handleAdjustStock,
            }}
            secondaryActions={[
              {
                content: "Cancel",
                onAction: () => setActiveItem(null),
              },
            ]}
          >
            <Modal.Section>
              <BlockStack gap="300">
                <Text as="p" variant="bodyMd">
                  Current Available Stock: <strong>{activeItem.available}</strong> units at{" "}
                  <strong>{activeItem.locationName}</strong>
                </Text>
                <TextField
                  label="Adjustment Quantity (positive to add, negative to subtract)"
                  value={adjustAmount}
                  onChange={setAdjustAmount}
                  type="number"
                  autoComplete="off"
                  helpText="Example: 50 adds 50 units. -10 removes 10 units."
                />
              </BlockStack>
            </Modal.Section>
          </Modal>
        )}

        {toastMessage && (
          <ActionToast content={toastMessage} onDismiss={() => setToastMessage(null)} />
        )}
      </Page>
    </Frame>
  );
}
