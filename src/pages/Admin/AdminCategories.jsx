import React, { useState } from "react";

import {
  Search,
  Filter,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import "../../styles/AdminCategories.css";


const categoriesData = [
  {
    id: 1,
    name: "Pothole",
    description: "Issues related to potholes on roads and streets",
    complaints: 42,
    icon: "🛣️",
  },

  {
    id: 2,
    name: "Garbage",
    description:
      "Garbage overflow, waste collection and cleanliness issues",
    complaints: 38,
    icon: "🗑️",
  },

  {
    id: 3,
    name: "Street Light",
    description:
      "Broken, damaged or non-functional street lights",
    complaints: 27,
    icon: "💡",
  },

  {
    id: 4,
    name: "Water Leakage",
    description:
      "Water leakage, pipeline burst and water supply issues",
    complaints: 23,
    icon: "💧",
  },

  {
    id: 5,
    name: "Tree / Plants",
    description:
      "Fallen trees, trimming, plantation and green area issues",
    complaints: 15,
    icon: "🌳",
  },

  {
    id: 6,
    name: "Electricity",
    description:
      "Electrical wiring, power supply and electrical issues",
    complaints: 11,
    icon: "🔌",
  },

  {
    id: 7,
    name: "Others",
    description:
      "Other general issues not listed above",
    complaints: 9,
    icon: "•••",
  },
];


function AdminCategories() {

  const navigate = useNavigate();

  const [search, setSearch] = useState("");


  const filteredCategories = categoriesData.filter((category) =>
    category.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );


  return (
    <div className="categories-page">


      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="categories-header">

        <div className="categories-title">

          <button
            className="back-button"
            onClick={() => navigate("/admin/dashboard")}
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


        {/* ADD CATEGORY */}

        <button className="add-category-button">

          <Plus size={19} />

          Add Category

        </button>

      </div>



      {/* =====================================================
          CATEGORY CARD
      ===================================================== */}

      <div className="categories-card">


        {/* ===================================================
            SEARCH
        =================================================== */}

        <div className="categories-toolbar">

          <div className="category-search">

            <Search size={19} />

            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          <button className="filter-button">

            <Filter size={18} />

            Filter

          </button>

        </div>



        {/* ===================================================
            TABLE
        =================================================== */}

        <div className="categories-table-wrapper">

          <table className="categories-table">

            <thead>

              <tr>

                <th>Category</th>

                <th>Description</th>

                <th>Total Complaints</th>

                <th>Status</th>

                <th>Actions</th>

              </tr>

            </thead>


            <tbody>

              {filteredCategories.map((category) => (

                <tr key={category.id}>


                  {/* CATEGORY */}

                  <td>

                    <div className="category-name">

                      <div className="category-icon">

                        {category.icon}

                      </div>

                      <span>
                        {category.name}
                      </span>

                    </div>

                  </td>



                  {/* DESCRIPTION */}

                  <td>

                    <span className="category-description">

                      {category.description}

                    </span>

                  </td>



                  {/* COMPLAINTS */}

                  <td>

                    <strong className="complaint-number">

                      {category.complaints}

                    </strong>

                  </td>



                  {/* STATUS */}

                  <td>

                    <span className="active-status">

                      Active

                    </span>

                  </td>



                  {/* ACTIONS */}

                  <td>

                    <div className="category-actions">

                      <button
                        className="edit-button"
                        title="Edit category"
                      >

                        <Pencil size={17} />

                      </button>


                      <button
                        className="delete-button"
                        title="Delete category"
                      >

                        <Trash2 size={17} />

                      </button>

                    </div>

                  </td>


                </tr>

              ))}

            </tbody>

          </table>

        </div>



        {/* ===================================================
            FOOTER
        =================================================== */}

        <div className="categories-footer">

          Showing {filteredCategories.length} of{" "}
          {categoriesData.length} categories

        </div>


      </div>

    </div>
  );
}


export default AdminCategories;