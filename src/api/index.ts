/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";
import https from "https";

import { AnyPay } from "..";
import utils from "./utils";
import APIError from "./error/apiError";
import ModuleError from "./error/moduleError";

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
			throw new ModuleError(`Invalid apiId`);
		} else if (!this.options.apiKey) {
			throw new ModuleError(`Invalid apiKey`);
		} else if (!this.options.secretKey) {
			throw new ModuleError(`Invalid secretKey`);
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
			const response = await axios({
				url: `${this.apiUrl}/${method}/${this.options.apiId}`,
				headers,
				params,
			});

			if (response.data.result) {
				return response.data.result;
			}

			if (response.data.error) {
				throw new APIError(
					response.data.error.message,
					Number(response.data.error.code),
				);
			}
			throw new ModuleError("Unknown error");
		} catch (error) {
			throw new ModuleError(error.message);
		}
	}
}

export { API };
