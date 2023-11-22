const express = require('express');
// const axios = require('axios');

const router = express.Router();

// axios.defaults.withCredentials = true;
// const api = axios.create({
//   baseURL: 'https://blankmap-server-6de6d45e4291.herokuapp.com/api',
// });

// Endpoint to simulate fetching maps with a query parameter
router.get('/maps', async (req, res) => {
    // Simulated data
    const mapsData = [
      {
        title: "Cat's Masterpiece",
        description: "Through the combined knowledge of all the felines in the world, we have created a masterpiece for the public",
        author: "Cat",
        tags: ["tag1", "tag2", "tag3"],
        mapSnapshot: temp_map, // Assuming temp_map is defined elsewhere
        createdDate: "10/25/2015",
        upVotes: 10,
        numberOfComments: 30,
      },
      {
        title: "Dog is better",
        description: "Dogs > Cats Ratio",
        author: "Dog",
        tags: ["tag4", "tag5", "tag6"],
        mapSnapshot: temp_map, // Assuming temp_map is defined elsewhere
        createdDate: "12/12/2002",
        upVotes: 9,
        numberOfComments: 27,
      },
      {
        title: "Bird's Eye View",
        description: "Explore the world from above with our bird's eye view map",
        author: "BirdWatcher",
        tags: ["bird", "aerial", "landscape"],
        mapSnapshot: temp_map, // Assuming temp_map is defined elsewhere
        createdDate: "05/08/2018",
        upVotes: 9,
        numberOfComments: 33,
      },
    ];
  
    res.json(mapsData);
  });

// Add more routes and functionality as needed

module.exports = router;