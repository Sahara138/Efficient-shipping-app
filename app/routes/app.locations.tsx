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
import type { LocationItem } from "../types/inventory";
import { FilterPaginationBar } from "../components/shared/FilterPaginationBar";
import { ActionToast } from "../components/shared/ActionToast";

const INITIAL_LOCATIONS: LocationItem[] = [
  {
    id: "gid://shopify/Location/7001",
    name: "Main Warehouse - Portland",
    address: "1200 Logistics Way",
    city: "Portland",
    country: "United States",
    isActive: true,
    isFulfillmentService: false,
  },
  {
    id: "gid://shopify/Location/7002",
    name: "East Coast Logistics Hub",
    address: "450 Freight Blvd",
    city: "Newark",
    country: "United States",
    isActive: true,
    isFulfillmentService: false,
  },
  {
    id: "gid://shopify/Location/7003",
    name: "European Depot - Rotterdam",
    address: "Havenstraat 88",
    city: "Rotterdam",
    country: "Netherlands",
    isActive: true,
    isFulfillmentService: true,
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return json({ locations: INITIAL_LOCATIONS });
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);
  return json({ success: true });
}

export default function LocationsRoute() {
  const data = useLoaderData<typeof loader>();
  const [locations, setLocations] = useState<LocationItem[]>(data.locations);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("United States");

  const filteredLocations = useMemo(() => {
    return locations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(search.toLowerCase()) ||
        loc.city.toLowerCase().includes(search.toLowerCase())
    );
  }, [locations, search]);

  const handleCreate = () => {
    if (!name || !city) {
      setToastMessage("Location name and city are required!");
      return;
    }
    const newLoc: LocationItem = {
      id: `gid://shopify/Location/${Date.now()}`,
      name,
      address,
      city,
      country,
      isActive: true,
      isFulfillmentService: false,
    };
    setLocations([newLoc, ...locations]);
    setIsCreateOpen(false);
    setName("");
    setAddress("");
    setCity("");
    setToastMessage("Location created!");
  };

  const handleToggleActive = (id: string) => {
    setLocations(
      locations.map((loc) => (loc.id === id ? { ...loc, isActive: !loc.isActive } : loc))
    );
    setToastMessage("Location status updated.");
  };

  const rows = filteredLocations.map((loc) => [
    <Text as="span" variant="bodyMd" fontWeight="bold" key={loc.id}>
      {loc.name}
    </Text>,
    loc.address,
    `${loc.city}, ${loc.country}`,
    <Badge key={loc.id} tone={loc.isActive ? "success" : "critical"}>
      {loc.isActive ? "Active" : "Inactive"}
    </Badge>,
    <Badge key={loc.id} tone={loc.isFulfillmentService ? "info" : "attention"}>
      {loc.isFulfillmentService ? "3PL / Service" : "Merchant Warehouse"}
    </Badge>,
    <Button key={loc.id} size="slim" onClick={() => handleToggleActive(loc.id)}>
      Toggle Status
    </Button>,
  ]);

  return (
    <Frame>
      <Page
        title="Fulfillment Locations"
        subtitle="Manage warehouses, retail stores, and 3PL fulfillment hubs"
        primaryAction={{
          content: "Add Location",
          onAction: () => setIsCreateOpen(true),
        }}
      >
        <TitleBar title="Fulfillment Locations" />

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <FilterPaginationBar
                  searchValue={search}
                  onSearchChange={setSearch}
                  searchPlaceholder="Search location name, city..."
                />

                <DataTable
                  columnContentTypes={["text", "text", "text", "text", "text", "text"]}
                  headings={["Location", "Address", "City & Country", "Status", "Type", "Actions"]}
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
          title="Add New Location"
          primaryAction={{
            content: "Save Location",
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
              <TextField label="Location Name" value={name} onChange={setName} autoComplete="off" />
              <TextField label="Street Address" value={address} onChange={setAddress} autoComplete="off" />
              <InlineStack gap="300">
                <TextField label="City" value={city} onChange={setCity} autoComplete="off" />
                <TextField label="Country" value={country} onChange={setCountry} autoComplete="off" />
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
