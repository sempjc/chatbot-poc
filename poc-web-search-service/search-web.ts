import https from "https";

interface SearchWeb {
  query: (query: string) => Promise<searchResult[]>;
}

type searchResult = {
  title: string;
  url: string;
};

export class BingSearch implements SearchWeb {
  private readonly apiKey: string;
  private readonly endpoint: string;

  constructor(apiKey: string, endpoint: string) {
    this.apiKey = apiKey;
    this.endpoint = endpoint;
  }

  async query(query: string): Promise<searchResult[]> {
    const response = await this.httpsGet(query);
    const webPages = response.webPages.value.slice(0, 1);
    const webPagesResult = webPages.map((webPage: { name: any; url: any }) => {
      return {
        title: webPage.name,
        url: webPage.url,
      };
    });
    return webPagesResult;
  }

  private async httpsGet(query: string) {
    const httpOptions = {
      hostname: this.endpoint,
      path: "/v7.0/search?q=" + encodeURIComponent(query),
      headers: {
        "Ocp-Apim-Subscription-Key": this.apiKey,
      },
    };

    const data: any = await new Promise((resolve, reject) => {
      https.get(httpOptions, (response) => {
        let body = "";
        response.on("data", (d) => {
          body += d;
        });
        response.on("end", () => {
          resolve(body);
        });
        response.on("error", (e) => {
          reject(e);
        });
      });
    });

    return JSON.parse(data);
  }
}
