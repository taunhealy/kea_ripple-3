import { useState } from "react";
import PortfolioForm from "@/app/components/dashboard/PortfolioForm";

export default function ImagesPage() {
  const [activeTab, setActiveTab] = useState("myImages");
  const [myImages, setMyImages] = useState([]);
  const [savedImages, setSavedImages] = useState([]);

  const handleUpload = (newImage) => {
    setMyImages([...myImages, newImage]);
  };

  return (
    <div>
      <div className="tabs">
        <button onClick={() => setActiveTab("myImages")}>My Images</button>
        <button onClick={() => setActiveTab("savedImages")}>
          Saved Images
        </button>
      </div>

      {activeTab === "myImages" && (
        <PortfolioForm
          userId="currentUserId" // Replace with actual user ID
          initialData={{ id: "portfolioId", portfolioImages: myImages }}
        />
      )}

      {activeTab === "savedImages" && (
        <div>
          {/* Display saved images */}
          <div>
            {savedImages.map((image, index) => (
              <img key={index} src={image.url} alt={`Saved Image ${index}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
