// Import real ClickUp client data
import { getDb } from "./db";
import { clickupClients } from "../drizzle/schema";

const CLICKUP_API_KEY = "pk_82195661_L32W2R69UK373MVCYG3EJXMJ830N1RT6";
const CLICKUP_VIEW_ID = "8ckrukp-16113";

// Map Client Status dropdown values
const CLIENT_STATUS_MAP: Record<number, string> = {
  0: "Churned",
  1: "Pending",
  2: "Onboarding",
  3: "Live",
  4: "Paused",
  5: "Ending Soon",
};

// Map ServiceType dropdown values (need to check these)
const SERVICE_TYPE_MAP: Record<number, string> = {
  1: "FAM",
  2: "PPC",
  3: "Consulting",
  // Add more as needed
};

interface ClickUpTask {
  id: string;
  name: string;
  url: string;
  status: { status: string };
  custom_fields: Array<{
    name: string;
    value: any;
    type: string;
    type_config?: {
      options?: Array<{
        id: string;
        name: string;
        orderindex: number;
      }>;
    };
  }>;
}

async function fetchAllClientsFromClickUp(): Promise<ClickUpTask[]> {
  const allClients: ClickUpTask[] = [];
  let page = 0;
  let lastPage = false;

  console.log('[Seed] Fetching clients from ClickUp view...');

  while (!lastPage) {
    const url = `https://api.clickup.com/api/v2/view/${CLICKUP_VIEW_ID}/task?page=${page}`;
    
    const response = await fetch(url, {
      headers: {
        "Authorization": CLICKUP_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`ClickUp API error: ${response.statusText}`);
    }

    const data = await response.json();
    const tasks = data.tasks || [];
    allClients.push(...tasks);
    
    lastPage = data.last_page || false;
    console.log(`[Seed] Fetched page ${page}: ${tasks.length} clients (last_page: ${lastPage})`);
    
    page++;
  }

  console.log(`[Seed] Total clients fetched: ${allClients.length}`);
  return allClients;
}

function getCustomFieldValue(task: ClickUpTask, fieldName: string): any {
  const field = task.custom_fields.find(cf => cf.name === fieldName);
  return field?.value;
}

function getCustomFieldOptionName(task: ClickUpTask, fieldName: string): string | null {
  const field = task.custom_fields.find(cf => cf.name === fieldName);
  if (!field || field.value === null || field.value === undefined) {
    return null;
  }

  const options = field.type_config?.options || [];
  const option = options.find(opt => opt.orderindex === parseInt(field.value));
  return option?.name || null;
}

async function seedClients() {
  console.log('[Seed] Starting ClickUp client data import...');
  
  try {
    const clickupTasks = await fetchAllClientsFromClickUp();
    const db = await getDb();
    
    if (!db) {
      throw new Error('Database not available');
    }

    let imported = 0;
    let skipped = 0;

    for (const task of clickupTasks) {
      // Extract custom fields
      const brandName = getCustomFieldValue(task, "Brand's Name");
      const clientStatusValue = getCustomFieldValue(task, "⭐ Client Status");
      const serviceTypeValue = getCustomFieldValue(task, "⭐ ServiceType");
      
      // Map status from dropdown value to name
      const clientStatus = clientStatusValue !== null && clientStatusValue !== undefined
        ? CLIENT_STATUS_MAP[parseInt(clientStatusValue)] || "Unknown"
        : "Unknown";

      // Map service type from dropdown value to name
      const serviceType = getCustomFieldOptionName(task, "⭐ ServiceType");

      const pocFirstName = getCustomFieldValue(task, "⭐ POC First Name");
      const pocLastName = getCustomFieldValue(task, "⭐ POC Last Name");
      const pocEmail = getCustomFieldValue(task, "⭐ POC Email");
      const pocPhone = getCustomFieldValue(task, "⭐ POC Phone No.");
      const ppcBudget = getCustomFieldValue(task, "⭐ PPC Monthly Budget");
      const totalAsinsFam = getCustomFieldValue(task, "Total Asins FAM");
      const totalAsinsPpc = getCustomFieldValue(task, "Total Asins PPC");
      const recurringFee = getCustomFieldValue(task, "4. Recurring Retainer Fee");

      const clientData = {
        clickupTaskId: task.id,
        clickupUrl: task.url,
        clientName: task.name,
        brandName: brandName || task.name,
        company: brandName || task.name,
        status: clientStatus.toLowerCase().replace(" ", "_"),
        defcon: 3, // Default to DEFCON 3 (will map from custom field later)
        amOwner: null, // Will need to map this if available
        ppcOwner: null, // Will need to map this if available
        creativeOwner: null, // Will need to map this if available
        podOwner: null, // Will need to map this if available
        totalAsinsFam: totalAsinsFam?.toString() || null,
        totalAsinsPpc: totalAsinsPpc?.toString() || null,
      };

      await db.insert(clickupClients)
        .values(clientData)
        .onConflictDoUpdate({
          target: clickupClients.clickupTaskId,
          set: {
            clientName: clientData.clientName,
            brandName: clientData.brandName,
            company: clientData.company,
            status: clientData.status,
            defcon: clientData.defcon,
            amOwner: clientData.amOwner,
            ppcOwner: clientData.ppcOwner,
            creativeOwner: clientData.creativeOwner,
            podOwner: clientData.podOwner,
            totalAsinsFam: clientData.totalAsinsFam,
            totalAsinsPpc: clientData.totalAsinsPpc,
            updatedAt: new Date(),
          },
        });

      console.log(`[Seed] ✓ ${clientData.clientName} (${clientData.status})`);
      imported++;
    }
    
    console.log('[Seed] ✅ Client data import completed successfully');
    console.log(`[Seed] Imported: ${imported}, Skipped: ${skipped}`);
    
    // Print status breakdown
    const statusCounts: Record<string, number> = {};
    for (const task of clickupTasks) {
      const statusValue = getCustomFieldValue(task, "⭐ Client Status");
      const status = statusValue !== null && statusValue !== undefined
        ? CLIENT_STATUS_MAP[parseInt(statusValue)] || "Unknown"
        : "Unknown";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    }
    
    console.log('[Seed] Status breakdown:');
    for (const [status, count] of Object.entries(statusCounts)) {
      console.log(`[Seed]   ${status}: ${count}`);
    }
    
  } catch (error) {
    console.error('[Seed] Error importing client data:', error);
    throw error;
  }
}

export { seedClients };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedClients()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
