import {
  Card,
  InlineStack,
  Text,
  Button,
  Select,
} from "@shopify/polaris";

import { Form } from "@remix-run/react";

type Props = {
  selectedProducts: string[];
  onClear: () => void;
};

export default function BulkActions({
  selectedProducts,
  onClear,
}: Props) {
  if (selectedProducts.length === 0) {
    return null;
  }

  return (
    <Card>
      <InlineStack
        align="space-between"
        blockAlign="center"
      >
        <Text as="p">
          {selectedProducts.length} product
          {selectedProducts.length > 1
            ? "s"
            : ""}{" "}
          selected
        </Text>

        <InlineStack gap="300">
          {/* STATUS */}

          <Form method="post">
            <input
              type="hidden"
              name="intent"
              value="bulk-status"
            />

            {selectedProducts.map((id) => (
              <input
                key={id}
                type="hidden"
                name="ids"
                value={id}
              />
            ))}

            <Select
              label=""
              labelHidden
              options={[
                {
                  label: "Set Active",
                  value: "ACTIVE",
                },
                {
                  label: "Set Draft",
                  value: "DRAFT",
                },
              ]}
              name="status"
            />

            <Button submit>
              Update status
            </Button>
          </Form>

          {/* DELETE */}

          <Form method="post">
            <input
              type="hidden"
              name="intent"
              value="bulk-delete"
            />

            {selectedProducts.map((id) => (
              <input
                key={id}
                type="hidden"
                name="ids"
                value={id}
              />
            ))}

            <Button
              submit
              tone="critical"
            >
              Delete selected
            </Button>
          </Form>

          <Button onClick={onClear}>
            Cancel
          </Button>
        </InlineStack>
      </InlineStack>
    </Card>
  );
}