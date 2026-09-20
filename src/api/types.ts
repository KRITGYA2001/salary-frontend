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
