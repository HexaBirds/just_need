import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  EmailIcon,
  LocationIcon,
  PhoneIcon,
  RatingStarIcon,
  DisableRedicon,
  EnableRedIcon,
} from "../../assets/icon/Icons";
import MechanicImage from "../../assets/Images/Png/dummyimage.jpg";
import DisableProviderPopUp from "../../Components/Popups/DisableProviderPopUp";
import DisablePopUp from "../../Components/Popups/DisablePopUp";
import EnablePopUp from "../../Components/Popups/EnablePopUp";
import ImagePreviewPopUp from "../../Components/Popups/ImagePreviewPopUp";
import GalleryImg1 from "../../assets/png/houseCleaner.png";
import { supabase } from "../../store/supabaseCreateClient";

function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPopupDisable, setShowPopupDisable] = useState(false);
  const [showImagePreviewPopUp, setShowImagePreviewPopUp] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState(null); // Track hovered item

  const fetchUser = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      console.error("Error fetching user:", error);
    } else {
      setUser(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  function handlePopupDisable() {
    setShowPopupDisable(!showPopupDisable);
    if (showPopupDisable) {
      fetchUser(); // Refresh user data when popup closes
    }
  }

  const handleImagePreviewPopUp = () => {
    setShowImagePreviewPopUp(!showImagePreviewPopUp);
  };

  const [listings, setListings] = useState([
    {
      id: 1,
      name: "House Cleaner",
      description: "Lorem ipsum...",
      rating: 4.2,
      reviews: 1452,
      isEnabled: true,
    },
    {
      id: 2,
      name: "Plumber",
      description: "Lorem ipsum...",
      rating: 4.5,
      reviews: 980,
      isEnabled: true,
    },
    {
      id: 3,
      name: "Electrician",
      description: "Lorem ipsum...",
      rating: 4.0,
      reviews: 870,
      isEnabled: true,
    },
    {
      id: 4,
      name: "Gardener",
      description: "Lorem ipsum...",
      rating: 4.3,
      reviews: 450,
      isEnabled: true,
    },
  ]);

  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState("");
  const [currentListingId, setCurrentListingId] = useState(null);

  const handlePopup = (id, type) => {
    const listing = listings.find((item) => item.id === id);
    if (listing) {
      setShowPopup(true);
      setPopupType(listing.isEnabled ? "disable" : "enable"); // Set popup type based on current status
      setCurrentListingId(id);
    }
  };

  const handleConfirm = () => {
    setListings((prevListings) =>
      prevListings.map((listing) =>
        listing.id === currentListingId
          ? { ...listing, isEnabled: popupType === "enable" }
          : listing
      )
    );
    setShowPopup(false);
    setPopupType("");
    setCurrentListingId(null);
  };

  const handleCancel = () => {
    setShowPopup(false);
    setPopupType("");
    setCurrentListingId(null);
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  const isActive = user.accountStatus === "active";

  return (
    <div className="px-4">
      <div className="flex items-center justify-end">
        <button
          onClick={handlePopupDisable}
          className="flex items-center gap-3 py-2.5 h-[42px] px-3 xl:px-[15px] rounded-[10px]"
        >
          {isActive ? (
            <>
              <DisableRedicon />
              <span className="text-black font-normal text-base">
                Disable Provider
              </span>
            </>
          ) : (
            <>
              <EnableRedIcon />
              <span className="text-black font-normal text-base">
                Enable Provider
              </span>
            </>
          )}
        </button>
      </div>
      <div className="xl:flex mt-[30px]">
        <div className="w-full lg:w-7/12 xl:w-[399px] xl:pe-2.5 lg:flex">
          <div className="bg-[#6C4DEF] px-[30px] py-5 rounded-[10px] flex-grow flex">
            <div className="flex items-center">
              <div className="pe-5 border-e-[1px] border-[#FFFFFF66]">
                <img
                  className="w-[78px] h-[78px] rounded-full object-cover"
                  src={user.image || MechanicImage}
                  alt="image of user"
                />
                <h1 className="font-medium lg:text-base xl:text-lg text-white mt-2.5 text-center">
                  {user.firstName}
                </h1>
                <h2 className="text-sm font-normal text-white mt-1 text-center">
                  {user.category}
                </h2>
              </div>
              <div className="ps-5">
                <div className="flex gap-2.5 items-center">
                  <PhoneIcon />
                  <h3 className="text-sm font-normal text-white">
                    {user.mobile_number}
                  </h3>
                </div>
                <div className="flex gap-2.5 items-center mt-2.5">
                  <EmailIcon />
                  <h3 className="text-sm font-normal text-white">
                    {user.useremail}
                  </h3>
                </div>
                <div className="flex gap-2.5 items-center mt-2.5">
                  <LocationIcon />
                  <h3 className="text-sm font-normal text-white">
                    {user?.address?.map((item) => `${item.city}/${item.state}`)}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!user.userType && (
          <div className="w-full lg:w-7/12 xl:w-[646px] xl:ps-2.5 mt-3 xl:mt-0 flex">
            <div className="bg-[#F1F1F1] rounded-[10px] p-[15px] pb-7 flex-grow flex flex-col">
              <p className="font-medium text-lg leading-[22px] text-black pb-2.5 border-b-[0.5px] border-dashed border-[#00000066]">
                Business details
              </p>
              <div className="flex items-center mt-3 xl:mt-[15px]">
                <div className="w-4/12">
                  <h2 className="font-medium text-sm xl:text-base text-black">
                    Business Name:
                  </h2>
                </div>
                <div className="w-10/12">
                  <h2 className="text-[#000000B2] text-sm xl:text-base font-normal">
                    {user?.business?.businessName}
                  </h2>
                </div>
              </div>
              <div className="flex items-center mt-3 xl:mt-[15px]">
                <div className="w-4/12">
                  <h2 className="font-medium text-sm xl:text-base text-black">
                    Service Name:
                  </h2>
                </div>
                <div className="w-10/12">
                  <h2 className="text-[#000000B2] text-sm xl:text-base font-normal">
                    {user?.business?.businessType}
                  </h2>
                </div>
              </div>
              <div className="flex items-center mt-3">
                <div className="w-4/12">
                  <h2 className="font-medium text-sm xl:text-base text-black">
                    Categories:
                  </h2>
                </div>
                <div className="w-10/12">
                  <h2 className="text-[#000000B2] text-sm xl:text-base font-normal">
                    {user?.business?.businessType}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="font-medium text-lg leading-[22px] text-black pb-2.5 border-b-[0.5px] border-dashed border-[#00000066] mt-[30px]">
        Posted Listing
      </p>
      <div className="flex flex-row flex-wrap -mx-3">
        {listings.map((item) => (
          <div
            key={item.id}
            className="w-6/12 mt-3 xl:mt-[15px] xl:w-3/12 px-3"
            style={{ opacity: item.isEnabled ? 1 : 0.5 }}
          >
            <div
              className="border-[1px] border-[#ebeaea] rounded-[10px] relative group  transition-all cursor-pointer"
              onMouseEnter={() => setHoveredItemId(item.id)} // Track hover state
              onMouseLeave={() => setHoveredItemId(null)} // Reset hover state
            >
              <img
                className="rounded-[10px] w-full group-hover:opacity-70 hover:bg-gray-100"
                src={GalleryImg1}
                alt="Listing"
              />
              <div className="p-2.5">
                <div className="flex items-center justify-between h-[40px] ">
                  <p className="font-medium text-sm text-black">{item.name}</p>
                  <div className="p-2">
                    <button
                      onClick={() =>
                        handlePopup(
                          item.id,
                          item.isEnabled ? "disable" : "enable"
                        )
                      }
                      className="flex items-center"
                    >
                      {/* Show Enable text on hover, otherwise show Disable icon */}
                      {hoveredItemId === item.id ? (
                        <span className="text-xs font-normal text-[#0DA800]">
                          Enable
                        </span>
                      ) : (
                        <DisableRedicon />
                      )}
                    </button>
                  </div>
                </div>
                <p className="font-normal text-[14px] text-[#00000099] mt-1">
                  {item.description}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <RatingStarIcon />
                  <h3 className="text-[#000F02] text-[10px] font-normal">
                    {item.rating} | {item.reviews} reviews
                  </h3>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showPopupDisable && (
        <DisableProviderPopUp
          handlePopupDisable={handlePopupDisable}
          userId={id}
        />
      )}

      {showPopup && (
        <div className="popup-container">
          {popupType === "disable" ? (
            <DisablePopUp onConfirm={handleConfirm} onCancel={handleCancel} />
          ) : (
            <EnablePopUp onConfirm={handleConfirm} onCancel={handleCancel} />
          )}
        </div>
      )}
    </div>
  );
}

export default UserDetails;
