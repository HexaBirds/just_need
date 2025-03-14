/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../../store/supabaseCreateClient";
import { toast } from "react-toastify";
import {
  CrossIcon,
  DeleteSvg,
  EditSvg,
  PlusIcon,
  PluswhiteIcon,
} from "../../assets/icon/Icon";
import { useServiceContext } from "../../store/ServiceContext";

function BannerDetails() {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [offer, setOffer] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [discount, setDiscount] = useState("");
  const [service, setService] = useState("");
  const [description, setDescription] = useState("");
  const [editingOffer, setEditingOffer] = useState(null);
  const [deletePopup, setDeletePopup] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [savePopup, setSavePopup] = useState(false);
  const [loadedImages, setLoadedImages] = useState({});
  const [dropdown, setDropdown] = useState(false);
  const [fetchError, setFetchError] = useState(null); // Track fetch errors
  const imageRefs = useRef({});

  const { categories, getCategoriesWithSubcategories, loading } =
    useServiceContext();

  useEffect(() => {
    fetchOffer();
    fetchCategoriesWithRetry();
  }, []);

  const fetchOffer = async () => {
    try {
      const { data, error } = await supabase.from("offers").select("*");
      if (error) throw error;
      setOffer(data || []);
      const initialLoadedState = (data || []).reduce((acc, item) => {
        acc[item.id] = false;
        return acc;
      }, {});
      setLoadedImages(initialLoadedState);

      (data || []).forEach((item) => {
        if (imageRefs.current[item.id]?.complete) {
          setLoadedImages((prev) => ({ ...prev, [item.id]: true }));
        }
      });
      setFetchError(null); // Clear any previous error
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast.error("Failed to fetch offers. Retrying...");
      setFetchError("Failed to fetch offers. Please check your connection.");
    }
  };

  // Retry mechanism for fetching categories
  const fetchCategoriesWithRetry = async (retries = 3, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
      try {
        await getCategoriesWithSubcategories();
        setFetchError(null); // Clear error on success
        return; // Exit on success
      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error);
        if (i === retries - 1) {
          toast.error("Failed to load categories after retries.");
          setFetchError("Failed to load categories. Please try again later.");
        } else {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const maxSizeInBytes = 1 * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        toast.error("Image size exceeds 1 MB. Please upload a smaller file.");
        return;
      }
      setImage(file);
      setImageUrl(URL.createObjectURL(file));
      setImageName(file.name);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    if (!tags.length || !discount || !service) {
      toast.error("Please fill all fields (at least one tag required)");
      return;
    }
    if (!editingOffer && !image) {
      toast.error("Please upload an image for new banners");
      return;
    }
    setSavePopup(true);
  };

  const handleSaveConfirm = async () => {
    try {
      let uploadedImageUrl = editingOffer ? editingOffer.image : "";
      if (image) {
        const fileExt = image.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const filePath = `banners/${fileName}`;

        const { data: imageData, error: imageError } = await supabase.storage
          .from("just_need")
          .upload(filePath, image, {
            cacheControl: "3600",
            upsert: false,
          });

        if (imageError)
          throw new Error("Image upload failed: " + imageError.message);

        const { data: publicUrlData } = supabase.storage
          .from("just_need")
          .getPublicUrl(imageData.path);

        if (!publicUrlData?.publicUrl)
          throw new Error("Failed to get public URL");

        uploadedImageUrl = publicUrlData.publicUrl;
      }

      if (editingOffer) {
        const { error } = await supabase
          .from("offers")
          .update({
            tagOffer: tags,
            discount,
            service,
            description,
            image: uploadedImageUrl,
          })
          .eq("id", editingOffer.id);

        if (error) throw error;
        toast.success("Banner updated successfully!");
      } else {
        const { error } = await supabase.from("offers").insert([
          {
            tagOffer: tags,
            discount,
            service,
            description,
            image: uploadedImageUrl,
          },
        ]);

        if (error) throw error;
        toast.success("Banner added successfully!");
      }

      fetchOffer();
      setIsModalOpen(false);
      resetForm();
      setSavePopup(false);
    } catch (error) {
      console.error("Error saving banner:", error);
      toast.error(error.message || "Failed to save banner. Please try again.");
      setSavePopup(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const { error } = await supabase
        .from("offers")
        .delete()
        .eq("id", deleteId);
      if (error) throw error;
      toast.success("Banner deleted successfully!");
      fetchOffer();
      setDeletePopup(false);
      setDeleteId(null);
    } catch (error) {
      toast.error("Error deleting banner: " + error.message);
      console.error(error);
      setDeletePopup(false);
      setDeleteId(null);
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setDeletePopup(true);
  };

  const handleEdit = (item) => {
    setEditingOffer(item);
    setTags(
      Array.isArray(item.tagOffer)
        ? item.tagOffer
        : item.tagOffer
          ? [item.tagOffer]
          : []
    );
    setDiscount(item.discount || "");
    setService(item.service || "");
    setDescription(item.description || "");
    setImageUrl(item.image || "");
    const imagePath = item.image ? item.image.split("/").pop() : "";
    setImageName(imagePath || "Existing Image");
    setImage(null);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setTags([]);
    setTagInput("");
    setDiscount("");
    setService("");
    setDescription("");
    setImage(null);
    setImageUrl("");
    setImageName("");
    setEditingOffer(null);
    setDropdown(false); // Reset dropdown
  };

  function handleAddNew() {
    resetForm();
    setIsModalOpen(true);
  }

  const handleImageLoad = (id) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }));
  };

  const activeCategories = categories.filter((category) => category.isActive);

  return (
    <div className="bg-white min-h-screen">
      <div className="mt-5 flex justify-end mx-10">
        <button
          onClick={handleAddNew}
          className="bg-[#0832DE] text-white rounded-[10px] py-2 px-4 flex items-center gap-2"
        >
          <PluswhiteIcon />
          Add New Banner
        </button>
      </div>

      {fetchError && (
        <div className="mx-5 my-5 p-4 bg-red-100 text-red-700 rounded-lg">
          {fetchError}
          <button
            onClick={() => {
              fetchOffer();
              fetchCategoriesWithRetry();
            }}
            className="ml-2 underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-5 my-5">
        {offer.map((item) => (
          <div className="relative group" key={item.id}>
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300 rounded-lg z-[1]"></div>

            {!loadedImages[item.id] && (
              <div className="aspect-video rounded-lg flex items-center justify-center bg-gray-200">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0832DE]"></div>
              </div>
            )}

            {/* Image */}
            <img
              ref={(el) => (imageRefs.current[item.id] = el)}
              src={item.image}
              alt="Banner"
              className={`aspect-video object-cover rounded-lg ${loadedImages[item.id] ? "block" : "hidden"
                }`}
              onLoad={() => handleImageLoad(item.id)}
            />

            {/* Delete Button */}
            <div
              className="absolute top-2 right-2 cursor-pointer z-[3]"
              onClick={() => handleDelete(item.id)}
            >
              <DeleteSvg />
            </div>

            {/* Edit Button */}
            <div
              className="absolute top-2 right-10 cursor-pointer z-[3]"
              onClick={() => handleEdit(item)}
            >
              <EditSvg />
            </div>

            {/* Service Tag */}
            <div className="absolute top-[10px] left-[10px] bg-white rounded-[50px] px-2.5 py-[5px] opacity-0 group-hover:opacity-100 z-[2]">
              {item.service}
            </div>

            {/* Tag Offers */}
            <div className="absolute flex gap-2 flex-wrap bottom-[10px] left-[10px] z-[3]">
              {item?.tagOffer.slice(0, 4).map((tag, index) => (
                <div
                  key={index}
                  className="bg-[#6C4DEF] text-white px-2.5 rounded-[50px] py-[5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>

      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-[694px] p-6 rounded-lg shadow-lg relative"
          >
            <div className="flex justify-center items-center mb-4">
              <h2 className="text-lg font-medium">
                {editingOffer ? "Edit Banner" : "Add Banner"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-3xl font-light absolute top-1.5 right-5"
              >
                ×
              </button>
            </div>
            <div className="border-b border-gray-300 mb-4"></div>
            <label className="text-black block mb-2">
              {!editingOffer ? "No Image Chosen" : "Upload Image"}
            </label>
            <div className="flex items-center gap-2 bg-[#F2F2F2] rounded-lg p-2">
              <input
                type="text"
                value={image ? image.name : imageName || "No Image Chosen"}
                className="flex-1 px-4 py-2 bg-transparent border-none text-gray-500"
                disabled
              />
              <input
                type="file"
                className="hidden"
                id="fileUpload"
                accept="image/*"
                onChange={handleImageChange}
              />
              <label
                htmlFor="fileUpload"
                className="px-2.5 py-1 border border-[#E03F3F] text-[#E03F3F] rounded-lg cursor-pointer flex items-center"
              >
                <PlusIcon className="mr-1" />
                Upload
              </label>
            </div>

            {imageUrl && (
              <img
                className="w-[58px] h-[58px] object-cover mt-2.5 rounded-[10px]"
                src={imageUrl}
                alt=""
              />
            )}

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="mt-4">
                <label className="text-gray-600 block text-base mb-2">
                  Tags (Press Enter to add)
                </label>
                <input
                  type="text"
                  placeholder="Enter Tag Name"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="w-full px-4 py-2 border rounded-lg bg-[#F2F2F2] text-gray-600 outline-none"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags?.map((tag, index) => (
                    <div
                      key={index}
                      className="bg-[#6C4DEF1A] text-[#6C4DEF] px-2.5 py-1 rounded-full flex items-center"
                    >
                      <p className="font-normal text-sm">{tag}</p>
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2.5 text-[#6C4DEF]"
                      >
                        <CrossIcon />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <label className="text-gray-600 block text-base mb-2">
                  Discount %
                </label>
                <input
                  type="text"
                  value={discount}
                  placeholder="Discount"
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-[#F2F2F2] text-gray-600 outline-none"
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-gray-600 block text-base mb-2">
                Select Service
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg bg-[#F2F2F2] text-gray-600 outline-none h-[50px] cursor-pointer"
                readOnly
                value={service || "Select a category"}
                onClick={() => setDropdown(!dropdown)}
              />
              {dropdown && (
                <div className="w-full max-h-[100px] overflow-y-auto bg-white border rounded-lg mt-1 absolute z-10 shadow-lg">
                  {loading ? (
                    <div className="px-4 py-2 text-gray-600">
                      Loading categories...
                    </div>
                  ) : activeCategories.length === 0 ? (
                    <div className="px-4 py-2 text-gray-600">
                      No active categories available
                    </div>
                  ) : (
                    activeCategories.map((category) => (
                      <div
                        key={category.id}
                        onClick={() => {
                          setService(category.categoryName);
                          setDropdown(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-600"
                      >
                        {category.categoryName}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              className="w-full mt-4 bg-[#0832DE] text-white py-2 rounded-lg"
            >
              {editingOffer ? "Update Details" : "Save Details"}
            </button>
          </div>
        </div>
      )}

      {deletePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[300px]">
            <h2 className="text-lg font-medium mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this banner?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeletePopup(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-[#6C4DEF] text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {savePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[300px]">
            <h2 className="text-lg font-medium mb-4">
              Confirm {editingOffer ? "Update" : "Save"}
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {editingOffer ? "update" : "save"} this
              banner?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setSavePopup(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfirm}
                className="px-4 py-2 bg-[#6C4DEF] text-white rounded-lg"
              >
                {editingOffer ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BannerDetails;
