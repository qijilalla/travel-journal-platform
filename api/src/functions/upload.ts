import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import * as multipart from "parse-multipart-data";

type ConnectionParts = Record<string, string>;

function normalizeConnectionString(raw: string): string {
  let value = raw.trim().replace(/[\r\n]/g, "");
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }
  return value;
}

function parseConnectionString(raw: string): ConnectionParts {
  const parts: ConnectionParts = {};
  for (const segment of raw.split(";")) {
    if (!segment) {
      continue;
    }
    const idx = segment.indexOf("=");
    if (idx === -1) {
      continue;
    }
    const key = segment.slice(0, idx).trim();
    let value = segment.slice(idx + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1).trim();
    }
    if (key) {
      parts[key] = value;
    }
  }
  return parts;
}

function createBlobServiceClient(connectionString: string): BlobServiceClient {
  const normalized = normalizeConnectionString(connectionString);
  const parts = parseConnectionString(normalized);
  const accountName = parts.AccountName?.trim();
  const accountKey = parts.AccountKey?.trim();
  const protocol = (parts.DefaultEndpointsProtocol || "https").trim();
  let endpointSuffix = (parts.EndpointSuffix || "core.windows.net").trim();
  endpointSuffix = endpointSuffix.split(/\s+/)[0];

  if (!accountName || !accountKey) {
    throw new Error("Invalid storage connection string.");
  }

  const blobEndpoint = `${protocol}://${accountName}.blob.${endpointSuffix}`;
  const credential = new StorageSharedKeyCredential(accountName, accountKey);
  return new BlobServiceClient(blobEndpoint, credential);
}

export async function uploadImage(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const connectionString = (process.env.BLOB_CONNECTION_STRING || "").trim();
    const containerName = (process.env.BLOB_CONTAINER || "images").trim();

    if (!connectionString) {
      return { status: 500, jsonBody: { error: "BLOB_CONNECTION_STRING not configured" } };
    }

    const contentType = request.headers.get("content-type") || "";
    const boundary = multipart.getBoundary(contentType);
    if (!boundary) {
      return { status: 400, jsonBody: { error: "Invalid multipart request" } };
    }

    const bodyBuffer = Buffer.from(await request.arrayBuffer());
    const parts = multipart.parse(bodyBuffer, boundary);
    const file = parts.find(part => part.filename) || parts[0];

    if (!file || !file.data) {
      return { status: 400, jsonBody: { error: "No file uploaded" } };
    }

    const baseName = file.filename || "image.jpg";
    const fileName = `${Date.now()}-${baseName}`;

    const blobServiceClient = createBlobServiceClient(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists({ access: "blob" });

    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    await blockBlobClient.upload(file.data, file.data.length, {
      blobHTTPHeaders: { blobContentType: file.type || "application/octet-stream" }
    });

    return {
      status: 200,
      jsonBody: { url: blockBlobClient.url, filename: fileName }
    };
  } catch (error: any) {
    context.log(`Error uploading image: ${error.message}`);
    return { status: 500, body: `Error: ${error.message}` };
  }
}

app.http("uploadImage", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: uploadImage,
  route: "upload"
});
