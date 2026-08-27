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
import type { MetafieldDefinition } from "../types/metafield";
import { FilterPaginationBar } from "../components/shared/FilterPaginationBar";
import { ActionToast } from "../components/shared/ActionToast";

const INITIAL_METAFIELDS: MetafieldDefinition[] = [
  {
    id: "gid://shopify/MetafieldDefinition/9301",
    namespace: "shipping_app",
    key: "carrier_notes",
    name: "Special Carrier Notes",
    ownerType: "ORDER",
    type: "SINGLE_LINE_TEXT",
    description: "Custom delivery instructions passed to carrier API",
    pinnedCount: 15,
  },
  {
    id: "gid://shopify/MetafieldDefinition/9302",
    namespace: "shipping_app",
    key: "package_dimensions",
    name: "Package Dimensions JSON",
    ownerType: "PRODUCT",
    type: "JSON",
    description: "Length, Width, Height and Tare Weight specs",
    pinnedCount: 42,
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return json({ metafields: INITIAL_METAFIELDS });
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);
  return json({ success: true });
}

export default function MetafieldsRoute() {
  const data = useLoaderData<typeof loader>();
  const [metafields, setMetafields] = useState<MetafieldDefinition[]>(data.metafields);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [namespace, setNamespace] = useState("shipping_app");
  const [key, setKey] = useState("");
  const [ownerType, setOwnerType] = useState<"PRODUCT" | "VARIANT" | "ORDER" | "CUSTOMER">("PRODUCT");
  const [type, setType] = useState<"SINGLE_LINE_TEXT" | "JSON" | "INTEGER" | "COLOR" | "FILE_REFERENCE">("SINGLE_LINE_TEXT");

  const filteredMetafields = useMemo(() => {
    return metafields.filter(
      (m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.key.toLowerCase().includes(search.toLowerCase())
    );
  }, [metafields, search]);

  const handleCreate = () => {
    if (!name || !key) {
      setToastMessage("Name and Key are required!");
      return;
    }
    const newMetafield: MetafieldDefinition = {
      id: `gid://shopify/MetafieldDefinition/${Date.now()}`,
      namespace,
      key,
      name,
      ownerType,
      type,
      pinnedCount: 0,
    };
    setMetafields([newMetafield, ...metafields]);
    setIsCreateOpen(false);
    setName("");
    setKey("");
    setToastMessage("Metafield Definition saved!");
  };

  const rows = filteredMetafields.map((m) => [
    <Text as="span" variant="bodyMd" fontWeight="bold" key={m.id}>
      {m.name}
    </Text>,
    `${m.namespace}.${m.key}`,
    <Badge key={m.id} tone="info">
      {m.ownerType}
    </Badge>,
    m.type,
    m.pinnedCount.toString(),
    <Button key={m.id} size="slim" onClick={() => setToastMessage(`Inspecting ${m.key}`)}>
      Inspect
    </Button>,
  ]);

  return (
    <Frame>
      <Page
        title="Metafield Definitions"
        subtitle="Configure custom data fields for Products, Orders, Customers, and Variants"
        primaryAction={{
          content: "Add Metafield Definition",
          onAction: () => setIsCreateOpen(true),
        }}
      >
        <TitleBar title="Metafield Definitions" />

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <FilterPaginationBar
                  searchValue={search}
                  onSearchChange={setSearch}
                  searchPlaceholder="Search metafield name or key..."
                />

                <DataTable
                  columnContentTypes={["text", "text", "text", "text", "numeric", "text"]}
                  headings={["Definition Name", "Namespace & Key", "Resource Owner", "Field Type", "Pinned Count", "Actions"]}
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
          title="Add Metafield Definition"
          primaryAction={{
            content: "Save Definition",
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
              <TextField label="Definition Name" value={name} onChange={setName} placeholder="e.g. Tariff Code" autoComplete="off" />
              <InlineStack gap="300">
                <TextField label="Namespace" value={namespace} onChange={setNamespace} autoComplete="off" />
                <TextField label="Key" value={key} onChange={setKey} placeholder="tariff_code" autoComplete="off" />
              </InlineStack>
              <Select
                label="Owner Resource"
                options={[
                  { label: "Product", value: "PRODUCT" },
                  { label: "Variant", value: "VARIANT" },
                  { label: "Order", value: "ORDER" },
                  { label: "Customer", value: "CUSTOMER" },
                ]}
                value={ownerType}
                onChange={(val) => setOwnerType(val as any)}
              />
              <Select
                label="Field Data Type"
                options={[
                  { label: "Single Line Text", value: "SINGLE_LINE_TEXT" },
                  { label: "JSON Structure", value: "JSON" },
                  { label: "Integer", value: "INTEGER" },
                  { label: "Color Hex", value: "COLOR" },
                  { label: "File Reference", value: "FILE_REFERENCE" },
                ]}
                value={type}
                onChange={(val) => setType(val as any)}
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
