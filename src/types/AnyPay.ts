import https from "https";
export interface IAnyPayOptions {
	apiId: string;
	secretKey: string;
	apiKey: string;
	projectId?: number;
	apiUrl?: string;
	merchantUrl?: string;
	httpsAgent?: https.Agent;
}
