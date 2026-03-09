import React, { useState, createContext, useContext, ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button'
import { 
  ChevronRight, 
  ChevronLeft, 
  Check 
} from 'lucide-react';

// Define types for our context and component props
interface WizardStep {
  id: string;
  label: string;
  content: ReactNode;
  isValid?: () => boolean;
}

interface WizardContextType {
  currentStep: number;
  totalSteps: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (stepIndex: number) => void;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

// Wizard Provider Component
interface WizardProviderProps {
  children: ReactNode;
  steps: WizardStep[];
  onComplete?: () => void;
}

export const WizardProvider: React.FC<WizardProviderProps> = ({ 
  children, 
  steps, 
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      // Check if current step is valid before moving
      const currentStepObj = steps[currentStep];
      if (!currentStepObj.isValid || currentStepObj.isValid()) {
        setCurrentStep(prev => prev + 1);
      }
    } else if (onComplete) {
      onComplete();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  const contextValue = {
    currentStep,
    totalSteps: steps.length,
    goToNextStep,
    goToPreviousStep,
    goToStep
  };

  return (
    <WizardContext.Provider value={contextValue}>
      {children}
    </WizardContext.Provider>
  );
};

// Custom hook to use Wizard context
export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
};

// Stepper Navigation Component
interface StepperNavigationProps {
  steps: WizardStep[];
}

export const StepperNavigation: React.FC<StepperNavigationProps> = ({ steps }) => {
  const { currentStep, goToStep } = useWizard();

  return (
    <div className="flex items-center justify-center space-x-2 mb-6">
      {steps.map((step, index) => (
        <button
          key={step.id}
          onClick={() => goToStep(index)}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center
            transition-all duration-300 ease-in-out
            ${index <= currentStep 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-secondary text-secondary-foreground border border-muted-foreground'}
            ${index === currentStep 
              ? 'ring-2 ring-primary ring-offset-2' 
              : ''}
            hover:bg-primary/90
          `}
        >
          {index < currentStep ? <Check size={20} /> : index + 1}
        </button>
      ))}
    </div>
  );
};

// Wizard Content Component
interface WizardContentProps {
  steps: WizardStep[];
}

export const WizardContent: React.FC<WizardContentProps> = ({ steps }) => {
  const { currentStep, goToNextStep, goToPreviousStep, totalSteps } = useWizard();

  const CurrentStepComponent = steps[currentStep].content;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
        {CurrentStepComponent}
      </div>
      
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={goToPreviousStep}
          disabled={currentStep === 0}
          className="flex items-center"
        >
          <ChevronLeft className="mr-2" /> Previous
        </Button>
        
        <Button 
          onClick={goToNextStep}
          className="flex items-center"
        >
          {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
          <ChevronRight className="ml-2" />
        </Button>
      </div>
    </div>
  );
};

export const WizardExample: React.FC = () => {
  const steps: WizardStep[] = [
    {
      id: 'personal-info',
      label: 'Personal Info',
      content: (
        <div className="flex justify-center">
          <div>
            <Label htmlFor="picture">File</Label>
            <Input id="picture" type="file" />
          </div>
        </div>
      ),
      isValid: () => true // Add your validation logic
    },
    {
      id: 'address',
      label: 'Address',
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">Address Details</h2>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Street Address" 
              className="w-full p-2 border rounded"
            />
            <input 
              type="text" 
              placeholder="City" 
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      ),
      isValid: () => true // Add your validation logic
    },
    {
      id: 'confirmation',
      label: 'Confirmation',
      content: (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Confirmation</h2>
          <p>Thank you for completing the wizard!</p>
        </div>
      )
    },
    {
      id: 'confirmation2',
      label: 'Confirmation 2',
      content: (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Confirmation 2</h2>
          <p>Thank you for completing the wizard!</p>
        </div>
      )
    }
  ];

  const handleWizardComplete = () => {
    alert('Wizard completed!');
  };

  return (
    <WizardProvider steps={steps} onComplete={handleWizardComplete}>
      {/* <div className="p-6 bg-background rounded-lg shadow-md"> */}
        <StepperNavigation steps={steps} />
        <WizardContent steps={steps} />
      {/* </div> */}
    </WizardProvider>
  );
};