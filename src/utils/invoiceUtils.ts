// src/utils/invoiceUtils.ts
import { Alert } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as WebBrowser from "expo-web-browser";
import { BASE_URL } from "../lib/apiClient";

export interface DownloadInvoiceOptions {
  orderId: string | number;
  displayId?: string | number;
  onStart?: () => void;
  onFinish?: () => void;
}

/**
 * Downloads invoice PDF from backend and opens it with native viewer / share sheet.
 * Completely eliminates third-party Google Docs Viewer timeouts and 'No preview' errors.
 */
export const downloadAndOpenInvoice = async ({
  orderId,
  displayId,
  onStart,
  onFinish,
}: DownloadInvoiceOptions): Promise<void> => {
  if (!orderId) {
    Alert.alert("Error", "Order ID is missing.");
    return;
  }

  try {
    onStart?.();

    const cleanBaseUrl = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
    const invoiceUrl = `${cleanBaseUrl}generate-download/${encodeURIComponent(String(orderId))}`;

    const safeName = String(displayId || orderId).replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `invoice_${safeName}.pdf`;
    const fileUri = `${FileSystem.documentDirectory || ""}${filename}`;

    // 1. Download PDF directly from backend
    const downloadRes = await FileSystem.downloadAsync(invoiceUrl, fileUri);

    if (downloadRes.status !== 200) {
      throw new Error(`Download failed with status ${downloadRes.status}`);
    }

    // 2. Open Native Document Viewer / Share Sheet
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(downloadRes.uri, {
        mimeType: "application/pdf",
        dialogTitle: `Invoice #${displayId || orderId}`,
        UTI: "com.adobe.pdf",
      });
    } else {
      await WebBrowser.openBrowserAsync(invoiceUrl);
    }
  } catch (error) {
    console.warn("Invoice download error:", error);
    // Fallback directly to in-app browser
    try {
      const cleanBaseUrl = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
      const invoiceUrl = `${cleanBaseUrl}generate-download/${encodeURIComponent(String(orderId))}`;
      await WebBrowser.openBrowserAsync(invoiceUrl);
    } catch {
      Alert.alert("Error", "Unable to open invoice. Please try again.");
    }
  } finally {
    onFinish?.();
  }
};
