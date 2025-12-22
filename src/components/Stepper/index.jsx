import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { styled, useTheme } from "@mui/material/styles";
import "./styles.css";

const StyledStepLabel = styled(StepLabel)(({ theme }) => ({
  "& .MuiStepLabel-label": {
    fontFamily: "'Poppins', sans-serif",
    // whiteSpace: "nowrap",
    overflow: "visible",
    "&.Mui-active": {
      fontWeight: 600,
    },
    "&.Mui-completed": {
      fontWeight: 500,
    },
  },
  "& .MuiStepLabel-labelContainer": {
    display: "flex",
    flexDirection: "column",
  },
}));

const ResponsiveStepperContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  overflowX: "auto",
  paddingBottom: theme.spacing(1),
}));

export default function HorizontalLinearAlternativeLabelStepper({
  steps,
  activeStep = 1,
  stepValidity,
  onStepClick,
}) {
  const theme = useTheme();

  return (
    <ResponsiveStepperContainer>
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        sx={{
          minWidth: "fit-content",
          padding: 2,
        }}
      >
        {steps.map((step, index) => (
          <Step
            key={step.title || step}
            sx={{
              cursor:
                index <= activeStep || stepValidity[index]
                  ? "pointer"
                  : "default",
              padding: "0 15px",
            }}
            onClick={() =>
              (index <= activeStep || stepValidity[index]) && onStepClick(index)
            }
          >
            <StyledStepLabel
              StepIconProps={{
                sx: {
                  "&.Mui-completed": {
                    color: "#7226FF",
                  },
                  "&.Mui-active": {
                    color: "#7226FF",
                  },
                  "&.Mui-disabled": {
                    color: "#BDBDBD",
                  },
                },
              }}
            >
              <div className="step-title">{step.title || step}</div>
              {step.subtitle && (
                <div className="step-subtitle">{step.subtitle}</div>
              )}
            </StyledStepLabel>
          </Step>
        ))}
      </Stepper>
    </ResponsiveStepperContainer>
  );
}
