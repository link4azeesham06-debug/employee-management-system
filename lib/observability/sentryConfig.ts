import type { ErrorEvent } from "@sentry/nextjs";

import {
  sanitizeErrorMetadata,
  sanitizeErrorText,
} from "@/lib/errors/reportError";

function stripQuery(url: string | undefined): string | undefined {
  return url?.split("?", 1)[0];
}

function beforeSend(event: ErrorEvent): ErrorEvent {
  event.user = undefined;
  event.message = event.message ? sanitizeErrorText(event.message) : undefined;

  event.exception?.values?.forEach((exception) => {
    if (exception.value) exception.value = sanitizeErrorText(exception.value);
  });

  if (event.request) {
    event.request.url = stripQuery(event.request.url);
    event.request.cookies = undefined;
    event.request.data = undefined;
    event.request.headers = undefined;
    event.request.query_string = undefined;
  }

  event.breadcrumbs = event.breadcrumbs?.map((breadcrumb) => ({
    ...breadcrumb,
    message: breadcrumb.message
      ? sanitizeErrorText(breadcrumb.message).split("?", 1)[0]
      : undefined,
    data: breadcrumb.data
      ? sanitizeErrorMetadata(breadcrumb.data)
      : undefined,
  }));

  return event;
}

export function createSentryOptions(dsn: string | undefined) {
  return {
    dsn,
    enabled: Boolean(dsn),
    sendDefaultPii: false,
    tracesSampleRate: 0,
    beforeSend,
  };
}
