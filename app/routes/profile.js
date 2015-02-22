var member = require(__dirname+'/../model/member')
// var mongoose = require('mongoose')
module.exports = function (app) { 

    app.get('/profile', function (req, res) {
        return res.render('profile/profile', {member:req.user})
    })

    app.get('/profile/edit', function (req, res) {
        return res.render('profile/edit', {member:req.user})
    })

    app.post('/profile/update', function (req, res) {
    	console.log("making post")
        member.updatePreferences(req.body, function () {
            return res.send({});
        })
    })



}