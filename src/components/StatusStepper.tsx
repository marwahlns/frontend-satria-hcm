import * as React from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { StepIconProps } from '@mui/material/StepIcon';
import {
    Box,
    Stepper,
    Step,
    StepLabel,
    Typography,
    StepContent
} from '@mui/material';

interface StatusStepperProps {
    statusId: number;
    createdDate?: string;
    acceptedDate?: string;
    approvedDate?: string;
    rejectedDate?: string;
    acceptedRemark?: string;
    approvedRemark?: string;
    rejectedRemark?: string;
    acceptTo?: string;
    approveTo?: string;
}

interface CustomStepIconProps extends StepIconProps {
    rejected?: string;
}

const CustomStepIcon: React.FC<CustomStepIconProps> = ({ active, completed, className, icon, rejected }) => {
    return (
        <div className={className}>
            {rejected ? (
                <CancelIcon color="error" />
            ) : (active || completed) ? (
                <CheckCircleIcon color="primary" />
            ) : (
                <div
                    style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        border: '2px solid gray',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'gray',
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
    statusId,
    createdDate,
    acceptedDate,
    approvedDate,
    rejectedDate,
    acceptedRemark,
    approvedRemark,
    rejectedRemark,
    acceptTo,
    approveTo
}) => {
    const formattedDateTime = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);

        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = date.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
        const year = date.getUTCFullYear();
        const hour = String(date.getUTCHours()).padStart(2, '0');
        const minute = String(date.getUTCMinutes()).padStart(2, '0');

        return `${day} ${month} ${year} at ${hour}.${minute}`;
    };

    const skipAcceptStep = acceptTo === approveTo;
    const steps = skipAcceptStep ? ['Submitted', 'Approved'] : ['Submitted', 'Accepted', 'Approved'];


    const getActiveStep = () => {
        if (statusId === 6) {
            if (!acceptedDate && rejectedDate) return skipAcceptStep ? 1 : 1;
            if (acceptedDate && rejectedDate) return skipAcceptStep ? 1 : 2;
        }
    
        if (skipAcceptStep) {
            if (statusId === 1) return 0;
            if (statusId === 2 || statusId === 3) return 1;
        }
    
        return statusId - 1;
    };    

    const activeStep = getActiveStep();

    const getLabel = (index: number) => {
        if (statusId === 6) {
            if (!acceptedDate && rejectedDate && index === (skipAcceptStep ? 1 : 1)) return 'Rejected';
            if (acceptedDate && rejectedDate && index === (skipAcceptStep ? 1 : 2)) return 'Rejected';
        }
    
        if (!skipAcceptStep) {
            if (index === 1 && !acceptedDate) return 'Waiting Accepted';
            if (index === 2 && !approvedDate) return 'Waiting Approval';
        } else {
            if (index === 1 && !approvedDate) return 'Waiting Approval';
        }
    
        return steps[index];
    };    

    const getDateText = (index: number) => {
        if (index === 0 && createdDate) return formattedDateTime(createdDate);
    
        if (!skipAcceptStep) {
            if (index === 1) {
                if (statusId === 6 && !acceptedDate && rejectedDate) return formattedDateTime(rejectedDate);
                if (acceptedDate) return formattedDateTime(acceptedDate);
            }
            if (index === 2) {
                if (statusId === 6 && acceptedDate && rejectedDate) return formattedDateTime(rejectedDate);
                if (approvedDate) return formattedDateTime(approvedDate);
            }
        } else {
            if (index === 1) {
                if (statusId === 6 && rejectedDate) return formattedDateTime(rejectedDate);
                if (approvedDate) return formattedDateTime(approvedDate);
            }
        }
    
        return '';
    };    

    const getRemarkText = (index: number) => {
        if (index === 1) {
            if (statusId === 6 && !acceptedDate && rejectedDate) {
                return rejectedRemark ?? "";
            }
            return acceptedRemark ?? "";
        }
        if (index === 2) {
            if (statusId === 6 && acceptedDate && rejectedDate) {
                return rejectedRemark ?? "";
            }
            return approvedRemark ?? "";
        }

        return "";
    };

    const isRejectedStep = (index: number) => {
        return statusId === 6 && (
            (index === 1 && !acceptedDate && rejectedDate) ||
            (index === 2 && acceptedDate && rejectedDate)
        );
    };

    return (
        <Box sx={{ maxWidth: 400 }}>
            <Stepper activeStep={activeStep} orientation="vertical" >
                {steps.map((_, index) => {
                    const label = getLabel(index);
                    const dateText = getDateText(index);
                    const rejected = isRejectedStep(index);

                    return (
                        <Step key={index} expanded>
                            <StepLabel
                                StepIconComponent={(iconProps) => (
                                    <CustomStepIcon {...iconProps} rejected={rejected} />
                                )}
                            >
                                <Typography>{label}</Typography>
                            </StepLabel>
                            <StepContent>
                                {dateText && (
                                    <Typography
                                        variant="caption"
                                        color={rejected ? 'error' : 'text.secondary'}
                                    >
                                        {dateText}
                                    </Typography>
                                )}

                                {getRemarkText(index) && (
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ fontStyle: 'italic', mt: 0, display: 'block' }}
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
