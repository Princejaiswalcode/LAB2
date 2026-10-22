#!/bin/bash
# Run this before every command whose screenshot you submit.
echo "=== STUDENT IDENTITY VERIFICATION ==="
aws sts get-caller-identity --query "{Account:Account, Arn:Arn}" --output table
echo "Student: Prince Jaiswal | Enrollment: PU02424EUG10032 | OS User: $(whoami) | Host: $(hostname) | Date: $(date)"
