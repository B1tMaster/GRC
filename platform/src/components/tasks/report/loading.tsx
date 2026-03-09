import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect, useState } from "react"

export function ReportLoading() {
  const [rowCount, setRowCount] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setRowCount((prev) => prev >= 10 ? 1 : prev + 1)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <div className="mb-8 text-center text-lg font-bold">Compliance check in progress...</div>
      <div className="mb-8">
        <Skeleton className="h-8 w-[250px]" />
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <Card className="p-6 flex flex-col items-center justify-center">
          <Skeleton className="w-8 h-8 mb-2 rounded-full" />
          <Skeleton className="h-10 w-[60px] mb-1" />
          <Skeleton className="h-4 w-[80px]" />
        </Card>
        <Card className="p-6 flex flex-col items-center justify-center">
          <Skeleton className="w-8 h-8 mb-2 rounded-full" />
          <Skeleton className="h-10 w-[60px] mb-1" />
          <Skeleton className="h-4 w-[80px]" />
        </Card>
        <Card className="p-6 flex flex-col items-center justify-center">
          <Skeleton className="w-8 h-8 mb-2 rounded-full" />
          <Skeleton className="h-10 w-[60px] mb-1" />
          <Skeleton className="h-4 w-[80px]" />
        </Card>
      </div>

      <Card className="p-6">
        <Skeleton className="h-6 w-[180px] mb-4" />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <Skeleton className="h-4 w-full" />
              </TableHead>
              <TableHead className="w-[150px]">
                <Skeleton className="h-4 w-full" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-full" />
              </TableHead>
              <TableHead className="w-[200px]">
                <Skeleton className="h-4 w-full" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-5 w-5 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-[100px] rounded-md" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-8 flex justify-end gap-4">
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </Card>
    </>
  )
} 