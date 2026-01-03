import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

const endpoint = process.env.COSMOS_ENDPOINT!;
const key = process.env.COSMOS_KEY!;
const databaseId = process.env.COSMOS_DATABASE || "TravelJournalDB";
const containerId = process.env.COSMOS_CONTAINER || "journals";

const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);
const container = database.container(containerId);

// GET all journals
export async function getJournals(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const { resources } = await container.items.query("SELECT * FROM c ORDER BY c.date DESC").fetchAll();
    return {
      status: 200,
      jsonBody: resources,
      headers: { "Content-Type": "application/json" }
    };
  } catch (error) {
    context.log("Error fetching journals:", error);
    return { status: 500, jsonBody: { error: "Failed to fetch journals" } };
  }
}

// GET single journal
export async function getJournal(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const id = request.params.id;
  try {
    const { resource } = await container.item(id, id).read();
    if (!resource) {
      return { status: 404, jsonBody: { error: "Journal not found" } };
    }
    return { status: 200, jsonBody: resource };
  } catch (error) {
    return { status: 500, jsonBody: { error: "Failed to fetch journal" } };
  }
}

// POST create journal
export async function createJournal(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = await request.json() as any;
    const newJournal = {
      id: Date.now().toString(),
      ...body,
      likes: [],
      comments: [],
      createdAt: new Date().toISOString()
    };
    const { resource } = await container.items.create(newJournal);
    return { status: 201, jsonBody: resource };
  } catch (error) {
    context.log("Error creating journal:", error);
    return { status: 500, jsonBody: { error: "Failed to create journal" } };
  }
}

// PUT update journal
export async function updateJournal(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const id = request.params.id;
  try {
    const body = await request.json() as any;
    const { resource } = await container.item(id, id).replace({ ...body, id });
    return { status: 200, jsonBody: resource };
  } catch (error) {
    return { status: 500, jsonBody: { error: "Failed to update journal" } };
  }
}

// DELETE journal
export async function deleteJournal(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const id = request.params.id;
  try {
    await container.item(id, id).delete();
    return { status: 204 };
  } catch (error) {
    return { status: 500, jsonBody: { error: "Failed to delete journal" } };
  }
}

// Register routes
app.http("getJournals", { methods: ["GET"], route: "journals", handler: getJournals });
app.http("getJournal", { methods: ["GET"], route: "journals/{id}", handler: getJournal });
app.http("createJournal", { methods: ["POST"], route: "journals", handler: createJournal });
app.http("updateJournal", { methods: ["PUT"], route: "journals/{id}", handler: updateJournal });
app.http("deleteJournal", { methods: ["DELETE"], route: "journals/{id}", handler: deleteJournal });
