"use client";

import { useMemo, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import toast from "react-hot-toast";
import { getUserErrorMessage } from "@/lib/errors/normalizeError";
import Swal from "sweetalert2";

import { Employee } from "@/types/employee";
import { useEmployees } from "@/hooks/useEmployees";

import { filterEmployees } from "@/utils/employeeFilters";
import { sortEmployees } from "@/utils/employeeSort";
import { exportEmployeesToCSV } from "@/utils/exportEmployees";

import SearchBar from "@/components/employee/SearchBar";
import FilterDrawer from "@/components/employee/FilterDrawer";
import EmployeeTable from "@/components/employee/EmployeeTable";
import EmployeeModal from "@/components/employee/EmployeeModal";
import EmployeeForm from "@/components/employee/EmployeeForm";

import Pagination from "@/components/employee/Pagination";
import LoadingSkeleton from "@/components/employee/LoadingSkeleton";
import EmptyState from "@/components/employee/EmptyState";
import BulkActions from "@/components/employee/BulkActions";
import { usePermissions } from "@/hooks/usePermissions";
import { Plus, Users } from "lucide-react";

export default function EmployeesPage() {
  /*
   * ----------------------------------------------------
   * EMPLOYEE CONTEXT
   * ----------------------------------------------------
   */

  const { employees, loading, createEmployee, editEmployee, removeEmployee } =
    useEmployees();
  const {
    canCreateEmployee,
    canEditEmployee,
    canDeleteEmployee,
    employeeEmail,
    employeeRecordId,
  } = usePermissions();
  const canManageEmployees =
    canCreateEmployee && canEditEmployee && canDeleteEmployee;

  /*
   * ----------------------------------------------------
   * UI STATE
   * ----------------------------------------------------
   */

  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [openModal, setOpenModal] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);

  const [search, setSearch] = useState("");

  const [selectedDepartment, setSelectedDepartment] = useState("All");

  const [selectedStatus, setSelectedStatus] = useState("All");

  const [sortColumn, setSortColumn] = useState<keyof Employee>("name");

  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  /*
   * ----------------------------------------------------
   * CONSTANTS
   * ----------------------------------------------------
   */

  const employeesPerPage = 8;

  /*
   * ----------------------------------------------------
   * DEPARTMENTS
   * ----------------------------------------------------
   */

  const visibleEmployees = useMemo(
    () =>
      canManageEmployees
        ? employees
        : employees.filter(
            (employee) =>
              employee.id === employeeRecordId ||
              employee.email.toLowerCase() === employeeEmail.toLowerCase(),
          ),
    [canManageEmployees, employeeEmail, employeeRecordId, employees],
  );

  const departments = useMemo(() => {
    const uniqueDepartments = Array.from(
      new Set(visibleEmployees.map((employee) => employee.department)),
    );

    return ["All", ...uniqueDepartments];
  }, [visibleEmployees]);

  /*
   * ----------------------------------------------------
   * STATUSES
   * ----------------------------------------------------
   */

  const statuses = ["All", "Active", "On Leave", "Inactive"];

  /*
   * ----------------------------------------------------
   * FILTER EMPLOYEES
   * ----------------------------------------------------
   */

  const filteredEmployees = useMemo(() => {
    return filterEmployees(visibleEmployees, {
      search,
      department: selectedDepartment,
      status: selectedStatus,
    });
  }, [visibleEmployees, search, selectedDepartment, selectedStatus]);

  /*
   * ----------------------------------------------------
   * SORT EMPLOYEES
   * ----------------------------------------------------
   */

  const sortedEmployees = useMemo(() => {
    return sortEmployees(filteredEmployees, sortColumn, sortDirection);
  }, [filteredEmployees, sortColumn, sortDirection]);

  /*
   * ----------------------------------------------------
   * PAGINATION
   * ----------------------------------------------------
   */

  const totalPages = Math.max(
    1,
    Math.ceil(sortedEmployees.length / employeesPerPage),
  );

  const activeFilterCount =
    Number(selectedDepartment !== "All") + Number(selectedStatus !== "All");

  const currentEmployees = useMemo(() => {
    const start = (currentPage - 1) * employeesPerPage;

    const end = start + employeesPerPage;

    return sortedEmployees.slice(start, end);
  }, [sortedEmployees, currentPage]);

  /*
   * ----------------------------------------------------
   * RESET PAGE WHEN FILTERS CHANGE
   * ----------------------------------------------------
   */

  function handleSearchChange(value: string) {
    setSearch(value);

    setCurrentPage(1);
  }

  function handleDepartmentChange(value: string) {
    setSelectedDepartment(value);

    setCurrentPage(1);
  }

  function handleStatusChange(value: string) {
    setSelectedStatus(value);

    setCurrentPage(1);
  }

  /*
   * ----------------------------------------------------
   * CLEAR SEARCH
   * ----------------------------------------------------
   */

  function handleClearSearch() {
    setSearch("");

    setCurrentPage(1);
  }

  /*
   * ----------------------------------------------------
   * RESET FILTERS
   * ----------------------------------------------------
   */

  function handleResetFilters() {
    setSelectedDepartment("All");

    setSelectedStatus("All");

    setSearch("");

    setCurrentPage(1);
  }

  /*
   * ----------------------------------------------------
   * SORT
   * ----------------------------------------------------
   */

  function handleSort(column: keyof Employee) {
    if (sortColumn === column) {
      setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);

      setSortDirection("asc");
    }
  }

  /*
   * ----------------------------------------------------
   * OPEN ADD MODAL
   * ----------------------------------------------------
   */

  function handleOpenAdd() {
    if (!canCreateEmployee) return;
    setEditingEmployee(null);

    setOpenModal(true);
  }

  /*
   * ----------------------------------------------------
   * OPEN EDIT MODAL
   * ----------------------------------------------------
   */

  function handleOpenEdit(employee: Employee) {
    if (!canEditEmployee) return;
    setEditingEmployee(employee);

    setOpenModal(true);
  }

  /*
   * ----------------------------------------------------
   * CLOSE MODAL
   * ----------------------------------------------------
   */

  function handleCloseModal() {
    setOpenModal(false);

    setEditingEmployee(null);
  }

  /*
   * ----------------------------------------------------
   * CREATE EMPLOYEE
   * ----------------------------------------------------
   */

  async function handleAddEmployee(employee: Omit<Employee, "id">) {
    if (!canCreateEmployee) return;
    try {
      await createEmployee(employee);

      toast.success("Employee added successfully");

      handleCloseModal();
    } catch (error) {
      toast.error(getUserErrorMessage(error, "Failed to add employee"));
    }
  }

  /*
   * ----------------------------------------------------
   * UPDATE EMPLOYEE
   * ----------------------------------------------------
   */

  async function handleUpdateEmployee(employee: Employee) {
    if (!canEditEmployee) return;
    try {
      await editEmployee(employee);

      toast.success("Employee updated successfully");

      handleCloseModal();
    } catch (error) {
      toast.error(getUserErrorMessage(error, "Failed to update employee"));
    }
  }

  /*
   * ----------------------------------------------------
   * DELETE EMPLOYEE
   * ----------------------------------------------------
   */

  async function handleDeleteEmployee(id: string) {
    if (!canDeleteEmployee) return;
    const result = await Swal.fire({
      title: "Delete Employee?",

      text: "This action cannot be undone.",

      icon: "warning",

      showCancelButton: true,

      confirmButtonColor: "#dc2626",

      cancelButtonColor: "#64748b",

      confirmButtonText: "Delete",

      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await removeEmployee(id);

      setSelectedEmployees((previous) =>
        previous.filter((employeeId) => employeeId !== id),
      );

      toast.success("Employee deleted successfully");
    } catch (error) {
      toast.error(getUserErrorMessage(error, "Failed to delete employee"));
    }
  }

  /*
   * ----------------------------------------------------
   * EXPORT
   * ----------------------------------------------------
   */

  function handleExport() {
    if (!canManageEmployees) return;

    if (!sortedEmployees.length) {
      toast.error("There are no employees to export.");

      return;
    }

    exportEmployeesToCSV(sortedEmployees);

    toast.success("Employee data exported successfully");
  }

  /*
   * ----------------------------------------------------
   * BULK DELETE
   * ----------------------------------------------------
   */

  async function handleBulkDelete() {
    if (!canDeleteEmployee) return;
    if (!selectedEmployees.length) {
      return;
    }

    const result = await Swal.fire({
      title: "Delete selected employees?",

      text: `${selectedEmployees.length} employee(s) will be deleted.`,

      icon: "warning",

      showCancelButton: true,

      confirmButtonColor: "#dc2626",

      confirmButtonText: "Delete",

      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      for (const employeeId of selectedEmployees) {
        await removeEmployee(employeeId);
      }

      setSelectedEmployees([]);

      toast.success("Selected employees deleted successfully");
    } catch (error) {
      toast.error(getUserErrorMessage(error, "Some employees could not be deleted"));
    }
  }

  /*
   * ----------------------------------------------------
   * SELECTION
   * ----------------------------------------------------
   */

  function handleClearSelection() {
    setSelectedEmployees([]);
  }

  /*
   * ----------------------------------------------------
   * LOADING STATE
   * ----------------------------------------------------
   */
  if (loading) {
    return (
      <ProtectedRoute>
        <LoadingSkeleton />
      </ProtectedRoute>
    );
  } /*
   * ----------------------------------------------------
   * PAGE
   * ----------------------------------------------------
   */

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* ==========================================
          PAGE HEADER
          ========================================== */}

        <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
              People Management
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Employees
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {canManageEmployees
                ? "Manage employee records, roles, departments and employment status from one place."
                : "Review your employee record and employment information."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm">
              <Users size={17} className="text-indigo-600" aria-hidden="true" />
              {visibleEmployees.length} employee{visibleEmployees.length === 1 ? "" : "s"}
            </div>

            {canCreateEmployee && (<button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              <Plus size={18} aria-hidden="true" /> Add employee
            </button>)}
          </div>
        </section>

        {/* ==========================================
          SEARCH
          ========================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <SearchBar
            search={search}
            resultCount={sortedEmployees.length}
            activeFilterCount={activeFilterCount}
            canExport={canManageEmployees}
            onSearchChange={handleSearchChange}
            onOpenFilters={() => setFilterOpen(true)}
            onClear={handleClearSearch}
            onExport={handleExport}
            onResetFilters={handleResetFilters}
          />
        </section>

        {/* ==========================================
          BULK ACTIONS
          ========================================== */}

        {canManageEmployees && (<BulkActions
          selectedCount={selectedEmployees.length}
          onDelete={handleBulkDelete}
          onExport={handleExport}
          onClear={handleClearSelection}
        />)}

        {/* ==========================================
          EMPLOYEE TABLE
          ========================================== */}

        {sortedEmployees.length === 0 ? (
          <EmptyState search={search} hasFilters={activeFilterCount > 0} onClear={handleResetFilters} />
        ) : (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <EmployeeTable
              employees={currentEmployees}
              editEmployee={handleOpenEdit}
              deleteEmployee={handleDeleteEmployee}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              canManage={canManageEmployees}
              selectedIds={selectedEmployees}
              onSelectionChange={setSelectedEmployees}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </section>
        )}

        {/* ==========================================
          EMPLOYEE MODAL
          ========================================== */}

        {openModal && (
          <EmployeeModal
            onClose={handleCloseModal}
            title={editingEmployee ? "Edit employee" : "Add employee"}
            description={editingEmployee ? "Update this employee's profile and employment details." : "Create a new employee record for your organization."}
          >
            <EmployeeForm
              addEmployee={handleAddEmployee}
              updateEmployee={handleUpdateEmployee}
              editingEmployee={editingEmployee}
              onCancel={handleCloseModal}
            />
          </EmployeeModal>
        )}

        {/* ==========================================
          FILTER DRAWER
          ========================================== */}

        <FilterDrawer
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          departments={departments}
          statuses={statuses}
          selectedDepartment={selectedDepartment}
          selectedStatus={selectedStatus}
          onDepartmentChange={handleDepartmentChange}
          onStatusChange={handleStatusChange}
          onReset={handleResetFilters}
        />
      </div>
    </ProtectedRoute>
  );
}
