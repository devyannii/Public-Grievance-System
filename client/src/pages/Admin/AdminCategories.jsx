import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Search,
  Plus,
  Filter,
  Pencil,
  Trash2,
  ChevronRight,
  X,
} from "lucide-react";

import AdminLayout from "../../components/layout/AdminLayout";
import { supabase } from "../../lib/supabaseClient";

import "../../styles/AdminCategories.css";

function AdminCategories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [complaintCounts, setComplaintCounts] = useState({});

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "Active",
  });

  // ======================================================
  // LOAD CATEGORIES + COMPLAINT COUNTS
  // ======================================================

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        { data: categoryData, error: categoryError },
        { data: complaintData, error: complaintError },
      ] = await Promise.all([
        supabase
          .from("categories")
          .select("*")
          .order("name", { ascending: true }),

        supabase
          .from("complaints")
          .select("category_id"),
      ]);

      if (categoryError) {
        throw new Error(categoryError.message);
      }

      if (complaintError) {
        console.warn(
          "Could not load complaint counts:",
          complaintError
        );
      }

      const counts = {};

      (complaintData || []).forEach((complaint) => {
        if (!complaint.category_id) return;

        counts[complaint.category_id] =
          (counts[complaint.category_id] || 0) + 1;
      });

      setCategories(categoryData || []);
      setComplaintCounts(counts);
    } catch (err) {
      console.error("Categories loading error:", err);

      setError(
        err.message || "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // ======================================================
  // FILTER
  // ======================================================

  const filteredCategories = useMemo(() => {
    const searchValue =
      search.toLowerCase().trim();

    return categories.filter((category) => {
      const matchesSearch =
        String(category.name || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(category.description || "")
          .toLowerCase()
          .includes(searchValue);

      const categoryStatus =
        category.status || "Active";

      const matchesStatus =
        statusFilter === "All" ||
        categoryStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    categories,
    search,
    statusFilter,
  ]);

  // ======================================================
  // MODAL
  // ======================================================

  const openAddModal = () => {
    setEditingCategory(null);

    setForm({
      name: "",
      description: "",
      status: "Active",
    });

    setError("");
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);

    setForm({
      name: category.name || "",
      description: category.description || "",
      status: category.status || "Active",
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingCategory(null);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ======================================================
  // ADD / EDIT CATEGORY
  // ======================================================

  const saveCategory = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // Prevent duplicate category names.
      const { data: existing, error: existingError } =
        await supabase
          .from("categories")
          .select("id, name")
          .ilike("name", name);

      if (existingError) {
        throw new Error(existingError.message);
      }

      const duplicate = (existing || []).find(
        (category) =>
          !editingCategory ||
          category.id !== editingCategory.id
      );

      if (duplicate) {
        setError(
          "A category with this name already exists."
        );
        return;
      }

      const payload = {
        name,
        description,
        status: form.status,
      };

      if (editingCategory) {
        const { data, error: updateError } =
          await supabase
            .from("categories")
            .update(payload)
            .eq("id", editingCategory.id)
            .select()
            .single();

        if (updateError) {
          throw new Error(updateError.message);
        }

        setCategories((previous) =>
          previous.map((category) =>
            category.id === editingCategory.id
              ? data
              : category
          )
        );
      } else {
        const { data, error: insertError } =
          await supabase
            .from("categories")
            .insert(payload)
            .select()
            .single();

        if (insertError) {
          throw new Error(insertError.message);
        }

        setCategories((previous) =>
          [...previous, data].sort((a, b) =>
            String(a.name || "").localeCompare(
              String(b.name || "")
            )
          )
        );
      }

      setShowModal(false);
      setEditingCategory(null);
    } catch (err) {
      console.error(
        "Saving category failed:",
        err
      );

      setError(
        err.message ||
          "Unable to save category."
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // DELETE
  // ======================================================

  const deleteCategory = async (category) => {
    const complaintCount =
      complaintCounts[category.id] || 0;

    if (complaintCount > 0) {
      window.alert(
        `This category has ${complaintCount} complaint${
          complaintCount === 1 ? "" : "s"
        }. It cannot be deleted until those complaints are reassigned.`
      );

      return;
    }

    const confirmed = window.confirm(
      `Delete "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      const { error: deleteError } =
        await supabase
          .from("categories")
          .delete()
          .eq("id", category.id);

      if (deleteError) {
        throw new Error(
          deleteError.message
        );
      }

      setCategories((previous) =>
        previous.filter(
          (item) =>
            item.id !== category.id
        )
      );
    } catch (err) {
      console.error(
        "Delete category failed:",
        err
      );

      setError(
        err.message ||
          "Unable to delete category."
      );
    }
  };

  // ======================================================
  // NAVIGATION
  // ======================================================

  const goBack = () => {
    navigate("/admin/dashboard");
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <AdminLayout>
      <div className="categories-page">

        {/* HEADER */}

        <div className="categories-header">

          <div className="categories-header-left">

            <button
              className="categories-back-button"
              onClick={goBack}
              title="Back to Dashboard"
              type="button"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1>Categories</h1>

              <p>
                Manage complaint categories
              </p>
            </div>

          </div>

          <button
            className="add-category-button"
            onClick={openAddModal}
            type="button"
          >
            <Plus size={19} />
            Add Category
          </button>

        </div>


        {/* ERROR */}

        {error && !showModal && (
          <div className="categories-error">
            {error}
          </div>
        )}


        {/* MAIN CARD */}

        <section className="categories-card">

          {/* SEARCH */}

          <div className="categories-toolbar">

            <div className="categories-search">

              <Search size={19} />

              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />

            </div>


            <button
              className="categories-filter-button"
              type="button"
              onClick={() =>
                setStatusFilter((current) =>
                  current === "All"
                    ? "Active"
                    : current === "Active"
                    ? "Inactive"
                    : "All"
                )
              }
              title={`Filter: ${statusFilter}`}
            >
              <Filter size={18} />

              {statusFilter === "All"
                ? "Filter"
                : statusFilter}

            </button>

          </div>


          {/* TABLE */}

          <div className="categories-table">

            <div className="categories-table-header">
              <span>Category</span>
              <span>Description</span>
              <span>Total Complaints</span>
              <span>Status</span>
              <span>Actions</span>
            </div>


            {loading ? (

              <div className="categories-empty">

                <strong>
                  Loading categories...
                </strong>

              </div>

            ) : (

              <>

                {filteredCategories.map(
                  (category) => {

                    const complaintCount =
                      complaintCounts[
                        category.id
                      ] || 0;

                    return (
                      <div
                        className="category-row"
                        key={category.id}
                      >

                        {/* CATEGORY */}

                        <div className="category-name-cell">

                          <strong>
                            {category.name}
                          </strong>

                        </div>


                        {/* DESCRIPTION */}

                        <div className="category-description">

                          {category.description ||
                            "No description"}

                        </div>


                        {/* COUNT */}

                        <div className="category-count">

                          {complaintCount}

                        </div>


                        {/* STATUS */}

                        <div>

                          <span
                            className={`category-status ${
                              String(
                                category.status ||
                                  "Active"
                              ).toLowerCase()
                            }`}
                          >

                            {category.status ||
                              "Active"}

                          </span>

                        </div>


                        {/* ACTIONS */}

                        <div className="category-actions">

                          <button
                            className="category-edit-button"
                            type="button"
                            onClick={() =>
                              openEditModal(
                                category
                              )
                            }
                            title="Edit Category"
                          >
                            <Pencil size={17} />
                          </button>


                          <button
                            className="category-delete-button"
                            type="button"
                            onClick={() =>
                              deleteCategory(
                                category
                              )
                            }
                            title="Delete Category"
                          >
                            <Trash2 size={17} />
                          </button>

                        </div>

                      </div>
                    );
                  }
                )}


                {filteredCategories.length ===
                  0 && (

                  <div className="categories-empty">

                    <Search size={28} />

                    <strong>
                      No categories found
                    </strong>

                    <span>
                      Try a different search term.
                    </span>

                  </div>

                )}

              </>

            )}


            {/* FOOTER */}

            <div className="categories-footer">

              <span>

                Showing{" "}
                {filteredCategories.length}{" "}
                of{" "}
                {categories.length}{" "}
                categories

              </span>

              <div className="categories-pagination">

                <button
                  type="button"
                  disabled
                >
                  <ArrowLeft size={17} />
                </button>

                <button
                  type="button"
                  className="pagination-active"
                >
                  1
                </button>

                <button
                  type="button"
                  disabled
                >
                  <ChevronRight size={17} />
                </button>

              </div>

            </div>

          </div>

        </section>


        {/* ADD / EDIT MODAL */}

        {showModal && (

          <div
            className="category-modal-overlay"
            onMouseDown={(event) => {

              if (
                event.target ===
                event.currentTarget
              ) {
                closeModal();
              }

            }}
          >

            <div className="category-modal">

              <div className="category-modal-header">

                <div>

                  <h2>

                    {editingCategory
                      ? "Edit Category"
                      : "Add Category"}

                  </h2>

                  <p>

                    {editingCategory
                      ? "Update the complaint category."
                      : "Create a new complaint category."}

                  </p>

                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="category-modal-close"
                  disabled={saving}
                >
                  <X size={19} />
                </button>

              </div>


              {error && (

                <div className="category-form-error">
                  {error}
                </div>

              )}


              <form
                className="category-form"
                onSubmit={saveCategory}
              >

                <label>

                  Category Name

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="e.g. Pothole"
                    maxLength={80}
                    autoFocus
                  />

                </label>


                <label>

                  Description

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="Describe the type of issues..."
                    maxLength={250}
                    rows={4}
                  />

                </label>


                <label>

                  Status

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                  >

                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>

                  </select>

                </label>


                <div className="category-form-actions">

                  <button
                    type="button"
                    className="category-cancel-button"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="category-save-button"
                    disabled={saving}
                  >

                    {saving
                      ? "Saving..."
                      : editingCategory
                      ? "Save Changes"
                      : "Add Category"}

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

export default AdminCategories;