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
import type { SubscriptionPlan } from "../types/discount";
import { FilterPaginationBar } from "../components/shared/FilterPaginationBar";
import { ActionToast } from "../components/shared/ActionToast";

const INITIAL_SUBSCRIPTIONS: SubscriptionPlan[] = [
  {
    id: "gid://shopify/SellingPlanGroup/9201",
    name: "Monthly Supply Replenishment",
    interval: "MONTHLY",
    discountPercentage: 10,
    activeSubscribers: 124,
    status: "ACTIVE",
  },
  {
    id: "gid://shopify/SellingPlanGroup/9202",
    name: "Weekly Express Delivery Membership",
    interval: "WEEKLY",
    discountPercentage: 15,
    activeSubscribers: 45,
    status: "ACTIVE",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return json({ plans: INITIAL_SUBSCRIPTIONS });
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);
  return json({ success: true });
}

export default function SubscriptionsRoute() {
  const data = useLoaderData<typeof loader>();
  const [plans, setPlans] = useState<SubscriptionPlan[]>(data.plans);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [interval, setInterval] = useState<"WEEKLY" | "MONTHLY" | "YEARLY">("MONTHLY");
  const [discountPercentage, setDiscountPercentage] = useState("10");

  const filteredPlans = useMemo(() => {
    return plans.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [plans, search]);

  const handleCreate = () => {
    if (!name) {
      setToastMessage("Subscription plan name is required!");
      return;
    }
    const newPlan: SubscriptionPlan = {
      id: `gid://shopify/SellingPlanGroup/${Date.now()}`,
      name,
      interval,
      discountPercentage: parseInt(discountPercentage) || 0,
      activeSubscribers: 0,
      status: "ACTIVE",
    };
    setPlans([newPlan, ...plans]);
    setIsCreateOpen(false);
    setName("");
    setToastMessage("Subscription plan created!");
  };

  const handleToggle = (id: string) => {
    setPlans(
      plans.map((p) => (p.id === id ? { ...p, status: p.status === "ACTIVE" ? "PAUSED" : "ACTIVE" } : p))
    );
    setToastMessage("Subscription plan status toggled.");
  };

  const rows = filteredPlans.map((p) => [
    <Text as="span" variant="bodyMd" fontWeight="bold" key={p.id}>
      {p.name}
    </Text>,
    <Badge key={p.id} tone="info">
      {p.interval}
    </Badge>,
    `${p.discountPercentage}% Off`,
    p.activeSubscribers.toString(),
    <Badge key={p.id} tone={p.status === "ACTIVE" ? "success" : "warning"}>
      {p.status}
    </Badge>,
    <Button key={p.id} size="slim" onClick={() => handleToggle(p.id)}>
      Toggle Status
    </Button>,
  ]);

  return (
    <Frame>
      <Page
        title="Subscriptions & Recurring Orders"
        subtitle="Manage recurring selling plans, subscription discounts, and active contracts"
        primaryAction={{
          content: "Create Subscription Plan",
          onAction: () => setIsCreateOpen(true),
        }}
      >
        <TitleBar title="Subscriptions & Recurring Orders" />

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <FilterPaginationBar
                  searchValue={search}
                  onSearchChange={setSearch}
                  searchPlaceholder="Search subscription plan name..."
                />

                <DataTable
                  columnContentTypes={["text", "text", "text", "numeric", "text", "text"]}
                  headings={["Plan Name", "Interval", "Discount", "Subscribers", "Status", "Actions"]}
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
          title="Create Subscription Plan"
          primaryAction={{
            content: "Save Plan",
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
              <TextField label="Plan Name" value={name} onChange={setName} placeholder="e.g. Monthly Refill Pack" autoComplete="off" />
              <Select
                label="Billing & Delivery Frequency"
                options={[
                  { label: "Weekly", value: "WEEKLY" },
                  { label: "Monthly", value: "MONTHLY" },
                  { label: "Yearly", value: "YEARLY" },
                ]}
                value={interval}
                onChange={(val) => setInterval(val as any)}
              />
              <TextField
                label="Subscriber Discount (%)"
                value={discountPercentage}
                onChange={setDiscountPercentage}
                type="number"
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
