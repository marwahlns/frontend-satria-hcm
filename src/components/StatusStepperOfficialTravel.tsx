import * as React from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturbOn";
import ErrorIcon from "@mui/icons-material/Error";
import { StepIconProps } from "@mui/material/StepIcon";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  StepContent,
} from "@mui/material";

interface StatusStepperProps {
  code: string;
  statusId: number;
  createdDate?: string;
  acceptedDeptHeadDate?: string;
  approvedDivHeadDate?: string;
  approvedDicDivDate?: string;
  approvedDeptHeadHCDate?: string;
  approvedDivHeadHCDate?: string;
  approvedDicHCDate?: string;
  approvedPresdirDate?: string;
  rejectedDate?: string;
  canceledDate?: string;

  acceptedDeptHeadRemark?: string;
  approvedDivHeadRemark?: string;
  approvedDicDivRemark?: string;
  approvedDeptHeadHCRemark?: string;
  approvedDivHeadHCRemark?: string;
  approvedDicHCRemark?: string;
  approvedPresdirRemark?: string;
  rejectedRemark?: string;
  canceledRemark?: string;

  acceptToDeptHead?: string;
  approveToDivHead?: string;
  approveToDicDiv?: string;
  approveToDeptHeadHC?: string;
  approveToDivHeadHC?: string;
  approveToDicDivHC?: string;
  approveToPresdir?: string;
}

interface CustomStepIconProps extends StepIconProps {
  rejected?: string;
  canceled?: boolean;
  label?: string;
}

const CustomStepIcon: React.FC<CustomStepIconProps> = ({
  active,
  completed,
  className,
  icon,
  rejected,
  canceled,
  label,
}) => {
  return (
    <div className={className}>
      {canceled ? (
        <DoNotDisturbIcon color="warning" />
      ) : rejected ? (
        <CancelIcon color="error" />
      ) : label === "Approval Bypassed" ? (
        <ErrorIcon color="disabled" />
      ) : active || completed ? (
        <CheckCircleIcon color="primary" />
      ) : (
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            border: "2px solid gray",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "gray",
            fontSize: 12,
          }}
        >
          {icon}
        </div>
      )}
    </div>
  );
};

const StatusStepper: React.FC<StatusStepperProps> = ({
  code,
  statusId,
  createdDate,
  acceptedDeptHeadDate,
  approvedDivHeadDate,
  approvedDicDivDate,
  approvedDeptHeadHCDate,
  approvedDivHeadHCDate,
  approvedDicHCDate,
  approvedPresdirDate,
  rejectedDate,
  canceledDate,
  acceptedDeptHeadRemark,
  approvedDivHeadRemark,
  approvedDicDivRemark,
  approvedDeptHeadHCRemark,
  approvedDivHeadHCRemark,
  approvedDicHCRemark,
  approvedPresdirRemark,
  rejectedRemark,
  canceledRemark,
  acceptToDeptHead,
  approveToDivHead,
  approveToDicDiv,
  approveToDeptHeadHC,
  approveToDivHeadHC,
  approveToDicDivHC,
  approveToPresdir,
}) => {
  const isDomestic = code.startsWith("TRF2");
  const formattedDateTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = date.toLocaleString("en-US", {
      month: "long",
      timeZone: "UTC",
    });
    const year = date.getUTCFullYear();
    const hour = String(date.getUTCHours()).padStart(2, "0");
    const minute = String(date.getUTCMinutes()).padStart(2, "0");

    return `${day} ${month} ${year} at ${hour}.${minute}`;
  };

  const skipAcceptStep = acceptToDeptHead === approveToDivHead;

  const stepsByStatus = {
    7: ["Submitted", "Cancelled"],
  };

  const defaultSteps = [
    "Submitted",
    "Accepted by Dept. Head",
    "Approved by Div. Head",
    "Approved by DIC Division",
    "Approved by Dept. Head HC",
    "Approved by Div. Head HC",
    "Approved by DIC Division HC",
    "Approved by President Director",
  ];

  let steps;

  if (stepsByStatus[statusId]) {
    steps = stepsByStatus[statusId];
  } else if (isDomestic) {
    steps = [
      "Submitted",
      "Approved By Dept. Head",
      "Approved By Div. Head",
      "Approved By Dept. Head HC",
    ];
  } else {
    steps = defaultSteps;
  }

  const getActiveStep = () => {
    if (statusId === 7) return 1;

    if (statusId === 6 && rejectedDate) {
      const steps = isDomestic
        ? [acceptedDeptHeadDate, approvedDivHeadDate, approvedDeptHeadHCDate]
        : [
            acceptedDeptHeadDate,
            approvedDivHeadDate,
            approvedDicDivDate,
            approvedDeptHeadHCDate,
            approvedDivHeadHCDate,
            approvedDicHCDate,
            approvedPresdirDate,
          ];

      let count = 0;
      for (const step of steps) {
        if (step) count++;
        else break;
      }

      return skipAcceptStep ? 1 : count + 1;
    }
    const stepsByStatus = isDomestic
      ? {
          8: [acceptedDeptHeadDate],
          9: [acceptedDeptHeadDate, approvedDivHeadDate],
          11: [
            acceptedDeptHeadDate,
            approvedDivHeadDate,
            approvedDeptHeadHCDate,
          ],
        }
      : {
          8: [acceptedDeptHeadDate],
          9: [acceptedDeptHeadDate, approvedDivHeadDate],
          10: [acceptedDeptHeadDate, approvedDivHeadDate, approvedDicDivDate],
          11: [
            acceptedDeptHeadDate,
            approvedDivHeadDate,
            approvedDicDivDate,
            approvedDeptHeadHCDate,
          ],
          12: [
            acceptedDeptHeadDate,
            approvedDivHeadDate,
            approvedDicDivDate,
            approvedDeptHeadHCDate,
            approvedDivHeadHCDate,
          ],
          13: [
            acceptedDeptHeadDate,
            approvedDivHeadDate,
            approvedDicDivDate,
            approvedDeptHeadHCDate,
            approvedDivHeadHCDate,
            approvedDicHCDate,
          ],
          14: [
            acceptedDeptHeadDate,
            approvedDivHeadDate,
            approvedDicDivDate,
            approvedDeptHeadHCDate,
            approvedDivHeadHCDate,
            approvedDicHCDate,
            approvedPresdirDate,
          ],
        };

    if (stepsByStatus[statusId]) {
      const steps = stepsByStatus[statusId];
      let count = 0;
      for (const step of steps) {
        if (step) count++;
        else break;
      }
      return count;
    }

    if (skipAcceptStep) {
      if (statusId === 1) return 0;
      if (statusId === 2 || statusId === 3) return 1;
    }

    return statusId - 1;
  };

  const activeStep = getActiveStep();

  const getLabel = (index: number) => {
    if (statusId === 7) {
      if (index === 1) return "Canceled";
      return steps[index];
    }

    if (statusId === 6) {
      if (
        !acceptedDeptHeadDate &&
        rejectedDate &&
        index === (skipAcceptStep ? 1 : 1)
      )
        return "Rejected";
      if (
        acceptedDeptHeadDate &&
        rejectedDate &&
        index === (skipAcceptStep ? 1 : 2)
      )
        return "Rejected";
      if (
        approvedDivHeadDate &&
        rejectedDate &&
        index === (skipAcceptStep ? 1 : 3)
      )
        return "Rejected";
      if (
        approvedDicDivDate &&
        rejectedDate &&
        index === (skipAcceptStep ? 1 : 4)
      )
        return "Rejected";
      if (
        approvedDeptHeadHCDate &&
        rejectedDate &&
        index === (skipAcceptStep ? 1 : 5)
      )
        return "Rejected";
      if (
        approvedDivHeadHCDate &&
        rejectedDate &&
        index === (skipAcceptStep ? 1 : 6)
      )
        return "Rejected";
      if (
        approvedDicHCDate &&
        rejectedDate &&
        index === (skipAcceptStep ? 1 : 7)
      )
        return "Rejected";
      if (
        approvedPresdirDate &&
        rejectedDate &&
        index === (skipAcceptStep ? 1 : 8)
      )
        return "Rejected";
    }

    if (!skipAcceptStep) {
      if (index === 1 && !acceptedDeptHeadDate) {
        if (rejectedDate) return "Approval Bypassed";
        return "Waiting Accepted by Dept. Head";
      }

      if (isDomestic) {
        if (index === 2 && !approvedDivHeadDate) {
          if (rejectedDate) return "Approval Bypassed";
          return "Waiting Approval Div. Head";
        }
        if (index === 3 && !approvedDeptHeadHCDate) {
          if (rejectedDate) return "Approval Bypassed";
          return "Waiting Approval Dept. Head HC";
        }
      } else {
        if (index === 2 && !approvedDivHeadDate) {
          if (rejectedDate) return "Approval Bypassed";
          return "Waiting Approval Div. Head";
        }
        if (index === 3 && !approvedDicDivDate) {
          if (rejectedDate) return "Approval Bypassed";
          return "Waiting Approval DIC Division";
        }
        if (index === 4 && !approvedDeptHeadHCDate) {
          if (rejectedDate) return "Approval Bypassed";
          return "Waiting Approval Dept. Head HC";
        }
        if (index === 5 && !approvedDivHeadHCDate) {
          if (rejectedDate) return "Approval Bypassed";
          return "Waiting Approval Div. Head HC";
        }
        if (index === 6 && !approvedDicHCDate) {
          if (rejectedDate) return "Approval Bypassed";
          return "Waiting Approval DIC Division HC";
        }
        if (index === 7 && !approvedPresdirDate) {
          if (rejectedDate) return "Approval Bypassed";
          return "Waiting Approval President Director";
        }
      }
    } else {
      if (index === 1 && !approvedDivHeadDate) return "Waiting Approval";
    }

    return steps[index];
  };

  const getDateText = (index: number) => {
    if (statusId === 7 && canceledDate) return formattedDateTime(canceledDate);
    if (index === 0 && createdDate) return formattedDateTime(createdDate);

    if (!skipAcceptStep) {
      if (index === 1) {
        if (statusId === 6 && !acceptedDeptHeadDate && rejectedDate)
          return formattedDateTime(rejectedDate);
        if (acceptedDeptHeadDate)
          return formattedDateTime(acceptedDeptHeadDate);
      }
      if (index === 2) {
        if (statusId === 6 && acceptedDeptHeadDate && rejectedDate)
          return formattedDateTime(rejectedDate);
        if (acceptedDeptHeadDate) return formattedDateTime(approvedDivHeadDate);
      }
      if (index === 3) {
        if (statusId === 6 && approvedDivHeadDate && rejectedDate)
          return formattedDateTime(rejectedDate);
        if (approvedDicDivDate) return formattedDateTime(approvedDicDivDate);
      }
      if (index === 4) {
        if (statusId === 6 && approvedDicDivDate && rejectedDate)
          return formattedDateTime(rejectedDate);
        if (approvedDeptHeadHCDate)
          return formattedDateTime(approvedDeptHeadHCDate);
      }
      if (index === 5) {
        if (statusId === 6 && approvedDeptHeadHCDate && rejectedDate)
          return formattedDateTime(rejectedDate);
        if (approvedDivHeadHCDate)
          return formattedDateTime(approvedDivHeadHCDate);
      }
      if (index === 6) {
        if (statusId === 6 && approvedDivHeadHCDate && rejectedDate)
          return formattedDateTime(rejectedDate);
        if (approvedDicHCDate) return formattedDateTime(approvedDicHCDate);
      }
      if (index === 7) {
        if (statusId === 6 && approvedDicHCDate && rejectedDate)
          return formattedDateTime(rejectedDate);
        if (approvedPresdirDate) return formattedDateTime(approvedPresdirDate);
      }
    } else {
      if (index === 1) {
        if (statusId === 6 && rejectedDate)
          return formattedDateTime(rejectedDate);
        if (approvedDivHeadDate) return formattedDateTime(approvedDivHeadDate);
      }
    }
    return "";
  };

  const getRemarkText = (index: number) => {
    if (statusId === 7 && index === 1) {
      return canceledRemark ?? "";
    }

    if (index === 1) {
      if (statusId === 6 && !acceptedDeptHeadDate && rejectedDate) {
        return rejectedRemark ?? "";
      }
      return acceptedDeptHeadRemark ?? "";
    }

    if (index === 2) {
      if (statusId === 6 && acceptedDeptHeadDate && rejectedDate) {
        return rejectedRemark ?? "";
      }
      return approvedDivHeadRemark ?? "";
    }

    if (index === 3) {
      if (isDomestic) {
        if (statusId === 6 && approvedDeptHeadHCDate && rejectedDate) {
          return rejectedRemark ?? "";
        }
        return approvedDeptHeadHCRemark ?? "";
      } else {
        if (statusId === 6 && approvedDicDivDate && rejectedDate) {
          return rejectedRemark ?? "";
        }
        return approvedDicDivRemark ?? "";
      }
    }

    if (index === 4) {
      if (statusId === 6 && approvedDeptHeadHCDate && rejectedDate) {
        return rejectedRemark ?? "";
      }
      return approvedDeptHeadHCRemark ?? "";
    }

    if (index === 5) {
      if (statusId === 6 && approvedDivHeadHCDate && rejectedDate) {
        return rejectedRemark ?? "";
      }
      return approvedDivHeadHCRemark ?? "";
    }

    if (index === 6) {
      if (statusId === 6 && approvedDicHCDate && rejectedDate) {
        return rejectedRemark ?? "";
      }
      return approvedDicHCRemark ?? "";
    }

    if (index === 7) {
      if (statusId === 6 && approvedDicDivDate && rejectedDate) {
        return rejectedRemark ?? "";
      }
      return approvedPresdirRemark ?? "";
    }
    return "";
  };

  const isRejectedStep = (index: number) => {
    return (
      statusId === 6 &&
      ((index === 1 && !acceptedDeptHeadDate && rejectedDate) ||
        (index === 2 && acceptedDeptHeadDate && rejectedDate))
    );
  };

  const isCanceledStep = (index: number) => {
    return statusId === 7 && index === 1;
  };

  return (
    <Box sx={{ maxWidth: 400 }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((_, index) => {
          const label = getLabel(index);
          const dateText = getDateText(index);
          const rejected = isRejectedStep(index);
          const canceled = isCanceledStep(index);

          return (
            <Step key={index} expanded>
              <StepLabel
                StepIconComponent={(iconProps) => (
                  <CustomStepIcon
                    {...iconProps}
                    rejected={rejected}
                    canceled={canceled}
                    label={label}
                  />
                )}
              >
                <Typography>{label}</Typography>
              </StepLabel>
              <StepContent>
                {dateText && (
                  <Typography
                    variant="caption"
                    color={
                      rejected
                        ? "error"
                        : canceled
                        ? "warning"
                        : "text.secondary"
                    }
                  >
                    {dateText}
                  </Typography>
                )}

                {getRemarkText(index) && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontStyle: "italic", mt: 0, display: "block" }}
                  >
                    {getRemarkText(index)}
                  </Typography>
                )}
              </StepContent>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
};

export default StatusStepper;
