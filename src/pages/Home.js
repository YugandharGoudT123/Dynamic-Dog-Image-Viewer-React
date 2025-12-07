import React, { useEffect, useState } from "react";
import "../App.css";

let timer;
let deleteFirstPhotoDelay;

function Home() {
  const [breeds, setBreeds] = useState({});
  const [images, setImages] = useState([]);

  useEffect(() => {
    console.log("IMAGES STATE:", images);
  }, [images]);

  // Load the list of breeds
  useEffect(() => {
    async function loadBreeds() {
      const res = await fetch("https://dog.ceo/api/breeds/list/all");
      const data = await res.json();
      setBreeds(data.message);
    }
    loadBreeds();
  }, []);

  // Load images for selected breed
  async function loadByBreed(breed) {
    if (breed === "Choose a dog breed") return;

    const res = await fetch(`https://dog.ceo/api/breed/${breed}/images`);
    const data = await res.json();

    createSlideshow(data.message);
  }

  // Slideshow logic
  function createSlideshow(imgArray) {
    let index = 0;

    clearInterval(timer);
    clearTimeout(deleteFirstPhotoDelay);

    setImages([imgArray[0], imgArray[1]]);
    index = 2;

    timer = setInterval(() => {
      setImages((prev) => [...prev, imgArray[index]]);

      deleteFirstPhotoDelay = setTimeout(() => {
        setImages((prev) => prev.slice(1));
      }, 1000);

      if (index + 1 >= imgArray.length) index = 0;
      else index++;
    }, 3000);
  }

  return (
    <div>
      <div className="project-info-banner">
        <div className="project-info-content">
          <div className="project-info-text">
            <h3>📱 Dynamic Dog Image Viewer</h3>
            <p>
              This project implements the Lewis Instructional Software Architecture Phase 3 reference app — a React static site deployed to the cloud with Google authentication and NoSQL/file storage.
            </p>
            <div className="team-section">
              <h4>👥 Team Members:</h4>
              <ul className="team-list-inline">
                <li>Sahithi Reddy Musuku</li>
                <li>Yugandhar Goud Thalla</li>
                <li>Abhishek Anand Makka</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="app">
        <div className="header">
          <h1>Infinite Dog App (React)</h1>

          <select onChange={(e) => loadByBreed(e.target.value)}>
            <option>Choose a dog breed</option>
            {Object.keys(breeds).map((breed) => (
              <option key={breed}>{breed}</option>
            ))}
          </select>
        </div>

        <div className="slideshow">
          {images.map((url, i) =>
            url ? (
              <div key={i} className="slide" style={{ backgroundImage: `url(${url})` }}></div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
