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
import type { B2BCompany } from "../types/b2b";
import { FilterPaginationBar } from "../components/shared/FilterPaginationBar";
import { ActionToast } from "../components/shared/ActionToast";

const INITIAL_COMPANIES: B2BCompany[] = [
  {
    id: "gid://shopify/Company/5001",
    name: "Cyberdyne Logistics Inc.",
    externalId: "CYB-8890",
    customerCount: 12,
    locationsCount: 4,
    paymentTerms: "NET_30",
    catalogName: "Wholesale Tier 1",
    createdAt: "2025-06-12",
  },
  {
    id: "gid://shopify/Company/5002",
    name: "Wayne Enterprises Global",
    externalId: "WAYNE-001",
    customerCount: 35,
    locationsCount: 10,
    paymentTerms: "NET_60",
    catalogName: "Enterprise Platinum",
    createdAt: "2024-01-20",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return json({ companies: INITIAL_COMPANIES });
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);
  return json({ success: true });
}

export default function B2BRoute() {
  const data = useLoaderData<typeof loader>();
  const [companies, setCompanies] = useState<B2BCompany[]>(data.companies);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [extId, setExtId] = useState("");
  const [paymentTerms, setPaymentTerms] = useState<"NET_30" | "NET_60" | "DUE_ON_RECEIPT">("NET_30");
  const [catalogName, setCatalogName] = useState("Wholesale Standard");

  const filteredCompanies = useMemo(() => {
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.externalId && c.externalId.toLowerCase().includes(search.toLowerCase()))
    );
  }, [companies, search]);

  const handleCreate = () => {
    if (!name) {
      setToastMessage("Company Name is required!");
      return;
    }
    const newCompany: B2BCompany = {
      id: `gid://shopify/Company/${Date.now()}`,
      name,
      externalId: extId || `COMP-${Date.now()}`,
      customerCount: 0,
      locationsCount: 1,
      paymentTerms,
      catalogName,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setCompanies([newCompany, ...companies]);
    setIsCreateOpen(false);
    setName("");
    setExtId("");
    setToastMessage("B2B Company profile registered!");
  };

  const rows = filteredCompanies.map((c) => [
    <Text as="span" variant="bodyMd" fontWeight="bold" key={c.id}>
      {c.name}
    </Text>,
    c.externalId || "N/A",
    c.customerCount.toString(),
    c.locationsCount.toString(),
    <Badge key={c.id} tone="info">
      {c.paymentTerms}
    </Badge>,
    c.catalogName,
    c.createdAt,
    <Button key={c.id} size="slim" onClick={() => setToastMessage(`Managing ${c.name}`)}>
      Configure
    </Button>,
  ]);

  return (
    <Frame>
      <Page
        title="B2B & Companies"
        subtitle="Manage B2B commercial accounts, custom catalogs, and payment terms"
        primaryAction={{
          content: "Add B2B Company",
          onAction: () => setIsCreateOpen(true),
        }}
      >
        <TitleBar title="B2B & Companies" />

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <FilterPaginationBar
                  searchValue={search}
                  onSearchChange={setSearch}
                  searchPlaceholder="Search B2B company name or external ID..."
                />

                <DataTable
                  columnContentTypes={["text", "text", "numeric", "numeric", "text", "text", "text", "text"]}
                  headings={["Company", "External ID", "Contacts", "Locations", "Terms", "Catalog", "Joined", "Actions"]}
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
          title="Register B2B Company"
          primaryAction={{
            content: "Create Company",
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
              <TextField label="Company Name" value={name} onChange={setName} autoComplete="off" />
              <TextField label="External ID / Tax ID" value={extId} onChange={setExtId} autoComplete="off" />
              <Select
                label="Payment Terms"
                options={[
                  { label: "Net 30 Days", value: "NET_30" },
                  { label: "Net 60 Days", value: "NET_60" },
                  { label: "Due On Receipt", value: "DUE_ON_RECEIPT" },
                ]}
                value={paymentTerms}
                onChange={(val) => setPaymentTerms(val as any)}
              />
              <TextField
                label="Assigned Price Catalog"
                value={catalogName}
                onChange={setCatalogName}
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
