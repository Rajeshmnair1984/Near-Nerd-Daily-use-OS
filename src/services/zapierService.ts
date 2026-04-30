export interface ZapierSettings {
  enabled: boolean;
  webhookUrl: string;
}

export type ZapierEventAction =
  | "created"
  | "updated"
  | "deleted"
  | "status_changed";
export type ZapierEventResource = "bill" | "location" | "vendor" | "document";

interface ZapierEvent<T> {
  action: ZapierEventAction;
  resource: ZapierEventResource;
  record?: T;
  recordId?: string;
  metadata?: Record<string, unknown>;
}

const ZAPIER_SETTINGS_KEY = "zapier_integration_settings";

const defaultSettings: ZapierSettings = {
  enabled: false,
  webhookUrl: "",
};

class ZapierService {
  getSettings(): ZapierSettings {
    try {
      const stored = localStorage.getItem(ZAPIER_SETTINGS_KEY);
      if (!stored) return defaultSettings;

      const parsed = JSON.parse(stored) as Partial<ZapierSettings>;
      return {
        enabled: Boolean(parsed.enabled),
        webhookUrl: parsed.webhookUrl || "",
      };
    } catch {
      return defaultSettings;
    }
  }

  saveSettings(settings: ZapierSettings): ZapierSettings {
    const normalized = {
      enabled: settings.enabled,
      webhookUrl: settings.webhookUrl.trim(),
    };
    localStorage.setItem(ZAPIER_SETTINGS_KEY, JSON.stringify(normalized));
    return normalized;
  }

  async sendEvent<T>(event: ZapierEvent<T>): Promise<void> {
    const settings = this.getSettings();
    if (!settings.enabled || !settings.webhookUrl) {
      return;
    }

    await this.post(settings.webhookUrl, {
      source: "Near Nerd Daily OS",
      sent_at: new Date().toISOString(),
      ...event,
    });
  }

  async testConnection(webhookUrl: string): Promise<void> {
    const trimmedUrl = webhookUrl.trim();
    if (!trimmedUrl) {
      throw new Error("Paste your Zapier webhook URL first");
    }

    await this.post(trimmedUrl, {
      source: "Near Nerd Daily OS",
      action: "test",
      resource: "zapier_connection",
      sent_at: new Date().toISOString(),
      message: "Zapier connection test from Near Nerd Daily OS",
    });
  }

  private async post(
    webhookUrl: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Zapier returned ${response.status}`);
    }
  }
}

export const zapierService = new ZapierService();
