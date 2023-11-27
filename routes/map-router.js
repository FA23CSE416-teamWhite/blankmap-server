const express = require('express');
// const axios = require('axios');
const MapController = require('../controllers/map-controller');
const router = express.Router();
const temp_map = 'https://datavizcatalogue.com/methods/images/top_images/choropleth.png';

// axios.defaults.withCredentials = true;
// const api = axios.create({
//   baseURL: 'https://blankmap-server-6de6d45e4291.herokuapp.com/api',
// });
const mapsData = [
    {
        title: "Cat's Masterpiece",
        description: "Through the combined knowledge of all the felines in the world, we have created a masterpiece for the public",
        author: "Cat",
        tags: ["tag1", "tag2", "tag3"],
        mapSnapshot: temp_map,
        createdDate: "10/25/2015",
        upVotes: 10,
        numberOfComments: 30,
    },
    {
        title: "Dog is better",
        description: "Dogs > Cats Ratio",
        author: "Dog",
        tags: ["tag4", "tag5", "tag6"],
        mapSnapshot: temp_map,
        createdDate: "12/12/2002",
        upVotes: 9,
        numberOfComments: 27,
    },
    {
        title: "Bird's Eye View",
        description: "Explore the world from above with our bird's eye view map",
        author: "BirdWatcher",
        tags: ["bird", "aerial", "landscape"],
        mapSnapshot: temp_map,
        createdDate: "05/08/2018",
        upVotes: 9,
        numberOfComments: 33,
    },
    {
        title: "Underwater Wonderland",
        description: "Discover the wonders of the ocean depths in this underwater map",
        author: "OceanExplorer",
        tags: ["underwater", "marine", "coral"],
        mapSnapshot: temp_map,
        createdDate: "08/17/2021",
        upVotes: 10,
        numberOfComments: 45,
    },
    {
        title: "Space Odyssey",
        description: "Embark on a cosmic journey with this space-themed map",
        author: "GalaxyExplorer",
        tags: ["space", "galaxy", "astronomy"],
        mapSnapshot: temp_map,
        createdDate: "03/02/2019",
        upVotes: 13,
        numberOfComments: 23,
    },
    {
        title: "Historical Heritage",
        description: "Explore the historical heritage of ancient civilizations in this map",
        author: "HistoryBuff",
        tags: ["history", "ancient", "heritage"],
        mapSnapshot: temp_map,
        createdDate: "06/14/2005",
        upVotes: 7,
        numberOfComments: 16,
    },
    {
        title: "Fantasy Kingdom",
        description: "Immerse yourself in a fantastical realm with this fantasy-themed map",
        author: "FantasyEnthusiast",
        tags: ["fantasy", "magic", "kingdom"],
        mapSnapshot: temp_map,
        createdDate: "09/30/2017",
        upVotes: 10,
        numberOfComments: 30,
    },
    {
        title: "Mountain Trek",
        description: "Embark on a challenging trek through breathtaking mountain landscapes",
        author: "MountainExplorer",
        tags: ["mountain", "hiking", "adventure"],
        mapSnapshot: temp_map,
        createdDate: "07/08/2014",
        upVotes: 11,
        numberOfComments: 23,
    },
    {
        title: "City Lights",
        description: "Experience the vibrant city life with this city lights map",
        author: "UrbanExplorer",
        tags: ["city", "urban", "nightlife"],
        mapSnapshot: temp_map,
        createdDate: "11/19/2019",
        upVotes: 1,
        numberOfComments: 70,
    },
    {
        title: "Enchanted Forest",
        description: "Get lost in the magic of an enchanted forest with this mystical map",
        author: "NatureLover",
        tags: ["forest", "nature", "enchanted"],
        mapSnapshot: temp_map,
        createdDate: "04/27/2016",
        upVotes: 10,
        numberOfComments: 30,
    },
    {
        title: "Cat's Masterpiece",
        description: "Through the combined knowledge of all the felines in the world, we have created a masterpiece for the public",
        author: "Cat",
        tags: ["tag1", "tag2", "tag3"],
        mapSnapshot: temp_map,
        createdDate: "10/25/2015",
        upVotes: 14,
        numberOfComments: 20,
    },
    {
        title: "Dog is better",
        description: "Dogs > Cats Ratio",
        author: "Dog",
        tags: ["tag4", "tag5", "tag6"],
        mapSnapshot: temp_map,
        createdDate: "12/12/2002",
        upVotes: 12,
        numberOfComments: 24,
    },
    {
        title: "Bird's Eye View",
        description: "Explore the world from above with our bird's eye view map",
        author: "BirdWatcher",
        tags: ["bird", "aerial", "landscape"],
        mapSnapshot: temp_map,
        createdDate: "05/08/2018",
        upVotes: 10,
        numberOfComments: 27,
    },
    {
        title: "Underwater Wonderland",
        description: "Discover the wonders of the ocean depths in this underwater map",
        author: "OceanExplorer",
        tags: ["underwater", "marine", "coral"],
        mapSnapshot: temp_map,
        createdDate: "08/17/2021",
        upVotes: 10,
        numberOfComments: 30,
    },
    {
        title: "Space Odyssey",
        description: "Embark on a cosmic journey with this space-themed map",
        author: "GalaxyExplorer",
        tags: ["space", "galaxy", "astronomy"],
        mapSnapshot: temp_map,
        createdDate: "03/02/2019",
        upVotes: 10,
        numberOfComments: 30,
    },
    {
        title: "Historical Heritage",
        description: "Explore the historical heritage of ancient civilizations in this map",
        author: "HistoryBuff",
        tags: ["history", "ancient", "heritage"],
        mapSnapshot: temp_map,
        createdDate: "06/14/2005",
        upVotes: 10,
        numberOfComments: 30,
    },
    {
        title: "Fantasy Kingdom",
        description: "Immerse yourself in a fantastical realm with this fantasy-themed map",
        author: "FantasyEnthusiast",
        tags: ["fantasy", "magic", "kingdom"],
        mapSnapshot: temp_map,
        createdDate: "09/30/2017",
        upVotes: 10,
        numberOfComments: 30,
    },
    {
        title: "Mountain Trek",
        description: "Embark on a challenging trek through breathtaking mountain landscapes",
        author: "MountainExplorer",
        tags: ["mountain", "hiking", "adventure"],
        mapSnapshot: temp_map,
        createdDate: "07/08/2014",
        upVotes: 10,
        numberOfComments: 30,
    },
    {
        title: "City Lights",
        description: "Experience the vibrant city life with this city lights map",
        author: "UrbanExplorer",
        tags: ["city", "urban", "nightlife"],
        mapSnapshot: temp_map,
        createdDate: "11/19/2019",
        upVotes: 10,
        numberOfComments: 30,
    },
    {
        title: "Enchanted Forest",
        description: "Get lost in the magic of an enchanted forest with this mystical map",
        author: "NatureLover",
        tags: ["forest", "nature", "enchanted"],
        mapSnapshot: temp_map,
        createdDate: "04/27/2016",
        upVotes: 10,
        numberOfComments: 30,
    },
];
// Endpoint to fetch maps with a query parameter
router.get('/maps', (req, res) => {
    const { q } = req.query;
    console.log('q:', q);
    const qExtract = q.replace(/^"(.*)"$/, '$1');
    console.log('q:', qExtract);
    console.log('q.trim():', qExtract.trim());
    console.log(qExtract.trim().length)
    try {
        // If q is null or empty, return all maps
        if (qExtract === null || qExtract === undefined || qExtract.trim() === "") {
            res.json(mapsData);
            console.log('No search query');
        } else {
            // Perform a case-insensitive search on the title and description fields
            const filteredMaps = mapsData.filter((map) => (
                map.title.toLowerCase().includes(qExtract.toLowerCase()) ||
                map.description.toLowerCase().includes(qExtract.toLowerCase()) ||
                map.author.toLowerCase().includes(qExtract.toLowerCase())
            ));
            console.log('Search query:', qExtract);
            res.json(filteredMaps);
        }
    } catch (error) {
        console.error('Error fetching maps:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/createMap', MapController.createMap);
router.put('/updateMapPage', MapController.updateMapPage);
module.exports = router;
