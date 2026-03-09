# User Workflows

This document outlines the primary user workflows within the Secure Path application, detailing the business context, data inputs, and data outputs for each process.

## 1. Compliance Analysis Workflow

This is the core workflow of the application, enabling a compliance officer to assess a client's policy documents against a set of authoritative standards.

### Business Context

In the financial industry, compliance with regulations like NIST, PCI-DSS, and HKMA is mandatory. This workflow automates the manual and error-prone process of reviewing a client's internal policies to ensure they meet these standards. By using AI to parse documents and suggest relevant compliance checks, the application significantly reduces the time and effort required for this task, while increasing the accuracy and consistency of the assessments.

### Workflow Steps

#### a. Upload User Policy

-   **Description**: The compliance officer uploads the client's user policy document.
-   **Input Data**: A file (`.pdf`) containing the client's user policy.
-   **Output Data**: The file is stored in the system and an `InputFile` record is created in the database, linking the document to the client and the compliance officer.
-   **Business Value**: This is the starting point of the compliance assessment. The uploaded document serves as the primary source of truth for the client's policies.

#### b. AI-Powered Test Case Suggestion

-   **Description**: The system analyzes the uploaded policy using an AI model. It identifies key themes, rules, and procedures within the document and suggests relevant test cases from its database of authoritative documents.
-   **Input Data**: The content of the uploaded user policy.
-   **Output Data**: A list of suggested `TestCase` records, each representing a specific compliance check from an authoritative document (e.g., a section from NIST 800-53).
-   **Business Value**: This step automates the mapping of a client's policy to specific regulatory requirements, a task that would otherwise require deep domain expertise and hours of manual work.

#### c. User Approval of Test Cases

-   **Description**: The compliance officer reviews the AI-suggested test cases and approves them for a test run. The officer can also manually add or remove test cases.
-   **Input Data**: The list of suggested `TestCase` records.
-   **Output Data**: A `TestSuite` record is created, which is a collection of the approved `TestCase` records for this specific assessment.
-   **Business Value**: This step ensures that a human expert is always in control of the assessment process, providing a critical layer of validation and oversight.

#### d. Test Run Execution

-   **Description**: The system initiates a `TestRun`, where the AI model evaluates the user policy against each `TestCase` in the `TestSuite`, using the methodology defined in the `TestCase`.
-   **Input Data**: The `TestSuite` and the user policy document.
-   **Output Data**: A `TestRun` record is created, and for each `TestCase`, a result is generated (e.g., "Compliant," "Non-Compliant," "Partially Compliant") along with a detailed explanation from the AI.
-   **Business Value**: This is the core of the automated assessment. The AI performs a detailed analysis that would be time-consuming and difficult to scale if done manually.

#### e. Report Generation

-   **Description**: Once the `TestRun` is complete, the system presents a comprehensive, interactive compliance report on the web interface.
-   **Input Data**: The results from the `TestRun` document stored in the database.
-   **Output Data**: An interactive report page that summarizes the findings. It includes:
    -   A high-level summary of compliant, non-compliant, and partially compliant controls.
    -   A detailed table of all test cases, their status, and the AI's confidence level.
    -   A slide-out panel for each test case, showing a detailed analysis, identified gaps, and actionable recommendations.
-   **Business Value**: The report provides a clear, actionable, and interactive summary of the client's compliance posture. This allows for easy exploration of the results and can be used for internal audits, regulatory submissions, and remediation planning.

## 2. Authoritative Document Management

This workflow describes how authoritative documents and their associated test cases are managed within the system.

### Business Context

The regulatory landscape is constantly evolving. This workflow allows administrators to keep the system's knowledge base of authoritative documents and test cases up-to-date, ensuring that compliance assessments are always based on the latest standards.

### Workflow Steps

#### a. Upload Authoritative Document

-   **Description**: An administrator uploads a new or updated authoritative document (e.g., the latest version of PCI-DSS).
-   **Input Data**: A file containing the authoritative document.
-   **Output Data**: An `AuthoritativeDocument` record is created in the database.

#### b. AI Prompt Engineering

-   **Description**: Before a new type of authoritative document can be processed, a developer must create a new set of prompts for the AI. These prompts are specifically designed to teach the AI how to interpret the structure, terminology, and requirements of the new standard.
-   **Input Data**: The new authoritative document standard.
-   **Output Data**: A new set of TypeScript files in the `src/server/llm/workflows/` directory containing the prompts and logic for the new standard. For example, to support PCI-DSS, a new `src/server/llm/workflows/pci-dss/` directory would be created with the relevant prompt engineering files.
-   **Business Value**: This step is crucial for ensuring the accuracy and reliability of the AI's analysis. By providing tailored instructions, the AI can generate high-quality, relevant test cases that are specific to the new authoritative document.

#### c. Create Test Cases and Methodologies

-   **Description**: Once the AI prompts are in place, an administrator can upload a new or updated authoritative document. The system will then use the newly created prompts to analyze the document and automatically generate a set of `TestCase` records. For each `TestCase`, a detailed methodology is also generated, which provides instructions for the AI on how to perform the assessment.
-   **Input Data**: A file containing the authoritative document.
-   **Output Data**: An `AuthoritativeDocument` record is created in the database, along with a set of `TestCase` records, each with a defined methodology, linked to the `AuthoritativeDocument`.
