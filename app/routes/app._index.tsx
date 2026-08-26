import type { LoaderFunctionArgs } from "@remix-run/node";
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
} from "@shopify/polaris";

import { TitleBar } from "@shopify/app-bridge-react";

import { authenticate } from "../shopify.server";

/* ---------------- LOADER ---------------- */

export async function loader({
  request,
}: LoaderFunctionArgs) {
  await authenticate.admin(request);

  return json({
    stats: {
      totalShipments: 248,
      inTransit: 86,
      delivered: 142,
      pending: 20,
    },

    recentShipments: [
      {
        id: "#SH-1048",
        customer: "John Smith",
        destination: "New York, USA",
        carrier: "DHL",
        status: "In transit",
      },
      {
        id: "#SH-1047",
        customer: "Emma Johnson",
        destination: "California, USA",
        carrier: "FedEx",
        status: "Delivered",
      },
      {
        id: "#SH-1046",
        customer: "Michael Brown",
        destination: "Texas, USA",
        carrier: "UPS",
        status: "Pending",
      },
      {
        id: "#SH-1045",
        customer: "Sophia Wilson",
        destination: "Florida, USA",
        carrier: "USPS",
        status: "Delivered",
      },
    ],
  });
}

/* ---------------- COMPONENT ---------------- */

export default function Index() {
  const { stats, recentShipments } =
    useLoaderData<typeof loader>();

  const getStatusTone = (
    status: string,
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

  return (
    <Page
      title="Efficient Shipping"
      subtitle="Manage your orders, shipments, and delivery performance"
      primaryAction={{
        content: "Create shipment",
        url: "/app/shipments",
      }}
      secondaryActions={[
        {
          content: "View orders",
          url: "/app/orders",
        },
      ]}
    >
      <TitleBar title="Efficient Shipping" />

      <BlockStack gap="500">

        {/* WELCOME SECTION */}

        <Card>
          <BlockStack gap="300">

            <BlockStack gap="100">
              <Text
                as="h2"
                variant="headingLg"
              >
                Welcome back 👋
              </Text>

              <Text
                as="p"
                variant="bodyMd"
                tone="subdued"
              >
                Here's what's happening with your
                shipments today.
              </Text>
            </BlockStack>

            <InlineStack gap="300">
              <Button
                variant="primary"
                url="/app/shipments"
              >
                Manage shipments
              </Button>

              <Button url="/app/orders">
                View orders
              </Button>
            </InlineStack>

          </BlockStack>
        </Card>


        {/* STATISTICS */}

        <Layout>

          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="200">

                <Text
                  as="p"
                  variant="bodySm"
                  tone="subdued"
                >
                  Total shipments
                </Text>

                <Text
                  as="h2"
                  variant="heading2xl"
                >
                  {stats.totalShipments}
                </Text>

                <Text
                  as="p"
                  variant="bodySm"
                  tone="success"
                >
                  ↑ 12% from last month
                </Text>

              </BlockStack>
            </Card>
          </Layout.Section>


          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="200">

                <Text
                  as="p"
                  variant="bodySm"
                  tone="subdued"
                >
                  In transit
                </Text>

                <Text
                  as="h2"
                  variant="heading2xl"
                >
                  {stats.inTransit}
                </Text>

                <Badge tone="info">
                  Active shipments
                </Badge>

              </BlockStack>
            </Card>
          </Layout.Section>


          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="200">

                <Text
                  as="p"
                  variant="bodySm"
                  tone="subdued"
                >
                  Delivered
                </Text>

                <Text
                  as="h2"
                  variant="heading2xl"
                >
                  {stats.delivered}
                </Text>

                <Badge tone="success">
                  Successfully delivered
                </Badge>

              </BlockStack>
            </Card>
          </Layout.Section>


          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="200">

                <Text
                  as="p"
                  variant="bodySm"
                  tone="subdued"
                >
                  Pending
                </Text>

                <Text
                  as="h2"
                  variant="heading2xl"
                >
                  {stats.pending}
                </Text>

                <Badge tone="warning">
                  Needs attention
                </Badge>

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

                <InlineStack
                  align="space-between"
                  blockAlign="center"
                >

                  <BlockStack gap="100">
                    <Text
                      as="h2"
                      variant="headingMd"
                    >
                      Recent shipments
                    </Text>

                    <Text
                      as="p"
                      variant="bodyMd"
                      tone="subdued"
                    >
                      Track your latest shipping activity.
                    </Text>
                  </BlockStack>

                  <Button
                    variant="plain"
                    url="/app/shipments"
                  >
                    View all
                  </Button>

                </InlineStack>

                <Divider />

                <BlockStack gap="0">

                  {recentShipments.map(
                    (shipment, index) => (
                      <Box
                        key={shipment.id}
                        paddingBlock="400"
                      >

                        <InlineStack
                          align="space-between"
                          blockAlign="center"
                          gap="400"
                          wrap={false}
                        >

                          <BlockStack gap="100">

                            <InlineStack gap="200">
                              <Text
                                as="h3"
                                variant="headingSm"
                              >
                                {shipment.id}
                              </Text>

                              <Badge
                                tone={getStatusTone(
                                  shipment.status,
                                )}
                              >
                                {shipment.status}
                              </Badge>
                            </InlineStack>

                            <Text
                              as="p"
                              variant="bodySm"
                              tone="subdued"
                            >
                              {shipment.customer} •{" "}
                              {shipment.destination}
                            </Text>

                            <Text
                              as="p"
                              variant="bodySm"
                              tone="subdued"
                            >
                              Carrier: {shipment.carrier}
                            </Text>

                          </BlockStack>

                          <Button
                            url="/app/shipments"
                          >
                            View
                          </Button>

                        </InlineStack>

                        {index <
                          recentShipments.length - 1 && (
                          <Box paddingBlockStart="400">
                            <Divider />
                          </Box>
                        )}

                      </Box>
                    ),
                  )}

                </BlockStack>

              </BlockStack>
            </Card>

          </Layout.Section>


          {/* RIGHT SIDE */}

          <Layout.Section variant="oneThird">

            <BlockStack gap="500">

              {/* DELIVERY PERFORMANCE */}

              <Card>

                <BlockStack gap="400">

                  <Text
                    as="h2"
                    variant="headingMd"
                  >
                    Delivery performance
                  </Text>

                  <BlockStack gap="200">

                    <InlineStack align="space-between">
                      <Text
                        as="span"
                        variant="bodyMd"
                      >
                        On-time delivery
                      </Text>

                      <Text
                        as="span"
                        variant="bodyMd"
                        fontWeight="semibold"
                      >
                        92%
                      </Text>
                    </InlineStack>

                    <ProgressBar
                      progress={92}
                      size="small"
                      tone="success"
                    />

                  </BlockStack>


                  <BlockStack gap="200">

                    <InlineStack align="space-between">
                      <Text
                        as="span"
                        variant="bodyMd"
                      >
                        Shipment success
                      </Text>

                      <Text
                        as="span"
                        variant="bodyMd"
                        fontWeight="semibold"
                      >
                        96%
                      </Text>
                    </InlineStack>

                    <ProgressBar
                      progress={96}
                      size="small"
                    />

                  </BlockStack>


                  <BlockStack gap="200">

                    <InlineStack align="space-between">
                      <Text
                        as="span"
                        variant="bodyMd"
                      >
                        Customer satisfaction
                      </Text>

                      <Text
                        as="span"
                        variant="bodyMd"
                        fontWeight="semibold"
                      >
                        89%
                      </Text>
                    </InlineStack>

                    <ProgressBar
                      progress={89}
                      size="small"
                    />

                  </BlockStack>

                </BlockStack>

              </Card>


              {/* QUICK ACTIONS */}

              <Card>

                <BlockStack gap="400">

                  <Text
                    as="h2"
                    variant="headingMd"
                  >
                    Quick actions
                  </Text>

                  <BlockStack gap="200">

                    <Button
                      fullWidth
                      variant="primary"
                      url="/app/shipments"
                    >
                      Create new shipment
                    </Button>

                    <Button
                      fullWidth
                      url="/app/orders"
                    >
                      Import orders
                    </Button>

                    <Button
                      fullWidth
                      url="/app/tracking"
                    >
                      Track shipment
                    </Button>

                    <Button
                      fullWidth
                      url="/app/shipping-rates"
                    >
                      Manage shipping rates
                    </Button>

                  </BlockStack>

                </BlockStack>

              </Card>


              {/* HELP */}

              <Card>

                <BlockStack gap="200">

                  <Text
                    as="h2"
                    variant="headingMd"
                  >
                    Need help?
                  </Text>

                  <Text
                    as="p"
                    variant="bodyMd"
                    tone="subdued"
                  >
                    Learn how to configure carriers,
                    shipping rates, tracking, and
                    fulfillment settings.
                  </Text>

                  <Button
                    variant="plain"
                    url="/app/settings"
                  >
                    Go to settings
                  </Button>

                </BlockStack>

              </Card>

            </BlockStack>

          </Layout.Section>

        </Layout>

      </BlockStack>
    </Page>
  );
}