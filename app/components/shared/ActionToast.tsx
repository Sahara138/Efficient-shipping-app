import React from "react";
import { Toast } from "@shopify/polaris";

type ActionToastProps = {
  content: string;
  error?: boolean;
  onDismiss: () => void;
};

export const ActionToast: React.FC<ActionToastProps> = ({
  content,
  error = false,
  onDismiss,
}) => {
  return <Toast content={content} error={error} onDismiss={onDismiss} duration={3000} />;
};
