import {
  TextField,
} from "@shopify/polaris";

import { Form } from "@remix-run/react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function ProductSearch({
  value,
  onChange,
}: Props) {
  return (
    <Form method="get">
      <TextField
        label="Search products"
        labelHidden
        placeholder="Search by title, vendor, or product type"
        value={value}
        onChange={onChange}
        name="query"
        autoComplete="off"
        clearButton
        onClearButtonClick={() =>
          onChange("")
        }
      />
    </Form>
  );
}