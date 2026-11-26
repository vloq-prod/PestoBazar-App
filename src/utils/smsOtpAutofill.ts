import { Platform } from "react-native";
import RNOtpVerify from "./otpVerify";

const BUFFER_TTL_MS = 30_000;

let activeGeneration = 0;
let isRetrieverActive = false;
let activeLength = 4;
let activeHandler: ((otp: string) => void) | null = null;
let bufferedOtp: { otp: string; receivedAt: number } | null = null;

/**
 * Extracts a numeric OTP of the expected digit length from an SMS Retriever payload.
 */
export function extractOtpFromSms(message: string, length = 4): string | null {
  if (!message || message === "Timeout Error.") return null;
  const match = new RegExp(`\\b(\\d{${length}})\\b`).exec(message);
  return match?.[1] ?? null;
}

/**
 * Logs Android SMS Retriever app signature hashes for debugging/verification.
 */
export async function logSmsRetrieverHash(): Promise<string[]> {
  if (Platform.OS !== "android") return [];
  try {
    const hashes = await RNOtpVerify.getHash();
    console.log("🔑 [SMS RETRIEVER HASH]:", hashes);
    return hashes;
  } catch (err) {
    console.warn("Could not get SMS hash:", err);
    return [];
  }
}

/**
 * Starts Android SMS Retriever before sending an OTP and buffers the code
 * briefly if the SMS arrives before the verification screen mounts.
 */
export function primeSmsRetriever(length = 4): void {
  if (Platform.OS !== "android") return;

  const gen = ++activeGeneration;
  activeLength = length;
  bufferedOtp = null;
  isRetrieverActive = true;

  RNOtpVerify.removeListener();
  RNOtpVerify.addListener((message: string) => {
    if (gen !== activeGeneration) return;

    if (message === "Timeout Error.") {
      isRetrieverActive = false;
      return;
    }

    const otp = extractOtpFromSms(message, activeLength);
    if (!otp) return;

    isRetrieverActive = false;
    if (activeHandler) {
      activeHandler(otp);
    } else {
      bufferedOtp = { otp, receivedAt: Date.now() };
    }
  });

  RNOtpVerify.getOtp().catch((err) => {
    if (gen === activeGeneration) {
      isRetrieverActive = false;
      RNOtpVerify.removeListener();
    }
    console.warn("SMS listener start error:", err);
  });
}

/**
 * Stops the active Android SMS Retriever listener and clears any buffered OTP.
 */
export function stopSmsOtpListener(): void {
  if (Platform.OS !== "android") return;
  activeGeneration++;
  activeHandler = null;
  bufferedOtp = null;
  isRetrieverActive = false;
  RNOtpVerify.removeListener();
}

/**
 * Subscribes the active OTP verification UI to Android SMS Retriever events.
 */
export function subscribeSmsOtp(options: {
  length?: number;
  onOtp: (otp: string) => void;
}): () => void {
  if (Platform.OS !== "android") return () => {};

  const length = options.length ?? 4;
  activeLength = length;
  activeHandler = options.onOtp;

  if (bufferedOtp) {
    const { otp, receivedAt } = bufferedOtp;
    bufferedOtp = null;
    if (Date.now() - receivedAt < BUFFER_TTL_MS) {
      Promise.resolve().then(() => {
        if (activeHandler === options.onOtp) {
          options.onOtp(otp);
        }
      });
      return () => {
        if (activeHandler === options.onOtp) {
          stopSmsOtpListener();
        }
      };
    }
  }

  if (!isRetrieverActive) {
    primeSmsRetriever(length);
  }

  return () => {
    if (activeHandler === options.onOtp) {
      stopSmsOtpListener();
    }
  };
}
