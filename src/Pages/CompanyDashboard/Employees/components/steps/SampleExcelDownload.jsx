import * as XLSX from 'xlsx';

export const downloadSampleExcel = () => {
  const sampleData = [
    {
      'First Name': 'Abraham',
      'Last Name': 'Hanson',
      'Email': 'john@company.com',
      'Role': 'carer',
      'Phone': '+44 123 456 7890',
      'Address': '221B Baker Street, London',
      'City': 'London',
      'Postal Code': 'SW1A 1AA',
      'Username': 'johnsmith',
      'Password': 'GeneratedPass123!'
    },
    {
      'First Name': 'EKene-onwon',
      'Last Name': 'Hanson',
      'Email': 'jane@company.com',
      'Role': 'carer',
      'Phone': '+44 234 567 8901',
      'Address': '19 Lever Street, Manchester, M1 1AN',
      'City': 'Manchester',
      'Postal Code': 'M1 1AA',
      'Username': 'janedoe',
      'Password': 'SecurePass456!'
    },
    {
      'First Name': 'Alice',
      'Last Name': 'Johnson',
      'Email': 'alice@company.com',
      'Role': 'admin',
      'Phone': '+44 345 678 9012',
      'Address': '789 Pine Rd',
      'City': 'Birmingham',
      'Postal Code': 'B1 1AA',
      'Username': 'alicejohnson',
      'Password': 'Random789!'
    }
  ];
  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sample Employees');
  XLSX.writeFile(wb, 'sample_employees.xlsx');
};