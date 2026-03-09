import type React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ExternalLink } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useRef } from "react"
import Link from "next/link"

type ReportItem = {
  id: string
  title: string
  description: string
  severity: "HIGH" | "CRITICAL" | "MEDIUM" | "LOW"
  documentEvidence: Array<{ id: string; citation: string; location: string; context: string }>
  controlEvidence: Array<{ id: string; citation: string; location: string; context: string }>
  impact: {
    security: string
    compliance: string
    operational: string
  }
  recommendation: {
    description: string
    priority: string
    steps: Array<{ id: string; step: string }>
    expectedOutcome: string
  }
}

const getSeverityStyle = (severity: string) => {
  switch (severity) {
    case "CRITICAL":
      return "bg-red-500 dark:bg-red-600 text-white"
    case "HIGH":
      return "bg-orange-500 dark:bg-orange-600 text-white"
    case "MEDIUM":
      return "bg-yellow-500 dark:bg-yellow-600 text-black dark:text-white"
    case "LOW":
      return "bg-blue-500 dark:bg-blue-600 text-white"
    default:
      return "bg-gray-500 dark:bg-gray-600 text-white"
  }
}

const ReportCards: React.FC<{ jsonData: string }> = ({ jsonData }) => {
  let report: ReportItem[] = []

  try {
    report = JSON.parse(jsonData)
  } catch (error) {
    console.error("Error parsing JSON data:", error)
  }

  if (!report || report.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          No report data available or invalid JSON. Please check your data source and try again.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="grid gap-8 w-full pb-6">
        {report.map((item) => (
          <Card 
            key={item.id}
            className="flex flex-col w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            {/* Compressed Header */}
            <CardHeader className="py-3 space-y-1 flex-none">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-base font-bold line-clamp-1">
                  {item.title}
                </CardTitle>
                <Badge className={`${getSeverityStyle(item.severity)} shrink-0`}>
                  {item.severity}
                </Badge>
              </div>
              <CardDescription className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                {item.description}
              </CardDescription>
            </CardHeader>

            {/* Main Content Area */}
            <CardContent className="flex-grow p-0 overflow-hidden">
              <Accordion 
                type="multiple" 
                className="w-full"
              >
                <AccordionItem value="evidence" className="border-gray-200 dark:border-gray-700">
                  <AccordionTrigger className="py-1 px-6 hover:no-underline hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-sm">
                    Evidence
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="px-6 py-2">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Document Evidence:</h4>
                        {item.documentEvidence.map((evidence) => (
                          <p key={evidence.id} className="text-xs text-gray-600 dark:text-gray-300">
                            {evidence.citation} - {evidence.location}
                            <Link href="#">
                              <ExternalLink className="w-3 h-3 inline-block ml-1 hover:text-blue-500 dark:hover:text-blue-400" />
                            </Link>
                          </p>
                        ))}
                        <h4 className="font-semibold text-sm mt-2">Control Evidence:</h4>
                        {item.controlEvidence.map((evidence) => (
                          <p key={evidence.id} className="text-xs text-gray-600 dark:text-gray-300">
                            {evidence.citation} - {evidence.location}
                          </p>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="impact" className="border-gray-200 dark:border-gray-700">
                  <AccordionTrigger className="py-1 px-6 hover:no-underline hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-sm">
                    Impact
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="px-6 py-2">
                      <div className="space-y-2">
                        <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 dark:text-gray-300">
                          <li>
                            <span className="font-semibold">Security:</span> {item.impact.security}
                          </li>
                          <li>
                            <span className="font-semibold">Compliance:</span> {item.impact.compliance}
                          </li>
                          <li>
                            <span className="font-semibold">Operational:</span> {item.impact.operational}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Recommendations Section */}
              <div className="flex flex-col items-start py-2 px-6 space-y-1 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-none">
                <div className="flex items-center justify-between w-full">
                  <h4 className="text-xs font-semibold">Recommendation:</h4>
                  <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600">
                    Priority: {item.recommendation.priority}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                  {item.recommendation.description}
                </p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-gray-600 dark:text-gray-300">
                  {item.recommendation.steps.map((step) => (
                    <li key={step.id}>{step.step}</li>
                  ))}
                </ol>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  <span className="font-semibold">Expected Outcome:</span> {item.recommendation.expectedOutcome}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ReportCards
