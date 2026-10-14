import { TemplateDefinition, ScaffoldingContext, PlannedFileItem } from '../../types/scaffolding';
import { generateReadme } from './shared';

// 1. Express
export const backendExpress: TemplateDefinition = {
  id: 'backend-express',
  name: 'Node.js + Express',
  category: 'backend',
  description: 'Robust Express REST API with TypeScript, Zod schema validation, CORS, error middleware, and Vitest assertions.',
  icon: '🟢',
  badge: 'Popular',
  languages: ['TypeScript', 'JavaScript'],
  frameworks: ['Express', 'Node.js', 'Zod'],
  defaultPackageManager: 'npm',
  supportedPackageManagers: ['npm', 'pnpm', 'yarn', 'bun'],
  defaultArchitecture: 'modular',
  supportedArchitectures: ['modular', 'clean', 'simple'],
  defaultPorts: { dev: 4000 },
  commands: { dev: 'npm run dev', build: 'npm run build', test: 'npm test' },
  envVariables: [
    { key: 'PORT', description: 'Port', defaultValue: '4000' },
  ],
  compatibleLibraries: [
    { id: 'cors', name: 'CORS', category: 'routing', description: 'Cross-origin middleware', defaultSelected: true, packageNames: ['cors'] },
    { id: 'zod', name: 'Zod', category: 'validation', description: 'Schema validator', defaultSelected: true, packageNames: ['zod'] },
  ],
  generateManifest: (ctx: ScaffoldingContext): PlannedFileItem[] => [
    {
      id: 'pkg',
      path: 'package.json',
      description: 'Dependencies',
      category: 'config',
      content: JSON.stringify({
        name: ctx.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        version: '1.0.0',
        type: 'module',
        scripts: { dev: 'tsx watch src/server.ts', build: 'tsc', test: 'vitest run' },
        dependencies: { express: '^4.21.2', cors: '^2.8.5', zod: '^3.24.1' },
        devDependencies: { '@types/express': '^4.17.21', tsx: '^4.19.2', typescript: '^5.7.0', vitest: '^3.0.0' },
      }, null, 2),
    },
    {
      id: 'server-ts',
      path: 'src/server.ts',
      description: 'Express server entry',
      category: 'source',
      content: `import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: '${ctx.projectName}' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(\`[Express] Running on port \${PORT}\`));
}

export default app;
`,
    },
    {
      id: 'readme',
      path: 'README.md',
      description: 'Documentation',
      category: 'doc',
      content: generateReadme(
        ctx,
        'Node.js Express + TypeScript',
        `${ctx.projectName}/src/server.ts`,
        ['Node.js 18+'],
        { install: `${ctx.packageManager} install`, dev: `${ctx.packageManager} run dev`, test: `${ctx.packageManager} test`, build: `${ctx.packageManager} run build` },
        'Standard Express REST structure.'
      ),
    },
  ],
};

// 2. Fastify
export const backendFastify: TemplateDefinition = {
  id: 'backend-fastify',
  name: 'Fastify',
  category: 'backend',
  description: 'Extremely fast Node.js web framework with TypeScript, low overhead, and JSON Schema validation.',
  icon: '⚡',
  languages: ['TypeScript'],
  frameworks: ['Fastify', 'TypeBox'],
  defaultPackageManager: 'npm',
  supportedPackageManagers: ['npm', 'pnpm', 'yarn', 'bun'],
  defaultArchitecture: 'modular',
  supportedArchitectures: ['modular', 'simple'],
  defaultPorts: { dev: 4000 },
  commands: { dev: 'npm run dev', build: 'npm run build', test: 'npm test' },
  envVariables: [],
  compatibleLibraries: [],
  generateManifest: (ctx: ScaffoldingContext): PlannedFileItem[] => [
    {
      id: 'pkg',
      path: 'package.json',
      description: 'Fastify manifest',
      category: 'config',
      content: JSON.stringify({
        name: ctx.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        type: 'module',
        scripts: { dev: 'tsx watch src/index.ts', build: 'tsc', test: 'vitest run' },
        dependencies: { fastify: '^5.2.0' },
        devDependencies: { tsx: '^4.19.2', typescript: '^5.7.0', vitest: '^3.0.0' },
      }, null, 2),
    },
    {
      id: 'fastify-index',
      path: 'src/index.ts',
      description: 'Fastify entry point',
      category: 'source',
      content: `import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

fastify.get('/health', async () => {
  return { status: 'healthy', framework: 'Fastify', service: '${ctx.projectName}' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 4000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
`,
    },
  ],
};

// 3. NestJS
export const backendNestjs: TemplateDefinition = {
  id: 'backend-nestjs',
  name: 'NestJS',
  category: 'backend',
  description: 'Progressive Node.js framework for building efficient, scalable, enterprise-grade applications.',
  icon: '🐱',
  languages: ['TypeScript'],
  frameworks: ['NestJS', 'Express', 'RxJS'],
  defaultPackageManager: 'npm',
  supportedPackageManagers: ['npm', 'pnpm', 'yarn'],
  defaultArchitecture: 'clean',
  supportedArchitectures: ['clean', 'modular'],
  defaultPorts: { dev: 3000 },
  commands: { dev: 'npm run start:dev', build: 'npm run build', test: 'npm test' },
  envVariables: [],
  compatibleLibraries: [],
  generateManifest: (ctx: ScaffoldingContext): PlannedFileItem[] => [
    {
      id: 'pkg',
      path: 'package.json',
      description: 'NestJS manifest',
      category: 'config',
      content: JSON.stringify({
        name: ctx.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        scripts: { 'start:dev': 'nest start --watch', build: 'nest build', test: 'jest' },
        dependencies: { '@nestjs/common': '^10.0.0', '@nestjs/core': '^10.0.0', rxjs: '^7.8.0' },
      }, null, 2),
    },
    {
      id: 'main-ts',
      path: 'src/main.ts',
      description: 'Nest bootstrap',
      category: 'source',
      content: `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
`,
    },
    {
      id: 'app-module',
      path: 'src/app.module.ts',
      description: 'Nest root module',
      category: 'source',
      content: `import { Module } from '@nestjs/common';

@Module({})
export class AppModule {}
`,
    },
  ],
};

// 4. Python FastAPI
export const backendFastAPI: TemplateDefinition = {
  id: 'backend-fastapi',
  name: 'Python + FastAPI',
  category: 'backend',
  description: 'High-performance Python 3.12 API with FastAPI, Pydantic v2 validation, OpenAPI docs, and Pytest.',
  icon: '🐍',
  badge: 'Fast',
  languages: ['Python'],
  frameworks: ['FastAPI', 'Pydantic v2', 'Uvicorn'],
  defaultPackageManager: 'pip',
  supportedPackageManagers: ['pip', 'poetry'],
  defaultArchitecture: 'modular',
  supportedArchitectures: ['modular', 'clean', 'simple'],
  defaultPorts: { dev: 8000 },
  commands: { dev: 'uvicorn app.main:app --reload --port 8000', build: 'python -m compileall app', test: 'pytest' },
  envVariables: [{ key: 'PORT', description: 'Port', defaultValue: '8000' }],
  compatibleLibraries: [{ id: 'pydantic', name: 'Pydantic', category: 'validation', description: 'Data validation', defaultSelected: true, packageNames: ['pydantic'] }],
  generateManifest: (ctx: ScaffoldingContext): PlannedFileItem[] => [
    {
      id: 'requirements',
      path: 'requirements.txt',
      description: 'Python packages',
      category: 'config',
      content: `fastapi>=0.115.0\nuvicorn>=0.32.0\npydantic>=2.10.0\npytest>=8.3.0\n`,
    },
    {
      id: 'pyproject',
      path: 'pyproject.toml',
      description: 'Python project metadata and pytest settings',
      category: 'config',
      content: `[project]\nname = "${ctx.projectName.toLowerCase()}"\nversion = "0.1.0"\n`,
    },
    {
      id: 'main-py',
      path: 'app/main.py',
      description: 'FastAPI app',
      category: 'source',
      content: `from fastapi import FastAPI
from app.api.routes import router

app = FastAPI(title="${ctx.projectName}")
app.include_router(router, prefix="/api/v1")

@app.get("/health")
def health():
    return {"status": "healthy", "service": "${ctx.projectName}"}
`,
    },
    {
      id: 'routes-py',
      path: 'app/api/routes.py',
      description: 'FastAPI routes controller',
      category: 'source',
      content: `from fastapi import APIRouter

router = APIRouter()

@router.get("/tasks")
def get_tasks():
    return [{"id": "1", "title": "First Task"}]
`,
    },
    {
      id: 'tests-main-py',
      path: 'tests/test_main.py',
      description: 'FastAPI pytest tests',
      category: 'test',
      content: `from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
`,
    },
  ],
};

// 5. Django
export const backendDjango: TemplateDefinition = {
  id: 'backend-django',
  name: 'Django',
  category: 'backend',
  description: 'High-level Python web framework encouraging rapid development and clean, pragmatic design.',
  icon: '🎯',
  languages: ['Python'],
  frameworks: ['Django 5+', 'Django REST Framework'],
  defaultPackageManager: 'pip',
  supportedPackageManagers: ['pip', 'poetry'],
  defaultArchitecture: 'modular',
  supportedArchitectures: ['modular', 'clean'],
  defaultPorts: { dev: 8000 },
  commands: { dev: 'python manage.py runserver', build: 'python manage.py check', test: 'python manage.py test' },
  envVariables: [],
  compatibleLibraries: [],
  generateManifest: (ctx: ScaffoldingContext): PlannedFileItem[] => [
    {
      id: 'requirements',
      path: 'requirements.txt',
      description: 'Django dependencies',
      category: 'config',
      content: `django>=5.1.0\ndjangorestframework>=3.15.0\n`,
    },
    {
      id: 'manage-py',
      path: 'manage.py',
      description: 'Django CLI',
      category: 'source',
      content: `#!/usr/bin/env python\nimport os\nimport sys\n\ndef main():\n    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')\n    from django.core.management import execute_from_command_line\n    execute_from_command_line(sys.argv)\n\nif __name__ == '__main__':\n    main()\n`,
    },
  ],
};

// 6. Flask
export const backendFlask: TemplateDefinition = {
  id: 'backend-flask',
  name: 'Flask',
  category: 'backend',
  description: 'Lightweight WSGI Python microframework with Blueprints and flexible extension architecture.',
  icon: '🧪',
  languages: ['Python'],
  frameworks: ['Flask 3+', 'SQLAlchemy'],
  defaultPackageManager: 'pip',
  supportedPackageManagers: ['pip', 'poetry'],
  defaultArchitecture: 'simple',
  supportedArchitectures: ['simple', 'modular'],
  defaultPorts: { dev: 5000 },
  commands: { dev: 'flask run', build: 'python -m compileall .', test: 'pytest' },
  envVariables: [],
  compatibleLibraries: [],
  generateManifest: (ctx: ScaffoldingContext): PlannedFileItem[] => [
    {
      id: 'requirements',
      path: 'requirements.txt',
      description: 'Flask requirements',
      category: 'config',
      content: `flask>=3.1.0\npytest>=8.0.0\n`,
    },
    {
      id: 'app-py',
      path: 'app.py',
      description: 'Flask application instance',
      category: 'source',
      content: `from flask import Flask, jsonify\n\napp = Flask(__name__)\n\n@app.route('/health')\ndef health():\n    return jsonify(status='healthy', service='${ctx.projectName}')\n\nif __name__ == '__main__':\n    app.run(port=5000)\n`,
    },
  ],
};

// 7. Go (Gin / Standard Net/HTTP)
export const backendGo: TemplateDefinition = {
  id: 'backend-go',
  name: 'Go',
  category: 'backend',
  description: 'High-concurrency compiled backend with Go 1.22+, Gin HTTP router, and idiomatic cmd/internal structure.',
  icon: '🐹',
  badge: 'High Perf',
  languages: ['Go'],
  frameworks: ['Go 1.22+', 'Gin'],
  defaultPackageManager: 'go',
  supportedPackageManagers: ['go'],
  defaultArchitecture: 'modular',
  supportedArchitectures: ['modular', 'clean'],
  defaultPorts: { dev: 8080 },
  commands: { dev: 'go run cmd/api/main.go', build: 'go build -o bin/server cmd/api/main.go', test: 'go test ./...' },
  envVariables: [],
  compatibleLibraries: [],
  generateManifest: (ctx: ScaffoldingContext): PlannedFileItem[] => [
    {
      id: 'go-mod',
      path: 'go.mod',
      description: 'Go module definition',
      category: 'config',
      content: `module ${ctx.projectName.toLowerCase().replace(/[^a-z0-9_]/g, '_')}\n\ngo 1.22\n\nrequire github.com/gin-gonic/gin v1.10.0\n`,
    },
    {
      id: 'main-go',
      path: 'cmd/api/main.go',
      description: 'Go application entry point',
      category: 'source',
      content: `package main

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "${ctx.projectName}",
		})
	})
	r.Run(":8080")
}
`,
    },
    {
      id: 'main-test',
      path: 'cmd/api/main_test.go',
      description: 'Go unit assertions',
      category: 'test',
      content: `package main

import "testing"

func TestHealthCheck(t *testing.T) {
	appName := "${ctx.projectName}"
	if appName == "" {
		t.Errorf("App name should not be empty")
	}
}
`,
    },
  ],
};

// 8. Rust (Axum / Tokio)
export const backendRust: TemplateDefinition = {
  id: 'backend-rust',
  name: 'Rust',
  category: 'backend',
  description: 'Memory-safe, blazingly fast asynchronous web service built with Rust 2021, Axum, and Tokio.',
  icon: '🦀',
  badge: 'Zero Overhead',
  languages: ['Rust'],
  frameworks: ['Axum', 'Tokio', 'Serde'],
  defaultPackageManager: 'cargo',
  supportedPackageManagers: ['cargo'],
  defaultArchitecture: 'modular',
  supportedArchitectures: ['modular', 'clean'],
  defaultPorts: { dev: 3000 },
  commands: { dev: 'cargo run', build: 'cargo build --release', test: 'cargo test' },
  envVariables: [],
  compatibleLibraries: [],
  generateManifest: (ctx: ScaffoldingContext): PlannedFileItem[] => [
    {
      id: 'cargo-toml',
      path: 'Cargo.toml',
      description: 'Cargo package manifest',
      category: 'config',
      content: `[package]
name = "${ctx.projectName.toLowerCase().replace(/[^a-z0-9_]/g, '_')}"
version = "0.1.0"
edition = "2021"

[dependencies]
axum = "0.7"
tokio = { version = "1.0", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
`,
    },
    {
      id: 'main-rs',
      path: 'src/main.rs',
      description: 'Axum async server entry point',
      category: 'source',
      content: `use axum::{routing::get, Json, Router};
use serde_json::{json, Value};

#[tokio::main]
async fn main() {
    let app = Router::new().route("/health", get(health_handler));
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    println!("[Rust Axum] Listening on http://0.0.0.0:3000");
    axum::serve(listener, app).await.unwrap();
}

async fn health_handler() -> Json<Value> {
    Json(json!({ "status": "healthy", "service": "${ctx.projectName}" }))
}
`,
    },
  ],
};

// 9. Java + Spring Boot
export const backendSpring: TemplateDefinition = {
  id: 'backend-spring',
  name: 'Java + Spring Boot',
  category: 'backend',
  description: 'Enterprise Java 21 REST API with Spring Boot 3, Spring Web, and Maven toolchain.',
  icon: '☕',
  languages: ['Java'],
  frameworks: ['Spring Boot 3', 'Java 21', 'Maven'],
  defaultPackageManager: 'dotnet',
  supportedPackageManagers: ['dotnet'],
  defaultArchitecture: 'modular',
  supportedArchitectures: ['modular', 'clean'],
  defaultPorts: { dev: 8080 },
  commands: { dev: './mvnw spring-boot:run', build: './mvnw clean package', test: './mvnw test' },
  envVariables: [],
  compatibleLibraries: [],
  generateManifest: (ctx: ScaffoldingContext): PlannedFileItem[] => [
    {
      id: 'pom-xml',
      path: 'pom.xml',
      description: 'Maven build file',
      category: 'config',
      content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>${ctx.projectName.toLowerCase()}</artifactId>
    <version>0.0.1-SNAPSHOT</version>
</project>
`,
    },
    {
      id: 'app-java',
      path: 'src/main/java/com/example/demo/DemoApplication.java',
      description: 'Spring Boot main class',
      category: 'source',
      content: `package com.example.demo;

public class DemoApplication {
    public static void main(String[] args) {
        System.out.println("${ctx.projectName} Spring Boot ready.");
    }
}
`,
    },
  ],
};

// 10. .NET / C#
export const backendDotNet: TemplateDefinition = {
  id: 'backend-dotnet',
  name: '.NET',
  category: 'backend',
  description: 'High-throughput ASP.NET Core Web API with C# 12 and OpenAPI Swagger documentation.',
  icon: '🟣',
  languages: ['C#'],
  frameworks: ['ASP.NET Core', '.NET 8', 'C# 12'],
  defaultPackageManager: 'dotnet',
  supportedPackageManagers: ['dotnet'],
  defaultArchitecture: 'modular',
  supportedArchitectures: ['modular', 'clean'],
  defaultPorts: { dev: 5000 },
  commands: { dev: 'dotnet run', build: 'dotnet build', test: 'dotnet test' },
  envVariables: [],
  compatibleLibraries: [],
  generateManifest: (ctx: ScaffoldingContext): PlannedFileItem[] => [
    {
      id: 'csproj',
      path: `${ctx.projectName}.csproj`,
      description: '.NET C# Project File',
      category: 'config',
      content: `<Project Sdk="Microsoft.NET.Sdk.Web">\n  <PropertyGroup>\n    <TargetFramework>net8.0</TargetFramework>\n  </PropertyGroup>\n</Project>\n`,
    },
    {
      id: 'program-cs',
      path: 'Program.cs',
      description: 'ASP.NET Core Minimal API entry point',
      category: 'source',
      content: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/health", () => Results.Ok(new { status = "healthy", service = "${ctx.projectName}" }));

app.Run();
`,
    },
  ],
};

export const allBackendTemplates = [
  backendExpress,
  backendFastify,
  backendNestjs,
  backendFastAPI,
  backendDjango,
  backendFlask,
  backendGo,
  backendRust,
  backendSpring,
  backendDotNet,
];
