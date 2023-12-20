const Map = require('../models/map-model');
const User = require('../models/user-model');
const auth = require('../auth');
const MapPage = require('../models/mappage-model');
const mongoose = require('mongoose');
const { search } = require('../routes/map-router');
const temp_map = 'https://datavizcatalogue.com/methods/images/top_images/choropleth.png';
const Pbf = require('pbf');
const geobuf = require('geobuf');


createMap = async (req, res) => {
    try {
        const { title, description, publicStatus, selectedCategory, tags, file,imageURL } = req.body;
        console.log("inside createMap"),
        console.log("request: " + req)
        const user_id = auth.verifyUser(req);
        console.log("user_id: " + user_id)
        // console.log("user_id_createmap: " + user_id);
        if (user_id === null) {
            return res.status(400).json({
                errorMessage: 'UNAUTHORIZED'
            });
        }
        console.log("Check missing fields")
        // Check for missing fields
        if (!title || !description || !publicStatus || !tags || !selectedCategory || !file) {
            return res.status(400).json({
                success: false,
                error: 'Invalid input. Please provide all required fields.',
            });
        }
        // console.log("Parsing File Content")
        // const fileContent = JSON.parse(file);
        // console.log("fileContent: " + fileContent);
        const encodedData = geobuf.encode(file, new Pbf());
        const compressed= Buffer.from(encodedData).toString('base64')
        const mapData = new Map({
            addedFeatures: [],
            baseData: compressed,
            mapType: selectedCategory 
        });
        console.log("Saving Map")
        const savedMapData = await mapData.save();
        const map = new MapPage({
            title: title,
            description: description,
            publicStatus: publicStatus,
            tags: tags, 
            imageURL:imageURL,
            map: savedMapData, 
            lastModified: Date.now(),
        });

        if (!map) {
            return res.status(400).json({ success: false, error: 'Failed to create map' });
        }
        console.log("Find user by id")
        const user = await User.findOne({ _id: user_id });

        if (!user) {
            return res.status(404).json({ errorMessage: 'User not found' });
        }

        // console.log("user found: " + JSON.stringify(user));

        map.owner = user;
        console.log("Adding to user maps")
        user.maps.push(map._id);
        console.log("Saving the user")
        await Promise.all([map.save(), user.save()]);
        console.log("Return the status")
        return res.status(201).json({ map: map });
    } catch (error) {
        console.log("error: " + error);
        return res.status(500).json({ errorMessage: 'Internal Server Error' });
    }
};

deleteMap = async (req, res) => {
    try {
        if (auth.verifyUser(req) === null) {
            return res.status(400).json({
                errorMessage: 'UNAUTHORIZED'
            });
        }

        // console.log("delete Map with id: " + JSON.stringify(req.params.id));
        const mappage = await MapPage.findById(req.params.id).exec();
        // console.log("map found: " + JSON.stringify(map));

        if (!mappage) {
            return res.status(404).json({
                errorMessage: 'Map not found!',
            });
        }
        console.log("Mappage to be deleted:", mappage)
        // Check ownership or other conditions if necessary
        await MapPage.findOneAndDelete({ _id: req.params.id }).exec();
        await Map.findOneAndDelete({ _id: mappage.map._id }).exec();
        return res.status(200).json({});
    } catch (error) {
        console.error("FAILURE: " + JSON.stringify(error));
        return res.status(500).json({
            errorMessage: 'Failed to delete Map!',
        });
    }
};
//gets all the mappages
getMapPages = async (req, res) => {
    try {
        if (auth.verifyUser(req) === null) {
            return res.status(400).json({
                errorMessage: 'UNAUTHORIZED'
            });
        }

        const mappages = await MapPage.find({}).exec();

        if (!mappages || mappages.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Mappages not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: mappages
        });
    } catch (error) {
        console.error("FAILURE: " + JSON.stringify(error));
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
};
//gets the mappages of the user
getMapPagePairs = async (req, res) => {
    try {
        const verifiedUser = auth.verifyUser(req);
        if (verifiedUser === null) {
            return res.status(400).json({
                errorMessage: 'UNAUTHORIZED'
            });
        }

        const user = await User.findOne({ _id: req.userId });
        // console.log("find user with id " + req.userId);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // console.log("find all Mappages owned by " + user.userName);
        const mappages = await MapPage.find({ owner: user }).sort({ creationDate: -1 });

        // console.log("found Mappages: " + JSON.stringify(mappages));

        if (!mappages || mappages.length === 0) {
            // console.log("!mappages.length");
            return res.status(200).json({ success: false, mappages});
        }
        
        const idNamePairs = await Promise.all(mappages.map(async page => {
            const mapData = await Map.findById(page.map); // Fetch map data using the ID stored in MapPage
            let jsonData=null;
            if (mapData) {
                const buffer = Buffer.from(mapData.baseData, 'base64'); // Convert back to Buffer
                const decodedData = geobuf.decode(new Pbf(buffer)); // Decode the Geobuf data
                
                // Use decodedData as your GeoJSON
                console.log(decodedData); // This is your GeoJSON
              }
            return {
                id: page._id,
                title: page.title,
                downvotes: page.downvotes,
                upvotes: page.upvotes,
                tags: page.tags,
                publicStatus: page.publicStatus,
                comments: page.comments,
                owner: user.userName,
                mapSnapshot: page.imageURL,
                map: decodedData,
                lastModified: page.lastModified.toLocaleDateString(),
                description: page.description,
                creationDate: page.creationDate.toLocaleDateString(),
            };
        }));

        // console.log("Send the Mappages pairs");
        return res.status(200).json({ success: true, idNamePairs });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

//get all public maps only
getPublicMapPagePairs = async (req, res) => {
    try {
        if (auth.verifyUser(req) === null) {
            return res.status(400).json({
                errorMessage: 'UNAUTHORIZED'
            });
        }

        const mappages = await MapPage.find({ publicStatus: true }).exec();

        // console.log("found Mappages: " + JSON.stringify(mappages));

        if (!mappages || mappages.length === 0) {
            // console.log("!mappages.length");
            return res.status(404).json({ success: false, error: 'Mappages not found' });
        } else {
            // console.log("Send the Mappages pairs");
            // PUT ALL THE LISTS INTO ID, NAME PAIRS
            let pairs = mappages.map(pages => ({
                _id: pages._id,
                title: pages.title,
                downvotes: pages.downvotes,
                upvotes: pages.upvotes,
                tags: pages.tags,
                publicStatus: pages.publicStatus,
                comments: pages.comments,
                owner: pages.owner,
                map: pages.map,
                lastModified: pages.lastModified,
                description: pages.description,
                creationDate: pages.creationDate,
            }));

            return res.status(200).json({ success: true, idNamePairs: pairs });
        }
    } catch (err) {
        console.error(err);
        return res.status(400).json({ success: false, error: err.message });
    }
};
//get map pages based on mappage id
getMapPageById = async (req, res) => {
    try {
        // console.log(req.params);
        // console.log(req.body);

        if (auth.verifyUser(req) === null) {
            // console.log("verify user issue");
            return res.status(400).json({
                errorMessage: 'UNAUTHORIZED'
            });
        }

        // console.log("Find Mappage with id: " + JSON.stringify(req.params.id));

        let mappage = await MapPage.findById(req.params.id).populate('map').exec();
        
        // console.log("mappage: " + JSON.stringify(mappage));
        if (!mappage) {
            // console.log("Mappage not found");
            return res.status(404).json({ success: false, error: 'Mappage not found' });
        }
        
        const buffer = Buffer.from(mappage.map.baseData, 'base64'); // Convert back to Buffer
        const decodedData = geobuf.decode(new Pbf(buffer)); // Decode the Geobuf data
        mappage.map.baseData=decodedData;
        // console.log("Found mappage: " + JSON.stringify(mappage));

        // Check if the Mappage belongs to this user
        // const user = await User.findOne({ userName: mappage.owner.userName }).exec();
        
        // if (!user) {
        //     console.log("User not found");
        //     return res.status(404).json({ success: false, error: 'User not found' });
        // }

        return res.status(200).json({ success: true, mappage: mappage });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ success: false, error: err.message });
    }
};
// if only changing comments and likes
updateMapPageGeneral = async (req, res) => {
    try {
        if (auth.verifyUser(req) === null) {
            return res.status(400).json({
                errorMessage: 'UNAUTHORIZED'
            });
        }

        const body = req.body;
        // console.log("updateMappage: " + JSON.stringify(body));
        // console.log("req.body.name: " + req.body.title);

        if (!body) {
            return res.status(400).json({
                success: false,
                error: 'You must provide a body to update',
            });
        }

        const mappage = await MapPage.findById(req.params.id).exec();

        if (!mappage) {
            return res.status(404).json({
                message: 'MapPage not found!',
            });
        }

        mappage.comments = body.comments;
        mappage.upvotes = body.upvotes;
        mappage.downvotes = body.downvotes;

        const updatedMappage = await mappage.save();

        // console.log("SUCCESS!!!");
        return res.status(200).json({
            success: true,
            id: updatedMappage._id,
            message: 'MapPage updated!',
        });
    } catch (error) {
        console.log("FAILURE: " + JSON.stringify(error));
        return res.status(404).json({
            error,
            message: 'MapPage not updated!',
        });
    }
};
updateMapPage = async (req, res) => {
    try {
        if (auth.verifyUser(req) === null) {
            return res.status(400).json({
                errorMessage: 'UNAUTHORIZED'
            });
        }

        const body = req.body.mappage;
        console.log("body: ", body)
        console.log("updateMappage: " + JSON.stringify(body));
        console.log("req.body.title: " + body.title);

        if (!body) {
            return res.status(400).json({
                success: false,
                error: 'You must provide a body to update',
            });
        }

        const mappage = await MapPage.findById(req.params.id).exec();

        console.log("mappage found: " + JSON.stringify(mappage));

        if (!mappage) {
            return res.status(404).json({
                message: 'MapPage not found!',
            });
        }

        // Check if the MapPage belongs to this user
        const user = await User.findOne({ userName: mappage.owner.userName }).exec();

        if (!user) {
            console.log("User not authorized");
            return res.status(401).json({
                message: 'User not authorized to update this MapPage',
            });
        }
        if (body.map) {
            const encodedData = geobuf.encode(body.map, new Pbf());
            const compressed= Buffer.from(encodedData).toString('base64')
            mappage.map = compressed;
        }


        // Update MapPage properties
        mappage.comments = body.comments;
        mappage.description = body.description;
        mappage.lastModified = body.lastModified;
        // mappage.map = body.map;
        mappage.publicStatus = body.publicStatus;
        mappage.tags = body.tags;
        mappage.title = body.title;
        mappage.upvotes = body.upvotes;
        mappage.downvotes = body.downvotes;
        
        const updatedMappage = await mappage.save();

        console.log("SUCCESS!!!");
        return res.status(200).json({
            success: true,
            id: updatedMappage._id,
            message: 'MapPage updated!',
        });
    } catch (error) {
        console.error("FAILURE: " + JSON.stringify(error));
        return res.status(404).json({
            error,
            message: 'MapPage not updated!',
        });
    }
};
// Similar functions for other map-related endpoints
searchMapPages = async (req, res) => {
    const { q } = req.query;
    const qExtract = q.replace(/^"(.*)"$/, '$1');

    try {
        let maps;
        // If q is null or empty, return all maps
        if (!qExtract || qExtract.trim() === "") {
            maps = await MapPage.find().populate('owner', 'userName').sort({ creationDate: -1 });
            // console.log('No search query');
        } else {
            // Perform a case-insensitive search on the title, description, and author.userName fields
            maps = await MapPage.find().populate('owner', 'userName');
            maps = maps.filter(map =>
                map.title.toLowerCase().includes(qExtract.toLowerCase()) ||
                map.description.toLowerCase().includes(qExtract.toLowerCase()) ||
                (map.owner && map.owner.userName.toLowerCase().includes(qExtract.toLowerCase()))
            ).sort((a, b) => b.creationDate - a.creationDate);;

            // console.log('Search query:', qExtract);
        }
        // console.log('Maps found:', maps)

        const transformedMaps = maps.map(map => ({
            id: map._id,
            title: map.title,
            description: map.description,
            owner: map.owner.userName,
            tags: map.tags,
            mapSnapshot: map.imageURL, //need to include actual snapshot
            creationDate: new Date(map.creationDate).toLocaleDateString(),
            upvotes: map.upvotes,
            downvotes: map.downvotes,
            comments: map.comments.map(comment => ({ 
                user: comment.user,
                likes: comment.likes,
                dislikes: comment.dislikes,
                comment: comment.comment,
                replies: comment.replies.map(reply => ({
                    user: reply.user, 
                    reply: reply.reply,
                })),
            })),
            numberOfComments: map.numberOfComments,
        }));
        // console.log('Transformed maps:', transformedMaps);

        res.json(transformedMaps);
    } catch (error) {
        console.error('Error fetching maps:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

updateMapBaseData = async (req, res) => {
    try {
        if (auth.verifyUser(req) === null) {
            return res.status(400).json({
                errorMessage: 'UNAUTHORIZED'
            });
        }
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No map with id: ${id}`);

        const encodedData = geobuf.encode(req.body.stringGeo, new Pbf());
        const compressed= Buffer.from(encodedData).toString('base64')

        const addedFeatures = req.body.addedFeatures; // Assuming this is GeoJSON

        const imageURL = req.body.savedImage;

        const mapPageToBeUpdated = await MapPage.findById(id);
        mapPageToBeUpdated.imageURL = imageURL;
        await mapPageToBeUpdated.save();

        const mapToBeUpdated = await Map.findById(mapPageToBeUpdated.map);
        mapToBeUpdated.baseData = compressed; // Storing the Geobuf-encoded data
        mapToBeUpdated.addedFeatures = addedFeatures; // Assuming these are in GeoJSON format

        await mapToBeUpdated.save();
        await mapPageToBeUpdated.populate('map');

        res.json(mapPageToBeUpdated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
module.exports = {
    createMap,
    deleteMap,
    updateMapPage,
    updateMapPageGeneral,
    getMapPages,
    getMapPagePairs,
    getMapPageById,
    getPublicMapPagePairs,
    searchMapPages,
    updateMapBaseData
    // Add other map-related functions here
};