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
import type { Collection, CollectionFormValues } from "../types/collection";
import { FilterPaginationBar } from "../components/shared/FilterPaginationBar";
import { ActionToast } from "../components/shared/ActionToast";

const INITIAL_COLLECTIONS: Collection[] = [
  {
    id: "gid://shopify/Collection/101",
    title: "Summer Collection 2026",
    handle: "summer-collection-2026",
    description: "Trendy lightweight apparel and accessories for hot summer days.",
    type: "SMART",
    productsCount: 34,
    updatedAt: "2026-08-20",
    image: { url: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-collection-1_small.png" },
    rules: [{ column: "TAG", relation: "EQUALS", condition: "Summer" }],
  },
  {
    id: "gid://shopify/Collection/102",
    title: "Best Sellers",
    handle: "best-sellers",
    description: "Our top-rated products loved by thousands of customers worldwide.",
    type: "SMART",
    productsCount: 112,
    updatedAt: "2026-08-25",
    image: { url: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-collection-2_small.png" },
    rules: [{ column: "TAG", relation: "EQUALS", condition: "BestSeller" }],
  },
  {
    id: "gid://shopify/Collection/103",
    title: "Eco-Friendly Gear",
    handle: "eco-friendly-gear",
    description: "Sustainably sourced shipping and packaging supplies.",
    type: "CUSTOM",
    productsCount: 19,
    updatedAt: "2026-08-18",
    image: { url: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-collection-3_small.png" },
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return json({ collections: INITIAL_COLLECTIONS });
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);
  return json({ success: true });
}

export default function CollectionsRoute() {
  const data = useLoaderData<typeof loader>();
  const [collections, setCollections] = useState<Collection[]>(data.collections);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Modals & Toast State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeCollection, setActiveCollection] = useState<Collection | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state
  const [formValues, setFormValues] = useState<CollectionFormValues>({
    title: "",
    description: "",
    handle: "",
    type: "SMART",
    imageUrl: "",
  });

  const filteredCollections = useMemo(() => {
    return collections.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.handle.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "ALL" || item.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [collections, search, typeFilter]);

  const paginatedCollections = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCollections.slice(start, start + pageSize);
  }, [filteredCollections, page]);

  const handleCreateSave = () => {
    if (!formValues.title) {
      setToastMessage("Title is required!");
      return;
    }
    const newCollection: Collection = {
      id: `gid://shopify/Collection/${Date.now()}`,
      title: formValues.title,
      handle: formValues.handle || formValues.title.toLowerCase().replace(/\s+/g, "-"),
      description: formValues.description,
      type: formValues.type,
      productsCount: 0,
      updatedAt: new Date().toISOString().split("T")[0],
      image: formValues.imageUrl ? { url: formValues.imageUrl } : undefined,
    };
    setCollections([newCollection, ...collections]);
    setIsCreateOpen(false);
    setFormValues({ title: "", description: "", handle: "", type: "SMART", imageUrl: "" });
    setToastMessage("Collection created successfully!");
  };

  const handleDelete = (id: string) => {
    setCollections(collections.filter((c) => c.id !== id));
    setIsDetailOpen(false);
    setToastMessage("Collection deleted.");
  };

  const handleBulkDelete = () => {
    setCollections(collections.filter((c) => !selectedIds.includes(c.id)));
    setSelectedIds([]);
    setToastMessage(`${selectedIds.length} collections deleted.`);
  };

  const rows = paginatedCollections.map((col) => [
    <Text as="span" variant="bodyMd" fontWeight="bold" key={col.id}>
      {col.title}
    </Text>,
    <Badge key={col.id} tone={col.type === "SMART" ? "info" : "success"}>
      {col.type}
    </Badge>,
    col.productsCount.toString(),
    col.updatedAt,
    <InlineStack gap="200" key={col.id}>
      <Button
        size="slim"
        onClick={() => {
          setActiveCollection(col);
          setIsDetailOpen(true);
        }}
      >
        View & Edit
      </Button>
      <Button size="slim" tone="critical" onClick={() => handleDelete(col.id)}>
        Delete
      </Button>
    </InlineStack>,
  ]);

  return (
    <Frame>
      <Page
        title="Collections Management"
        subtitle="Manage smart and manual product collections"
        primaryAction={{
          content: "Create Collection",
          onAction: () => setIsCreateOpen(true),
        }}
      >
        <TitleBar title="Collections Management" />

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <FilterPaginationBar
                  searchValue={search}
                  onSearchChange={setSearch}
                  searchPlaceholder="Search collections..."
                  filterOptions={[
                    { label: "All Types", value: "ALL" },
                    { label: "Automated / Smart", value: "SMART" },
                    { label: "Custom / Manual", value: "CUSTOM" },
                  ]}
                  selectedFilter={typeFilter}
                  onFilterChange={setTypeFilter}
                  selectedCount={selectedIds.length}
                  bulkActions={[
                    {
                      content: "Delete Selected",
                      destructive: true,
                      onAction: handleBulkDelete,
                    },
                  ]}
                  pagination={{
                    hasNext: page * pageSize < filteredCollections.length,
                    hasPrevious: page > 1,
                    onNext: () => setPage((p) => p + 1),
                    onPrevious: () => setPage((p) => Math.max(1, p - 1)),
                  }}
                />

                <DataTable
                  columnContentTypes={["text", "text", "numeric", "text", "text"]}
                  headings={["Title", "Type", "Products", "Last Updated", "Actions"]}
                  rows={rows}
                />
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Create Modal */}
        <Modal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Create New Collection"
          primaryAction={{
            content: "Save Collection",
            onAction: handleCreateSave,
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
                label="Collection Title"
                value={formValues.title}
                onChange={(val) => setFormValues({ ...formValues, title: val })}
                autoComplete="off"
              />
              <TextField
                label="Handle (slug)"
                value={formValues.handle}
                onChange={(val) => setFormValues({ ...formValues, handle: val })}
                autoComplete="off"
                helpText="Leave empty to auto-generate from title"
              />
              <Select
                label="Collection Type"
                options={[
                  { label: "Smart / Automated (Rule-based)", value: "SMART" },
                  { label: "Custom / Manual", value: "CUSTOM" },
                ]}
                value={formValues.type}
                onChange={(val) =>
                  setFormValues({ ...formValues, type: val as "SMART" | "CUSTOM" })
                }
              />
              <TextField
                label="Description"
                value={formValues.description}
                onChange={(val) => setFormValues({ ...formValues, description: val })}
                multiline={3}
                autoComplete="off"
              />
              <TextField
                label="Image URL"
                value={formValues.imageUrl || ""}
                onChange={(val) => setFormValues({ ...formValues, imageUrl: val })}
                autoComplete="off"
              />
            </BlockStack>
          </Modal.Section>
        </Modal>

        {/* Details & Edit Modal */}
        {activeCollection && (
          <Modal
            open={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            title={`Collection: ${activeCollection.title}`}
            primaryAction={{
              content: "Done",
              onAction: () => setIsDetailOpen(false),
            }}
          >
            <Modal.Section>
              <BlockStack gap="300">
                <Text as="p" variant="bodyMd">
                  <strong>ID:</strong> {activeCollection.id}
                </Text>
                <Text as="p" variant="bodyMd">
                  <strong>Handle:</strong> {activeCollection.handle}
                </Text>
                <Text as="p" variant="bodyMd">
                  <strong>Type:</strong> {activeCollection.type}
                </Text>
                <Text as="p" variant="bodyMd">
                  <strong>Description:</strong> {activeCollection.description || "N/A"}
                </Text>
                <Text as="p" variant="bodyMd">
                  <strong>Total Products:</strong> {activeCollection.productsCount}
                </Text>
                {activeCollection.rules && activeCollection.rules.length > 0 && (
                  <Card>
                    <BlockStack gap="200">
                      <Text as="h3" variant="headingSm">
                        Automated Rules
                      </Text>
                      {activeCollection.rules.map((rule, idx) => (
                        <Badge key={idx} tone="attention">
                          {`${rule.column} ${rule.relation} "${rule.condition}"`}
                        </Badge>
                      ))}
                    </BlockStack>
                  </Card>
                )}
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
