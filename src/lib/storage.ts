const SESSION_URI_KEY = "dborbit.session.connection-uri";

export function getSessionConnectionUris() {
  if (typeof window === "undefined") {
    return {} as Record<string, string>;
  }

  try {
    return JSON.parse(sessionStorage.getItem(SESSION_URI_KEY) ?? "{}") as Record<
      string,
      string
    >;
  } catch {
    return {};
  }
}

export function setSessionConnectionUri(connectionId: string, uri: string) {
  if (typeof window === "undefined") {
    return;
  }

  const current = getSessionConnectionUris();
  current[connectionId] = uri;
  sessionStorage.setItem(SESSION_URI_KEY, JSON.stringify(current));
}

export function removeSessionConnectionUri(connectionId: string) {
  if (typeof window === "undefined") {
    return;
  }

  const current = getSessionConnectionUris();
  delete current[connectionId];
  sessionStorage.setItem(SESSION_URI_KEY, JSON.stringify(current));
}

export function getSessionConnectionUri(connectionId: string) {
  return getSessionConnectionUris()[connectionId];
}
