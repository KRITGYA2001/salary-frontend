import {
  Box,
  Chip,
  Link,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import type { Employee, PageResponse } from '../../api/types';
import { colors } from '../../theme/tokens';
import { formatDate, formatMoney, formatUsd } from '../../utils/format';
import { type EmployeeFilters, PAGE_SIZE_OPTIONS, type SortField } from './employeeFilters';

interface EmployeeTableProps {
  page: PageResponse<Employee> | undefined;
  filters: EmployeeFilters;
  loading: boolean;
  refreshing: boolean;
  onChange: (changes: Partial<EmployeeFilters>) => void;
}

interface Column {
  label: string;
  sortField?: SortField;
  align?: 'right';
}

const COLUMNS: readonly Column[] = [
  { label: 'Employee', sortField: 'name' },
  { label: 'Role' },
  { label: 'Country', sortField: 'country' },
  { label: 'Salary', sortField: 'salary', align: 'right' },
  { label: 'Hired', sortField: 'hireDate' },
  { label: 'Status' },
];

const SKELETON_ROW_COUNT = 8;

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, row) => (
        <TableRow key={row}>
          {COLUMNS.map((column) => (
            <TableCell key={column.label}>
              <Skeleton variant="text" width={column.label === 'Employee' ? 160 : 90} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function EmployeeRow({ employee }: { employee: Employee }) {
  const isActive = employee.status === 'ACTIVE';
  return (
    <TableRow hover>
      <TableCell>
        <Link
          component={RouterLink}
          to={`/employees/${employee.id}`}
          underline="hover"
          sx={{ fontWeight: 600, color: 'text.primary' }}
        >
          {employee.fullName}
        </Link>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {employee.employeeCode} · {employee.email}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography>{employee.jobTitle}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {employee.department}
        </Typography>
      </TableCell>
      <TableCell>{employee.countryName}</TableCell>
      <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
        <Typography sx={{ fontWeight: 600 }}>{formatMoney(employee.salary, employee.currency)}</Typography>
        {employee.currency !== 'USD' && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {formatUsd(employee.salaryUsd)}
          </Typography>
        )}
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(employee.hireDate)}</TableCell>
      <TableCell>
        <Chip
          size="small"
          label={isActive ? 'Active' : 'Inactive'}
          sx={{
            bgcolor: isActive ? colors.accentSoft : colors.paperDeep,
            color: isActive ? colors.accent : colors.inkMuted,
            fontWeight: 600,
          }}
        />
      </TableCell>
    </TableRow>
  );
}

export function EmployeeTable({ page, filters, loading, refreshing, onChange }: EmployeeTableProps) {
  const toggleSort = (field: SortField) => {
    const isSameField = filters.sort === field;
    onChange({ sort: field, direction: isSameField && filters.direction === 'asc' ? 'desc' : 'asc' });
  };

  return (
    <Paper sx={{ overflow: 'hidden', opacity: refreshing ? 0.7 : 1, transition: 'opacity 150ms' }}>
      <TableContainer>
        <Table aria-label="Employees" aria-busy={loading || refreshing} sx={{ minWidth: 860 }}>
          <TableHead>
            <TableRow>
              {COLUMNS.map((column) => (
                <TableCell
                  key={column.label}
                  align={column.align}
                  sortDirection={filters.sort === column.sortField ? filters.direction : false}
                >
                  {column.sortField ? (
                    <TableSortLabel
                      active={filters.sort === column.sortField}
                      direction={filters.sort === column.sortField ? filters.direction : 'asc'}
                      onClick={() => toggleSort(column.sortField!)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <SkeletonRows />
            ) : (
              page?.items.map((employee) => <EmployeeRow key={employee.id} employee={employee} />)
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ borderTop: `1px solid ${colors.line}` }}>
        <TablePagination
          component="div"
          count={page?.totalItems ?? 0}
          page={page ? Math.min(page.page, Math.max(page.totalPages - 1, 0)) : 0}
          rowsPerPage={filters.size}
          rowsPerPageOptions={[...PAGE_SIZE_OPTIONS]}
          onPageChange={(_, nextPage) => onChange({ page: nextPage })}
          onRowsPerPageChange={(event) => onChange({ size: Number(event.target.value) })}
          labelRowsPerPage="Rows"
        />
      </Box>
    </Paper>
  );
}
