import { logApplicationError } from '@/lib/activityLog';

export async function register() {}

export async function onRequestError(
  error: unknown,
  request: { path: string; method: string; headers?: Record<string, string> },
  context: { routeType: string; routePath: string; renderSource?: string },
) {
  const exception = error instanceof Error ? error : new Error(String(error));
  await logApplicationError({
    level: 'ERROR',
    message: exception.message || 'Unhandled server error',
    route: request.path || context.routePath,
    method: request.method,
    statusCode: 500,
    stack: exception.stack,
    metadata: {
      routeType: context.routeType,
      renderSource: context.renderSource || null,
    },
  });
}
