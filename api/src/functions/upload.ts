import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { BlobServiceClient } from "@azure/storage-blob";
import * as multipart from "parse-multipart-data";

export async function uploadImage(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const connectionString = process.env.BLOB_CONNECTION_STRING;
    const containerName = process.env.BLOB_CONTAINER || "images";

    if (!connectionString) {
      return { status: 500, jsonBody: { error: "BLOB_CONNECTION_STRING not configured" } };
    }

    // Parse multipart data
    const bodyBuffer = Buffer.from(await request.arrayBuffer());
    const contentType = request.headers.get("content-type") || "";
    context.log("Content-Type:", contentType);
    const boundary = multipart.getBoundary(contentType);
    context.log("Boundary:", boundary);
    const parts = multipart.parse(bodyBuffer, boundary);
    context.log("Parts count:", parts?.length);

    if (!parts || parts.length === 0) {
      return { status: 400, jsonBody: { error: "No file uploaded" } };
    }

    const file = parts[0];
    const fileName = file.filename || `upload-${Date.now()}.jpg`;

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Ensure container exists.
    await containerClient.createIfNotExists({ access: "blob" });

    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    await blockBlobClient.upload(file.data, file.data.length, {
      blobHTTPHeaders: { blobContentType: file.type }
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

app.http("uploadImage", { methods: ["POST"], authLevel: "anonymous", handler: uploadImage, route: "upload" });
