import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import BASE_URL from "../../Config";
import { Button } from 'react-bootstrap';
import Swal from "sweetalert2";
import { Form } from "react-bootstrap";
import api from "../../interceptors/axiosInterceptor";
import Loader from "../common/Loader";


const AddCounselor = () => {
  const [counselors, setCounselors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;
  const [loading, setLoading] = useState(false);


  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    status: "active",
    country: "",
    branch: "",
  });

  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedCounselorForReassign, setSelectedCounselorForReassign] = useState(null);
  const [counselorLeads, setCounselorLeads] = useState([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [targetCounselorId, setTargetCounselorId] = useState("");
  const [reassignLoading, setReassignLoading] = useState(false);
  const [assignedLeadSearch, setAssignedLeadSearch] = useState("");

  const fetchCounselors = async () => {
    try {
      setLoading(true);
      const res = await api.get(`${BASE_URL}counselor`);
      setCounselors(res.data);
    } catch (err) {
      console.error("Failed to fetch counselors", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounselors();
  }, []);

  const handleOpenReassignModal = async (counselor) => {
    try {
      setSelectedCounselorForReassign(counselor);
      setSelectedLeadIds([]);
      setTargetCounselorId("");
      setAssignedLeadSearch("");
      setShowReassignModal(true);
      setReassignLoading(true);
      const res = await api.get(`${BASE_URL}counselor-assigned-leads/${counselor.id}`);
      setCounselorLeads(res.data || []);
    } catch (err) {
      console.error("Failed to fetch assigned leads", err);
      Swal.fire("Error", "Failed to load assigned leads", "error");
    } finally {
      setReassignLoading(false);
    }
  };

  const filteredAssignedLeads = Array.isArray(counselorLeads)
    ? counselorLeads.filter((l) =>
        (l.full_name || l.student_name || "").toLowerCase().includes(assignedLeadSearch.toLowerCase()) ||
        (l.email || "").toLowerCase().includes(assignedLeadSearch.toLowerCase()) ||
        (l.phone_number || l.phone || "").toLowerCase().includes(assignedLeadSearch.toLowerCase()) ||
        (l.course_name || "").toLowerCase().includes(assignedLeadSearch.toLowerCase())
      )
    : [];

  const handleToggleSelectAllLeads = (e) => {
    if (e.target.checked) {
      const filteredIds = filteredAssignedLeads.map((l) => l.id);
      setSelectedLeadIds((prev) => [...new Set([...prev, ...filteredIds])]);
    } else {
      const filteredIds = filteredAssignedLeads.map((l) => l.id);
      setSelectedLeadIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    }
  };

  const handleToggleSelectLead = (id) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleReassignLeads = async (e) => {
    e.preventDefault();
    if (!selectedLeadIds.length) {
      Swal.fire("Warning", "Please select at least one lead to reassign.", "warning");
      return;
    }
    if (!targetCounselorId) {
      Swal.fire("Warning", "Please select a target counselor.", "warning");
      return;
    }
    if (String(targetCounselorId) === String(selectedCounselorForReassign?.id)) {
      Swal.fire("Warning", "Please select a different counselor than the current one.", "warning");
      return;
    }

    try {
      setReassignLoading(true);
      const payload = {
        inquiry_ids: selectedLeadIds,
        counselor_id: targetCounselorId,
        assigned_by: localStorage.getItem("user_id") || 1,
      };
      const res = await api.post(`${BASE_URL}bulk-assign-inquiry`, payload);
      Swal.fire("Success!", res.data.message || "Leads reassigned successfully.", "success");
      setShowReassignModal(false);
      fetchCounselors();
    } catch (err) {
      console.error("Failed to reassign leads", err);
      Swal.fire("Error", err.response?.data?.message || "Failed to reassign leads.", "error");
    } finally {
      setReassignLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "university_id" ? parseInt(value) : value,
    }));
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      user_id: 1,
      role: "counselor",
      university_id: null,
    };

    try {
      if (editingId) {
        await api.put(`${BASE_URL}counselor/${editingId}`, payload);
        Swal.fire("Updated!", "Counselor updated successfully", "success");
      } else {
        await api.post(`${BASE_URL}counselor`, payload);
        Swal.fire("Added!", "Counselor added successfully", "success");
      }
      fetchCounselors();
      setShowModal(false);
      resetForm();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Operation failed";
      Swal.fire("Error", errorMsg, "error");
    }
  };

  const handleEdit = (counselor) => {
    setFormData({
      full_name: counselor.full_name,
      email: counselor.email,
      phone: counselor.phone,
      password: "", // keep password blank initially
      status: counselor.status,
      country: counselor.country || "",
      branch: counselor.branch || "",
    });
    setEditingId(counselor.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will delete the counselor.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`${BASE_URL}counselor/${id}`);
          Swal.fire("Deleted!", "Counselor deleted.", "success");
          fetchCounselors();
        } catch (err) {
          Swal.fire("Error", "Failed to delete", "error");
        }
      }
    });
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      password: "",
      status: "active",
      country: "",
      branch: "",
    });
    setEditingId(null);
  };

  const filtered = Array.isArray(counselors)
    ? counselors.filter((c) =>
      c.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="p-4">
      {loading && <Loader text="Loading Counselor Data..." />}


      <div className="mb-3">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          {/* Heading */}
          <h2 className="mb-0">Counselor Management</h2>

          {/* Search + Add Button Group */}
          <div className="d-flex flex-column flex-sm-row align-items-stretch gap-2 w-md-auto mt-2 mt-md-0">
            <input
              className="form-control"
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <button
              className="btn btn-primary btn-sm"
              style={{ whiteSpace: 'nowrap' }}
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              + Add Counselor
            </button>
          </div>
        </div>
      </div>


      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-light">
            <tr className="text-center">
              <th className="freeze-column freeze-column-1">#</th>
              <th className="freeze-column freeze-column-2">Name</th>
              <th className="freeze-column freeze-column-3">Phone</th>      
              <th>Email</th>
              <th>Country</th>
              <th>Branch</th>
              <th>Assigned Leads</th>
              <th>Status</th>
              <th>Date Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((c, index) => (
              <tr key={c.id}>
                <td className="freeze-column freeze-column-1">{indexOfFirstItem + index + 1}</td>
                <td className="freeze-column freeze-column-2">{c.full_name}</td>
                <td className="freeze-column freeze-column-3">{c.phone}</td>
                <td>{c.email}</td>
                <td>{c.country || "N/A"}</td>
                <td>{c.branch || "N/A"}</td>
                <td className="text-center">
                  {c.assigned_leads_count > 0 ? (
                    <span
                      className="badge bg-info text-dark"
                      style={{ cursor: "pointer", fontSize: "0.85rem", padding: "6px 10px" }}
                      onClick={() => handleOpenReassignModal(c)}
                      title="Click to view and reassign assigned leads"
                    >
                      {c.assigned_leads_count} Leads
                    </span>
                  ) : (
                    <span className="badge bg-secondary" style={{ fontSize: "0.85rem", padding: "6px 10px" }}>
                      0 Leads
                    </span>
                  )}
                </td>
                <td>{c.status}</td>
                <td>
                  {c.created_at
                    ? new Date(c.created_at).toLocaleDateString()
                    : "N/A"}
                </td>
                <td>

                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="me-2"
                    onClick={() => handleEdit(c)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    className="me-2"
                    onClick={() => handleDelete(c.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
      <div className="mt-4 d-flex justify-content-center">
        <nav>
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                &laquo;
              </button>
            </li>

            {[...Array(totalPages)].map((_, i) => (
              <li
                key={i}
                className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              </li>
            ))}

            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                &raquo;
              </button>
            </li>
          </ul>
        </nav>
      </div>


      {showModal && (
        <div
          className="modal show"
          style={{ display: "block", background: "#00000055" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleAddOrUpdate}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingId ? "Edit" : "Add"} Counselor
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      name="full_name"
                      placeholder="Full Name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      placeholder={editingId ? "Password (leave blank to keep current)" : "Password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!editingId}
                    />
                  </div>

                  <div className="mb-3">
                    <Form.Select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Country</option>
                      <option value="Greece">Greece</option>
                      <option value="Hungary">Hungary</option>
                      <option value="UK">UK</option>
                      <option value="Cyprus">Cyprus</option>
                      <option value="Canada">Canada</option>
                      <option value="Malaysia">Malaysia</option>
                      <option value="Lithuania">Lithuania</option>
                      <option value="Latvia">Latvia</option>
                      <option value="Germany">Germany</option>
                      <option value="New Zealand">New Zealand</option>
                      <option value="Estonia">Estonia</option>
                      <option value="Australia">Australia</option>
                      <option value="South Korea">South Korea</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Denmark">Denmark</option>
                      <option value="Netherlands">Netherlands</option>
                      <option value="Sweden">Sweden</option>
                      <option value="Norway">Norway</option>
                      <option value="Belgium">Belgium</option>
                      <option value="Romania">Romania</option>
                      <option value="Russia">Russia</option>
                      <option value="Turkey">Turkey</option>
                      <option value="Ireland">Ireland</option>
                      <option value="USA">USA</option>
                      <option value="Portugal">Portugal</option>
                      <option value="Malta">Malta</option>
                      <option value="Slovakia">Slovakia</option>
                      <option value="Others">Others</option>
                    </Form.Select>
                  </div>
                  <div className="mb-3">
                    <Form.Select
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Branch</option>
                      <option value="Dhaka">Dhaka</option>
                      <option value="banani">banani</option>
                      <option value="sylhet">sylhet</option>
                    </Form.Select>
                  </div>
                  <div className="mb-3">
                    <Form.Select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Form.Select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button className="btn btn-success" type="submit">
                    {editingId ? "Save Changes" : "Add Counselor"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showReassignModal && (
        <div
          className="modal show"
          style={{ display: "block", background: "#00000055", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  Assigned Leads for: {selectedCounselorForReassign?.full_name} ({counselorLeads.length} total)
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowReassignModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {reassignLoading ? (
                  <Loader text="Loading leads..." />
                ) : (
                  <>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 p-3 bg-light rounded gap-2 border">
                      <div className="d-flex align-items-center gap-2">
                        <Form.Select
                          size="sm"
                          style={{ width: "230px" }}
                          value={targetCounselorId}
                          onChange={(e) => setTargetCounselorId(e.target.value)}
                        >
                          <option value="">Select Target Counselor</option>
                          {counselors
                            .filter((cn) => cn.id !== selectedCounselorForReassign?.id && cn.status === "active")
                            .map((cn) => (
                              <option key={cn.id} value={cn.id}>
                                {cn.full_name} ({cn.branch || "General"})
                              </option>
                            ))}
                        </Form.Select>
                        <Button
                          variant="success"
                          size="sm"
                          disabled={selectedLeadIds.length === 0 || !targetCounselorId || reassignLoading}
                          onClick={handleReassignLeads}
                        >
                          Reassign Selected ({selectedLeadIds.length})
                        </Button>
                      </div>
                      <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="🔍 Search Lead Name / Email / Phone..."
                          style={{ minWidth: "220px" }}
                          value={assignedLeadSearch}
                          onChange={(e) => setAssignedLeadSearch(e.target.value)}
                        />
                        {assignedLeadSearch && (
                          <Button variant="outline-secondary" size="sm" onClick={() => setAssignedLeadSearch("")}>
                            ✕
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="table-responsive" style={{ maxHeight: "400px" }}>
                      <table className="table table-sm table-bordered table-hover">
                        <thead className="table-light sticky-top">
                          <tr>
                            <th style={{ width: "40px" }} className="text-center">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={filteredAssignedLeads.length > 0 && filteredAssignedLeads.every((l) => selectedLeadIds.includes(l.id))}
                                onChange={handleToggleSelectAllLeads}
                              />
                            </th>
                            <th>#</th>
                            <th>Lead Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Course</th>
                            <th>Country</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAssignedLeads.length > 0 ? (
                            filteredAssignedLeads.map((lead, idx) => (
                              <tr
                                key={lead.id}
                                style={{ cursor: "pointer" }}
                                onClick={() => handleToggleSelectLead(lead.id)}
                              >
                                <td className="text-center" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={selectedLeadIds.includes(lead.id)}
                                    onChange={() => handleToggleSelectLead(lead.id)}
                                  />
                                </td>
                                <td>{idx + 1}</td>
                                <td>{lead.full_name || lead.student_name || "N/A"}</td>
                                <td>{lead.email || "N/A"}</td>
                                <td>{lead.phone_number || lead.phone || "N/A"}</td>
                                <td>{lead.course_name || "N/A"}</td>
                                <td>{lead.country || "N/A"}</td>
                                <td>
                                  <span className="badge bg-secondary">
                                    {lead.lead_status || "Assigned"}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="8" className="text-center text-muted py-3">
                                {counselorLeads.length === 0
                                  ? "No leads currently assigned to this counselor."
                                  : "No matching leads found for your search."}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowReassignModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCounselor;
