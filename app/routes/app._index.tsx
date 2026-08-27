import { useState, useMemo } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
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
  Button,
  Box,
  Divider,
  ProgressBar,
  Modal,
  TextField,
  Select,
  Frame,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { FilterPaginationBar } from "../components/shared/FilterPaginationBar";
import { ActionToast } from "../components/shared/ActionToast";

type Shipment = {
  id: string;
  customer: string;
  destination: string;
  carrier: "DHL" | "FedEx" | "UPS" | "USPS";
  status: "In transit" | "Delivered" | "Pending" | "Exception";
  trackingNumber: string;
  date: string;
};

const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: "#SH-1048",
    customer: "John Smith",
    destination: "New York, USA",
    carrier: "DHL",
    status: "In transit",
    trackingNumber: "DHL-9874102",
    date: "2026-08-27",
  },
  {
    id: "#SH-1047",
    customer: "Emma Johnson",
    destination: "California, USA",
    carrier: "FedEx",
    status: "Delivered",
    trackingNumber: "FDX-1092834",
    date: "2026-08-26",
  },
  {
    id: "#SH-1046",
    customer: "Michael Brown",
    destination: "Texas, USA",
    carrier: "UPS",
    status: "Pending",
    trackingNumber: "UPS-5541092",
    date: "2026-08-25",
  },
  {
    id: "#SH-1045",
    customer: "Sophia Wilson",
    destination: "Florida, USA",
    carrier: "USPS",
    status: "Delivered",
    trackingNumber: "USP-8821094",
    date: "2026-08-24",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return json({ initialShipments: INITIAL_SHIPMENTS });
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);
  return json({ success: true });
}

export default function Index() {
  const { initialShipments } = useLoaderData<typeof loader>();
  const [shipments, setShipments] = useState<Shipment[]>(initialShipments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [activeShipment, setActiveShipment] = useState<Shipment | null>(null);

  // Form Fields
  const [customer, setCustomer] = useState("");
  const [destination, setDestination] = useState("");
  const [carrier, setCarrier] = useState<"DHL" | "FedEx" | "UPS" | "USPS">("DHL");
  const [trackLookup, setTrackLookup] = useState("");
  const [lookupResult, setLookupResult] = useState<Shipment | null>(null);

  // Calculated Stats
  const stats = useMemo(() => {
    const total = shipments.length;
    const inTransit = shipments.filter((s) => s.status === "In transit").length;
    const delivered = shipments.filter((s) => s.status === "Delivered").length;
    const pending = shipments.filter((s) => s.status === "Pending").length;
    return { total, inTransit, delivered, pending };
  }, [shipments]);

  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      const matchesSearch =
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.customer.toLowerCase().includes(search.toLowerCase()) ||
        s.destination.toLowerCase().includes(search.toLowerCase()) ||
        s.trackingNumber.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [shipments, search, statusFilter]);

  const getStatusTone = (
    status: string
  ): "success" | "warning" | "info" | "attention" => {
    switch (status) {
      case "Delivered":
        return "success";
      case "In transit":
        return "info";
      case "Pending":
        return "warning";
      default:
        return "attention";
    }
  };

  const handleCreateShipment = () => {
    if (!customer || !destination) {
      setToastMessage("Customer name and destination are required!");
      return;
    }
    const newId = `#SH-${Math.floor(1050 + Math.random() * 900)}`;
    const trk = `${carrier.toUpperCase()}-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const newShipment: Shipment = {
      id: newId,
      customer,
      destination,
      carrier,
      status: "In transit",
      trackingNumber: trk,
      date: new Date().toISOString().split("T")[0],
    };

    setShipments([newShipment, ...shipments]);
    setIsCreateOpen(false);
    setCustomer("");
    setDestination("");
    setToastMessage(`Shipment ${newId} created with tracking ${trk}`);
  };

  const handleUpdateStatus = (id: string, newStatus: Shipment["status"]) => {
    setShipments(
      shipments.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
    if (activeShipment && activeShipment.id === id) {
      setActiveShipment({ ...activeShipment, status: newStatus });
    }
    setToastMessage(`Shipment ${id} updated to ${newStatus}`);
  };

  const handleTrackSearch = () => {
    const found = shipments.find(
      (s) =>
        s.trackingNumber.toLowerCase() === trackLookup.trim().toLowerCase() ||
        s.id.toLowerCase() === trackLookup.trim().toLowerCase()
    );
    if (found) {
      setLookupResult(found);
      setToastMessage(`Found shipment details for ${found.id}`);
    } else {
      setLookupResult(null);
      setToastMessage("No shipment found matching that tracking code.");
    }
  };

  return (
    <Frame>
      <Page
        title="Efficient Shipping Dashboard"
        subtitle="Manage your orders, shipments, and live delivery performance"
        primaryAction={{
          content: "Create shipment",
          onAction: () => setIsCreateOpen(true),
        }}
        secondaryActions={[
          {
            content: "Track shipment",
            onAction: () => setIsTrackOpen(true),
          },
        ]}
      >
        <TitleBar title="Efficient Shipping Dashboard" />

        <BlockStack gap="500">
          {/* WELCOME SECTION */}
          <Card>
            <BlockStack gap="300">
              <BlockStack gap="100">
                <Text as="h2" variant="headingLg">
                  Welcome back 👋
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Here is real-time shipping performance and active delivery status today.
                </Text>
              </BlockStack>

              <InlineStack gap="300">
                <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
                  Create shipment
                </Button>
                <Button onClick={() => setIsTrackOpen(true)}>
                  Track shipment
                </Button>
                <Button url="/app/orders">
                  View orders
                </Button>
                <Button url="/app/shipping">
                  Shipping rates
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>

          {/* DYNAMIC STATISTICS */}
          <Layout>
            <Layout.Section variant="oneHalf">
              <Card>
                <BlockStack gap="200">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Total shipments
                  </Text>
                  <Text as="h2" variant="heading2xl">
                    {stats.total}
                  </Text>
                  <Text as="p" variant="bodySm" tone="success">
                    ↑ Live tracked packages
                  </Text>
                </BlockStack>
              </Card>
            </Layout.Section>

            <Layout.Section variant="oneHalf">
              <Card>
                <BlockStack gap="200">
                  <Text as="p" variant="bodySm" tone="subdued">
                    In transit
                  </Text>
                  <Text as="h2" variant="heading2xl">
                    {stats.inTransit}
                  </Text>
                  <Badge tone="info">Active shipments</Badge>
                </BlockStack>
              </Card>
            </Layout.Section>

            <Layout.Section variant="oneHalf">
              <Card>
                <BlockStack gap="200">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Delivered
                  </Text>
                  <Text as="h2" variant="heading2xl">
                    {stats.delivered}
                  </Text>
                  <Badge tone="success">Successfully delivered</Badge>
                </BlockStack>
              </Card>
            </Layout.Section>

            <Layout.Section variant="oneHalf">
              <Card>
                <BlockStack gap="200">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Pending
                  </Text>
                  <Text as="h2" variant="heading2xl">
                    {stats.pending}
                  </Text>
                  <Badge tone="warning">Needs attention</Badge>
                </BlockStack>
              </Card>
            </Layout.Section>
          </Layout>

          {/* MAIN CONTENT */}
          <Layout>
            {/* RECENT SHIPMENTS */}
            <Layout.Section>
              <Card>
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <BlockStack gap="100">
                      <Text as="h2" variant="headingMd">
                        Recent shipments activity
                      </Text>
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Search and manage live shipping activity.
                      </Text>
                    </BlockStack>
                  </InlineStack>

                  <FilterPaginationBar
                    searchValue={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search shipment ID, customer, tracking #..."
                    filterOptions={[
                      { label: "All Statuses", value: "ALL" },
                      { label: "In transit", value: "In transit" },
                      { label: "Delivered", value: "Delivered" },
                      { label: "Pending", value: "Pending" },
                    ]}
                    selectedFilter={statusFilter}
                    onFilterChange={setStatusFilter}
                  />

                  <Divider />

                  <BlockStack gap="0">
                    {filteredShipments.length === 0 ? (
                      <Box paddingBlock="400">
                        <Text as="p" tone="subdued">No shipments matching your filter criteria.</Text>
                      </Box>
                    ) : (
                      filteredShipments.map((shipment, index) => (
                        <Box key={shipment.id} paddingBlock="400">
                          <InlineStack align="space-between" blockAlign="center" gap="400" wrap={false}>
                            <BlockStack gap="100">
                              <InlineStack gap="200">
                                <Text as="h3" variant="headingSm">
                                  {shipment.id}
                                </Text>
                                <Badge tone={getStatusTone(shipment.status)}>
                                  {shipment.status}
                                </Badge>
                              </InlineStack>

                              <Text as="p" variant="bodySm" tone="subdued">
                                {shipment.customer} • {shipment.destination}
                              </Text>

                              <Text as="p" variant="bodySm" tone="subdued">
                                Carrier: {shipment.carrier} | Tracking: <strong>{shipment.trackingNumber}</strong>
                              </Text>
                            </BlockStack>

                            <InlineStack gap="200">
                              {shipment.status !== "Delivered" && (
                                <Button
                                  size="slim"
                                  onClick={() => handleUpdateStatus(shipment.id, "Delivered")}
                                >
                                  Mark Delivered
                                </Button>
                              )}
                              <Button
                                size="slim"
                                variant="primary"
                                onClick={() => setActiveShipment(shipment)}
                              >
                                Details
                              </Button>
                            </InlineStack>
                          </InlineStack>

                          {index < filteredShipments.length - 1 && (
                            <Box paddingBlockStart="400">
                              <Divider />
                            </Box>
                          )}
                        </Box>
                      ))
                    )}
                  </BlockStack>
                </BlockStack>
              </Card>
            </Layout.Section>

            {/* RIGHT SIDE: PERFORMANCE & QUICK ACTIONS */}
            <Layout.Section variant="oneThird">
              <BlockStack gap="500">
                {/* DELIVERY PERFORMANCE */}
                <Card>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                      Delivery performance
                    </Text>

                    <BlockStack gap="200">
                      <InlineStack align="space-between">
                        <Text as="span" variant="bodyMd">On-time delivery</Text>
                        <Text as="span" variant="bodyMd" fontWeight="semibold">94%</Text>
                      </InlineStack>
                      <ProgressBar progress={94} size="small" tone="success" />
                    </BlockStack>

                    <BlockStack gap="200">
                      <InlineStack align="space-between">
                        <Text as="span" variant="bodyMd">Shipment success</Text>
                        <Text as="span" variant="bodyMd" fontWeight="semibold">98%</Text>
                      </InlineStack>
                      <ProgressBar progress={98} size="small" />
                    </BlockStack>

                    <BlockStack gap="200">
                      <InlineStack align="space-between">
                        <Text as="span" variant="bodyMd">Customer satisfaction</Text>
                        <Text as="span" variant="bodyMd" fontWeight="semibold">92%</Text>
                      </InlineStack>
                      <ProgressBar progress={92} size="small" />
                    </BlockStack>
                  </BlockStack>
                </Card>

                {/* QUICK ACTIONS */}
                <Card>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                      Quick actions
                    </Text>

                    <BlockStack gap="200">
                      <Button fullWidth variant="primary" onClick={() => setIsCreateOpen(true)}>
                        Create new shipment
                      </Button>

                      <Button fullWidth onClick={() => setIsImportOpen(true)}>
                        Import unfulfilled orders
                      </Button>

                      <Button fullWidth onClick={() => setIsTrackOpen(true)}>
                        Track shipment
                      </Button>

                      <Button fullWidth url="/app/shipping">
                        Manage shipping rates
                      </Button>
                    </BlockStack>
                  </BlockStack>
                </Card>
              </BlockStack>
            </Layout.Section>
          </Layout>
        </BlockStack>

        {/* MODAL: CREATE SHIPMENT */}
        <Modal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Create New Shipment"
          primaryAction={{
            content: "Generate Label & Shipment",
            onAction: handleCreateShipment,
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
                label="Customer Full Name"
                value={customer}
                onChange={setCustomer}
                placeholder="e.g. Alexander Pierce"
                autoComplete="off"
              />
              <TextField
                label="Destination Address"
                value={destination}
                onChange={setDestination}
                placeholder="e.g. Seattle, WA, USA"
                autoComplete="off"
              />
              <Select
                label="Carrier Service"
                options={[
                  { label: "DHL Express", value: "DHL" },
                  { label: "FedEx Priority", value: "FedEx" },
                  { label: "UPS Ground", value: "UPS" },
                  { label: "USPS Mail", value: "USPS" },
                ]}
                value={carrier}
                onChange={(val) => setCarrier(val as any)}
              />
            </BlockStack>
          </Modal.Section>
        </Modal>

        {/* MODAL: TRACK SHIPMENT */}
        <Modal
          open={isTrackOpen}
          onClose={() => {
            setIsTrackOpen(false);
            setLookupResult(null);
          }}
          title="Live Shipment Tracker"
          primaryAction={{
            content: "Lookup Tracking",
            onAction: handleTrackSearch,
          }}
          secondaryActions={[
            {
              content: "Close",
              onAction: () => {
                setIsTrackOpen(false);
                setLookupResult(null);
              },
            },
          ]}
        >
          <Modal.Section>
            <BlockStack gap="300">
              <TextField
                label="Tracking Number or Shipment ID"
                value={trackLookup}
                onChange={setTrackLookup}
                placeholder="Try: DHL-9874102 or #SH-1048"
                autoComplete="off"
              />
              {lookupResult && (
                <Card>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd">
                      Shipment {lookupResult.id} Status: {lookupResult.status}
                    </Text>
                    <Text as="p">Customer: {lookupResult.customer}</Text>
                    <Text as="p">Destination: {lookupResult.destination}</Text>
                    <Text as="p">Carrier: {lookupResult.carrier}</Text>
                    <Text as="p">Tracking Code: {lookupResult.trackingNumber}</Text>
                  </BlockStack>
                </Card>
              )}
            </BlockStack>
          </Modal.Section>
        </Modal>

        {/* MODAL: IMPORT UNFULFILLED ORDERS */}
        <Modal
          open={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          title="Import Unfulfilled Shopify Orders"
          primaryAction={{
            content: "Import 3 Orders",
            onAction: () => {
              setIsImportOpen(false);
              setToastMessage("Imported 3 unfulfilled Shopify orders for shipment creation.");
            },
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: () => setIsImportOpen(false),
            },
          ]}
        >
          <Modal.Section>
            <Text as="p">Found 3 unfulfilled store orders eligible for batch label generation.</Text>
          </Modal.Section>
        </Modal>

        {/* MODAL: SHIPMENT DETAILS */}
        {activeShipment && (
          <Modal
            open={Boolean(activeShipment)}
            onClose={() => setActiveShipment(null)}
            title={`Shipment Details: ${activeShipment.id}`}
            primaryAction={{
              content: "Done",
              onAction: () => setActiveShipment(null),
            }}
          >
            <Modal.Section>
              <BlockStack gap="300">
                <Text as="p" variant="bodyMd">
                  <strong>Customer:</strong> {activeShipment.customer}
                </Text>
                <Text as="p" variant="bodyMd">
                  <strong>Destination:</strong> {activeShipment.destination}
                </Text>
                <Text as="p" variant="bodyMd">
                  <strong>Carrier:</strong> {activeShipment.carrier}
                </Text>
                <Text as="p" variant="bodyMd">
                  <strong>Tracking Number:</strong> {activeShipment.trackingNumber}
                </Text>
                <Text as="p" variant="bodyMd">
                  <strong>Created Date:</strong> {activeShipment.date}
                </Text>
                <InlineStack gap="200" blockAlign="center">
                  <Text as="span"><strong>Current Status:</strong></Text>
                  <Badge tone={getStatusTone(activeShipment.status)}>
                    {activeShipment.status}
                  </Badge>
                </InlineStack>

                <Divider />

                <Text as="h3" variant="headingSm">
                  Status Control:
                </Text>
                <InlineStack gap="200">
                  <Button
                    size="slim"
                    onClick={() => handleUpdateStatus(activeShipment.id, "In transit")}
                  >
                    Set In Transit
                  </Button>
                  <Button
                    size="slim"
                    variant="primary"
                    onClick={() => handleUpdateStatus(activeShipment.id, "Delivered")}
                  >
                    Set Delivered
                  </Button>
                  <Button
                    size="slim"
                    onClick={() => handleUpdateStatus(activeShipment.id, "Pending")}
                  >
                    Set Pending
                  </Button>
                </InlineStack>
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