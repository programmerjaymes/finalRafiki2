type SmsGatewayResponse = {
  success?: boolean;
  sentCount?: number;
  senderIdUsed?: string;
  creditsRemaining?: number;
  message?: string;
  error?: string | { error?: string; message?: string };
};

export type SmsSendResult = {
  success: boolean;
  phone: string;
  senderIdUsed?: string;
  creditsRemaining?: number;
  error?: string;
};

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function gatewayError(payload: SmsGatewayResponse, status: number) {
  const nested = typeof payload.error === 'object' ? payload.error : null;
  const detail = typeof payload.error === 'string'
    ? payload.error
    : nested?.message || nested?.error || payload.message;
  if (status === 401) {
    return detail
      ? `SMS gateway rejected the API credentials: ${detail}`
      : 'SMS gateway rejected the API credentials. Check the API key and business ID.';
  }
  return detail || `SMS gateway returned HTTP ${status}`;
}

export async function sendSms(phone: string, message: string): Promise<SmsSendResult> {

  try {
    const baseUrl = requiredEnv('SMS_GATEWAY_URL').replace(/\/$/, '');
    const apiKey = requiredEnv('SMS_GATEWAY_API_KEY');
    const businessId = requiredEnv('SMS_GATEWAY_BUSINESS_ID');
    const senderId = process.env.SMS_SENDER_ID?.trim() || undefined;
    const response = await fetch(`${baseUrl}/api/v1/sms/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        to: phone,
        message,
        businessId,
        ...(senderId ? { senderId } : {}),
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(20_000),
    });

    const payload = (await response.json().catch(() => ({}))) as SmsGatewayResponse;
    if (!response.ok || payload.success === false) {
      return {
        success: false,
        phone,
        error: gatewayError(payload, response.status),
      };
    }

    return {
      success: true,
      phone,
      senderIdUsed: payload.senderIdUsed,
      creditsRemaining: payload.creditsRemaining,
    };
  } catch (error) {
    return {
      success: false,
      phone,
      error: error instanceof Error ? error.message : 'Unable to reach SMS gateway',
    };
  }
}
