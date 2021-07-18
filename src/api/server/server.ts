import { IServerOptions, THttpMethod } from "./../../types/server";
import express from "express";
import ip from "ip";

import ModuleError from "../error/moduleError";

const app = express();

app.use(express.urlencoded({ extended: true })); // for encoded bodies
app.use(express.json()); // for json encoded bodies

function createServer(params: IServerOptions): void {
	const start = Date.now();

	let methods: THttpMethod[];

	if (params.method === undefined) {
		methods = ["POST"];
	} else if (
		!Array.isArray(params.method) &&
		typeof params.method === "string"
	) {
		methods = [params.method];
	} else {
		methods = params.method;
	}

	const logging = params.logging !== undefined ? params.logging : true;

	let url: string;

	if (params.url == `/${params.url}`) {
		url = params.url;
	} else if (params.url == `${params.url}`) {
		url = "/" + params.url;
	}

	const urlencodedParser = express.urlencoded({ extended: false });
	if (methods.length === 0) {
		throw new ModuleError(
			`Specify at least one method for the handler in the array.`,
		);
	}

	methods.map(function (method) {
		if (method === "GET") {
			app.get(url, urlencodedParser, (req, res) => {
				params.handler(req, res);
				return;
			});
		}
		if (method === "POST") {
			app.post(url, urlencodedParser, (req, res) => {
				params.handler(req, res);
				return;
			});
		}
	});

	const end = Date.now() - start;
	app.listen(params.port, () => {
		if (logging) {
			console.log(
				`STARTED SESSION:\nURL: http://${ip.address()}:${
					params.port
				}${url}\nMETHOD: ${methods.join()}\nPING: ${end}ms`,
			);
		}
	});
	app.on("error", (err) => {
		throw new ModuleError(`Error:\n${err}`);
	});
}

export default createServer;
