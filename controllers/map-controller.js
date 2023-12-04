const Map = require('../models/map-model');
const User = require('../models/user-model');
const auth = require('../auth');
const MapPage = require('../models/mappage-model');
const mongoose = require('mongoose');
const { search } = require('../routes/map-router');
const temp_map = 'https://datavizcatalogue.com/methods/images/top_images/choropleth.png';


createMap = async (req, res) => {
    try {
        const { title, description, publicStatus, selectedCategory, tags, file } = req.body;
        const user_id = auth.verifyUser(req);
        console.log("user_id_createmap: " + user_id);
        if (user_id === null) {
            return res.status(400).json({
                errorMessage: 'UNAUTHORIZED'
            });
        }

        // Check for missing fields
        if (!title || !description || !publicStatus || !tags || !selectedCategory || !file) {
            return res.status(400).json({
                success: false,
                error: 'Invalid input. Please provide all required fields.',
            });
        }
        const bufferData = Buffer.from(JSON.stringify(file));
       
        console.log("passed valid input");
        const mapData = new Map({
            addedFeatures: [{ }],
            baseData: bufferData ,
            mapType: selectedCategory 
        });

        const tagObjects = tags.map(tag => {
            try {
                return mongoose.Types.ObjectId(tag);
            } catch (error) {
                // Handle the case where the tag is not a valid ObjectId
                console.error(`Invalid tag value: ${tag}`);
                return null; // Or handle the error as needed
            }
        }).filter(tagObject => tagObject !== null);

        const map = new MapPage({
            title: title,
            description: description,
            publicStatus: publicStatus,
            tags: tagObjects,
            map: mapData, 
            lastModified: Date.now(),
        });

        if (!map) {
            return res.status(400).json({ success: false, error: 'Failed to create map' });
        }

        const user = await User.findOne({ _id: user_id });

        if (!user) {
            return res.status(404).json({ errorMessage: 'User not found' });
        }

        console.log("user found: " + JSON.stringify(user));

        // const ownerId = mongoose.Types.ObjectId(user_id);

        map.owner = user;

        user.maps.push(map._id);

        await Promise.all([map.save(), user.save()]);

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

        console.log("delete Map with id: " + JSON.stringify(req.params.id));

        const map = await Map.findById(req.params.id).exec();

        console.log("map found: " + JSON.stringify(map));

        if (!map) {
            return res.status(404).json({
                errorMessage: 'Map not found!',
            });
        }

        // Check ownership or other conditions if necessary

        await Map.findOneAndDelete({ _id: req.params.id }).exec();

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
        console.log("find user with id " + req.userId);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        console.log("find all Mappages owned by " + user.userName);
        const mappages = await MapPage.find({ owner: user });

        console.log("found Mappages: " + JSON.stringify(mappages));

        if (!mappages || mappages.length === 0) {
            console.log("!mappages.length");
            return res.status(404).json({ success: false, error: 'Mappages not found' });
        }

        const idNamePairs = mappages.map(page => ({
            _id: page._id,
            title: page.title,
            downvotes: page.downvotes,
            upvotes: page.upvotes,
            tags: page.tags,
            publicStatus: page.publicStatus,
            comments: page.comments,
            owner: page.owner,
            map: page.map,
            lastModified: page.lastModified,
            description: page.description,
            creationDate: page.creationDate,
        }));

        console.log("Send the Mappages pairs");
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

        console.log("found Mappages: " + JSON.stringify(mappages));

        if (!mappages || mappages.length === 0) {
            console.log("!mappages.length");
            return res.status(404).json({ success: false, error: 'Mappages not found' });
        } else {
            console.log("Send the Mappages pairs");
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
        console.log(req.params);
        console.log(req.body);

        if (auth.verifyUser(req) === null) {
            console.log("verify user issue");
            return res.status(400).json({
                errorMessage: 'UNAUTHORIZED'
            });
        }

        console.log("Find Mappage with id: " + JSON.stringify(req.params.id));

        const mappage = await MapPage.findById(req.params.id).exec();
        
        if (!mappage) {
            console.log("Mappage not found");
            return res.status(404).json({ success: false, error: 'Mappage not found' });
        }

        console.log("Found mappage: " + JSON.stringify(mappage));

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
        console.log("updateMappage: " + JSON.stringify(body));
        console.log("req.body.name: " + req.body.title);

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

        console.log("SUCCESS!!!");
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

        const body = req.body;
        console.log("updateMappage: " + JSON.stringify(body));
        console.log("req.body.name: " + req.body.title);

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

        // Update MapPage properties
        mappage.comments = body.comments;
        mappage.description = body.description;
        mappage.lastModified = body.lastModified;
        mappage.map = body.map;
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
            maps = await MapPage.find().populate('owner', 'userName');
            console.log('No search query');
        } else {
            // Perform a case-insensitive search on the title, description, and author.userName fields
            maps = await MapPage.find().populate('owner', 'userName');
            maps = maps.filter(map =>
                map.title.toLowerCase().includes(qExtract.toLowerCase()) ||
                map.description.toLowerCase().includes(qExtract.toLowerCase()) ||
                (map.owner && map.owner.userName.toLowerCase().includes(qExtract.toLowerCase()))
            );

            console.log('Search query:', qExtract);
        }
        console.log('Maps found:', maps)

        const transformedMaps = maps.map(map => ({
            id: map._id,
            title: map.title,
            description: map.description,
            author: map.owner.userName,
            tags: map.tags,
            mapSnapshot: temp_map, //need to include actual snapshot
            createdDate: new Date(map.creationDate).toLocaleDateString(),
            upVotes: map.upVotes,
            downVotes: map.downVotes,
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
    // Add other map-related functions here
};