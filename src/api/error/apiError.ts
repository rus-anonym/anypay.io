class APIError extends Error {
	constructor(message: string) {
		super(message);

		this.message = message;
		this.name = "APIError";

		Error.captureStackTrace(this);
	}
}

export default APIError;
