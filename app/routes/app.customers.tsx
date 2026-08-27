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
import type { Customer, CustomerFormValues } from "../types/customer";
import { FilterPaginationBar } from "../components/shared/FilterPaginationBar";
import { ActionToast } from "../components/shared/ActionToast";

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "gid://shopify/Customer/4001",
    firstName: "Sarah",
    lastName: "Connor",
    email: "sarah@cyberdyne.com",
    phone: "+1 555-0192",
    ordersCount: 14,
    totalSpent: "$1,840.50",
    tags: ["VIP", "Frequent Buyer"],
    companyName: "Cyberdyne Systems",
    state: "ENABLED",
    createdAt: "2025-11-10",
    notes: "Requires signature on heavy parcel deliveries.",
  },
  {
    id: "gid://shopify/Customer/4002",
    firstName: "Bruce",
    lastName: "Wayne",
    email: "bruce@gotham.org",
    phone: "+1 555-0199",
    ordersCount: 42,
    totalSpent: "$18,500.00",
    tags: ["B2B", "Wholesale"],
    companyName: "Wayne Enterprises",
    state: "ENABLED",
    createdAt: "2024-03-15",
  },
  {
    id: "gid://shopify/Customer/4003",
    firstName: "Peter",
    lastName: "Parker",
    email: "peter@dailybugle.com",
    ordersCount: 2,
    totalSpent: "$85.50",
    tags: ["Retail"],
    state: "INVITED",
    createdAt: "2026-08-01",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return json({ customers: INITIAL_CUSTOMERS });
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);
  return json({ success: true });
}

export default function CustomersRoute() {
  const data = useLoaderData<typeof loader>();
  const [customers, setCustomers] = useState<Customer[]>(data.customers);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formValues, setFormValues] = useState<CustomerFormValues>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    tags: "VIP",
    companyName: "",
    notes: "",
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.companyName && c.companyName.toLowerCase().includes(search.toLowerCase()));
      const matchesTag = tagFilter === "ALL" || c.tags.includes(tagFilter);
      return matchesSearch && matchesTag;
    });
  }, [customers, search, tagFilter]);

  const paginatedCustomers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, page]);

  const handleCreateCustomer = () => {
    if (!formValues.firstName || !formValues.email) {
      setToastMessage("First name and Email are required!");
      return;
    }
    const newCustomer: Customer = {
      id: `gid://shopify/Customer/${Date.now()}`,
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      email: formValues.email,
      phone: formValues.phone,
      ordersCount: 0,
      totalSpent: "$0.00",
      tags: formValues.tags ? formValues.tags.split(",").map((t) => t.trim()) : [],
      companyName: formValues.companyName,
      state: "ENABLED",
      createdAt: new Date().toISOString().split("T")[0],
      notes: formValues.notes,
    };
    setCustomers([newCustomer, ...customers]);
    setIsCreateOpen(false);
    setFormValues({ firstName: "", lastName: "", email: "", phone: "", tags: "VIP", companyName: "", notes: "" });
    setToastMessage("Customer account created!");
  };

  const handleBulkAddTag = () => {
    setCustomers(
      customers.map((c) =>
        selectedIds.includes(c.id) ? { ...c, tags: Array.from(new Set([...c.tags, "Verified"])) } : c
      )
    );
    setSelectedIds([]);
    setToastMessage(`Tagged ${selectedIds.length} customers with "Verified".`);
  };

  const rows = paginatedCustomers.map((c) => [
    <Text as="span" variant="bodyMd" fontWeight="bold" key={c.id}>
      {c.firstName} {c.lastName}
    </Text>,
    c.email,
    c.companyName || "Individual",
    c.ordersCount.toString(),
    c.totalSpent,
    <InlineStack gap="100" key={c.id}>
      {c.tags.map((t, idx) => (
        <Badge key={idx} tone="info">
          {t}
        </Badge>
      ))}
    </InlineStack>,
    <Button key={c.id} size="slim" onClick={() => setActiveCustomer(c)}>
      View Profile
    </Button>,
  ]);

  return (
    <Frame>
      <Page
        title="Customers CRM"
        subtitle="Manage customer profiles, B2B links, and purchasing history"
        primaryAction={{
          content: "Add Customer",
          onAction: () => setIsCreateOpen(true),
        }}
      >
        <TitleBar title="Customers CRM" />

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <FilterPaginationBar
                  searchValue={search}
                  onSearchChange={setSearch}
                  searchPlaceholder="Search customer name, email, company..."
                  filterOptions={[
                    { label: "All Customers", value: "ALL" },
                    { label: "VIP", value: "VIP" },
                    { label: "B2B", value: "B2B" },
                    { label: "Wholesale", value: "Wholesale" },
                  ]}
                  selectedFilter={tagFilter}
                  onFilterChange={setTagFilter}
                  selectedCount={selectedIds.length}
                  bulkActions={[
                    {
                      content: "Add Tag 'Verified'",
                      onAction: handleBulkAddTag,
                    },
                  ]}
                  pagination={{
                    hasNext: page * pageSize < filteredCustomers.length,
                    hasPrevious: page > 1,
                    onNext: () => setPage((p) => p + 1),
                    onPrevious: () => setPage((p) => Math.max(1, p - 1)),
                  }}
                />

                <DataTable
                  columnContentTypes={["text", "text", "text", "numeric", "text", "text", "text"]}
                  headings={["Name", "Email", "Company", "Orders", "Total Spent", "Tags", "Actions"]}
                  rows={rows}
                />
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Create Customer Modal */}
        <Modal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Add New Customer Profile"
          primaryAction={{
            content: "Save Customer",
            onAction: handleCreateCustomer,
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
              <InlineStack gap="300">
                <TextField
                  label="First Name"
                  value={formValues.firstName}
                  onChange={(val) => setFormValues({ ...formValues, firstName: val })}
                  autoComplete="off"
                />
                <TextField
                  label="Last Name"
                  value={formValues.lastName}
                  onChange={(val) => setFormValues({ ...formValues, lastName: val })}
                  autoComplete="off"
                />
              </InlineStack>
              <TextField
                label="Email"
                value={formValues.email}
                onChange={(val) => setFormValues({ ...formValues, email: val })}
                type="email"
                autoComplete="off"
              />
              <TextField
                label="Phone"
                value={formValues.phone || ""}
                onChange={(val) => setFormValues({ ...formValues, phone: val })}
                autoComplete="off"
              />
              <TextField
                label="Company Name"
                value={formValues.companyName || ""}
                onChange={(val) => setFormValues({ ...formValues, companyName: val })}
                autoComplete="off"
              />
              <TextField
                label="Tags (comma separated)"
                value={formValues.tags || ""}
                onChange={(val) => setFormValues({ ...formValues, tags: val })}
                autoComplete="off"
              />
            </BlockStack>
          </Modal.Section>
        </Modal>

        {/* Profile Modal */}
        {activeCustomer && (
          <Modal
            open={Boolean(activeCustomer)}
            onClose={() => setActiveCustomer(null)}
            title={`Customer: ${activeCustomer.firstName} ${activeCustomer.lastName}`}
            primaryAction={{
              content: "Done",
              onAction: () => setActiveCustomer(null),
            }}
          >
            <Modal.Section>
              <BlockStack gap="300">
                <Text as="p" variant="bodyMd">
                  <strong>Email:</strong> {activeCustomer.email}
                </Text>
                <Text as="p" variant="bodyMd">
                  <strong>Phone:</strong> {activeCustomer.phone || "N/A"}
                </Text>
                <Text as="p" variant="bodyMd">
                  <strong>Company:</strong> {activeCustomer.companyName || "N/A"}
                </Text>
                <Text as="p" variant="bodyMd">
                  <strong>Total Orders:</strong> {activeCustomer.ordersCount}
                </Text>
                <Text as="p" variant="bodyMd">
                  <strong>Total Lifetime Spend:</strong> {activeCustomer.totalSpent}
                </Text>
                {activeCustomer.notes && (
                  <Text as="p" variant="bodyMd">
                    <strong>Special Notes:</strong> {activeCustomer.notes}
                  </Text>
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
