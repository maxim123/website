var Pitch = require(__dirname+'/../model/pitch')
var mongoose = require('mongoose')
module.exports = function (app) { 

    app.get('/pitch', function (req, res) {
        return res.redirect('https://docs.google.com/a/umich.edu/document/d/11SaehysI5rf6Xmx6Z0OdD1lkhkLkByjvSE3WZP3MxHY')
    })

    app.get('/pitch/all', function (req, res) {
        Pitch.find({}, function (err, pitches) {
            return res.render('pitch/all',{pitches:pitches})
        })
    })

    app.get('/pitch/new', function (req, res) {
        return res.render('pitch/new',{member:req.user})
    })

    app.post('/pitch/new', function (req, res) {
        var pitch = new Pitch(req.body)
        pitch.save(function (err) {
            if (err) throw err
            pitch.member = req.user
            return res.render('pitch/view',{member:req.user,pitch:pitch,votes:{innovation:0,usefulness:0,coolness:0}})
        })
    })

    app.get('/pitch/:id/vote', function (req, res) {
        Pitch.findOne({_id:req.params.id},function (err, pitch) {
            if (err) throw err
            return res.render('pitch/vote',{member:req.user,pitch:pitch})
        })
    })

    app.post('/pitch/:id/vote', function (req, res) {
        Pitch.findOne({_id:req.params.id},function (err, pitch) {
            pitch.populate('member', function (err, pitch) {
                if (err) throw err
                var userHasSeen = false
                for (var i in pitch.votes) {
                    if (pitch.votes[i].member == req.user._id) {
                        pitch.votes[i] = {                    
                            member:req.body.member,
                            innovationScore:Number(req.body.innovationScore),
                            usefulnessScore:Number(req.body.usefulnessScore),
                            coolnessScore:Number(req.body.coolnessScore)
                        } /// this is broken!! mongodb doesn't like updating the array
                        userHasSeen = true
                    }
                }
                if (!userHasSeen) pitch.votes.push({
                    member:req.body.member,
                    innovationScore:Number(req.body.innovationScore),
                    usefulnessScore:Number(req.body.usefulnessScore),
                    coolnessScore:Number(req.body.coolnessScore)
                }) // /// this is broken!!
                pitch.markModified('votes')
                pitch.save( function (err) {
                    if (err) throw err
                    return res.render('pitch/view',{member:req.user,pitch:pitch,votes:{innovation:0,usefulness:0,coolness:0}})
                })
            })
        })
    })

    app.get('/pitch/:id', function (req, res) {
        Pitch.findOne({_id:req.params.id}, function (err, pitch) {
            pitch.populate('member', function (err, pitch) {
                if (err) throw err
                var votes = pitch.votes.reduce(function (prev,cur) {
                    prev.innovation += cur.innovationScore
                    prev.usefulness += cur.usefulnessScore
                    prev.coolness += cur.coolnessScore
                    return prev
                },{innovation:0,usefulness:0,coolness:0})
                var userHasSeen = false
                for (var i in pitch.votes) {
                    if (pitch.votes[i].member == req.user._id) userHasSeen = true
                }
                return res.render('pitch/view',{member:req.user,pitch:pitch,votes:votes,userHasSeen:userHasSeen})
            })
        })
    })

}