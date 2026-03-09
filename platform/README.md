# Secure Path - AI-Powered Compliance Testing

Secure Path is a tool designed to assist compliance officers in evaluating how their clients' user policies align with authoritative documents. The system leverages AI to analyze uploaded policies, suggest relevant compliance checks, and generate detailed reports.

## Tech Stack

This project is built with a modern, full-stack TypeScript architecture.

- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Backend & CMS**: [Payload CMS](https://payloadcms.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [Shadcn/UI](https://ui.shadcn.com/) components
- **AI/LLM**:
  - [OpenAI](https://openai.com/) for language model integration
  - [Langfuse](https://langfuse.com/) for LLM observability and tracing
  - [Zerox](https://github.com/getomni-ai/zerox) for document parsing
- **Containerization**: [Docker](https://www.docker.com/)
- **CI/CD**: [GitLab CI/CD](https://docs.gitlab.com/ee/ci/)

## Local Environment Setup

To set up the project for local development, follow these steps:

1.  **Install Dependencies**: This project uses `pnpm` as the package manager.
    ```bash
    pnpm install
    ```

2.  **Set Up Environment Variables**: This project uses two environment files.
    
    First, copy the application environment variables:
    ```bash
    cp .env.example .env
    ```
    You will need to provide credentials for the database, OpenAI, Langfuse, and other services.

    Next, copy the services environment variables for Docker:
    ```bash
    cp .env.docker.example .env.docker
    ```
    This file contains configuration for services like PostgreSQL, Redis, and MinIO.

3.  **Start Dependent Services**: The project requires a PostgreSQL database and other services. These can be started using Docker Compose.
    ```bash
    pnpm services:up
    ```

4.  **Generate Payload Types**: Generate TypeScript types from your Payload CMS collections.
    ```bash
    pnpm generate:types
    ```

5.  **Run the Development Server**: Start the Next.js development server.
    ```bash
    pnpm dev
    ```
    The application will be available at [http://localhost:3000](http://localhost:3000).

## Configuration

### Workflow Batch Size

The application supports configuring the number of test cases that can be processed in parallel within each batch of the `process-test-run` workflow. This can be adjusted through the DevPanel global in the Payload CMS admin interface:

1.  Navigate to the Globals section in the admin panel.
2.  Select "Dev Panel".
3.  Set the "Workflow Test Case Batch Size" to your desired value (minimum: 1, default: 5).

This setting controls how many `evaluate-test-case` tasks run in parallel, which can help optimize performance and avoid rate limits.

## Deployment

The application is deployed using GitLab CI/CD. The pipeline is defined in `.gitlab-ci.yml`.

- **Staging**: Merges to the `main` branch are automatically deployed to a staging environment.
- **Production**: Manual approval is required for deployment to the production environment.

The deployment process involves:
1.  Building a Docker image using the `Dockerfile`.
2.  Pushing the image to a container registry.
3.  Deploying the image to the target environment.