import { ScaffoldingContext } from '../../types/scaffolding';

export function generateReadme(
  ctx: ScaffoldingContext,
  techSummary: string,
  folderTree: string,
  prereqs: string[],
  commands: { dev: string; build: string; test: string; install: string },
  archNotes: string
): string {
  return `# ${ctx.projectName}

${ctx.projectDescription || 'Production-ready software project built with ' + techSummary}

## Technology Stack
- **Architecture**: ${ctx.architecture.replace('-', ' ').toUpperCase()}
- **Framework & Runtime**: ${techSummary}
- **Package Manager**: \`${ctx.packageManager}\`
- **Initial Libraries**: ${ctx.selectedLibraries.length > 0 ? ctx.selectedLibraries.join(', ') : 'Standard core toolchain'}

## Folder Structure
\`\`\`text
${folderTree}
\`\`\`

## Prerequisites
${prereqs.map(p => `- ${p}`).join('\n')}

## Getting Started

### 1. Installation
\`\`\`bash
${commands.install}
\`\`\`

### 2. Environment Variables
Copy the template environment variables:
\`\`\`bash
cp .env.example .env
\`\`\`

### 3. Development Server
\`\`\`bash
${commands.dev}
\`\`\`

### 4. Automated Tests
\`\`\`bash
${commands.test}
\`\`\`

### 5. Production Build
\`\`\`bash
${commands.build}
\`\`\`

## Architecture & Conventions
${archNotes}

## Troubleshooting
- If dependencies fail to install, check your runtime version against prerequisites.
- Check \`.env\` for any missing configuration parameters.
- Run the test suite using \`${commands.test}\` to verify system health.
`;
}
