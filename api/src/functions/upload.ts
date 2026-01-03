import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { BlobServiceClient } from "@azure/storage-blob";

const connectionString = process.env.BLOB_CONNECTION_STRING || "";
const containerName = process.env.BLOB_CONTAINER || "images";

// POST upload image
export async function uploadImage(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const formData = await request.formData();
    const fileEntry = formData.get("file");
    
    if (!fileEntry || typeof fileEntry === "string") {
      return { status: 400, jsonBody: { error: "No file provided" } };
    }

    const file = fileEntry as unknown as { name: string; type: string; arrayBuffer(): Promise<ArrayBuffer> };

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    // Generate unique blob name
    const blobName = `${Date.now()}-${file.name}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Upload file
    const arrayBuffer = await file.arrayBuffer();
    await blockBlobClient.uploadData(arrayBuffer, {
      blobHTTPHeaders: { blobContentType: file.type }
    });

    // Return the URL
    const imageUrl = blockBlobClient.url;
    
    context.log("Image uploaded:", imageUrl);
    
    return {
      status: 200,
      jsonBody: { url: imageUrl }
    };
  } catch (error) {
    context.log("Error uploading image:", error);
    return { status: 500, jsonBody: { error: "Failed to upload image" } };
  }
}

app.http("uploadImage", { methods: ["POST"], route: "upload", handler: uploadImage });
