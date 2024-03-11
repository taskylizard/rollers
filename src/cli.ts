import { runMain, defineCommand } from "citty";

const cli = defineCommand({
	meta: {
		name: "rollers",
	},
	args: {
		files: { required: true, type: "positional" },
		clean: { default: true, type: "boolean" },
		outdir: {
			default: "dist",
			type: "string",
		},
	},
	async run({ args }) {
		const { build } = await import("./build.ts");
		await build({
			entry: args.files,
			...args,
		});
	},
});

runMain(cli);
