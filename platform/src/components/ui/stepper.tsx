import { cn } from "@/lib/utils";

import { useTask } from "@/lib/providers/task-provider";

export function Stepper({ className }: { className?: string }) {
  const { step, stepsCount, steps } = useTask()
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between relative">
        {/* Horizontal connecting lines */}
        <div className="absolute top-4 left-0 w-full h-[2px] bg-secondary" />
        <div 
          className="absolute top-4 left-0 h-[2px] bg-primary transition-all duration-300" 
          style={{ 
            width: `${((step - 1) / (stepsCount - 1)) * 100}%`,
          }} 
        />
        
        {/* Steps */}
        <div className="w-full flex justify-between">
          {Array.from({ length: stepsCount }).map((_, index) => (
            <div key={index} className="flex-1 flex flex-col items-center relative z-10">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors bg-white border-2",
                  step === index + 1
                    ? "border-primary bg-primary text-primary-foreground"
                    : index + 1 < step
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-secondary bg-white text-secondary-foreground"
                )}
              >
                {index + 1}
              </div>
              {steps.map(step => step.label) && (
                <span
                  className={cn(
                    "text-sm font-medium mt-2 text-center w-full px-2",
                    step === index + 1
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {steps.map(step => step.label)[index]}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 