const Map = require('../models/map-model');
const User = require('../models/user-model');
const auth = require('../auth');

createMap = (req, res) => {
    if (auth.verifyUser(req) === null) {
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        });
    }
    const body = req.body;
    console.log("createMap body: " + JSON.stringify(body));
    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a Map',
        });
    }

    const map = new Map(body);
    console.log("map: " + map.toString());
    if (!map) {
        return res.status(400).json({ success: false, error: err });
    }

    User.findOne({ _id: req.userId }, (err, user) => {
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
                        return res.status(400).json({
                            errorMessage: 'Map Not Created!'
                        });
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