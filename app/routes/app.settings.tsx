import { useState } from "react";
import {
  Page,
  Card,
  BlockStack,
  InlineStack,
  Text,
  TextField,
  Select,
  ChoiceList,
  Button,
  Divider,
  Box,
  Link,
  Badge,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { ActionFunctionArgs, json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";

export async function loader() {
  const settings = {
    storeName: "Efficient Shipping Store",
    businessAddress: "123 Main St, Anytown, USA",
    storePhone: "+1 (555) 123-4567",

    currency: "usd",

    shippingProvider: "none",

    defaultPackage: "medium",

    notificationFrequency: "immediately",

    notifications: [
      "new-order",
      "shipping-update",
      "delivery-update",
    ],

    autoFulfillment: false,

    insurance: false,

    signatureRequired: false,
  };

  return json(settings);
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const settings = {
    storeName: formData.get("storeName"),
    businessAddress: formData.get("businessAddress"),
    storePhone: formData.get("storePhone"),

    currency: formData.get("currency"),

    shippingProvider: formData.get("shippingProvider"),

    defaultPackage: formData.get("defaultPackage"),

    notificationFrequency: formData.get(
      "notificationFrequency"
    ),

    notifications: formData.getAll("notifications"),

    autoFulfillment:
      formData.get("autoFulfillment") === "true",

    insurance:
      formData.get("insurance") === "true",

    signatureRequired:
      formData.get("signatureRequired") === "true",
  };

  console.log("Updated shipping settings:", settings);

  // TODO:
  // Save settings to database using shop/session/shopId.

  return json({
    success: true,
    message: "Shipping settings updated successfully.",
    settings,
  });
}

export default function SettingsPage() {
  const settings = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const isSaving = navigation.state === "submitting";

  const [formState, setFormState] = useState({
    storeName: settings.storeName,
    businessAddress: settings.businessAddress,
    storePhone: settings.storePhone,

    currency: settings.currency,

    shippingProvider: settings.shippingProvider,

    defaultPackage: settings.defaultPackage,

    notificationFrequency:
      settings.notificationFrequency,

    notifications: settings.notifications,

    autoFulfillment: settings.autoFulfillment,

    insurance: settings.insurance,

    signatureRequired:
      settings.signatureRequired,
  });

  return (
    <Page>
      <TitleBar title="Efficient Shipping Settings" />

      <BlockStack gap="500">

        {/* SUCCESS MESSAGE */}
        {actionData?.success && (
          <Card>
            <InlineStack gap="200">
              <Badge tone="success">Saved</Badge>

              <Text as="p" variant="bodyMd">
                {actionData.message}
              </Text>
            </InlineStack>
          </Card>
        )}

        <Form method="POST">

          <BlockStack gap="500">

            {/* STORE INFORMATION */}
            <Card>
              <BlockStack gap="400">

                <InlineStack
                  align="space-between"
                  blockAlign="center"
                >
                  <Text
                    as="h2"
                    variant="headingMd"
                  >
                    Store Information
                  </Text>

                  <Button
                    submit
                    variant="primary"
                    loading={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </InlineStack>

                <TextField
                  label="Store name"
                  name="storeName"
                  value={formState.storeName}
                  onChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      storeName: value,
                    }))
                  }
                  autoComplete="organization"
                />

                <TextField
                  label="Business address"
                  name="businessAddress"
                  value={formState.businessAddress}
                  onChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      businessAddress: value,
                    }))
                  }
                  multiline={3}
                  autoComplete="street-address"
                />

                <TextField
                  label="Store phone"
                  name="storePhone"
                  value={formState.storePhone}
                  onChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      storePhone: value,
                    }))
                  }
                  autoComplete="tel"
                />

                <Select
                  label="Currency"
                  name="currency"
                  options={[
                    {
                      label: "US Dollar ($)",
                      value: "usd",
                    },
                    {
                      label: "Canadian Dollar (CAD)",
                      value: "cad",
                    },
                    {
                      label: "Euro (€)",
                      value: "eur",
                    },
                    {
                      label: "British Pound (£)",
                      value: "gbp",
                    },
                  ]}
                  value={formState.currency}
                  onChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      currency: value,
                    }))
                  }
                />

              </BlockStack>
            </Card>


            {/* SHIPPING PROVIDER */}
            <Card>
              <BlockStack gap="400">

                <Text
                  as="h2"
                  variant="headingMd"
                >
                  Shipping Provider
                </Text>

                <Text
                  as="p"
                  variant="bodyMd"
                  tone="subdued"
                >
                  Connect your shipping provider to
                  automatically calculate rates and
                  manage shipments.
                </Text>

                <Select
                  label="Shipping provider"
                  name="shippingProvider"
                  options={[
                    {
                      label: "Select provider",
                      value: "none",
                    },
                    {
                      label: "DHL",
                      value: "dhl",
                    },
                    {
                      label: "FedEx",
                      value: "fedex",
                    },
                    {
                      label: "UPS",
                      value: "ups",
                    },
                    {
                      label: "USPS",
                      value: "usps",
                    },
                    {
                      label: "Custom / Other",
                      value: "custom",
                    },
                  ]}
                  value={formState.shippingProvider}
                  onChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      shippingProvider: value,
                    }))
                  }
                />

                <InlineStack
                  align="end"
                >
                  <Button variant="primary">
                    Connect Provider
                  </Button>
                </InlineStack>

              </BlockStack>
            </Card>


            {/* PACKAGE SETTINGS */}
            <Card>
              <BlockStack gap="400">

                <Text
                  as="h2"
                  variant="headingMd"
                >
                  Default Package
                </Text>

                <Text
                  as="p"
                  variant="bodyMd"
                  tone="subdued"
                >
                  Choose the default package size used
                  when calculating shipping rates.
                </Text>

                <Select
                  label="Default package"
                  name="defaultPackage"
                  options={[
                    {
                      label: "Small",
                      value: "small",
                    },
                    {
                      label: "Medium",
                      value: "medium",
                    },
                    {
                      label: "Large",
                      value: "large",
                    },
                    {
                      label: "Extra Large",
                      value: "extra-large",
                    },
                  ]}
                  value={formState.defaultPackage}
                  onChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      defaultPackage: value,
                    }))
                  }
                />

              </BlockStack>
            </Card>


            {/* SHIPPING PREFERENCES */}
            <Card>
              <BlockStack gap="400">

                <Text
                  as="h2"
                  variant="headingMd"
                >
                  Shipping Preferences
                </Text>

                <ChoiceList
                  title="Shipment options"
                  choices={[
                    {
                      label:
                        "Automatically fulfill orders",
                      value: "auto-fulfillment",
                    },
                    {
                      label:
                        "Offer shipping insurance",
                      value: "insurance",
                    },
                    {
                      label:
                        "Require signature on delivery",
                      value: "signature-required",
                    },
                  ]}
                  selected={[
                    ...(formState.autoFulfillment
                      ? ["auto-fulfillment"]
                      : []),

                    ...(formState.insurance
                      ? ["insurance"]
                      : []),

                    ...(formState.signatureRequired
                      ? ["signature-required"]
                      : []),
                  ]}
                  onChange={(values) => {
                    setFormState((prev) => ({
                      ...prev,

                      autoFulfillment:
                        values.includes(
                          "auto-fulfillment"
                        ),

                      insurance:
                        values.includes(
                          "insurance"
                        ),

                      signatureRequired:
                        values.includes(
                          "signature-required"
                        ),
                    }));
                  }}
                  allowMultiple
                />

              </BlockStack>
            </Card>


            {/* NOTIFICATIONS */}
            <Card>
              <BlockStack gap="400">

                <Text
                  as="h2"
                  variant="headingMd"
                >
                  Notifications
                </Text>

                <Select
                  label="Notification frequency"
                  name="notificationFrequency"
                  options={[
                    {
                      label: "Immediately",
                      value: "immediately",
                    },
                    {
                      label: "Hourly digest",
                      value: "hourly",
                    },
                    {
                      label: "Daily digest",
                      value: "daily",
                    },
                  ]}
                  value={
                    formState.notificationFrequency
                  }
                  onChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      notificationFrequency:
                        value,
                    }))
                  }
                />

                <ChoiceList
                  title="Notification types"
                  choices={[
                    {
                      label:
                        "New order notifications",
                      value: "new-order",
                    },
                    {
                      label:
                        "Shipping updates",
                      value: "shipping-update",
                    },
                    {
                      label:
                        "Delivery updates",
                      value: "delivery-update",
                    },
                    {
                      label:
                        "Failed shipment alerts",
                      value: "failed-shipment",
                    },
                    {
                      label:
                        "Return notifications",
                      value: "return",
                    },
                  ]}
                  selected={
                    formState.notifications
                  }
                  onChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      notifications: value,
                    }))
                  }
                  allowMultiple
                />

              </BlockStack>
            </Card>


            {/* CONNECTED ACCOUNTS */}
            <Card>
              <BlockStack gap="400">

                <Text
                  as="h2"
                  variant="headingMd"
                >
                  Connected Accounts
                </Text>

                <InlineStack
                  align="space-between"
                  blockAlign="center"
                >

                  <BlockStack gap="100">

                    <Text
                      as="h3"
                      variant="headingSm"
                    >
                      Shipping Provider
                    </Text>

                    <Text
                      as="p"
                      variant="bodyMd"
                      tone="subdued"
                    >
                      No shipping provider connected
                    </Text>

                  </BlockStack>

                  <Button variant="primary">
                    Connect
                  </Button>

                </InlineStack>

                <Text
                  as="p"
                  variant="bodySm"
                  tone="subdued"
                >
                  Connect your shipping provider account
                  to enable live shipping rates,
                  shipment tracking, and label creation.
                </Text>

              </BlockStack>
            </Card>


            {/* TOOLS */}
            <Card>
              <BlockStack gap="400">

                <Text
                  as="h2"
                  variant="headingMd"
                >
                  Tools
                </Text>

                <BlockStack gap="300">

                  <InlineStack
                    align="space-between"
                    blockAlign="center"
                  >

                    <BlockStack gap="100">

                      <Text
                        as="h3"
                        variant="headingSm"
                      >
                        Reset shipping settings
                      </Text>

                      <Text
                        as="p"
                        variant="bodyMd"
                        tone="subdued"
                      >
                        Reset all shipping settings
                        to their default values.
                      </Text>

                    </BlockStack>

                    <Button tone="critical">
                      Reset
                    </Button>

                  </InlineStack>

                  <Divider />

                  <InlineStack
                    align="space-between"
                    blockAlign="center"
                  >

                    <BlockStack gap="100">

                      <Text
                        as="h3"
                        variant="headingSm"
                      >
                        Export settings
                      </Text>

                      <Text
                        as="p"
                        variant="bodyMd"
                        tone="subdued"
                      >
                        Download a backup of your
                        current shipping configuration.
                      </Text>

                    </BlockStack>

                    <Button>
                      Export
                    </Button>

                  </InlineStack>

                </BlockStack>

              </BlockStack>
            </Card>


            {/* SAVE BUTTON */}
            <InlineStack align="end">
              <Button
                submit
                variant="primary"
                loading={isSaving}
              >
                {isSaving
                  ? "Saving..."
                  : "Save Settings"}
              </Button>
            </InlineStack>

          </BlockStack>

        </Form>


        {/* FOOTER */}
        <Box paddingBlockStart="400">
          <InlineStack align="center">

            <Text
              as="p"
              variant="bodySm"
              tone="subdued"
            >
              Need help with shipping configuration?{" "}

              <Link
                url="https://help.shopify.com"
                external
              >
                View Shopify shipping documentation
              </Link>
            </Text>

          </InlineStack>
        </Box>

      </BlockStack>
    </Page>
  );
}