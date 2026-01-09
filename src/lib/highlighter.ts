import { createHighlighter, type Highlighter } from "shiki";

let highlighter: Highlighter | null = null

export async function getHighlighter(): Promise<Highlighter> {
    if(!highlighter) {
        highlighter = await createHighlighter({
            themes: ["github-dark", "github-light"],
            langs: [
                "plaintext",
                "javascript",
                "typescript",
                "python",
                "java",
                "c",
                "cpp",
                "csharp",
                "go",
                "rust",
                "ruby",
                "php",
                "swift",
                "kotlin",
                "html",
                "css",
                "scss",
                "json",
                "yaml",
                "xml",
                "markdown",
                "sql",
                "bash",
                "powershell",
                "dockerfile",
            ],
        })
    }
    return highlighter
}

export async function highlightCode(
    code: string,
    language: string,
    theme: "dark" | "light" = "dark"
): Promise<string> {
    const hl = await getHighlighter()

    // Ensure Language is supported, fallback to plaintext
    const supportedLangs = hl.getLoadedLanguages()
    const lang = supportedLangs.includes(language as any) ? language: "plaintext"

    return hl.codeToHtml(code, {
        lang,
        theme: theme === "dark" ? "github-dark": "github-light",
    })
}

// Language options for the dropdown
export const SUPPORTED_LANGUAGES = [
    { value: "plaintext", label: "Plain Text" },
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "c", label: "C" },
    { value: "cpp", label: "C++" },
    { value: "csharp", label: "C#" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "ruby", label: "Ruby" },
    { value: "php", label: "PHP" },
    { value: "swift", label: "Swift" },
    { value: "kotlin", label: "Kotlin" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "scss", label: "SCSS" },
    { value: "json", label: "JSON" },
    { value: "yaml", label: "YAML" },
    { value: "xml", label: "XML" },
    { value: "markdown", label: "Markdown" },
    { value: "sql", label: "SQL" },
    { value: "bash", label: "Bash" },
    { value: "shell", label: "Shell" },
    { value: "powershell", label: "PowerShell" },
    { value: "dockerfile", label: "Dockerfile" },
] as const;