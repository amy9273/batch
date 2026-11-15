import { AirtableRecord } from '@/types/airtable';

export interface IAirtableClient {
  fetchAll<T>(table: string, params?: Record<string, string>): Promise<AirtableRecord<T>[]>;
  fetchById<T>(table: string, recordId: string): Promise<AirtableRecord<T>>;
  patch<T>(table: string, recordId: string, fields: Partial<T>): Promise<AirtableRecord<T>>;
}

export class AirtableClient implements IAirtableClient {
  private readonly baseUrl: string = 'https://api.airtable.com/v0';

  private getCredentials(): { apiKey: string; baseId: string } {
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;

    if (!apiKey || !baseId) {
      throw new Error('Airtable credentials (AIRTABLE_API_KEY, AIRTABLE_BASE_ID) missing.');
    }

    return { apiKey, baseId };
  }

  private getHeaders(apiKey: string): HeadersInit {
    return {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  public async fetchAll<T>(
    table: string,
    params: Record<string, string> = {}
  ): Promise<AirtableRecord<T>[]> {
    const { apiKey, baseId } = this.getCredentials();
    let offset: string | undefined = undefined;
    const allRecords: AirtableRecord<T>[] = [];

    do {
      const query = new URLSearchParams({
        pageSize: '100',
        ...params,
      });
      if (offset) {
        query.set('offset', offset);
      }

      const url = `${this.baseUrl}/${baseId}/${encodeURIComponent(table)}?${query.toString()}`;
      const res = await fetch(url, {
        headers: this.getHeaders(apiKey),
        cache: 'no-store',
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Airtable fetchAll error for table "${table}": [${res.status}] ${errText}`);
      }

      const data = await res.json();
      allRecords.push(...data.records);
      offset = data.offset;
    } while (offset);

    return allRecords;
  }

  public async fetchById<T>(table: string, recordId: string): Promise<AirtableRecord<T>> {
    const { apiKey, baseId } = this.getCredentials();
    const url = `${this.baseUrl}/${baseId}/${encodeURIComponent(table)}/${recordId}`;
    const res = await fetch(url, {
      headers: this.getHeaders(apiKey),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Airtable fetchById error for ${table}/${recordId}: [${res.status}] ${errText}`);
    }

    return res.json();
  }

  public async patch<T>(
    table: string,
    recordId: string,
    fields: Partial<T>
  ): Promise<AirtableRecord<T>> {
    const { apiKey, baseId } = this.getCredentials();
    const url = `${this.baseUrl}/${baseId}/${encodeURIComponent(table)}/${recordId}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(apiKey),
      body: JSON.stringify({ fields }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Airtable patch error for ${table}/${recordId}: [${res.status}] ${errText}`);
    }

    return res.json();
  }
}
