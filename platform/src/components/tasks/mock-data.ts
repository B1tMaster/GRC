interface Control {
  id: string;
  name: string;
}

interface Section {
  name: string;
  controls: Control[];
}

interface Framework {
  name: string;
  sections: Section[];
}

interface ComplianceData {
  [key: string]: Framework;
}

interface ControlDetails {
  standards: {
    total: number;
    references: string[];
  };
  citations: {
    total: number;
    references: string[];
  };
  recommendations: string[];
}

interface ControlDetailsMap {
  [key: string]: ControlDetails;
}

interface ReportSummary {
  passed: number;
  failed: number;
  notApplicable: number;
}

interface ReportDetail {
  id: string;
  status: "passed" | "failed" | "notApplicable";
  name: string;
  sources: number[];
}

interface ReportData {
  summary: ReportSummary;
  details: ReportDetail[];
}

export const mockComplianceData: ComplianceData = {
  nist: {
    name: "NIST",
    sections: [
      {
        name: "Access Control",
        controls: [
          { id: "ac-1", name: "AC-1: Access Control Policy" },
          { id: "ac-2", name: "AC-2: Account Management" },
          { id: "ac-3", name: "AC-3: Access Enforcement" },
          { id: "ac-4", name: "AC-4: Information Flow Enforcement" },
        ],
      },
      {
        name: "Audit and Accountability",
        controls: [
          { id: "au-1", name: "AU-1: Audit Policy" },
          { id: "au-2", name: "AU-2: Event Logging" },
        ],
      },
    ],
  },
  pciDss: {
    name: "PCI DSS",
    sections: [
      {
        name: "Requirement 1: Network Security",
        controls: [
          { id: "1.1", name: "1.1: Firewall Standards" },
          { id: "2.1", name: "2.1: Password Requirements" },
          { id: "2.2", name: "2.2: System Hardening" },
        ],
      },
    ],
  },
};

export const mockControlDetails: ControlDetailsMap = {
  "ac-1": {
    standards: {
      total: 1,
      references: [
        "NIST SP 800-53 Rev. 5 Section 3.1.2",
        "PCI DSS v4.0 Requirement 1.2.1"
      ]
    },
    citations: {
      total: 3,
      references: [
        "Section 2.3: Access Control Policy",
        "Policy Documentation Section 4.1",
        "Security Guidelines Chapter 3"
      ]
    },
    recommendations: [
      "Update access control documentation",
      "Implement regular policy reviews",
      "Enhance monitoring procedures"
    ]
  }
};

export const mockReportData: ReportData = {
  summary: {
    passed: 8,
    failed: 2,
    notApplicable: 1
  },
  details: [
    { id: "ac-1", status: "passed", name: "AC-1: Access Control Policy", sources: [1, 4] },
    { id: "ac-2", status: "passed", name: "AC-2: Account Management", sources: [5, 2] },
    { id: "ac-3", status: "passed", name: "AC-3: Access Enforcement", sources: [5, 3] },
    { id: "ac-4", status: "passed", name: "AC-4: Information Flow Enforcement", sources: [4, 3] },
    { id: "au-1", status: "passed", name: "AU-1: Audit Policy", sources: [3, 4] },
    { id: "au-2", status: "passed", name: "AU-2: Event Logging", sources: [3, 3] },
    { id: "req-1-1", status: "failed", name: "1.1: Firewall Standards", sources: [2, 3] }
  ]
}; 