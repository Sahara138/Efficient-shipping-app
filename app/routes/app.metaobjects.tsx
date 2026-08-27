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
import type { MetaobjectDefinition, MetaobjectEntry } from "../types/metafield";
import { FilterPaginationBar } from "../components/shared/FilterPaginationBar";
import { ActionToast } from "../components/shared/ActionToast";

const INITIAL_DEFS: MetaobjectDefinition[] = [
  {
    id: "gid://shopify/MetaobjectDefinition/9401",
    type: "shipping_carrier_spec",
    name: "Shipping Carrier Spec",
    fieldCount: 5,
    entryCount: 3,
    description: "API Credentials and SLA specs per carrier",
  },
  {
    id: "gid://shopify/MetaobjectDefinition/9402",
    type: "custom_packaging_type",
    name: "Custom Packaging Type",
    fieldCount: 4,
    entryCount: 8,
    description: "Box dimensions, tare weight, and max load payload",
  },
];

const INITIAL_ENTRIES: MetaobjectEntry[] = [
  {
    id: "gid://shopify/Metaobject/1",
    handle: "dhl-express-sla",
    definitionType: "shipping_carrier_spec",
    fields: { carrier_name: "DHL Express", priority: "HIGH", max_weight_kg: 70 },
    updatedAt: "2026-08-25",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return json({ definitions: INITIAL_DEFS, entries: INITIAL_ENTRIES });
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);
  return json({ success: true });
}

export default function MetaobjectsRoute() {
  const data = useLoaderData<typeof loader>();
  const [definitions, setDefinitions] = useState<MetaobjectDefinition[]>(data.definitions);
  const [entries, setEntries] = useState<MetaobjectEntry[]>(data.entries);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [typeName, setTypeName] = useState("");
  const [handle, setHandle] = useState("");

  const filteredDefs = useMemo(() => {
    return definitions.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));
  }, [definitions, search]);

  const handleCreateEntry = () => {
    if (!typeName || !handle) {
      setToastMessage("Type and Handle are required!");
      return;
    }
    const newEntry: MetaobjectEntry = {
      id: `gid://shopify/Metaobject/${Date.now()}`,
      handle,
      definitionType: typeName,
      fields: { title: handle, created_at: new Date().toISOString() },
      updatedAt: new Date().toISOString().split("T")[0],
    };
    setEntries([newEntry, ...entries]);
    setIsCreateOpen(false);
    setTypeName("");
    setHandle("");
    setToastMessage("Metaobject entry created!");
  };

  const rows = filteredDefs.map((d) => [
    <Text as="span" variant="bodyMd" fontWeight="bold" key={d.id}>
      {d.name}
    </Text>,
    d.type,
    d.fieldCount.toString(),
    d.entryCount.toString(),
    d.description || "N/A",
    <Button key={d.id} size="slim" onClick={() => setToastMessage(`Managing ${d.name} entries`)}>
      Manage Entries
    </Button>,
  ]);

  return (
    <Frame>
      <Page
        title="Metaobjects Builder"
        subtitle="Define multi-field structured data objects and entries for your store"
        primaryAction={{
          content: "Create Metaobject Entry",
          onAction: () => setIsCreateOpen(true),
        }}
      >
        <TitleBar title="Metaobjects Builder" />

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <FilterPaginationBar
                  searchValue={search}
                  onSearchChange={setSearch}
                  searchPlaceholder="Search metaobject definitions..."
                />

                <DataTable
                  columnContentTypes={["text", "text", "numeric", "numeric", "text", "text"]}
                  headings={["Metaobject Name", "Type Handle", "Fields", "Entries", "Description", "Actions"]}
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
          title="Create Metaobject Entry"
          primaryAction={{
            content: "Save Entry",
            onAction: handleCreateEntry,
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
              <TextField label="Definition Type Handle" value={typeName} onChange={setTypeName} placeholder="e.g. custom_packaging_type" autoComplete="off" />
              <TextField label="Entry Handle" value={handle} onChange={setHandle} placeholder="e.g. heavy-pallet-spec" autoComplete="off" />
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
