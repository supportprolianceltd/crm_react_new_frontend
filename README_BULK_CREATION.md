# Bulk User and Client Creation Documentation

## Overview
This system provides bulk creation functionality for both employees and clients through Excel file uploads, with comprehensive validation and error handling.

## Features

### Bulk Employee Creation
- **Location**: `src/Pages/CompanyDashboard/Employees/components/steps/BulkUploadEmployees.jsx`
- **API Endpoint**: `/api/user/users/bulk-create/`
- **Supported Fields**: First Name, Last Name, Email, Role, Phone, Address, City, Postal Code, Password
- **Validation**: Duplicate email checking, role validation (staff, carer, hr, admin, co-admin)

### Bulk Client Creation
- **Location**: `src/Pages/CompanyDashboard/Clients/components/steps/BulkUploadClients.jsx`
- **API Endpoint**: `/api/user/clients/bulk-create/`
- **Supported Fields**: Personal info, contact details, address, next of kin, preferred care times
- **Special Features**: Preferred care times with availability scheduling

## Key Components

### 1. Excel Upload Processing
- XLSX file parsing with field mapping
- Automatic data validation and transformation
- Sample Excel templates with valid data examples

### 2. Data Validation
- **Django Model Compliance**: All fields validated against backend model choices
- **User-Friendly Errors**: Technical validation messages converted to actionable guidance
- **Duplicate Detection**: Email uniqueness checking before submission

### 3. Error Handling
- **Partial Success Support**: Handles scenarios where some records succeed and others fail
- **Detailed Error Messages**: Field-specific validation feedback
- **Recovery Guidance**: Clear instructions for fixing validation issues

### 4. UI Components
- **Editable Table**: Inline editing of uploaded data
- **Progress Indicators**: Loading states and submission feedback
- **Modal Interface**: Clean, responsive bulk upload workflow

## Data Formats

### Employee Excel Columns
- First Name, Last Name, Email, Role, Phone, Address, City, Postal Code, Password

### Client Excel Columns
- Title, First Name, Last Name, Gender Identity, Preferred Pronouns, Date of Birth
- Marital Status, NHIS Number, Email, Phone, Alternate Phone
- Primary/Secondary Contacts, Communication Preferences
- Address details, Next of Kin information
- **Preferred Care Times**: JSON format with daily availability schedules

### Preferred Care Times Format
```json
{
  "monday": {"available": true, "start": "07:00", "end": "19:00"},
  "tuesday": {"available": true, "start": "07:00", "end": "19:00"},
  "wednesday": {"available": true, "start": "07:00", "end": "19:00"},
  "thursday": {"available": true, "start": "07:00", "end": "19:00"},
  "friday": {"available": true, "start": "07:00", "end": "15:00"},
  "saturday": {"available": true, "start": "09:00", "end": "13:00"},
  "sunday": {"available": false}
}
```

## API Response Handling

### Success Response
```json
{
  "status": "success",
  "created": [...],
  "message": "Created X users successfully"
}
```

### Partial Success Response
```json
{
  "status": "partial_success",
  "created": [...],
  "errors": [
    {
      "index": 0,
      "email": "user@example.com",
      "errors": {
        "profile": {
          "title": ["\"Ms\" is not a valid choice."]
        }
      }
    }
  ],
  "message": "Created 3 users, 2 failed"
}
```

## Usage Workflow

1. **Download Sample**: Get template with valid data examples
2. **Upload Excel**: Import data with proper column headers
3. **Review & Edit**: Modify data in the editable table interface
4. **Validate**: Automatic duplicate checking and field validation
5. **Submit**: Bulk creation with detailed success/error feedback
6. **Handle Errors**: Fix validation issues and resubmit failed records

## Error Message Examples

### Before (Technical)
```
title: "Ms" is not a valid choice.
gender_identity: "Non-binary" is not a valid choice.
```

### After (User-Friendly)
```
Title 'Ms' is not valid. Please use: Mr, Mrs, Miss, or Dr
Gender Identity 'Non-binary' is not valid. Please use: Male, Female, Non-Binary, Other, or Prefer not to say
```

## Integration Points

- **Employee Page**: `CreateEmployeePage.jsx` - Bulk upload button integration
- **Client Page**: `CreateClientForHealthcarePage.jsx` - Bulk upload modal
- **API Services**: Separate service functions for employees and clients
- **Validation**: Shared validation helpers with field-specific logic

## Security & Performance

- **Permission Checks**: Admin/superuser validation for bulk operations
- **Rate Limiting**: Built-in duplicate checking and validation
- **Error Recovery**: Graceful handling of partial failures
- **Data Sanitization**: Safe JSON parsing and input validation