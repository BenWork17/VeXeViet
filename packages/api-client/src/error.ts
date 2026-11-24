import { ERROR_MESSAGES, ErrorCode } from '@vexeviet/types';

export interface NormalisedApiFailure {
  code: ErrorCode | string;
  message: string;
  details: string[];
  rawDetails?: Record<string, unknown>;
  requestId?: string;
  status: number;
}

const isRecord = (val: unknown): val is Record<string, unknown> =>
  typeof val === 'object' && val !== null && !Array.isArray(val);

export function flattenErrorDetails(...sources: unknown[]): string[] {
  const lines: string[] = [];

  for (const source of sources) {
    if (source === null || source === undefined) continue;

    if (Array.isArray(source)) {
      for (const item of source) {
        if (typeof item === 'string') {
          lines.push(item);
        } else if (isRecord(item)) {
          const field = typeof item.field === 'string' ? item.field : undefined;
          const message = typeof item.message === 'string' ? item.message : undefined;
          if (field && message) lines.push(`${field}: ${message}`);
          else if (message) lines.push(message);
          else if (field) lines.push(field);
          else lines.push(JSON.stringify(item));
        } else if (item !== null && item !== undefined) {
          lines.push(String(item));
        }
      }
    } else if (typeof source === 'string') {
      lines.push(source);
    } else if (isRecord(source)) {
      for (const [key, value] of Object.entries(source)) {
        lines.push(`${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`);
      }
    }
  }

  return lines;
}

export function generateClientRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `fe-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Normalises any Backend error envelope (`{ success: false, error: { code, message, details? }, requestId }`
 * or legacy flat string `{ success: false, error: "message", code? }`) into a single predictable shape.
 */
export function normaliseApiError(
  status: number,
  body: unknown,
  headerRequestId?: string
): NormalisedApiFailure {
  const fallbackMessage = `Yêu cầu thất bại (HTTP ${status}).`;

  if (!isRecord(body) || body.success !== false) {
    return {
      code: `HTTP_${status}`,
      message: `Máy chủ trả về dữ liệu không đúng định dạng (HTTP ${status}).`,
      details: [],
      requestId: headerRequestId,
      status,
    };
  }

  const requestId =
    (typeof body.requestId === 'string' && body.requestId) || headerRequestId || undefined;
  const outerCode =
    typeof body.code === 'string' && body.code ? body.code : `HTTP_${status}`;
  const errorField = body.error;

  if (typeof errorField === 'string') {
    return {
      code: outerCode,
      message: errorField || ERROR_MESSAGES[outerCode] || fallbackMessage,
      details: flattenErrorDetails(body.details),
      requestId,
      status,
    };
  }

  if (isRecord(errorField)) {
    const code =
      typeof errorField.code === 'string' && errorField.code ? errorField.code : outerCode;
    const message =
      (typeof errorField.message === 'string' && errorField.message) ||
      ERROR_MESSAGES[code] ||
      fallbackMessage;

    return {
      code,
      message,
      details: flattenErrorDetails(errorField.details, body.details),
      rawDetails: isRecord(errorField.details) ? errorField.details : undefined,
      requestId,
      status,
    };
  }

  return {
    code: outerCode,
    message: ERROR_MESSAGES[outerCode] || fallbackMessage,
    details: flattenErrorDetails(body.details),
    requestId,
    status,
  };
}
