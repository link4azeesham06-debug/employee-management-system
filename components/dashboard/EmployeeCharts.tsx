"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, ChartNoAxesCombined } from "lucide-react";

import type { Employee } from "@/types/employee";

type Props = {
  employees: Employee[];
};

type DepartmentDatum = { name: string; value: number };
type StatusDatum = { name: Employee["status"]; employees: number };

const DEPARTMENT_COLORS = [
  "#4f46e5",
  "#818cf8",
  "#059669",
  "#d97706",
  "#64748b",
];

const STATUS_COLORS: Record<Employee["status"], string> = {
  Active: "#059669",
  "On Leave": "#d97706",
  Inactive: "#dc2626",
};

const tooltipStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  boxShadow: "0 10px 30px rgb(15 23 42 / 0.1)",
  color: "#0f172a",
  fontSize: "12px",
};

export default function EmployeeCharts({ employees }: Props) {
  const departmentData = Object.values(
    employees.reduce<Record<string, DepartmentDatum>>((accumulator, employee) => {
      accumulator[employee.department] ??= {
        name: employee.department,
        value: 0,
      };
      accumulator[employee.department].value += 1;
      return accumulator;
    }, {})
  ).sort((first, second) => second.value - first.value);

  const statusData = Object.values(
    employees.reduce<Record<string, StatusDatum>>((accumulator, employee) => {
      accumulator[employee.status] ??= {
        name: employee.status,
        employees: 0,
      };
      accumulator[employee.status].employees += 1;
      return accumulator;
    }, {})
  );

  const totalEmployees = employees.length;

  return (
    <section aria-labelledby="analytics-title">
      <div className="mb-4">
        <h2 id="analytics-title" className="text-xl font-bold text-slate-900">
          Workforce analytics
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Current headcount distribution based on employee records.
        </p>
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-5">
        <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900">Employees by department</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Share of total workforce by team
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-100">
              <ChartNoAxesCombined size={19} aria-hidden="true" />
            </div>
          </div>

          {departmentData.length === 0 ? (
            <ChartEmptyState />
          ) : (
            <div className="mt-4 grid min-w-0 items-center gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(10rem,0.65fr)]">
              <div
                className="h-[250px] min-w-0 sm:h-[280px]"
                role="img"
                aria-label={`Department distribution for ${totalEmployees} employees`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="57%"
                      outerRadius="82%"
                      paddingAngle={3}
                      stroke="none"
                    >
                      {departmentData.map((department, index) => (
                        <Cell
                          key={department.name}
                          fill={DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <ul className="space-y-3" aria-label="Department totals">
                {departmentData.map((department, index) => (
                  <li key={department.name} className="flex items-center gap-2.5 text-sm">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length],
                      }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate text-slate-600">
                      {department.name}
                    </span>
                    <span className="font-semibold tabular-nums text-slate-900">
                      {department.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>

        <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900">Employment status</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Active, leave, and inactive headcount
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200">
              <BarChart3 size={19} aria-hidden="true" />
            </div>
          </div>

          {statusData.length === 0 ? (
            <ChartEmptyState />
          ) : (
            <div
              className="mt-6 h-[280px] min-w-0"
              role="img"
              aria-label={`Employment status breakdown for ${totalEmployees} employees`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />
                  <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={tooltipStyle} />
                  <Bar dataKey="employees" radius={[8, 8, 0, 0]} maxBarSize={56}>
                    {statusData.map((status) => (
                      <Cell key={status.name} fill={STATUS_COLORS[status.name]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

function ChartEmptyState() {
  return (
    <div className="mt-5 flex h-[260px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm text-slate-500">
      Analytics will appear when employee records are available.
    </div>
  );
}
