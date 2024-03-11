import { existsSync } from "node:fs";
import { unlink } from "node:fs/promises";
import { globby } from "globby";
import { consola } from "consola";
import { colors } from "consola/utils";

export async function cleanDist(patterns: readonly string[], dir: string) {
	const files = await globby(patterns, {
		cwd: dir,
		absolute: true,
	});

	await Promise.all(files.map((file) => existsSync(file) && unlink(file)));
}

export const logger = consola.create({
	formatOptions: {
		date: false,
	},
	defaults: {
		tag: colors.red("rollers"),
	},
});
