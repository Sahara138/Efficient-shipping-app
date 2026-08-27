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
import type { Discount } from "../types/discount";
import { FilterPaginationBar } from "../components/shared/FilterPaginationBar";
import { ActionToast } from "../components/shared/ActionToast";

const INITIAL_DISCOUNTS: Discount[] = [
  {
    id: "gid://shopify/DiscountCodeNode/9001",
    code: "FREESHIP2026",
    title: "Free Shipping on Orders over $100",
    type: "FREE_SHIPPING",
    value: "100%",
    status: "ACTIVE",
    usageCount: 142,
    startsAt: "2026-01-01",
  },
  {
    id: "gid://shopify/DiscountCodeNode/9002",
    code: "SUMMER15",
    title: "Summer Sale 15% Off",
    type: "PERCENTAGE",
    value: "15%",
    status: "ACTIVE",
    usageCount: 89,
    startsAt: "2026-06-01",
    endsAt: "2026-09-01",
  },
  {
    id: "gid://shopify/DiscountCodeNode/9003",
    code: "WELCOME20",
    title: "$20 Off First Shipping Order",
    type: "FIXED_AMOUNT",
    value: "$20.00",
    status: "ACTIVE",
    usageCount: 310,
    startsAt: "2026-01-15",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return json({ discounts: INITIAL_DISCOUNTS });
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);
  return json({ success: true });
}

export default function DiscountsRoute() {
  const data = useLoaderData<typeof loader>();
  const [discounts, setDiscounts] = useState<Discount[]>(data.discounts);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING">("PERCENTAGE");
  const [value, setValue] = useState("20");

  const filteredDiscounts = useMemo(() => {
    return discounts.filter(
      (d) =>
        d.code.toLowerCase().includes(search.toLowerCase()) ||
        d.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [discounts, search]);

  const handleCreate = () => {
    if (!code || !title) {
      setToastMessage("Discount code and title are required!");
      return;
    }
    const newDisc: Discount = {
      id: `gid://shopify/DiscountCodeNode/${Date.now()}`,
      code: code.toUpperCase().trim(),
      title,
      type,
      value: type === "PERCENTAGE" ? `${value}%` : `$${value}`,
      status: "ACTIVE",
      usageCount: 0,
      startsAt: new Date().toISOString().split("T")[0],
    };
    setDiscounts([newDisc, ...discounts]);
    setIsCreateOpen(false);
    setCode("");
    setTitle("");
    setToastMessage("Discount Code created!");
  };

  const handleToggleStatus = (id: string) => {
    setDiscounts(
      discounts.map((d) =>
        d.id === id ? { ...d, status: d.status === "ACTIVE" ? "EXPIRED" : "ACTIVE" } : d
      )
    );
    setToastMessage("Discount status toggled.");
  };

  const rows = filteredDiscounts.map((d) => [
    <Text as="span" variant="bodyMd" fontWeight="bold" key={d.id}>
      {d.code}
    </Text>,
    d.title,
    <Badge key={d.id} tone="info">
      {d.type}
    </Badge>,
    d.value,
    d.usageCount.toString(),
    <Badge key={d.id} tone={d.status === "ACTIVE" ? "success" : "critical"}>
      {d.status}
    </Badge>,
    <Button key={d.id} size="slim" onClick={() => handleToggleStatus(d.id)}>
      Toggle
    </Button>,
  ]);

  return (
    <Frame>
      <Page
        title="Discounts & Promotions"
        subtitle="Manage discount codes, percentage cuts, and free shipping promotions"
        primaryAction={{
          content: "Create Discount",
          onAction: () => setIsCreateOpen(true),
        }}
      >
        <TitleBar title="Discounts & Promotions" />

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <FilterPaginationBar
                  searchValue={search}
                  onSearchChange={setSearch}
                  searchPlaceholder="Search discount code or promotion title..."
                />

                <DataTable
                  columnContentTypes={["text", "text", "text", "text", "numeric", "text", "text"]}
                  headings={["Code", "Title", "Type", "Value", "Usages", "Status", "Actions"]}
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
          title="Create Discount Code"
          primaryAction={{
            content: "Save Discount",
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
              <TextField label="Discount Code" value={code} onChange={setCode} placeholder="e.g. SAVE20" autoComplete="off" />
              <TextField label="Internal Title" value={title} onChange={setTitle} placeholder="e.g. 20% Off Holiday Shipping" autoComplete="off" />
              <Select
                label="Discount Type"
                options={[
                  { label: "Percentage Off", value: "PERCENTAGE" },
                  { label: "Fixed Amount Off ($)", value: "FIXED_AMOUNT" },
                  { label: "Free Shipping", value: "FREE_SHIPPING" },
                ]}
                value={type}
                onChange={(val) => setType(val as any)}
              />
              <TextField label="Discount Value" value={value} onChange={setValue} autoComplete="off" />
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
