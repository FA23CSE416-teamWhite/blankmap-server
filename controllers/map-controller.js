const Map = require('../models/map-model');
const User = require('../models/user-model');
const auth = require('../auth');
const MapPage = require('../models/mappage-model');

createMap = (req, res) => {
    const { title, description, publicStatus,selectedCategory, tags, file } = req.body;
    user_id = auth.verifyUser(req);
    console.log("user_id_createmap: " + user_id);
    if (user_id === null) {
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        });
    }
    console.log("passed verify useer")
    if (!title || !description || !publicStatus || !tags || !selectedCategory|| !file) {
        return res.status(400).json({
            success: false,
            error: 'Invalid input. Please provide all required fields.',
        });
    }
    console.log("passed valid input")
    const body = req.body;
    console.log("createMap body: " + JSON.stringify(body));
    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a Map',
        });
    }

    const map = new MapPage({
        title: title,
        description: description,
        publicStatus: publicStatus,
        tags: tags,
        
        // file: file
        lastModified: Date.now(),
    });
    console.log("map: " + map.toString());
    if (!map) {
        return res.status(400).json({ success: false, error: err });
    }

    User.findOne({ _id: user_id }, (err, user) => {
        console.log("inside user findone")
        if (err) {
            console.log("error: " + err);
            return res.status(500).json({
                errorMessage: 'Internal Server Error',
            });
        }
        if (!user) {
            return res.status(404).json({
                errorMessage: 'User not found',
            });
        }
        console.log("user found: " + JSON.stringify(user));
        user.maps.push(map._id);
        user.save()
            .then(() => {
                map.save()
                    .then(() => {
                        return res.status(201).json({
                            map: map
                        });
                    })
                    .catch(error => {
                        console.log("error: " + error);
                        return res.status(500).json({
                            errorMessage: 'Internal Server Error',
                        });
                    });
            })
            .catch(error => {
                console.log("error: " + error);
                return res.status(500).json({
                    errorMessage: 'Internal Server Error',
                });
            });
    });
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

// Similar functions for other map-related endpoints

module.exports = {
    createMap,
    deleteMap,
    // Add other map-related functions here
};