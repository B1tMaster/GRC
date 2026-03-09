import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { AuthoritativeDocument, TestCase as PayloadTestCase } from "@/payload-types";
import { Dispatch, SetStateAction } from "react";

import type { TestSuiteWithDocType as ApiTestSuite } from "@/lib/api/types";
import type { TestSuite as PayloadTestSuite } from "@/payload-types";

interface ComplianceStepProps {
  testSuites: PayloadTestSuite[] | null;
  relatedTestSuites: ApiTestSuite[];
  setRelatedTestSuites: Dispatch<SetStateAction<ApiTestSuite[]>>;
  startAnalysis: () => void;
  setStep: (step: number) => void;
  isPending: boolean;
  summary: string;
}

export function ComplianceStep({ testSuites, relatedTestSuites, setRelatedTestSuites, startAnalysis, setStep, isPending, summary }: ComplianceStepProps) {
  const handleControlToggle = (testSuite: PayloadTestSuite, docType: string) => {
    setRelatedTestSuites((prev) =>
      prev.some(ts => ts.testSuiteId === testSuite.id)
        ? prev.filter(ts => ts.testSuiteId !== testSuite.id)
        : [
            ...prev,
            {
              alias: testSuite.alias,
              title: testSuite.title,
              justification: "",
              testSuiteId: testSuite.id,
              docType: docType
            }
          ]
    );
  };

  if (!testSuites) return null;

  

  const testSuitesGroupedByDocType = (testSuites: PayloadTestSuite[]): Record<string, PayloadTestSuite[]> => {
    const result = testSuites.reduce((acc, suite) => {
      const docType = (suite.authoritativeDocument as AuthoritativeDocument | null)?.docType || "unknown";
      acc[docType] = [...(acc[docType] || []), suite];
      return acc;
    }, {} as Record<string, PayloadTestSuite[]>);

    result['pci-dss'] = result['pci-dss'].sort((a, b) => {
      const aNumber = parseInt(a.alias.split('-')[a.alias.split('-').length - 1]);
      const bNumber = parseInt(b.alias.split('-')[b.alias.split('-').length - 1]);

      return aNumber - bNumber;
    });
 
    return result;
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Select Compliance Tests</h2>
        
        {summary && (
          <div className="p-4 rounded-lg border bg-card text-card-foreground">
            <h3 className="text-lg font-medium mb-2">Document Summary</h3>
            <p className="text-muted-foreground">{summary}</p>
          </div>
        )}
        
        {Object.entries(testSuitesGroupedByDocType(testSuites)).map(
          ([docType, suites]: [string, PayloadTestSuite[]]) => {
            // Get all test cases for this suite
            // const suiteTestCases: TestCase[] = (suite.testCases?.docs || [])
            //   .filter((doc): doc is PayloadTestCase => typeof doc === 'object' && doc !== null)
            //   .map(testCase => ({
            //     id: testCase.id,
            //     title: testCase.title || '',
            //     suiteId: suite.id.toString()
            //   }));

            return (
              <div key={docType} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={docType}
                    checked={suites.length > 0 && suites.every(suite => 
                      relatedTestSuites.some(ts => ts.testSuiteId === suite.id)
                    )}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setRelatedTestSuites(prev => [...prev, ...suites.map((suite: PayloadTestSuite) => ({
                          alias: suite.alias,
                          title: suite.title,
                          justification: "",
                          testSuiteId: suite.id,
                          docType: docType
                        }))]);
                      } else {
                        setRelatedTestSuites(prev => 
                          prev.filter(ts => !suites.some(suite => ts.testSuiteId === suite.id))
                        );
                      }
                    }}
                  />
                  <Label htmlFor={docType}>{docType.toUpperCase()}</Label>
                </div>

                <div className="ml-6 space-y-2">
                  {suites.map((suite) => (
                    <div key={suite.alias} className="flex items-center space-x-2">
                      <Checkbox
                        id={suite.alias}
                        checked={relatedTestSuites.some(ts => ts.testSuiteId === suite.id)}
                        onCheckedChange={() =>
                          handleControlToggle(suite, docType)
                        }
                      />
                      <Label htmlFor={suite.alias}>{suite.title}</Label>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
        )}

        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
          <Button onClick={startAnalysis} disabled={isPending || relatedTestSuites.length === 0}>
            {isPending ? 'Starting Analysis...' : 'Start Analysis'}
          </Button>
        </div>
      </div>
    </Card>
  );
} 