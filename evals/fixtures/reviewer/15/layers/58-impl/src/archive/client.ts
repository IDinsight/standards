// Uploads export files to the document archive over HTTP.

export class ArchiveError extends Error {
  // HTTP status of the archive's response, or undefined when no response arrived.
  status: number | undefined;

  constructor(message: string, status?: number, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'ArchiveError';
    this.status = status;
  }
}

export type ArchiveClient = {
  put(name: string, body: string): Promise<void>;
};

export type HttpArchiveOptions = {
  baseUrl: string;
  token: string;
  fetch?: typeof fetch;
};

export function createHttpArchiveClient(options: HttpArchiveOptions): ArchiveClient {
  const send = options.fetch ?? fetch;
  const base = options.baseUrl.replace(/\/+$/, '');
  return {
    async put(name, body) {
      let response: Response;
      try {
        response = await send(`${base}/exports/${encodeURIComponent(name)}`, {
          method: 'PUT',
          headers: {
            authorization: `Bearer ${options.token}`,
            'content-type': 'text/csv; charset=utf-8',
          },
          body,
        });
      } catch (error) {
        throw new ArchiveError(`archive unreachable: ${(error as Error).message}`, undefined, { cause: error });
      }
      if (!response.ok) {
        throw new ArchiveError(`archive responded ${response.status}`, response.status);
      }
    },
  };
}
