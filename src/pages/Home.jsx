import React, { useState, useEffect } from "react";
import "./Home.css";
import axios from "axios";
import { services } from "../data/Services";

function Home() {
  const [category, setCategory] = useState("Brand_Activations");
  const [subcategory, setSubcategory] = useState("Instore_Activation");
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [uploadedImages, setUploadedImages] = useState([]);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    imageURL: null,
  });
  const [selectedService, setSelectedService] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");

  const showSubcategory =
    category === "Brand_Activations" || category === "Branding";

  useEffect(() => {
    fetchImages();
  }, [category, subcategory]);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    let toastTimer;
    if (toast.show) {
      toastTimer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 3000);
    }
    return () => clearTimeout(toastTimer);
  }, [toast]);

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    setSelectedService("");
    setServiceDescription("");

    // Set default subcategory based on category
    if (newCategory === "Brand_Activations") {
      setSubcategory("Instore_Activation");
    } else if (newCategory === "Branding") {
      setSubcategory("Instore_Branding");
    } else {
      setSubcategory("");
    }
  };

  const handleSubcategoryChange = (e) => {
    console.log("Subcategory changed to:", e.target.value);
    setSubcategory(e.target.value);
  };

  useEffect(() => {
    console.log("Current subcategory state:", subcategory);
  }, [subcategory]);

  const handleServiceChange = (e) => {
    const selectedTitle = e.target.value;
    setSelectedService(selectedTitle);
    const service = services.find((s) => s.title === selectedTitle);
    if (service) {
      setServiceDescription(service.description);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const resetForm = () => {
    const fileInput = document.getElementById("image");
    if (fileInput) fileInput.value = "";
    setImage(null);
    setSelectedService("");
    setServiceDescription("");
  };

  const fetchImages = async () => {
    try {
      const response = await axios.get(
        // "https://zamarsolutions.co.ke/Zamar/api/get_images.php"
        "https://adminserver.zamarsolutions.co.ke/images"
      );
      let filtered = response.data.filter(
        (img) =>
          img.category === category &&
          (!showSubcategory || img.subcategory === subcategory)
      );

      if (category === "Services" && selectedService) {
        filtered = filtered.filter((img) => img.title === selectedService);
      }

      setUploadedImages(filtered);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  useEffect(() => {
    if (category === "Services") {
      fetchImages();
    }
  }, [selectedService]);

  const handleDelete = async (imageURL) => {
    setDeleteModal({ show: true, imageURL });
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.delete(
        // "https://zamarsolutions.co.ke/Zamar/index.php",
        "https://adminserver.zamarsolutions.co.ke/images",
        {
          data: { image_URL: deleteModal.imageURL },
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status === 200) {
        showToast("Image deleted successfully!", "success");
        fetchImages();
      }
    } catch (error) {
      console.error("Delete failed:", error);
      showToast("Error deleting image.", "error");
    } finally {
      setDeleteModal({ show: false, imageURL: null });
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ show: false, imageURL: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("category", category);
      if (showSubcategory && subcategory) {
        console.log("Appending subcategory:", subcategory);
        formData.append("subcategory", subcategory);
      }
      if (image) {
        formData.append("image", image);
      }
      if (category === "Services") {
        formData.append("title", selectedService);
        formData.append("description", serviceDescription);
      }

      // Debug logging
      console.log("Category:", category);
      console.log("Subcategory:", subcategory);
      console.log("FormData contents:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      const response = await axios.post(
        // "https://zamarsolutions.co.ke/Zamar/index.php",
        "https://adminserver.zamarsolutions.co.ke/images",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Upload response:", response.data);
      if (response.status === 200) {
        showToast("Upload successful!", "success");
        resetForm();
        fetchImages();
      } else {
        showToast("Upload failed. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      showToast("Error uploading. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="home-container">
      {deleteModal.show && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="modal-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" />
              </svg>
            </div>
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete this image? This action cannot be
              undone.
            </p>
            <div className="modal-buttons">
              <button onClick={confirmDelete} className="confirm-button">
                Delete
              </button>
              <button onClick={cancelDelete} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="header-section">
        <div className="header-content">
          <div className="header-logo">
            <img
              src="/zamar.svg"
              alt="Zamar Solutions Logo"
              className="company-logo-img"
            />
            <div className="header-text">
              <h1>Zamar Solutions Admin Panel</h1>
              <p>Upload and manage your portfolio images</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("isAdmin");
            window.location.href = "/";
          }}
          className="button-logout"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>

      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-icon">
            {toast.type === "success" ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 12l2 2 4-4" />
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            )}
          </div>
          <div className="toast-message">{toast.message}</div>
        </div>
      )}

      <div className="main-content">
        <div className="upload-section">
          <div className="section-header">
            <h2>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Upload New Image
            </h2>
            <p>Select category and upload your image to the portfolio</p>
          </div>

          <form onSubmit={handleSubmit} className="upload-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z" />
                  </svg>
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={handleCategoryChange}
                  required
                >
                  <option value="Brand_Activations">Brand Activations</option>
                  <option value="Branding">Branding</option>
                  <option value="Vehicle_Branding">Vehicle Branding</option>
                  <option value="Client">New Client</option>
                  <option value="Services">Services</option>
                  <option value="ThreeD">ThreeD</option>
                </select>
              </div>

              {showSubcategory && (
                <div className="form-group">
                  <label htmlFor="subcategory">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z" />
                    </svg>
                    Subcategory
                  </label>
                  <select
                    id="subcategory"
                    value={subcategory}
                    onChange={handleSubcategoryChange}
                  >
                    {category === "Brand_Activations" && (
                      <>
                        <option value="Instore_Activation">
                          Instore Activation
                        </option>
                        <option value="Experiential_Marketing">
                          Experiential Marketing
                        </option>
                      </>
                    )}
                    {category === "Branding" && (
                      <>
                        <option value="Instore_Branding">
                          Instore Branding
                        </option>
                        <option value="Outdoor_Branding">
                          Outdoor Branding
                        </option>
                        <option value="Free_Standing_Units">
                          Free Standing Units
                        </option>
                      </>
                    )}
                  </select>
                </div>
              )}
            </div>

            {category === "Services" && (
              <div className="services-section">
                <div className="form-group">
                  <label htmlFor="service">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    Service
                  </label>
                  <select
                    id="service"
                    value={selectedService}
                    onChange={handleServiceChange}
                    required
                  >
                    <option value="">Select a service</option>
                    {services.map((service, index) => (
                      <option key={index} value={service.title}>
                        {service.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="description">Service Description</label>
                  <textarea
                    id="description"
                    disabled
                    className="textarea"
                    value={serviceDescription}
                    onChange={(e) => setServiceDescription(e.target.value)}
                    required
                    rows="3"
                    placeholder="Service description will appear here..."
                  />
                </div>
              </div>
            )}

            <div className="file-upload-section">
              <label htmlFor="image" className="file-upload-label">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>Select Image</span>
                <small>Click to browse or drag and drop</small>
              </label>
              <input
                type="file"
                id="image"
                onChange={handleImageChange}
                required
                accept="image/*"
                style={{ display: "none" }}
              />
              {image && <div className="file-selected">✓ {image.name}</div>}
            </div>

            <div className="submit-section">
              <button
                type="submit"
                disabled={isSubmitting}
                className="submit-button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!image) {
                    e.preventDefault();
                    showToast("Please select an image first!", "error");
                    return;
                  }
                  if (category === "Services" && !selectedService) {
                    e.preventDefault();
                    showToast("Please select a service!", "error");
                    return;
                  }
                }}
              >
                {isSubmitting ? (
                  <span className="button-content">
                    <span className="spinner"></span>
                    Uploading...
                  </span>
                ) : (
                  <span className="button-content">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Upload Image
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="gallery-section">
          <div className="section-header">
            <h2>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              Gallery ({uploadedImages.length} images)
            </h2>
            <p>Manage your uploaded images</p>
          </div>

          {uploadedImages.length === 0 ? (
            <div className="empty-state">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <h3>No images uploaded yet</h3>
              <p>Upload your first image to get started</p>
            </div>
          ) : (
            <div className="image-grid">
              {uploadedImages.map((img, idx) => (
                <div key={idx} className="image-card">
                  <div className="image-wrapper">
                    <img src={img.image_URL} alt="Uploaded" loading="lazy" />
                    <div className="image-overlay">
                      <button
                        onClick={() => handleDelete(img.image_URL)}
                        className="delete-button"
                        title="Delete image"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {img.title && (
                    <div className="image-info">
                      <h4>{img.title}</h4>
                      {img.description && (
                        <p>{img.description.substring(0, 100)}...</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
