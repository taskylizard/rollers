import { generate, generateBuffer, TemplateData } from "./src/index";

async function basicExample() {
	console.log("🎨 Running basic OpenGraph example...");

	const template = `
#rect(
  width: 100%, 
  height: 100%, 
  fill: gradient.linear(rgb("#667eea"), rgb("#764ba2"))
)[
  #align(center + horizon)[
    #text(
      "{{title}}", 
      size: 48pt, 
      weight: "bold", 
      fill: white
    )
    
    #v(20pt)
    
    #text(
      "{{subtitle}}", 
      size: 24pt, 
      fill: rgb("#f0f0f0")
    )
  ]
]`;

	const data: TemplateData = {
		title: "Hello OpenGraph!",
		subtitle: "Generated with Typst CLI",
	};

	const result = await generate({
		template: `
#set page(width: 1200pt, height: 630pt)
${template}
    `,
		data,
		outputPath: "./basic-example.png",
	});

	if (result.success) {
		console.log("✅ Basic example generated:", result.outputPath);
	} else {
		console.error("❌ Basic example failed:", result.error);
	}
}

async function blogPostExample() {
	console.log("📝 Running blog post OpenGraph example...");

	const template = `
#rect(
  width: 100%, 
  height: 100%, 
  fill: rgb("#1a1a1a"),
  stroke: 2pt + rgb("#333")
)[
  #grid(
    columns: (1fr, 300pt),
    column-gutter: 40pt,
    
    // Left column - content
    align(left + horizon)[
      #text("{{category}}", size: 16pt, fill: rgb("#10b981"), weight: "semibold")
      
      #v(10pt)
      
      #text(
        "{{title}}", 
        size: 42pt, 
        weight: "bold", 
        fill: white
      )
      
      #v(15pt)
      
      #text(
        "{{description}}", 
        size: 18pt, 
        fill: rgb("#9ca3af")
      )
      
      #v(20pt)
      
      #text("{{author}} • {{date}}", size: 14pt, fill: rgb("#6b7280"))
    ],
    
    // Right column - visual element
    align(center + horizon)[
      #rect(
        width: 200pt,
        height: 200pt,
        radius: 20pt,
        fill: gradient.radial(rgb("#10b981"), rgb("#059669"))
      )[
        #align(center + horizon)[
          #text("{{readTime}}", size: 36pt, weight: "bold", fill: white)
          #v(5pt)
          #text("min read", size: 14pt, fill: rgb("#d1fae5"))
        ]
      ]
    ]
  )
]`;

	const data: TemplateData = {
		category: "TECHNOLOGY",
		title: "Building Modern Web Applications",
		description:
			"Learn how to create fast, scalable applications using the latest web technologies and best practices.",
		author: "Jane Developer",
		date: "Jan 15, 2024",
		readTime: "8",
	};

	const result = await generate({
		template: `
#set page(width: 1200pt, height: 630pt, fill: rgb("#1a1a1a"))
${template}
    `,
		data,
		ignoreSystemFonts: true,
		outputPath: "./blog-post-example.png",
	});

	if (result.success) {
		console.log("✅ Blog post example generated:", result.outputPath);
	} else {
		console.error("❌ Blog post example failed:", result.error);
	}
}

async function bufferExample() {
	console.log("💾 Running buffer example...");

	const template = `
#rect(
  width: 100%, 
  height: 100%, 
  fill: rgb("#0f172a")
)[
  #align(center + horizon)[
    #stack(
      dir: ttb,
      spacing: 20pt,
      
      text("{{emoji}}", size: 80pt),
      text("{{message}}", size: 32pt, fill: white, weight: "bold"),
      text("Generated as Buffer", size: 16pt, fill: rgb("#64748b"))
    )
  ]
]`;

	const data: TemplateData = {
		emoji: "🚀",
		message: "Buffer Example",
	};

	const buffer = await generateBuffer({
		template: `
#set page(width: 800pt, height: 400pt)
${template}
    `,
		data,
		dpi: 150,
	});

	if (buffer) {
		console.log(
			"✅ Buffer example generated successfully, size:",
			buffer.length,
			"bytes",
		);
		// You could save the buffer or send it as a response
		// require('fs').writeFileSync('./buffer-example.png', buffer);
	} else {
		console.error("❌ Buffer example failed");
	}
}

async function customFontExample() {
	console.log("🔤 Running custom font example...");

	const template = `
#rect(
  width: 100%, 
  height: 100%, 
  fill: rgb("#fbbf24")
)[
  #align(center + horizon)[
    #text(
      "{{title}}", 
      size: 52pt, 
      weight: "bold", 
      fill: rgb("#1f2937")
    )
    
    #v(15pt)
    
    #text(
      "{{subtitle}}", 
      size: 20pt, 
      fill: rgb("#374151")
    )
  ]
]`;

	const data: TemplateData = {
		title: "Custom Fonts",
		subtitle: "Using font-path option",
	};

	const result = await generate({
		template: `
#set page(width: 1200pt, height: 630pt)
${template}
    `,
		data,
		fontPaths: ["/usr/share/fonts", "./fonts"], // Example font paths
		ignoreSystemFonts: false,
		outputPath: "./custom-font-example.png",
	});

	if (result.success) {
		console.log("✅ Custom font example generated:", result.outputPath);
	} else {
		console.error("❌ Custom font example failed:", result.error);
		console.log("i  Note: This example requires custom fonts to be available");
	}
}

async function runAllExamples() {
	console.log("🎯 Running OpenGraph Generator Examples\n");

	try {
		await basicExample();
		console.log();

		await blogPostExample();
		console.log();

		await bufferExample();
		console.log();

		await customFontExample();
		console.log();

		console.log("🎉 All examples completed!");
		console.log("\nGenerated files:");
		console.log("- basic-example.png");
		console.log("- blog-post-example.png");
		console.log("- custom-font-example.png");
	} catch (error) {
		console.error("💥 Error running examples:", error);
		console.log("\n📋 Prerequisites:");
		console.log(
			"- Typst CLI must be installed (https://typst.app/docs/installation/)",
		);
		console.log("- Run: typst --version to verify installation");
	}
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	runAllExamples();
}
