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
import type { MediaFile } from "../types/analytics";
import { FilterPaginationBar } from "../components/shared/FilterPaginationBar";
import { ActionToast } from "../components/shared/ActionToast";

const INITIAL_FILES: MediaFile[] = [
  {
    id: "gid://shopify/MediaImage/9501",
    fileName: "dhl-packing-label-spec.pdf",
    fileType: "GENERIC_FILE",
    url: "https://cdn.shopify.com/s/files/1/0533/2089/files/label-spec.pdf",
    sizeMb: 1.2,
    createdAt: "2026-08-20",
  },
  {
    id: "gid://shopify/MediaImage/9502",
    fileName: "pallet-wrap-instruction.mp4",
    fileType: "VIDEO",
    url: "https://cdn.shopify.com/s/files/1/0533/2089/files/video-instruction.mp4",
    sizeMb: 14.8,
    createdAt: "2026-08-22",
  },
  {
    id: "gid://shopify/MediaImage/9503",
    fileName: "fragile-shipping-sticker.png",
    fileType: "IMAGE",
    url: "https://cdn.shopify.com/s/files/1/0533/2089/files/fragile-sticker.png",
    sizeMb: 0.4,
    createdAt: "2026-08-25",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return json({ files: INITIAL_FILES });
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);
  return json({ success: true });
}

export default function FilesRoute() {
  const data = useLoaderData<typeof loader>();
  const [files, setFiles] = useState<MediaFile[]>(data.files);
  const [search, setSearch] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState<"IMAGE" | "VIDEO" | "GENERIC_FILE">("IMAGE");

  const filteredFiles = useMemo(() => {
    return files.filter((f) => f.fileName.toLowerCase().includes(search.toLowerCase()));
  }, [files, search]);

  const handleUpload = () => {
    if (!fileName) {
      setToastMessage("File Name is required!");
      return;
    }
    const newFile: MediaFile = {
      id: `gid://shopify/MediaImage/${Date.now()}`,
      fileName,
      fileType,
      url: `https://cdn.shopify.com/s/files/1/0533/2089/files/${fileName}`,
      sizeMb: parseFloat((Math.random() * 5).toFixed(1)),
      createdAt: new Date().toISOString().split("T")[0],
    };
    setFiles([newFile, ...files]);
    setIsUploadOpen(false);
    setFileName("");
    setToastMessage("File uploaded to CDN!");
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard?.writeText(url);
    setToastMessage("CDN URL copied to clipboard!");
  };

  const rows = filteredFiles.map((f) => [
    <Text as="span" variant="bodyMd" fontWeight="bold" key={f.id}>
      {f.fileName}
    </Text>,
    <Badge key={f.id} tone={f.fileType === "IMAGE" ? "success" : f.fileType === "VIDEO" ? "info" : "attention"}>
      {f.fileType}
    </Badge>,
    `${f.sizeMb} MB`,
    f.createdAt,
    <InlineStack gap="200" key={f.id}>
      <Button size="slim" onClick={() => handleCopyUrl(f.url)}>
        Copy URL
      </Button>
      <Button size="slim" tone="critical" onClick={() => {
        setFiles(files.filter(item => item.id !== f.id));
        setToastMessage("File removed.");
      }}>
        Delete
      </Button>
    </InlineStack>,
  ]);

  return (
    <Frame>
      <Page
        title="Files & Media Library"
        subtitle="Manage product images, shipping instruction videos, and document files"
        primaryAction={{
          content: "Upload File",
          onAction: () => setIsUploadOpen(true),
        }}
      >
        <TitleBar title="Files & Media Library" />

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <FilterPaginationBar
                  searchValue={search}
                  onSearchChange={setSearch}
                  searchPlaceholder="Search file name..."
                />

                <DataTable
                  columnContentTypes={["text", "text", "text", "text", "text"]}
                  headings={["File Name", "Type", "Size", "Uploaded", "Actions"]}
                  rows={rows}
                />
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Modal */}
        <Modal
          open={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          title="Upload Media / File"
          primaryAction={{
            content: "Upload",
            onAction: handleUpload,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: () => setIsUploadOpen(false),
            },
          ]}
        >
          <Modal.Section>
            <BlockStack gap="300">
              <TextField label="File Name" value={fileName} onChange={setFileName} placeholder="custom-box-art.png" autoComplete="off" />
              <Select
                label="File Type"
                options={[
                  { label: "Image", value: "IMAGE" },
                  { label: "Video", value: "VIDEO" },
                  { label: "Generic Document / PDF", value: "GENERIC_FILE" },
                ]}
                value={fileType}
                onChange={(val) => setFileType(val as any)}
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
