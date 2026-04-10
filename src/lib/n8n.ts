declare const process: {
  env: Record<string, string | undefined>;
};

type ChatHistoryMessage = {
  role: "user" | "model";
  content: string;
};

type N8NChatInput = {
  message: string;
  sessionId?: string;
  pageContext?: string;
  currentPage?: string;
  history?: ChatHistoryMessage[];
};

type N8NImageInput = {
  imageBase64: string;
  mimeType: string;
  reportType: "pollution" | "encroachment" | "erosion" | "general";
  filename: string;
  filesize: number;
};

type N8NReportInput = {
  type: string;
  location: string;
  date: string;
  analysis: string;
  severity: string;
  detectedIssues: string[];
};

function env(name: string) {
  return process.env[name]?.trim() || "";
}

function requireEnv(name: string) {
  const value = env(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function buildAuthHeaders() {
  const headerName = env("N8N_WEBHOOK_AUTH_HEADER_NAME");
  const headerValue = env("N8N_WEBHOOK_AUTH_HEADER_VALUE");

  if (!headerName || !headerValue) {
    return {};
  }

  return {
    [headerName]: headerValue,
  };
}

function withAction(url: string, action: string) {
  const parsed = new URL(url);
  parsed.searchParams.set("action", action);
  return parsed.toString();
}

async function parsePayload(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function coerceString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  return null;
}

function extractMessage(payload: unknown): string | null {
  if (payload == null) {
    return null;
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const found = extractMessage(item);
      if (found) {
        return found;
      }
    }
    return null;
  }

  if (typeof payload === "object") {
    const data = payload as Record<string, unknown>;

    const directKeys = [
      "answer",
      "output",
      "response",
      "message",
      "text",
      "analysis",
      "report",
      "summary",
      "content",
    ];

    for (const key of directKeys) {
      const direct = data[key];

      if (typeof direct === "string") {
        return direct;
      }

      if (direct && typeof direct === "object") {
        const nested = direct as Record<string, unknown>;
        const fromContent = coerceString(nested.content) || coerceString(nested.text);
        if (fromContent) {
          return fromContent;
        }
      }
    }

    const nestedKeys = ["data", "json", "body"];
    for (const key of nestedKeys) {
      const nested = extractMessage(data[key]);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

function normalizeSeverity(value: unknown): "low" | "medium" | "high" | "critical" {
  if (typeof value !== "string") {
    return "medium";
  }

  const lower = value.toLowerCase();
  if (lower === "low" || lower === "medium" || lower === "high" || lower === "critical") {
    return lower;
  }

  return "medium";
}

function normalizeConfidence(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0.7;
  }

  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
}

async function postJson(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = await parsePayload(response);

  if (!response.ok) {
    const detail =
      extractMessage(payload) ||
      (typeof payload === "string" ? payload : null) ||
      `n8n request failed with status ${response.status}`;

    throw new Error(detail);
  }

  return payload;
}

export async function sendChatToN8N(input: N8NChatInput) {
  const chatWebhookUrl = requireEnv("N8N_CHAT_WEBHOOK_URL");
  const requestUrl = withAction(chatWebhookUrl, "sendMessage");

  const payload = await postJson(requestUrl, {
    chatInput: input.message,
    sessionId: input.sessionId || "",
    metadata: {
      pageContext: input.pageContext || "",
      currentPage: input.currentPage || "",
      history: input.history || [],
    },
  });

  const message =
    extractMessage(payload) ||
    "I could not produce a response right now. Please try again.";

  return {
    message,
    raw: payload,
  };
}

export async function analyzeImageViaN8N(input: N8NImageInput) {
  const analyzeWebhookUrl = requireEnv("N8N_ANALYZE_WEBHOOK_URL");

  const payload = await postJson(analyzeWebhookUrl, {
    image: input.imageBase64,
    mimeType: input.mimeType,
    size: input.filesize,
    filename: input.filename,
    reportType: input.reportType,
  });

  const data = (payload || {}) as Record<string, unknown>;
  const nestedData =
    data.data && typeof data.data === "object"
      ? (data.data as Record<string, unknown>)
      : null;
  const analysisText =
    extractMessage(payload) ||
    "Image was processed, but no detailed analysis text was returned.";

  const detectedIssues = readStringArray(data.detectedIssues);
  const fallbackDetectedIssues = readStringArray(nestedData?.detectedIssues);

  const recommendations = readStringArray(data.recommendations);
  const fallbackRecommendations = readStringArray(nestedData?.recommendations);

  return {
    analysis: analysisText,
    severity: normalizeSeverity(data.severity),
    confidence: normalizeConfidence(data.confidence),
    detectedIssues:
      detectedIssues.length > 0
        ? detectedIssues
        : fallbackDetectedIssues.length > 0
          ? fallbackDetectedIssues
        : ["Review image findings manually for final confirmation."],
    recommendations:
      recommendations.length > 0
        ? recommendations
        : fallbackRecommendations.length > 0
          ? fallbackRecommendations
        : ["Verify this finding with field inspection or additional imagery."],
    raw: payload,
  };
}

export async function generateReportViaN8N(input: N8NReportInput) {
  const reportWebhookUrl = requireEnv("N8N_REPORT_WEBHOOK_URL");

  const payload = await postJson(reportWebhookUrl, {
    reportType: input.type,
    area: input.location,
    date: input.date,
    analysis: input.analysis,
    severity: input.severity,
    detectedIssues: input.detectedIssues,
  });

  const summary =
    extractMessage(payload) ||
    "A report request was processed, but no summary text was returned.";

  return {
    summary,
    raw: payload,
  };
}
