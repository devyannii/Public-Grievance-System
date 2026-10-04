import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Edit3,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../lib/supabaseClient";
import AdminLayout from "../../components/layout/AdminLayout";

import "../../styles/AdminDepartments.css";

function AdminDepartments() {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [complaintCounts, setComplaintCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  // =========================================================
  // LOAD DEPARTMENTS
  // =========================================================

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error: departmentsError } = await supabase
        .from("departments")
        .select("id, name, description, is_active, created_at")
        .order("created_at", { ascending: true });

      if (departmentsError) {
        throw departmentsError;
      }

      setDepartments(data || []);

      // -------------------------------------------------------
      // Load real complaint counts for each department
      // -------------------------------------------------------

      if (data && data.length > 0) {
        const departmentIds = data.map((department) => department.id);

        const { data: complaints, error: complaintsError } =
          await supabase
            .from("complaints")
            .select("department_id")
            .in("department_id", departmentIds);

        if (complaintsError) {
          console.warn(
            "Could not load complaint counts:",
            complaintsError
          );
          setComplaintCounts({});
        } else {
          const counts = {};

          departmentIds.forEach((id) => {
            counts[id] = 0;
          });

          (complaints || []).forEach((complaint) => {
            if (complaint.department_id) {
              counts[complaint.department_id] =
                (counts[complaint.department_id] || 0) + 1;
            }
          });

          setComplaintCounts(counts);
        }
      } else {
        setComplaintCounts({});
      }
    } catch (err) {
      console.error("Department loading error:", err);
      setError(
        err.message || "Unable to load departments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  // =========================================================
  // FILTER
  // =========================================================

  const filteredDepartments = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return departments.filter((department) => {
      const matchesSearch =
        !searchValue ||
        department.name?.toLowerCase().includes(searchValue) ||
        department.description
          ?.toLowerCase()
          .includes(searchValue);

      const matchesFilter =
        filter === "All" ||
        (filter === "Active" && department.is_active) ||
        (filter === "Inactive" && !department.is_active);

      return matchesSearch && matchesFilter;
    });
  }, [departments, search, filter]);

  // =========================================================
  // MODAL
  // =========================================================

  const openAddModal = () => {
    setEditingDepartment(null);

    setForm({
      name: "",
      description: "",
      is_active: true,
    });

    setError("");
    setModalOpen(true);
  };

  const openEditModal = (department) => {
    setEditingDepartment(department);

    setForm({
      name: department.name || "",
      description: department.description || "",
      is_active: department.is_active ?? true,
    });

    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingDepartment(null);

    setForm({
      name: "",
      description: "",
      is_active: true,
    });

    setError("");
  };

  // =========================================================
  // SAVE
  // =========================================================

  const handleSave = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      setError("Department name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingDepartment) {
        const { data, error: updateError } = await supabase
          .from("departments")
          .update({
            name,
            description,
            is_active: form.is_active,
          })
          .eq("id", editingDepartment.id)
          .select("id, name, description, is_active, created_at")
          .single();

        if (updateError) {
          throw updateError;
        }

        setDepartments((previous) =>
          previous.map((department) =>
            department.id === editingDepartment.id
              ? data
              : department
          )
        );
      } else {
        const { data, error: insertError } = await supabase
          .from("departments")
          .insert({
            name,
            description,
            is_active: form.is_active,
          })
          .select("id, name, description, is_active, created_at")
          .single();

        if (insertError) {
          throw insertError;
        }

        setDepartments((previous) => [
          ...previous,
          data,
        ]);

        setComplaintCounts((previous) => ({
          ...previous,
          [data.id]: 0,
        }));
      }

      closeModal();
    } catch (err) {
      console.error("Department save error:", err);
      setError(
        err.message || "Unable to save department."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // TOGGLE ACTIVE
  // =========================================================

  const toggleDepartmentStatus = async (department) => {
    const newStatus = !department.is_active;

    try {
      setError("");

      const { data, error: updateError } = await supabase
        .from("departments")
        .update({
          is_active: newStatus,
        })
        .eq("id", department.id)
        .select("id, name, description, is_active, created_at")
        .single();

      if (updateError) {
        throw updateError;
      }

      setDepartments((previous) =>
        previous.map((item) =>
          item.id === department.id ? data : item
        )
      );
    } catch (err) {
      console.error(
        "Department status update error:",
        err
      );

      setError(
        err.message ||
          "Unable to update department status."
      );
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const deleteDepartment = async (department) => {
    const count = complaintCounts[department.id] || 0;

    if (count > 0) {
      setError(
        `"${department.name}" has ${count} assigned complaint${
          count === 1 ? "" : "s"
        }. Deactivate it instead of deleting it.`
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete "${department.name}" permanently?`
    );

    if (!confirmed) return;

    try {
      setError("");

      const { error: deleteError } = await supabase
        .from("departments")
        .delete()
        .eq("id", department.id);

      if (deleteError) {
        throw deleteError;
      }

      setDepartments((previous) =>
        previous.filter(
          (item) => item.id !== department.id
        )
      );

      setComplaintCounts((previous) => {
        const next = { ...previous };
        delete next[department.id];
        return next;
      });
    } catch (err) {
      console.error("Department delete error:", err);

      setError(
        err.message ||
          "Unable to delete department."
      );
    }
  };

  // =========================================================
  // COUNTS
  // =========================================================

  const totalDepartments = departments.length;

  const activeDepartments = departments.filter(
    (department) => department.is_active
  ).length;

  const inactiveDepartments =
    departments.filter(
      (department) => !department.is_active
    ).length;

  const totalAssignedComplaints = Object.values(
    complaintCounts
  ).reduce((total, count) => total + count, 0);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <AdminLayout>
      <div className="departments-page">
        {/* HEADER */}
        <div className="departments-header">
          <div className="departments-header-left">
            <button
              type="button"
              className="departments-back-button"
              onClick={() =>
                navigate("/admin/dashboard")
              }
            >
              <ArrowLeft size={17} />
              Back
            </button>

            <div>
              <h1>Departments</h1>
              <p>
                Manage departments responsible for
                handling complaints.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="add-department-button"
            onClick={openAddModal}
          >
            <Plus size={18} />
            Add Department
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="departments-error">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* SUMMARY */}
        <div className="department-summary-grid">
          <div className="department-summary-card">
            <div className="department-summary-icon">
              <Building2 size={20} />
            </div>

            <div>
              <span>Total Departments</span>
              <strong>{totalDepartments}</strong>
            </div>
          </div>

          <div className="department-summary-card">
            <div className="department-summary-icon active">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <span>Active</span>
              <strong>{activeDepartments}</strong>
            </div>
          </div>

          <div className="department-summary-card">
            <div className="department-summary-icon inactive">
              <Building2 size={20} />
            </div>

            <div>
              <span>Inactive</span>
              <strong>{inactiveDepartments}</strong>
            </div>
          </div>

          <div className="department-summary-card">
            <div className="department-summary-icon complaints">
              <Building2 size={20} />
            </div>

            <div>
              <span>Assigned Complaints</span>
              <strong>{totalAssignedComplaints}</strong>
            </div>
          </div>
        </div>

        {/* MAIN CARD */}
        <div className="departments-card">
          <div className="departments-toolbar">
            <div className="departments-search">
              <Search size={17} />

              <input
                type="text"
                placeholder="Search departments..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <div className="departments-filters">
              {["All", "Active", "Inactive"].map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    className={
                      filter === item
                        ? "department-filter-active"
                        : ""
                    }
                    onClick={() =>
                      setFilter(item)
                    }
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>

          {/* TABLE */}
          <div className="departments-table-wrapper">
            <table className="departments-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Description</th>
                  <th>Complaints</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="departments-loading"
                    >
                      Loading departments...
                    </td>
                  </tr>
                ) : filteredDepartments.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="departments-empty"
                    >
                      <Building2 size={30} />
                      <strong>
                        No departments found
                      </strong>
                      <span>
                        Try changing your search or
                        filter.
                      </span>
                    </td>
                  </tr>
                ) : (
                  filteredDepartments.map(
                    (department) => (
                      <tr key={department.id}>
                        <td>
                          <div className="department-name">
                            <div className="department-icon">
                              <Building2 size={18} />
                            </div>

                            <strong>
                              {department.name}
                            </strong>
                          </div>
                        </td>

                        <td>
                          <span className="department-description">
                            {department.description ||
                              "No description provided."}
                          </span>
                        </td>

                        <td>
                          <span className="department-complaint-count">
                            {complaintCounts[
                              department.id
                            ] || 0}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className={`department-status ${
                              department.is_active
                                ? "active"
                                : "inactive"
                            }`}
                            onClick={() =>
                              toggleDepartmentStatus(
                                department
                              )
                            }
                            title="Click to change status"
                          >
                            <span />
                            {department.is_active
                              ? "Active"
                              : "Inactive"}
                          </button>
                        </td>

                        <td>
                          <div className="department-actions">
                            <button
                              type="button"
                              className="department-edit-button"
                              onClick={() =>
                                openEditModal(
                                  department
                                )
                              }
                              title="Edit department"
                            >
                              <Edit3 size={16} />
                            </button>

                            <button
                              type="button"
                              className="department-delete-button"
                              onClick={() =>
                                deleteDepartment(
                                  department
                                )
                              }
                              title="Delete department"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>

          {!loading &&
            filteredDepartments.length > 0 && (
              <div className="departments-footer">
                Showing{" "}
                <strong>
                  {filteredDepartments.length}
                </strong>{" "}
                of{" "}
                <strong>{departments.length}</strong>{" "}
                departments
              </div>
            )}
        </div>

        {/* ADD / EDIT MODAL */}
        {modalOpen && (
          <div
            className="department-modal-overlay"
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget
              ) {
                closeModal();
              }
            }}
          >
            <div className="department-modal">
              <div className="department-modal-header">
                <div>
                  <h2>
                    {editingDepartment
                      ? "Edit Department"
                      : "Add Department"}
                  </h2>

                  <p>
                    {editingDepartment
                      ? "Update department information."
                      : "Create a new complaint department."}
                  </p>
                </div>

                <button
                  type="button"
                  className="department-modal-close"
                  onClick={closeModal}
                  disabled={saving}
                >
                  <X size={19} />
                </button>
              </div>

              {error && (
                <div className="department-form-error">
                  {error}
                </div>
              )}

              <form
                className="department-form"
                onSubmit={handleSave}
              >
                <div className="department-form-group">
                  <label htmlFor="department-name">
                    Department Name
                  </label>

                  <input
                    id="department-name"
                    type="text"
                    placeholder="e.g. Sanitation"
                    value={form.name}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        name: event.target.value,
                      }))
                    }
                    disabled={saving}
                  />
                </div>

                <div className="department-form-group">
                  <label htmlFor="department-description">
                    Description
                  </label>

                  <textarea
                    id="department-description"
                    rows="4"
                    placeholder="Describe the responsibilities of this department..."
                    value={form.description}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        description:
                          event.target.value,
                      }))
                    }
                    disabled={saving}
                  />
                </div>

                <label className="department-active-toggle">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        is_active:
                          event.target.checked,
                      }))
                    }
                    disabled={saving}
                  />

                  <span>
                    <strong>Active Department</strong>
                    <small>
                      Allow this department to receive
                      new complaints.
                    </small>
                  </span>
                </label>

                <div className="department-form-actions">
                  <button
                    type="button"
                    className="department-cancel-button"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="department-save-button"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingDepartment
                      ? "Save Changes"
                      : "Add Department"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminDepartments;