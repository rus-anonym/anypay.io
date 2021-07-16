import https from "https";

import { API } from "./api/methods.js";

import { IAnyPayOptions } from "./types/AnyPay";

const defaultOptions = {
	apiUrl: "https://anypay.io/api",
	agent: new https.Agent({
		keepAlive: true,
		keepAliveMsecs: 1000,
	}),
};

class AnyPay {
	public options: IAnyPayOptions;
	public apiUrl: string;
	public agent: https.Agent | null;
	public api: API;

	constructor(params: IAnyPayOptions) {
		this.options = { ...params };
		this.apiUrl = defaultOptions.apiUrl;
		this.agent = defaultOptions.agent;

		if (this.apiUrl.startsWith("http://")) {
			this.agent = null;
		}

		this.api = new API(this);
	}
	/**
	 *
	 * @param {Transfer data} options
	 */
	public setOptions(options: IAnyPayOptions): AnyPay {
		Object.assign(this.options, options);
		return this;
	}
}

export { AnyPay };
