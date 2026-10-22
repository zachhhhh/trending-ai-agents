// Rebuilds README.md from https://agentatlas.dev/trending.json (no key, no deps).
import { writeFile } from "node:fs/promises";

const res = await fetch("https://agentatlas.dev/trending.json", { headers: { "User-Agent": "awesome-trending-ai-agents" } });
if (!res.ok) throw new Error(`feed HTTP ${res.status}`);
const feed = await res.json();

const k = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k` : String(n ?? 0));
const cell = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\s+/g, " ").trim().slice(0, 140);
const table = (rows) =>
	[
		"| # | Repo | What it is | Stars | Stars/day |",
		"|---|------|-----------|------:|----------:|",
		...rows.map((r, i) => `| ${i + 1} | [${r.repo}](${r.url}) | ${cell(r.description)} | ${k(r.stars)} | +${k(r.starsPerDay)} |`),
	].join("\n");

const updated = feed.generatedAt.slice(0, 16).replace("T", " ");
const md = `# Trending AI agent repos

The fastest-rising new GitHub repos for AI coding agents: Claude Code, Codex, agent skills (SKILL.md) and MCP servers. Updated every day from public GitHub data by [AgentAtlas](https://agentatlas.dev/trending?utm_source=github&utm_medium=awesome-list).

**Last updated:** ${updated} UTC. Ranked by stars per day since creation (repos created in the last 30 days). Star counts can be inflated: read the code before you install anything.

Live, filterable version with Hacker News discussions: **[agentatlas.dev/trending](https://agentatlas.dev/trending?utm_source=github&utm_medium=awesome-list)**

## Contents
- [Rising this month](#rising-this-month)
${feed.topics.map((t) => `- [${t.name}](#${t.name.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/ /g, "-")})`).join("\n")}
- [Established projects](#established-projects)

## Rising this month
${table(feed.rising)}

${feed.topics
	.filter((t) => t.rising.length)
	.map((t) => `## ${t.name}\n\nMore: [trending ${t.name} on AgentAtlas](${t.url}?utm_source=github&utm_medium=awesome-list)\n\n${table(t.rising.slice(0, 10))}`)
	.join("\n\n")}

## Established projects
| Repo | Stars | Gained in 7 days |
|------|------:|-----------------:|
${feed.established.map((r) => `| [${r.repo}](${r.url}) | ${k(r.stars)} | ${r.gained7d == null ? "–" : `+${r.gained7d}`} |`).join("\n")}

## Is your repo here?
Add the badge to your README:

\`\`\`md
[![Trending on AgentAtlas](https://img.shields.io/badge/trending_on-AgentAtlas-111111)](https://agentatlas.dev/trending)
\`\`\`

Data: [agentatlas.dev/trending.json](https://agentatlas.dev/trending.json), CC BY 4.0 with a link back. List generated automatically; open an issue to report a wrong entry.
`;
await writeFile(new URL("../README.md", import.meta.url), md);
console.log(`README: ${feed.rising.length} rising repos, updated ${updated}`);
