/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";
import https from "https";

import { AnyPay } from "..";
import utils from "./utils";
import APIError from "./error/apiError";

import { IAnyPayOptions } from "../types/AnyPay";
import IRatesResponse from "../types/methods/rates";

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
			throw new APIError(`Invalid apiId`);
		} else if (!this.options.apiKey) {
			throw new APIError(`Invalid apiKey`);
		} else if (!this.options.secretKey) {
			throw new APIError(`Invalid secretKey`);
		}
	}

	public async getBalance(): Promise<number> {
		const response = await this.call("balance", {
			sign: utils.generateHash(
				`balance${this.options.apiId}${this.options.apiKey}`,
				"sha256",
			),
		});
		return Number(response.result.balance);
	}

	public async getRates(): Promise<IRatesResponse> {
		const response = await this.call("rates", {
			sign: utils.generateHash(
				`rates${this.options.apiId}${this.options.apiKey}`,
				"sha256",
			),
		});
		return response.result;
	}

	public async call(
		method: string,
		params?: Record<string, any>,
		headers: Record<string, any> = {
			Accept: "application/json",
			"Content-Type": "application/x-www-form-urlencoded",
		},
	): Promise<any> {
		try {
			return (
				await axios({
					url: `${this.apiUrl}/${method}/${this.options.apiId}`,
					headers,
					params,
				})
			).data;
		} catch (error) {
			throw new APIError(error.message);
		}
	}
}

export { API };
