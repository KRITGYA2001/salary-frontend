/** Error envelope returned by the backend for every non-2xx response. */
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}

export interface Country {
  code: string;
  name: string;
  currencyCode: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface JobTitle {
  id: number;
  title: string;
  departmentId: number;
}

export interface FilterOptions {
  countries: Country[];
  departments: Department[];
  jobTitles: JobTitle[];
}

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT';

export interface Employee {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  departmentId: number;
  department: string;
  jobTitleId: number;
  jobTitle: string;
  countryCode: string;
  countryName: string;
  currency: string;
  employmentType: EmploymentType;
  salary: number;
  salaryUsd: number;
  hireDate: string;
  status: EmployeeStatus;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}
