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
  Badge,
  BlockStack,
  InlineStack,
  Text,
  Frame,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import type { ReturnRequest } from "../types/order";
import { FilterPaginationBar } from "../components/shared/FilterPaginationBar";
import { ActionToast } from "../components/shared/ActionToast";

const INITIAL_RETURNS: ReturnRequest[] = [
  {
    id: "gid://shopify/Return/3001",
    orderId: "gid://shopify/Order/1001",
    orderName: "#1001",
    customerName: "Sarah Connor",
    reason: "DEFECTIVE",
    status: "REQUESTED",
    refundAmount: "$49.98",
    createdAt: "2026-08-27",
  },
  {
    id: "gid://shopify/Return/3002",
    orderId: "gid://shopify/Order/1002",
    orderName: "#1002",
    customerName: "Bruce Wayne",
    reason: "WRONG_SIZE",
    status: "APPROVED",
    refundAmount: "$450.00",
    createdAt: "2026-08-25",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return json({ returns: INITIAL_RETURNS });
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);
  return json({ success: true });
}

export default function ReturnsRoute() {
  const data = useLoaderData<typeof loader>();
  const [returnsList, setReturnsList] = useState<ReturnRequest[]>(data.returns);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredReturns = useMemo(() => {
    return returnsList.filter((r) => {
      const matchesSearch =
        r.orderName.toLowerCase().includes(search.toLowerCase()) ||
        r.customerName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [returnsList, search, statusFilter]);

  const handleApprove = (id: string) => {
    setReturnsList(returnsList.map((r) => (r.id === id ? { ...r, status: "APPROVED" } : r)));
    setToastMessage("Return request approved and shipping label issued.");
  };

  const handleReject = (id: string) => {
    setReturnsList(returnsList.map((r) => (r.id === id ? { ...r, status: "REJECTED" } : r)));
    setToastMessage("Return request rejected.");
  };

  const handleRefund = (id: string) => {
    setReturnsList(returnsList.map((r) => (r.id === id ? { ...r, status: "COMPLETED" } : r)));
    setToastMessage("Refund processed & items restocked successfully.");
  };

  const rows = filteredReturns.map((r) => [
    <Text as="span" variant="bodyMd" fontWeight="bold" key={r.id}>
      {r.orderName}
    </Text>,
    r.customerName,
    <Badge key={r.id} tone="attention">
      {r.reason}
    </Badge>,
    r.refundAmount,
    <Badge
      key={r.id}
      tone={
        r.status === "COMPLETED"
          ? "success"
          : r.status === "APPROVED"
          ? "info"
          : r.status === "REJECTED"
          ? "critical"
          : "warning"
      }
    >
      {r.status}
    </Badge>,
    r.createdAt,
    <InlineStack gap="200" key={r.id}>
      {r.status === "REQUESTED" && (
        <>
          <Button size="slim" variant="primary" onClick={() => handleApprove(r.id)}>
            Approve
          </Button>
          <Button size="slim" tone="critical" onClick={() => handleReject(r.id)}>
            Reject
          </Button>
        </>
      )}
      {r.status === "APPROVED" && (
        <Button size="slim" variant="primary" onClick={() => handleRefund(r.id)}>
          Issue Refund
        </Button>
      )}
    </InlineStack>,
  ]);

  return (
    <Frame>
      <Page title="Returns & Refunds" subtitle="Process product returns, inspect items, and manage refunds">
        <TitleBar title="Returns & Refunds" />

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <FilterPaginationBar
                  searchValue={search}
                  onSearchChange={setSearch}
                  searchPlaceholder="Search order # or customer..."
                  filterOptions={[
                    { label: "All Returns", value: "ALL" },
                    { label: "Requested", value: "REQUESTED" },
                    { label: "Approved", value: "APPROVED" },
                    { label: "Completed", value: "COMPLETED" },
                    { label: "Rejected", value: "REJECTED" },
                  ]}
                  selectedFilter={statusFilter}
                  onFilterChange={setStatusFilter}
                />

                <DataTable
                  columnContentTypes={["text", "text", "text", "text", "text", "text", "text"]}
                  headings={["Order", "Customer", "Reason", "Refund", "Status", "Date", "Actions"]}
                  rows={rows}
                />
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {toastMessage && (
          <ActionToast content={toastMessage} onDismiss={() => setToastMessage(null)} />
        )}
      </Page>
    </Frame>
  );
}
