const Map = require('../models/map-model');
const User = require('../models/user-model');
const auth = require('../auth');
const MapPage = require('../models/mappage-model');
const mongoose = require('mongoose');


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
    if (auth.verifyUser(req) === null) {
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        });
    }
    console.log("delete Map with id: " + JSON.stringify(req.params.id));
    console.log("delete " + req.params.id);
    Map.findById({ _id: req.params.id }, (err, map) => {
        console.log("map found: " + JSON.stringify(map));
        if (err) {
            return res.status(404).json({
                errorMessage: 'Map not found!',
            });
        }

        // Check ownership or other conditions if necessary

        Map.findOneAndDelete({ _id: req.params.id }, () => {
            return res.status(200).json({});
        }).catch(err => console.log(err));
    });
};
//gets all the mappages
getMapPages = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    await MapPage.find({}, (err, mappages) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!mappages.length) {
            return res
                .status(404)
                .json({ success: false, error: `Mappages not found` })
        }
        return res.status(200).json({ success: true, data: mappages })
    }).catch(err => console.log(err))
}
//gets the mappages of the user
getMapPagePairs = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    await User.findOne({ _id: req.userId }, (err, user) => {
        console.log("find user with id " + req.userId);
        async function asyncFindMapPages(user) {
            console.log("find all Mappages owned by " + user.userName);
            await MapPage.find({ user: user }, (err, mappages) => {
                console.log("found Mappages: " + JSON.stringify(mappages));
                if (err) {
                    return res.status(400).json({ success: false, error: err })
                }
                if (!mappages) {
                    console.log("!mappages.length");
                    return res
                        .status(404)
                        .json({ success: false, error: 'Mappages not found' })
                }
                else {
                    console.log("Send the Mappages pairs");
                    // PUT ALL THE LISTS INTO ID, NAME PAIRS
                    let pairs = [];
                    for (let key in mappages) {
                        let pages = mappages[key];
                        let pair = {
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
                        };
                        pairs.push(pair);
                    }
                    return res.status(200).json({ success: true, idNamePairs: pairs })
                }
            }).catch(err => console.log(err))
        }
        asyncFindMapPages(user);
    }).catch(err => console.log(err))
}
//get all public maps only
getPublicMapPagePairs = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    await MapPage.find({ publicStatus: true }, (err, mappages) => {
        console.log("found Mappages: " + JSON.stringify(mappages));
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!mappages) {
            console.log("!mappages.length");
            return res
                .status(404)
                .json({ success: false, error: 'Mappages not found' })
        }
        else {
            console.log("Send the Mappages pairs");
            // PUT ALL THE LISTS INTO ID, NAME PAIRS
            let pairs = [];
            for (let key in mappages) {
                let pages = mappages[key];
                let pair = {
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
                };
                pairs.push(pair);
            }
            return res.status(200).json({ success: true, idNamePairs: pairs })
        }
    }).catch(err => console.log(err))
}
//get map pages based on mappage id
getMapPageById = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log("Find Mappage with id: " + JSON.stringify(req.params.id));

    await MapPage.findById({ _id: req.params.id }, (err, mappage) => {
        if (err) {
            return res.status(400).json({ success: false, error: err });
        }
        console.log("Found mappage: " + JSON.stringify(mappage));

        // DOES THIS Mappage BELONG TO THIS USER?
        async function asyncFindUser(mappage) {
            await User.findOne({ userName: mappage.owner.userName }, (err, user) => {
                return res.status(200).json({ success: true, mappage: mappage })
            });
        }
        asyncFindUser(mappage);
    }).catch(err => console.log(err))
}
updateMapPage = async (req, res) => {
    if (auth.verifyUser(req) === null) {
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        });
    }
    const body = req.body
    console.log("updateMappage: " + JSON.stringify(body));
    console.log("req.body.name: " + req.body.title);

    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a body to update',
        })
    }
    MapPage.findById({ _id: req.params.id }, (err, mappage) => {
        console.log("mappage found: " + JSON.stringify(mappage));
        if (err) {
            return res.status(404).json({
                err,
                message: 'MapPage not found!',
            })
        }
        // DOES THIS MAP BELONG TO THIS USER?
        async function asyncFindUser(mappage) {
            await User.findOne({ userName: mappage.owner.userName }, (err, user) => {
                    console.log("correct user!");

                    mappage.comments = body.mappage.comments;
                    mappage.description = body.mappage.description;
                    mappage.lastModified = body.mappage.lastModified;
                    mappage.map = body.mappage.map;
                    mappage.publicStatus = body.mappage.publicStatus;
                    mappage.tags = body.mappage.tags;
                    mappage.title = body.mappage.title;
                    mappage.upvotes = body.mappage.upvotes;
                    mappage.downvotes = body.mappage.downvotes;
                    mappage
                        .save()
                        .then(() => {
                            console.log("SUCCESS!!!");
                            return res.status(200).json({
                                success: true,
                                id: mappage._id,
                                message: 'mappage updated!',
                            })
                        })
                        .catch(error => {
                            console.log("FAILURE: " + JSON.stringify(error));
                            return res.status(404).json({
                                error,
                                message: 'mappage not updated!',
                            })
                        })
            });
        }
        asyncFindUser(mappage);
    })
};
// Similar functions for other map-related endpoints

module.exports = {
    createMap,
    deleteMap,
    updateMapPage,
    getMapPages,
    getMapPagePairs,
    getMapPageById,
    getPublicMapPagePairs,
    // Add other map-related functions here
};