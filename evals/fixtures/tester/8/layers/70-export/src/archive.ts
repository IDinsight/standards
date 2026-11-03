export type ArchiveRequest = {
  method: 'PUT';
  headers: Record<string, string>;
  body: string;
  signal: AbortSignal;
};

export type ArchiveResponse = {
  status: number;
  json: () => Promise<unknown>;
};

export type ArchiveSend = (url: string, request: ArchiveRequest) => Promise<ArchiveResponse>;

export type ArchiveClient = {
  put: (name: string, csv: string, timeoutMs: number) => Promise<{ location: string }>;
};

// The archive answered with a status other than 201, or the request failed
// without a response (status null).
export class ArchiveError extends Error {
  status: number | null;

  constructor(message: string, status: number | null) {
    super(message);
    this.name = 'ArchiveError';
    this.status = status;
  }
}

// An upload was abandoned because it ran past its time limit.
export class ArchiveTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`archive upload took longer than ${timeoutMs} ms`);
    this.name = 'ArchiveTimeoutError';
  }
}

export function createArchiveClient(baseUrl: string, send: ArchiveSend = fetch as unknown as ArchiveSend): ArchiveClient {
  const root = baseUrl.replace(/\/+$/, '');
  return {
    async put(name, csv, timeoutMs) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(new ArchiveTimeoutError(timeoutMs)), timeoutMs);
      let response: ArchiveResponse;
      try {
        response = await send(`${root}/files/${encodeURIComponent(name)}`, {
          method: 'PUT',
          headers: { 'content-type': 'text/csv; charset=utf-8' },
          body: csv,
          signal: controller.signal,
        });
      } catch (error) {
        if (controller.signal.aborted) throw controller.signal.reason;
        throw new ArchiveError(`archive unreachable: ${(error as Error).message}`, null);
      } finally {
        clearTimeout(timer);
      }
      if (response.status !== 201) {
        throw new ArchiveError(`archive responded ${response.status}`, response.status);
      }
      const body = (await response.json()) as { location?: unknown };
      if (typeof body.location !== 'string') {
        throw new ArchiveError('archive response has no location', response.status);
      }
      return { location: body.location };
    },
  };
}
