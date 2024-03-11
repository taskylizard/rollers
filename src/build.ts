import { existsSync } from "fs";
import { globby } from "globby";
import type { OutputOptions, InputOptions } from "@rolldown/node";
import { rolldown } from "@rolldown/node";
import { logger, cleanDist } from "./utils";

class DetailedError extends Error {
	constructor(message: string | undefined) {
		super(message);

		this.name = this.constructor.name;

		if (typeof Error.captureStackTrace === "function") {
			Error.captureStackTrace(this, this.constructor);
		} else {
			this.stack = new Error(message).stack;
		}
	}
}
type Format = NonNullable<OutputOptions["format"]>;

interface Options {
	entry?: InputOptions["input"];
	format?: Format | Format[];
	plugins?: InputOptions["plugins"];
	external?: InputOptions["external"];
	outDir?: string;
	clean?: boolean | string[];
}

async function normalizeOptions(options: Options) {
	let {
		entry,
		format = ["esm"],
		plugins = [],
		external = [],
		clean = false,
	} = options;

	if (!entry || Object.keys(entry).length === 0) {
		throw new DetailedError(`No input files, try "rollers <file>"`);
	}

	if (typeof entry === "string") {
		entry = [entry];
	}

	if (Array.isArray(entry)) {
		const resolvedEntry = await globby(entry);

		if (resolvedEntry.length > 0) {
			entry = resolvedEntry;

			logger.info(`Building entry: ${entry}`);
		} else {
			throw new DetailedError(`Cannot find ${entry}`);
		}
	} else {
		Object.keys(entry).forEach((alias) => {
			const filename = entry[alias];

			if (!existsSync(filename)) {
				throw new DetailedError(`Cannot find ${alias}: ${filename}`);
			}
		});

		logger.info(`Building entry: ${JSON.stringify(entry)}`);
	}

	if (!Array.isArray(format)) format = [format];
	if (format.length === 0) format = ["esm"];
	if (clean && !Array.isArray(clean)) clean = [];

	return {
		entry,
		plugins,
		external,
		format,
		outDir: options.outDir || "dist",
		clean: clean ?? false,
	};
}

async function build(userOptions = {}) {
	const { entry, external, plugins, outDir, format, clean } =
		await normalizeOptions(userOptions);

	if (clean) {
		await cleanDist(["**/*", ...clean], outDir);
		logger.info("Cleaning output folder...");
	}

	const builder = await rolldown({
		input: entry,
		external,
		plugins,
	});

	await Promise.all(
		format.map((f: any) =>
			builder.write({
				format: f,
				dir: outDir,
			}),
		),
	);

	logger.success("Build complete!");
}

export { build };
