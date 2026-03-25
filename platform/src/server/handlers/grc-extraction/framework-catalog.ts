/**
 * Framework Catalog
 * Reference data for COBIT 2019, COSO ERM, NIST 800-53, ISO 27001, HKMA SPM, and PCI DSS
 */

import type { FrameworkControl, FrameworkType } from './types';

export const COBIT_2019_CONTROLS: FrameworkControl[] = [
  // EDM - Evaluate, Direct and Monitor
  {
    id: 'cobit-edm01',
    framework: 'COBIT2019',
    domain: 'EDM',
    process: 'EDM01',
    controlId: 'EDM01',
    controlName: 'Ensured Governance Framework Setting and Maintenance',
    description: 'Analyze and articulate the requirements for the governance of enterprise IT. Put in place and maintain effective enabling structures, principles and processes.',
    keywords: ['governance', 'framework', 'strategy', 'objectives', 'principles', 'board', 'direction']
  },
  {
    id: 'cobit-edm02',
    framework: 'COBIT2019',
    domain: 'EDM',
    process: 'EDM02',
    controlId: 'EDM02',
    controlName: 'Ensured Benefits Delivery',
    description: 'Optimize the value contribution to the business from the business processes, IT services and IT assets.',
    keywords: ['value', 'benefits', 'optimization', 'shareholders', 'stakeholders', 'sustainable', 'long-term']
  },
  {
    id: 'cobit-edm03',
    framework: 'COBIT2019',
    domain: 'EDM',
    process: 'EDM03',
    controlId: 'EDM03',
    controlName: 'Ensured Risk Optimization',
    description: 'Ensure that IT-related enterprise risk does not exceed the enterprise risk appetite and tolerance.',
    keywords: ['risk', 'appetite', 'tolerance', 'optimization', 'exposure']
  },
  {
    id: 'cobit-edm04',
    framework: 'COBIT2019',
    domain: 'EDM',
    process: 'EDM04',
    controlId: 'EDM04',
    controlName: 'Ensured Resource Optimization',
    description: 'Ensure that adequate and sufficient IT-related capabilities are available to support enterprise objectives.',
    keywords: ['resources', 'capabilities', 'capacity', 'budget', 'optimization']
  },
  {
    id: 'cobit-edm05',
    framework: 'COBIT2019',
    domain: 'EDM',
    process: 'EDM05',
    controlId: 'EDM05',
    controlName: 'Ensured Stakeholder Engagement',
    description: 'Ensure that enterprise IT stakeholders are identified and engaged.',
    keywords: ['stakeholder', 'engagement', 'communication', 'transparency', 'reporting']
  },

  // APO - Align, Plan and Organize
  {
    id: 'cobit-apo01',
    framework: 'COBIT2019',
    domain: 'APO',
    process: 'APO01',
    controlId: 'APO01',
    controlName: 'Managed I&T Management Framework',
    description: 'Clarify and maintain the governance of enterprise IT mission and vision.',
    keywords: ['management', 'framework', 'mission', 'vision', 'culture', 'alignment']
  },
  {
    id: 'cobit-apo02',
    framework: 'COBIT2019',
    domain: 'APO',
    process: 'APO02',
    controlId: 'APO02',
    controlName: 'Managed Strategy',
    description: 'Provide a holistic view of the current business and IT environment, the future direction, and the initiatives required.',
    keywords: ['strategy', 'planning', 'direction', 'roadmap', 'transformation']
  },
  {
    id: 'cobit-apo04',
    framework: 'COBIT2019',
    domain: 'APO',
    process: 'APO04',
    controlId: 'APO04',
    controlName: 'Managed Innovation',
    description: 'Achieve competitive advantage, business innovation, and improved operational effectiveness.',
    keywords: ['innovation', 'technology', 'digital', 'transformation', 'competitive']
  },
  {
    id: 'cobit-apo06',
    framework: 'COBIT2019',
    domain: 'APO',
    process: 'APO06',
    controlId: 'APO06',
    controlName: 'Managed Budget and Costs',
    description: 'Foster partnership between IT and enterprise stakeholders.',
    keywords: ['budget', 'costs', 'financial', 'expenditure', 'capital', 'resources', 'spending']
  },
  {
    id: 'cobit-apo07',
    framework: 'COBIT2019',
    domain: 'APO',
    process: 'APO07',
    controlId: 'APO07',
    controlName: 'Managed Human Resources',
    description: 'Optimize human resources capabilities to meet enterprise objectives.',
    keywords: ['human resources', 'workforce', 'people', 'staff', 'recruitment', 'talent', 'skills', 'capacity']
  },
  {
    id: 'cobit-apo08',
    framework: 'COBIT2019',
    domain: 'APO',
    process: 'APO08',
    controlId: 'APO08',
    controlName: 'Managed Relationships',
    description: 'Manage the relationship between the business and IT.',
    keywords: ['relationships', 'stakeholders', 'engagement', 'communication', 'partnership']
  },
  {
    id: 'cobit-apo11',
    framework: 'COBIT2019',
    domain: 'APO',
    process: 'APO11',
    controlId: 'APO11',
    controlName: 'Managed Quality',
    description: 'Define and communicate quality requirements in all processes.',
    keywords: ['quality', 'assurance', 'standards', 'improvement', 'three lines', 'defence']
  },
  {
    id: 'cobit-apo12',
    framework: 'COBIT2019',
    domain: 'APO',
    process: 'APO12',
    controlId: 'APO12',
    controlName: 'Managed Risk',
    description: 'Continually identify, assess and reduce IT-related risk.',
    keywords: ['risk', 'management', 'assessment', 'mitigation', 'appetite', 'tolerance', 'exposure', 'register']
  },
  {
    id: 'cobit-apo13',
    framework: 'COBIT2019',
    domain: 'APO',
    process: 'APO13',
    controlId: 'APO13',
    controlName: 'Managed Security',
    description: 'Define, operate and monitor a system for information security management.',
    keywords: ['security', 'information', 'protection', 'cyber', 'confidentiality']
  },

  // BAI - Build, Acquire and Implement
  {
    id: 'cobit-bai01',
    framework: 'COBIT2019',
    domain: 'BAI',
    process: 'BAI01',
    controlId: 'BAI01',
    controlName: 'Managed Programs',
    description: 'Manage all programs and projects from the investment portfolio.',
    keywords: ['program', 'project', 'portfolio', 'investment', 'delivery', 'transformation']
  },
  {
    id: 'cobit-bai06',
    framework: 'COBIT2019',
    domain: 'BAI',
    process: 'BAI06',
    controlId: 'BAI06',
    controlName: 'Managed IT Changes',
    description: 'Manage all changes in a controlled manner.',
    keywords: ['change', 'management', 'control', 'transition', 'implementation']
  },

  // DSS - Deliver, Service and Support
  {
    id: 'cobit-dss04',
    framework: 'COBIT2019',
    domain: 'DSS',
    process: 'DSS04',
    controlId: 'DSS04',
    controlName: 'Managed Continuity',
    description: 'Establish and maintain a plan to enable the business and IT to respond to incidents.',
    keywords: ['continuity', 'resilience', 'recovery', 'disaster', 'business continuity', 'operational']
  },
  {
    id: 'cobit-dss05',
    framework: 'COBIT2019',
    domain: 'DSS',
    process: 'DSS05',
    controlId: 'DSS05',
    controlName: 'Managed Security Services',
    description: 'Protect enterprise information to maintain the level of information security risk acceptable.',
    keywords: ['security', 'cyber', 'protection', 'threat', 'vulnerability', 'attack', 'defence']
  },

  // MEA - Monitor, Evaluate and Assess
  {
    id: 'cobit-mea01',
    framework: 'COBIT2019',
    domain: 'MEA',
    process: 'MEA01',
    controlId: 'MEA01',
    controlName: 'Managed Performance and Conformance Monitoring',
    description: 'Collect, validate and evaluate business, IT and process goals and metrics.',
    keywords: ['performance', 'monitoring', 'metrics', 'KPI', 'KRI', 'measurement']
  },
  {
    id: 'cobit-mea02',
    framework: 'COBIT2019',
    domain: 'MEA',
    process: 'MEA02',
    controlId: 'MEA02',
    controlName: 'Managed System of Internal Control',
    description: 'Continuously monitor and evaluate the control environment.',
    keywords: ['internal control', 'control environment', 'assurance', 'audit', 'monitoring']
  },
  {
    id: 'cobit-mea03',
    framework: 'COBIT2019',
    domain: 'MEA',
    process: 'MEA03',
    controlId: 'MEA03',
    controlName: 'Managed Compliance with External Requirements',
    description: 'Ensure that the enterprise is compliant with all applicable external requirements.',
    keywords: ['compliance', 'regulatory', 'legal', 'requirements', 'external', 'laws', 'regulations']
  },
  {
    id: 'cobit-mea04',
    framework: 'COBIT2019',
    domain: 'MEA',
    process: 'MEA04',
    controlId: 'MEA04',
    controlName: 'Managed Assurance',
    description: 'Enable the organization to design and develop efficient and effective assurance initiatives.',
    keywords: ['assurance', 'audit', 'independent', 'review', 'evaluation']
  }
];

export const COSO_ERM_CONTROLS: FrameworkControl[] = [
  // Governance & Culture
  {
    id: 'coso-gc-01',
    framework: 'COSO_ERM',
    domain: 'Governance & Culture',
    controlId: 'GC-01',
    controlName: 'Exercises Board Risk Oversight',
    description: 'The board of directors provides oversight of the strategy and carries out governance responsibilities.',
    keywords: ['board', 'oversight', 'governance', 'directors', 'supervision']
  },
  {
    id: 'coso-gc-02',
    framework: 'COSO_ERM',
    domain: 'Governance & Culture',
    controlId: 'GC-02',
    controlName: 'Establishes Operating Structures',
    description: 'The organization establishes operating structures in the pursuit of strategy and business objectives.',
    keywords: ['structure', 'operating', 'organization', 'framework', 'management']
  },
  {
    id: 'coso-gc-03',
    framework: 'COSO_ERM',
    domain: 'Governance & Culture',
    controlId: 'GC-03',
    controlName: 'Defines Desired Culture',
    description: 'The organization defines the desired behaviors that characterize the entity\'s desired culture.',
    keywords: ['culture', 'values', 'ethics', 'behavior', 'tone']
  },
  {
    id: 'coso-gc-04',
    framework: 'COSO_ERM',
    domain: 'Governance & Culture',
    controlId: 'GC-04',
    controlName: 'Demonstrates Commitment to Core Values',
    description: 'The organization demonstrates a commitment to integrity and ethical values.',
    keywords: ['integrity', 'ethics', 'values', 'commitment', 'conduct']
  },
  {
    id: 'coso-gc-05',
    framework: 'COSO_ERM',
    domain: 'Governance & Culture',
    controlId: 'GC-05',
    controlName: 'Attracts, Develops, and Retains Capable Individuals',
    description: 'The organization is committed to building human capital in alignment with strategy.',
    keywords: ['talent', 'human capital', 'recruitment', 'development', 'retention', 'people']
  },

  // Strategy & Objective-Setting
  {
    id: 'coso-so-01',
    framework: 'COSO_ERM',
    domain: 'Strategy & Objective-Setting',
    controlId: 'SO-01',
    controlName: 'Analyzes Business Context',
    description: 'The organization considers potential effects of business context on risk profile.',
    keywords: ['context', 'environment', 'business', 'external', 'internal']
  },
  {
    id: 'coso-so-02',
    framework: 'COSO_ERM',
    domain: 'Strategy & Objective-Setting',
    controlId: 'SO-02',
    controlName: 'Defines Risk Appetite',
    description: 'The organization defines risk appetite in the context of creating, preserving, and realizing value.',
    keywords: ['risk appetite', 'tolerance', 'threshold', 'acceptable', 'limit']
  },
  {
    id: 'coso-so-03',
    framework: 'COSO_ERM',
    domain: 'Strategy & Objective-Setting',
    controlId: 'SO-03',
    controlName: 'Evaluates Alternative Strategies',
    description: 'The organization evaluates alternative strategies and potential impact on risk profile.',
    keywords: ['strategy', 'alternatives', 'options', 'evaluation', 'impact']
  },
  {
    id: 'coso-so-04',
    framework: 'COSO_ERM',
    domain: 'Strategy & Objective-Setting',
    controlId: 'SO-04',
    controlName: 'Formulates Business Objectives',
    description: 'The organization considers risk while establishing business objectives.',
    keywords: ['objectives', 'goals', 'targets', 'business', 'strategic']
  },

  // Performance
  {
    id: 'coso-perf-01',
    framework: 'COSO_ERM',
    domain: 'Performance',
    controlId: 'PERF-01',
    controlName: 'Identifies Risk',
    description: 'The organization identifies risk that impacts the achievement of its strategy and business objectives.',
    keywords: ['identify', 'risk', 'recognition', 'detection', 'emerging']
  },
  {
    id: 'coso-perf-02',
    framework: 'COSO_ERM',
    domain: 'Performance',
    controlId: 'PERF-02',
    controlName: 'Assesses Severity of Risk',
    description: 'The organization assesses the severity of risk.',
    keywords: ['assess', 'severity', 'impact', 'likelihood', 'magnitude']
  },
  {
    id: 'coso-perf-03',
    framework: 'COSO_ERM',
    domain: 'Performance',
    controlId: 'PERF-03',
    controlName: 'Prioritizes Risks',
    description: 'The organization prioritizes risks as a basis for selecting responses to risks.',
    keywords: ['prioritize', 'ranking', 'order', 'importance', 'critical']
  },
  {
    id: 'coso-perf-04',
    framework: 'COSO_ERM',
    domain: 'Performance',
    controlId: 'PERF-04',
    controlName: 'Implements Risk Responses',
    description: 'The organization identifies and selects risk responses.',
    keywords: ['response', 'mitigation', 'treatment', 'action', 'control']
  },
  {
    id: 'coso-perf-05',
    framework: 'COSO_ERM',
    domain: 'Performance',
    controlId: 'PERF-05',
    controlName: 'Develops Portfolio View',
    description: 'The organization develops and evaluates a portfolio view of risk.',
    keywords: ['portfolio', 'aggregate', 'enterprise-wide', 'holistic', 'consolidated']
  },

  // Review & Revision
  {
    id: 'coso-rr-01',
    framework: 'COSO_ERM',
    domain: 'Review & Revision',
    controlId: 'RR-01',
    controlName: 'Assesses Substantial Change',
    description: 'The organization identifies and assesses changes that may substantially affect strategy.',
    keywords: ['change', 'substantial', 'material', 'significant', 'transformation']
  },
  {
    id: 'coso-rr-02',
    framework: 'COSO_ERM',
    domain: 'Review & Revision',
    controlId: 'RR-02',
    controlName: 'Reviews Risk and Performance',
    description: 'The organization reviews entity performance and considers risk.',
    keywords: ['review', 'performance', 'monitoring', 'evaluation', 'assessment']
  },
  {
    id: 'coso-rr-03',
    framework: 'COSO_ERM',
    domain: 'Review & Revision',
    controlId: 'RR-03',
    controlName: 'Pursues Improvement in ERM',
    description: 'The organization pursues improvement of enterprise risk management.',
    keywords: ['improvement', 'enhancement', 'continuous', 'maturity', 'evolution']
  },

  // Information, Communication & Reporting
  {
    id: 'coso-icr-01',
    framework: 'COSO_ERM',
    domain: 'Information, Communication & Reporting',
    controlId: 'ICR-01',
    controlName: 'Leverages Information and Technology',
    description: 'The organization leverages the entity\'s information and technology systems.',
    keywords: ['information', 'technology', 'systems', 'data', 'digital']
  },
  {
    id: 'coso-icr-02',
    framework: 'COSO_ERM',
    domain: 'Information, Communication & Reporting',
    controlId: 'ICR-02',
    controlName: 'Communicates Risk Information',
    description: 'The organization uses communication channels to support enterprise risk management.',
    keywords: ['communication', 'reporting', 'channels', 'stakeholder', 'transparency']
  },
  {
    id: 'coso-icr-03',
    framework: 'COSO_ERM',
    domain: 'Information, Communication & Reporting',
    controlId: 'ICR-03',
    controlName: 'Reports on Risk, Culture, and Performance',
    description: 'The organization reports on risk, culture, and performance at multiple levels.',
    keywords: ['reporting', 'disclosure', 'transparency', 'board', 'executive']
  }
];

export const NIST_800_53_CONTROLS: FrameworkControl[] = [
  // Access Control family
  { id: 'nist-ac-1', framework: 'NIST_800_53', domain: 'Access Control', controlId: 'AC-1', controlName: 'Policy and Procedures', description: 'Develop, document, and disseminate access control policy and procedures.', keywords: ['access control', 'policy', 'procedures', 'authorization'] },
  { id: 'nist-ac-2', framework: 'NIST_800_53', domain: 'Access Control', controlId: 'AC-2', controlName: 'Account Management', description: 'Manage system accounts including establishing, activating, modifying, reviewing, disabling, and removing accounts.', keywords: ['account', 'management', 'provisioning', 'access', 'user', 'identity'] },
  { id: 'nist-ac-3', framework: 'NIST_800_53', domain: 'Access Control', controlId: 'AC-3', controlName: 'Access Enforcement', description: 'Enforce approved authorizations for logical access to information and system resources.', keywords: ['access', 'enforcement', 'authorization', 'least privilege', 'permissions'] },
  { id: 'nist-ac-6', framework: 'NIST_800_53', domain: 'Access Control', controlId: 'AC-6', controlName: 'Least Privilege', description: 'Employ the principle of least privilege allowing only authorized accesses.', keywords: ['least privilege', 'minimal access', 'role-based', 'need-to-know'] },
  { id: 'nist-ac-17', framework: 'NIST_800_53', domain: 'Access Control', controlId: 'AC-17', controlName: 'Remote Access', description: 'Establish and document usage restrictions and implementation guidance for remote access.', keywords: ['remote access', 'VPN', 'telework', 'zero trust'] },
  // System and Communications Protection (Encryption)
  { id: 'nist-sc-8', framework: 'NIST_800_53', domain: 'System & Communications Protection', controlId: 'SC-8', controlName: 'Transmission Confidentiality and Integrity', description: 'Protect the confidentiality and integrity of transmitted information.', keywords: ['encryption', 'transmission', 'TLS', 'confidentiality', 'integrity', 'transit'] },
  { id: 'nist-sc-12', framework: 'NIST_800_53', domain: 'System & Communications Protection', controlId: 'SC-12', controlName: 'Cryptographic Key Establishment and Management', description: 'Establish and manage cryptographic keys using approved key management technology.', keywords: ['key management', 'cryptographic', 'PKI', 'certificate', 'key lifecycle'] },
  { id: 'nist-sc-13', framework: 'NIST_800_53', domain: 'System & Communications Protection', controlId: 'SC-13', controlName: 'Cryptographic Protection', description: 'Implement cryptographic mechanisms to prevent unauthorized disclosure and modification.', keywords: ['encryption', 'cryptography', 'FIPS 140', 'AES', 'cryptographic module'] },
  { id: 'nist-sc-28', framework: 'NIST_800_53', domain: 'System & Communications Protection', controlId: 'SC-28', controlName: 'Protection of Information at Rest', description: 'Protect the confidentiality and integrity of information at rest.', keywords: ['encryption at rest', 'data protection', 'storage', 'confidentiality'] },
  // Configuration Management (Change Mgmt)
  { id: 'nist-cm-1', framework: 'NIST_800_53', domain: 'Configuration Management', controlId: 'CM-1', controlName: 'Policy and Procedures', description: 'Develop, document, and disseminate configuration management policy and procedures.', keywords: ['configuration', 'change management', 'policy', 'baseline'] },
  { id: 'nist-cm-3', framework: 'NIST_800_53', domain: 'Configuration Management', controlId: 'CM-3', controlName: 'Configuration Change Control', description: 'Determine and document types of changes to the system under configuration control.', keywords: ['change control', 'configuration', 'approval', 'testing', 'documentation'] },
  // Incident Response
  { id: 'nist-ir-1', framework: 'NIST_800_53', domain: 'Incident Response', controlId: 'IR-1', controlName: 'Policy and Procedures', description: 'Develop, document, and disseminate incident response policy and procedures.', keywords: ['incident response', 'policy', 'procedures', 'breach'] },
  { id: 'nist-ir-4', framework: 'NIST_800_53', domain: 'Incident Response', controlId: 'IR-4', controlName: 'Incident Handling', description: 'Implement an incident handling capability that includes preparation, detection, analysis, containment, eradication, and recovery.', keywords: ['incident handling', 'containment', 'eradication', 'recovery', 'CSIRT'] },
  { id: 'nist-ir-6', framework: 'NIST_800_53', domain: 'Incident Response', controlId: 'IR-6', controlName: 'Incident Reporting', description: 'Require personnel to report suspected incidents to the organizational incident response capability.', keywords: ['incident reporting', 'notification', 'escalation', 'regulatory reporting'] },
  // Program Management (AI Governance — mapped via PM family)
  { id: 'nist-pm-9', framework: 'NIST_800_53', domain: 'Program Management', controlId: 'PM-9', controlName: 'Risk Management Strategy', description: 'Develop a comprehensive strategy to manage risk to organizational operations, assets, individuals, and other organizations.', keywords: ['risk management', 'strategy', 'enterprise risk', 'risk framework'] },
  { id: 'nist-pt-1', framework: 'NIST_800_53', domain: 'PII Processing & Transparency', controlId: 'PT-1', controlName: 'Policy and Procedures', description: 'Develop, document, and disseminate PII processing and transparency policy.', keywords: ['privacy', 'PII', 'transparency', 'data protection', 'AI', 'explainability'] },
];

export const ISO_27001_CONTROLS: FrameworkControl[] = [
  // A.5 — Information Security Policies
  { id: 'iso-a5', framework: 'ISO27001', domain: 'Information Security Policies', controlId: 'A.5', controlName: 'Information Security Policies', description: 'Management direction for information security in accordance with business requirements and relevant laws and regulations.', keywords: ['policy', 'management direction', 'information security', 'governance'] },
  // A.6 — Organization of Information Security
  { id: 'iso-a6', framework: 'ISO27001', domain: 'Organization of IS', controlId: 'A.6', controlName: 'Organization of Information Security', description: 'Establish a management framework to initiate and control the implementation of information security.', keywords: ['organization', 'roles', 'responsibilities', 'segregation of duties', 'mobile', 'teleworking'] },
  // A.8 — Asset Management
  { id: 'iso-a8', framework: 'ISO27001', domain: 'Asset Management', controlId: 'A.8', controlName: 'Asset Management', description: 'Identify organizational assets and define appropriate protection responsibilities.', keywords: ['asset management', 'classification', 'handling', 'media', 'inventory'] },
  // A.9 — Access Control
  { id: 'iso-a9-1', framework: 'ISO27001', domain: 'Access Control', controlId: 'A.9.1', controlName: 'Business Requirements of Access Control', description: 'Limit access to information and information processing facilities.', keywords: ['access control', 'business requirements', 'access policy', 'network'] },
  { id: 'iso-a9-2', framework: 'ISO27001', domain: 'Access Control', controlId: 'A.9.2', controlName: 'User Access Management', description: 'Ensure authorized user access and prevent unauthorized access to systems and services.', keywords: ['user access', 'registration', 'provisioning', 'privilege management', 'authentication'] },
  { id: 'iso-a9-4', framework: 'ISO27001', domain: 'Access Control', controlId: 'A.9.4', controlName: 'System and Application Access Control', description: 'Prevent unauthorized access to systems and applications.', keywords: ['system access', 'application access', 'login', 'password', 'MFA'] },
  // A.10 — Cryptography
  { id: 'iso-a10', framework: 'ISO27001', domain: 'Cryptography', controlId: 'A.10', controlName: 'Cryptography', description: 'Ensure proper and effective use of cryptography to protect the confidentiality, authenticity and integrity of information.', keywords: ['cryptography', 'encryption', 'key management', 'certificates', 'FIPS'] },
  // A.12 — Operations Security
  { id: 'iso-a12-1', framework: 'ISO27001', domain: 'Operations Security', controlId: 'A.12.1.2', controlName: 'Change Management', description: 'Changes to the organization, business processes, information processing facilities and systems that affect information security shall be controlled.', keywords: ['change management', 'operations', 'change control', 'testing'] },
  // A.16 — Incident Management
  { id: 'iso-a16-1', framework: 'ISO27001', domain: 'Incident Management', controlId: 'A.16.1', controlName: 'Management of Information Security Incidents', description: 'Ensure a consistent and effective approach to the management of information security incidents, including communication.', keywords: ['incident management', 'incident response', 'reporting', 'evidence', 'lessons learned'] },
  // A.18 — Compliance
  { id: 'iso-a18', framework: 'ISO27001', domain: 'Compliance', controlId: 'A.18', controlName: 'Compliance', description: 'Avoid breaches of legal, statutory, regulatory or contractual obligations related to information security.', keywords: ['compliance', 'legal', 'regulatory', 'audit', 'privacy', 'data protection'] },
];

export const HKMA_SPM_CONTROLS: FrameworkControl[] = [
  { id: 'hkma-tm-g-1', framework: 'HKMA_SPM', domain: 'Technology Risk Management', controlId: 'TM-G-1', controlName: 'IT Governance', description: 'Board and senior management oversight of IT strategy, policies and risk management framework.', keywords: ['IT governance', 'board oversight', 'technology risk', 'strategy'] },
  { id: 'hkma-tm-e-1', framework: 'HKMA_SPM', domain: 'Technology Risk Management', controlId: 'TM-E-1', controlName: 'Information Security', description: 'Establish information security management framework including classification, access control, and encryption.', keywords: ['information security', 'classification', 'access control', 'encryption', 'security framework'] },
  { id: 'hkma-or-2', framework: 'HKMA_SPM', domain: 'Operational Resilience', controlId: 'OR-2', controlName: 'Operational Resilience Framework', description: 'Establish and maintain an operational resilience framework including identification of critical operations and impact tolerances.', keywords: ['operational resilience', 'business continuity', 'critical operations', 'impact tolerance'] },
  { id: 'hkma-sa-1', framework: 'HKMA_SPM', domain: 'Supervisory Approach', controlId: 'SA-1', controlName: 'Risk-Based Supervisory Approach', description: 'Supervisory policies and procedures reflecting risk-based approach to banking supervision including technology risk.', keywords: ['risk-based', 'supervision', 'regulatory', 'banking', 'compliance'] },
  { id: 'hkma-genai-1', framework: 'HKMA_SPM', domain: 'GenAI Governance', controlId: 'GenAI-1', controlName: 'GenAI Risk Management', description: 'Governance framework for adoption and use of generative AI including model risk management, data governance, and ethical use.', keywords: ['AI', 'GenAI', 'generative AI', 'model risk', 'explainability', 'ethical AI', 'AI governance'] },
  { id: 'hkma-genai-2', framework: 'HKMA_SPM', domain: 'GenAI Governance', controlId: 'GenAI-2', controlName: 'AI Explainability and Fairness', description: 'Ensure AI/ML models are explainable, fair, and free from bias with appropriate human oversight.', keywords: ['explainability', 'fairness', 'bias', 'transparency', 'human oversight', 'AI ethics'] },
  { id: 'hkma-tm-e-4', framework: 'HKMA_SPM', domain: 'Technology Risk Management', controlId: 'TM-E-4', controlName: 'Cyber Security', description: 'Implement cyber security management framework including threat intelligence, vulnerability management, and incident response.', keywords: ['cyber security', 'threat intelligence', 'vulnerability', 'penetration testing', 'SOC'] },
  { id: 'hkma-ic-1', framework: 'HKMA_SPM', domain: 'Internal Controls', controlId: 'IC-1', controlName: 'Internal Control Framework', description: 'Establish an internal control framework appropriate to the nature, size, and complexity of the institution.', keywords: ['internal controls', 'control environment', 'three lines', 'assurance', 'audit'] },
];

export const PCI_DSS_CONTROLS: FrameworkControl[] = [
  // Requirement 3 — Protect Stored Account Data
  { id: 'pci-req3', framework: 'PCI_DSS', domain: 'Protect Stored Data', controlId: 'Req 3', controlName: 'Protect Stored Account Data', description: 'Protect stored account data through encryption, truncation, masking, and hashing.', keywords: ['data protection', 'encryption at rest', 'stored data', 'masking', 'tokenization'] },
  { id: 'pci-req3-5', framework: 'PCI_DSS', domain: 'Protect Stored Data', controlId: 'Req 3.5', controlName: 'Protect Cryptographic Keys', description: 'Protect cryptographic keys used to protect stored account data against disclosure and misuse.', keywords: ['key management', 'key protection', 'HSM', 'key custodian', 'split knowledge'] },
  // Requirement 4 — Protect Data in Transit
  { id: 'pci-req4', framework: 'PCI_DSS', domain: 'Protect Data in Transit', controlId: 'Req 4', controlName: 'Protect Cardholder Data in Transit', description: 'Protect cardholder data with strong cryptography during transmission over open, public networks.', keywords: ['encryption in transit', 'TLS', 'transmission', 'network security', 'cryptography'] },
  // Requirement 6 — Develop Secure Systems
  { id: 'pci-req6-5', framework: 'PCI_DSS', domain: 'Secure Development', controlId: 'Req 6.5', controlName: 'Change Management Procedures', description: 'Follow change management procedures for all changes to system components.', keywords: ['change management', 'change control', 'software development', 'testing', 'approval'] },
  // Requirement 7/8 — Access Control
  { id: 'pci-req7', framework: 'PCI_DSS', domain: 'Access Control', controlId: 'Req 7', controlName: 'Restrict Access by Business Need to Know', description: 'Restrict access to system components and cardholder data to only those individuals whose job requires such access.', keywords: ['access control', 'need to know', 'least privilege', 'role-based', 'authorization'] },
  { id: 'pci-req8', framework: 'PCI_DSS', domain: 'Access Control', controlId: 'Req 8', controlName: 'Identify Users and Authenticate Access', description: 'Identify and authenticate access to system components using unique IDs and strong authentication.', keywords: ['authentication', 'MFA', 'identity', 'unique ID', 'password', 'multi-factor'] },
  // Requirement 10 — Logging and Monitoring
  { id: 'pci-req10', framework: 'PCI_DSS', domain: 'Logging & Monitoring', controlId: 'Req 10', controlName: 'Log and Monitor All Access', description: 'Log and monitor all access to network resources and cardholder data.', keywords: ['logging', 'monitoring', 'audit trail', 'SIEM', 'alerting'] },
  // Requirement 12 — Information Security Policy
  { id: 'pci-req12', framework: 'PCI_DSS', domain: 'Security Policy', controlId: 'Req 12', controlName: 'Information Security Policy', description: 'Maintain a policy that addresses information security for all personnel.', keywords: ['security policy', 'information security', 'personnel', 'awareness', 'training'] },
  { id: 'pci-req12-10', framework: 'PCI_DSS', domain: 'Incident Response', controlId: 'Req 12.10', controlName: 'Incident Response Plan', description: 'Implement an incident response plan. Be prepared to respond immediately to a system breach.', keywords: ['incident response', 'breach', 'forensics', 'notification', 'recovery plan'] },
];

export const ALL_FRAMEWORK_CONTROLS: FrameworkControl[] = [
  ...COBIT_2019_CONTROLS,
  ...COSO_ERM_CONTROLS,
  ...NIST_800_53_CONTROLS,
  ...ISO_27001_CONTROLS,
  ...HKMA_SPM_CONTROLS,
  ...PCI_DSS_CONTROLS,
];

export function getControlsByFramework(framework: FrameworkType): FrameworkControl[] {
  return ALL_FRAMEWORK_CONTROLS.filter(c => c.framework === framework);
}

export function getControlById(id: string): FrameworkControl | undefined {
  return ALL_FRAMEWORK_CONTROLS.find(c => c.id === id);
}

export function searchControlsByKeyword(keyword: string): FrameworkControl[] {
  const lowerKeyword = keyword.toLowerCase();
  return ALL_FRAMEWORK_CONTROLS.filter(c => 
    c.keywords.some(k => k.toLowerCase().includes(lowerKeyword)) ||
    c.controlName.toLowerCase().includes(lowerKeyword) ||
    c.description.toLowerCase().includes(lowerKeyword)
  );
}
