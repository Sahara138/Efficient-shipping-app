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
  Box,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import type { Order } from "../types/order";
import { FilterPaginationBar } from "../components/shared/FilterPaginationBar";
import { ActionToast } from "../components/shared/ActionToast";

const INITIAL_ORDERS: Order[] = [
  {
    id: "gid://shopify/Order/1001",
    name: "#1001",
    customerName: "Sarah Connor",
    customerEmail: "sarah@cyberdyne.com",
    totalPrice: "$149.99",
    currency: "USD",
    financialStatus: "PAID",
    fulfillmentStatus: "UNFULFILLED",
    createdAt: "2026-08-26",
    shippingAddress: "742 Evergreen Terrace, Springfield, OR",
    lineItems: [
      { id: "1", title: "Heavy Duty Shipping Box", quantity: 2, price: "$24.99", sku: "BOX-HD-01" },
      { id: "2", title: "Thermal Shipping Label Printer", quantity: 1, price: "$99.99", sku: "PRN-TH-99" },
    ],
  },
  {
    id: "gid://shopify/Order/1002",
    name: "#1002",
    customerName: "Bruce Wayne",
    customerEmail: "bruce@gotham.org",
    totalPrice: "$450.00",
    currency: "USD",
    financialStatus: "PAID",
    fulfillmentStatus: "FULFILLED",
    createdAt: "2026-08-25",
    shippingAddress: "1007 Mountain Drive, Gotham City, NY",
    trackingNumber: "DHL998473612",
    carrier: "DHL Express",
    lineItems: [
      { id: "3", title: "Armored Freight Pallet", quantity: 1, price: "$450.00", sku: "PLT-ARM-00" },
    ],
  },
  {
    id: "gid://shopify/Order/1003",
    name: "#1003",
    customerName: "Peter Parker",
    customerEmail: "peter@dailybugle.com",
    totalPrice: "$85.50",
    currency: "USD",
    financialStatus: "PENDING",
    fulfillmentStatus: "UNFULFILLED",
    createdAt: "2026-08-27",
    shippingAddress: "20 Ingram St, Queens, NY",
    lineItems: [
      { id: "4", title: "Bubble Wrap Roll (50m)", quantity: 3, price: "$28.50", sku: "BBL-50M" },
    ],
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return json({ orders: INITIAL_ORDERS });
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);
  return json({ success: true });
}

export default function OrdersRoute() {
  const data = useLoaderData<typeof loader>();
  const [orders, setOrders] = useState<Order[]>(data.orders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isFulfillModalOpen, setIsFulfillModalOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("DHL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchesSearch =
        ord.name.toLowerCase().includes(search.toLowerCase()) ||
        ord.customerName.toLowerCase().includes(search.toLowerCase()) ||
        ord.customerEmail.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" ||
        ord.fulfillmentStatus === statusFilter ||
        ord.financialStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, page]);

  const handleFulfillSubmit = () => {
    if (!activeOrder) return;
    setOrders(
      orders.map((o) =>
        o.id === activeOrder.id
          ? {
              ...o,
              fulfillmentStatus: "FULFILLED",
              trackingNumber: trackingNumber || `TRK-${Date.now()}`,
              carrier,
            }
          : o
      )
    );
    setIsFulfillModalOpen(false);
    setActiveOrder(null);
    setTrackingNumber("");
    setToastMessage(`Order ${activeOrder.name} fulfilled successfully!`);
  };

  const handleBulkFulfill = () => {
    setOrders(
      orders.map((o) =>
        selectedIds.includes(o.id)
          ? { ...o, fulfillmentStatus: "FULFILLED", carrier: "UPS", trackingNumber: `UPS-${Date.now()}` }
          : o
      )
    );
    setSelectedIds([]);
    setToastMessage(`${selectedIds.length} orders marked as fulfilled.`);
  };

  const rows = paginatedOrders.map((ord) => [
    <Text as="span" variant="bodyMd" fontWeight="bold" key={ord.id}>
      {ord.name}
    </Text>,
    ord.customerName,
    ord.totalPrice,
    <Badge key={ord.id} tone={ord.financialStatus === "PAID" ? "success" : "warning"}>
      {ord.financialStatus}
    </Badge>,
    <Badge key={ord.id} tone={ord.fulfillmentStatus === "FULFILLED" ? "success" : "attention"}>
      {ord.fulfillmentStatus}
    </Badge>,
    ord.createdAt,
    <InlineStack gap="200" key={ord.id}>
      <Button size="slim" onClick={() => setActiveOrder(ord)}>
        Details
      </Button>
      {ord.fulfillmentStatus !== "FULFILLED" && (
        <Button
          size="slim"
          variant="primary"
          onClick={() => {
            setActiveOrder(ord);
            setIsFulfillModalOpen(true);
          }}
        >
          Fulfill
        </Button>
      )}
    </InlineStack>,
  ]);

  return (
    <Frame>
      <Page
        title="Orders & Fulfillment"
        subtitle="Manage customer orders, shipments, and tracking status"
      >
        <TitleBar title="Orders & Fulfillment" />

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <FilterPaginationBar
                  searchValue={search}
                  onSearchChange={setSearch}
                  searchPlaceholder="Search order #, customer, email..."
                  filterOptions={[
                    { label: "All Orders", value: "ALL" },
                    { label: "Unfulfilled", value: "UNFULFILLED" },
                    { label: "Fulfilled", value: "FULFILLED" },
                    { label: "Paid", value: "PAID" },
                    { label: "Pending", value: "PENDING" },
                  ]}
                  selectedFilter={statusFilter}
                  onFilterChange={setStatusFilter}
                  selectedCount={selectedIds.length}
                  bulkActions={[
                    {
                      content: "Bulk Mark Fulfilled",
                      onAction: handleBulkFulfill,
                    },
                  ]}
                  pagination={{
                    hasNext: page * pageSize < filteredOrders.length,
                    hasPrevious: page > 1,
                    onNext: () => setPage((p) => p + 1),
                    onPrevious: () => setPage((p) => Math.max(1, p - 1)),
                  }}
                />

                <DataTable
                  columnContentTypes={["text", "text", "text", "text", "text", "text", "text"]}
                  headings={["Order", "Customer", "Total", "Payment", "Fulfillment", "Date", "Actions"]}
                  rows={rows}
                />
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Fulfill Modal */}
        <Modal
          open={isFulfillModalOpen}
          onClose={() => setIsFulfillModalOpen(false)}
          title={`Fulfill Order ${activeOrder?.name}`}
          primaryAction={{
            content: "Complete Fulfillment",
            onAction: handleFulfillSubmit,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: () => setIsFulfillModalOpen(false),
            },
          ]}
        >
          <Modal.Section>
            <BlockStack gap="300">
              <Select
                label="Shipping Carrier"
                options={[
                  { label: "DHL Express", value: "DHL" },
                  { label: "FedEx International", value: "FEDEX" },
                  { label: "UPS Ground", value: "UPS" },
                  { label: "USPS Priority", value: "USPS" },
                ]}
                value={carrier}
                onChange={setCarrier}
              />
              <TextField
                label="Tracking Number"
                value={trackingNumber}
                onChange={setTrackingNumber}
                placeholder="e.g. 1Z9999999999999999"
                autoComplete="off"
              />
            </BlockStack>
          </Modal.Section>
        </Modal>

        {/* Order Detail Modal */}
        {activeOrder && !isFulfillModalOpen && (
          <Modal
            open={Boolean(activeOrder)}
            onClose={() => setActiveOrder(null)}
            title={`Order Summary: ${activeOrder.name}`}
            primaryAction={{
              content: "Close",
              onAction: () => setActiveOrder(null),
            }}
          >
            <Modal.Section>
              <BlockStack gap="300">
                <Text as="p" variant="bodyMd">
                  <strong>Customer:</strong> {activeOrder.customerName} ({activeOrder.customerEmail})
                </Text>
                <Text as="p" variant="bodyMd">
                  <strong>Shipping Address:</strong> {activeOrder.shippingAddress}
                </Text>
                <Text as="p" variant="bodyMd">
                  <strong>Financial Status:</strong> {activeOrder.financialStatus}
                </Text>
                <Text as="p" variant="bodyMd">
                  <strong>Fulfillment Status:</strong> {activeOrder.fulfillmentStatus}
                </Text>
                {activeOrder.trackingNumber && (
                  <Text as="p" variant="bodyMd">
                    <strong>Carrier & Tracking:</strong> {activeOrder.carrier} - {activeOrder.trackingNumber}
                  </Text>
                )}
                <Box paddingBlock="200">
                  <Text as="h3" variant="headingSm">
                    Line Items:
                  </Text>
                  {activeOrder.lineItems.map((item) => (
                    <Text key={item.id} as="p" variant="bodySm">
                      • {item.title} (x{item.quantity}) - {item.price} [SKU: {item.sku}]
                    </Text>
                  ))}
                </Box>
                <Text as="h3" variant="headingMd">
                  Total: {activeOrder.totalPrice} {activeOrder.currency}
                </Text>
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
