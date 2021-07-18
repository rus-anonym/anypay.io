/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";
import https from "https";
import querystring from "querystring";

import { AnyPay } from "..";
import utils from "./utils";
import APIError from "./error/apiError";
import ModuleError from "./error/moduleError";

import { IAnyPayOptions } from "../types/AnyPay";
import ICreatePaymentLinkParams from "../types/methods/createPaymentLink";
import IRatesResponse from "../types/methods/rates";
import INotifyIPResponse from "../types/methods/notifyIP";
import {
	ICommissionsParams,
	ICommissionsResponse,
} from "../types/methods/commissions";
import {
	IPaymentsParams,
	IPaymentsResponse,
} from "./../types/methods/payments";
import {
	ICreatePayoutParams,
	ICreatePayoutResponse,
} from "./../types/methods/createPayout";

class API {
	private anypay: AnyPay;
	public apiUrl: string;
	public agent: https.Agent;
	public options: IAnyPayOptions;

	constructor(anypay: AnyPay) {
		this.anypay = anypay;
		this.agent = this.anypay.agent;
		this.apiUrl = this.anypay.apiUrl;
		this.options = this.anypay.options;

		if (!this.options.apiId) {
			throw new ModuleError(`Invalid apiId`);
		} else if (!this.options.apiKey) {
			throw new ModuleError(`Invalid apiKey`);
		} else if (!this.options.secretKey) {
			throw new ModuleError(`Invalid secretKey`);
		}
	}

	public async getBalance(): Promise<number> {
		const response = await this.call({
			method: "balance",
			params: {
				sign: utils.generateHash(
					`balance${this.options.apiId}${this.options.apiKey}`,
					"sha256",
				),
			},
		});
		return Number(response.result.balance);
	}

	public async getRates(): Promise<IRatesResponse> {
		const response = await this.call({
			method: "rates",
			params: {
				sign: utils.generateHash(
					`rates${this.options.apiId}${this.options.apiKey}`,
					"sha256",
				),
			},
		});
		return response.result;
	}

	public async getCommissions(
		params: ICommissionsParams,
	): Promise<ICommissionsResponse> {
		const response = await this.call({
			method: "commissions",
			params: {
				...params,
				sign: utils.generateHash(
					`commissions${this.options.apiId}${params.project_id}${this.options.apiKey}`,
					"sha256",
				),
			},
		});
		return response.result;
	}

	public async getPayments(
		params: IPaymentsParams,
	): Promise<IPaymentsResponse> {
		const response = await this.call({
			method: "payments",
			params: {
				...params,
				sign: utils.generateHash(
					`payments${this.options.apiId}${params.project_id}${this.options.apiKey}`,
					"sha256",
				),
			},
		});
		return response.result;
	}

	public async getServiceIP(): Promise<INotifyIPResponse> {
		const response = await this.call({
			method: "ip-notification",
			params: {
				sign: utils.generateHash(
					`ip-notification${this.options.apiId}${this.options.apiKey}`,
					"sha256",
				),
			},
		});
		return response.result;
	}

	public async createPayout(
		params: ICreatePayoutParams,
	): Promise<ICreatePayoutResponse> {
		const response = await this.call({
			method: "create-payout",
			params: {
				...params,
				sign: utils.generateHash(
					`create-payout${this.options.apiId}${params.payout_id}${params.payout_type}${params.amount}${params.wallet}${this.options.apiKey}`,
					"sha256",
				),
			},
		});
		return response.result;
	}

	public createPaymentLink(params: ICreatePaymentLinkParams): string {
		const url = `https://anypay.io/merchant?`;
		const queryString = querystring.stringify({
			...params,
			sign: utils.generateHash(
				`${params.currency}:${params.amount}:${this.options.secretKey}:${params.merchant_id}:${params.pay_id}`,
				"md5",
			),
		});
		return url + queryString;
	}

	public async call({
		method,
		params,
		headers = {
			Accept: "application/json",
			"Content-Type": "application/x-www-form-urlencoded",
		},
	}: {
		method?: string;
		params?: Record<string, any>;
		headers?: Record<string, any>;
	}): Promise<any> {
		const url = `${this.apiUrl}/${method}/${this.options.apiId}`;
		const response = await axios({
			url,
			headers,
			params,
		}).catch((error) => {
			throw new ModuleError(error.message);
		});

		if (response.data.result) {
			return response.data;
		}

		if (response.data.error) {
			throw new APIError(
				response.data.error.message,
				Number(response.data.error.code),
			);
		}
		throw new ModuleError("Unknown error");
	}
}

export { API };
