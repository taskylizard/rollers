import { x } from "tinyexec";
import { writeFileSync, readFileSync, unlinkSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

/**
 * Data to substitute into template variables
 * Keys represent variable names, values are the replacement content
 */
export interface TemplateData {
	[key: string]: string | number | boolean;
}

export interface Options {
	/** Typst template content with {{variable}} placeholders */
	template: string;
	/** Data to substitute into template variables */
	data: TemplateData;
	/** Additional font directories to include */
	fontPaths?: string[];
	/** Skip system fonts when rendering */
	ignoreSystemFonts?: boolean;
	/** Pixels per inch for output quality */
	dpi?: number;
	/** Where to save the generated image (temp file if not specified) */
	outputPath?: string;
	/** Path to typst binary (uses system PATH if not specified) */
	typstBinaryPath?: string;
}

export interface GenerateResult {
	/** Whether image generation completed successfully */
	success: boolean;
	/** Path to generated image (only present on success) */
	outputPath?: string;
	/** Error message (only present on failure) */
	error?: string;
}

/**
 * OpenGraph image generator using Typst templates
 * Handles template substitution, temporary files, and typst compilation to PNG
 */
export class Generator {
	/**
	 * Replace {{variable}} placeholders in template with actual values
	 * @param template - Template string containing {{variable}} patterns
	 * @param data - Values to substitute for variables
	 * @returns Template with variables replaced
	 * @throws Error if template references undefined variables
	 */
	private static substituteTemplate(
		template: string,
		data: TemplateData,
	): string {
		return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
			const value = data[key];
			if (value === undefined) {
				throw new Error(`Template variable '${key}' not found in data`);
			}
			return String(value);
		});
	}

	/**
	 * Create temporary file with given content
	 * @param content - File content to write
	 * @param extension - File extension (including dot)
	 * @returns Path to created temporary file
	 */
	private static createTempFile(content: string, extension: string): string {
		const tempPath = join(tmpdir(), `typst-temp-${Date.now()}${extension}`);
		writeFileSync(tempPath, content);
		return tempPath;
	}

	/**
	 * Build and execute typst compile command with provided options
	 * @param inputPath - Path to source .typ file
	 * @param outputPath - Where to save compiled output
	 * @param options - Generation options (fonts, DPI, etc.)
	 * @throws Error if typst command fails
	 */
	private static async buildAndExecuteTypstCommand(
		inputPath: string,
		outputPath: string,
		options: Options,
	): Promise<void> {
		const args = ["compile"];

		if (options.fontPaths?.length) {
			options.fontPaths.forEach((fontPath) => {
				args.push("--font-path", fontPath);
			});
		}

		if (options.ignoreSystemFonts) {
			args.push("--ignore-system-fonts");
		}

		if (options.dpi) {
			args.push("--ppi", String(options.dpi));
		}

		args.push(inputPath, outputPath);

		const typstCommand = options.typstBinaryPath || "typst";
		await x("bash", ["-c", `${typstCommand} ${args.join(" ")}`]);
	}

	/**
	 * Generate OpenGraph image from template and data
	 * @param options - Generation configuration
	 * @returns Result indicating success/failure and output path
	 */
	static async generate(options: Options): Promise<GenerateResult> {
		const { template, data, outputPath } = options;

		let tempTypstFile: string | null = null;

		try {
			const typstContent = this.substituteTemplate(template, data);

			tempTypstFile = this.createTempFile(typstContent, ".typ");

			const finalOutputPath =
				outputPath || join(tmpdir(), `opengraph-${Date.now()}.png`);

			await this.buildAndExecuteTypstCommand(
				tempTypstFile,
				finalOutputPath,
				options,
			);

			if (!existsSync(finalOutputPath)) {
				throw new Error("Typst failed to generate output file");
			}

			return {
				success: true,
				outputPath: finalOutputPath,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error),
			};
		} finally {
			if (tempTypstFile && existsSync(tempTypstFile)) {
				try {
					unlinkSync(tempTypstFile);
				} catch {}
			}
		}
	}

	/**
	 * Generate OpenGraph image and return as Buffer instead of saving to disk
	 * @param options - Generation configuration
	 * @returns Image content as Buffer, or null on failure
	 */
	static async generateBuffer(options: Options): Promise<Buffer | null> {
		const result = await this.generate(options);

		if (!result.success || !result.outputPath) {
			return null;
		}

		try {
			const buffer = readFileSync(result.outputPath);

			if (!options.outputPath) {
				unlinkSync(result.outputPath);
			}

			return buffer;
		} catch {
			return null;
		}
	}
}

/**
 * Generate OpenGraph image from template and data (convenience function)
 * @param options - Generation configuration
 * @returns Result indicating success/failure and output path
 */
export const generate = (options: Options): Promise<GenerateResult> => {
	return Generator.generate(options);
};

/**
 * Generate OpenGraph image and return as Buffer (convenience function)
 * @param options - Generation configuration
 * @returns Image content as Buffer, or null on failure
 */
export const generateBuffer = (options: Options): Promise<Buffer | null> => {
	return Generator.generateBuffer(options);
};
