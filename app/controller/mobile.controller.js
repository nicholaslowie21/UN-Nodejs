const moment = require('moment-timezone')
const db = require('../models')
const Institution = db.institution
const User = db.users
const ContactCard = db.contactcard
const { default: ShortUniqueId } = require('short-unique-id');
const uid = new ShortUniqueId();
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const nodeCountries =  require("node-countries");
const Helper = require('../service/helper.service')

exports.institutionChoice = async function (req, res){
    
    account = await User.findOne({ '_id': req.id }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!account)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such user account!',
        data: {}
    });

    if(!account.institutionIds.includes(req.body.institutionId))
    return res.status(500).json({
        status: 'error',
        msg: 'You are not affiliated to this institution!',
        data: {}
    });

    account.institutionChoice = req.body.institutionId

    account.save(account)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Institution choice updated',
            data: { user: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.deleteInsitutionChoice = async function (req, res){
    account = await User.findOne({ '_id': req.id }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!account)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such user account!',
        data: {}
    });

    account.institutionChoice = ""

    account.save(account)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Institution choice removed',
            data: { user: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.addContact = async function (req, res){

    let qrhash = req.body.qrhash.split(";")
    
    if(qrhash.length != 2)
    return res.status(500).json({
        status: 'error',
        msg: 'The qr hash is invalid!',
        data: {}
    });

    let accountId = qrhash[0]
    let accountType = qrhash[1]

    var account;

    if(accountType === "institution") {
        account = await Institution.findOne({ '_id': accountId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });
    } else if (accountType === "user") {
        account = await User.findOne({ '_id': accountId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });
    }

    if(!account)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    var institutionChosen = ""
    if(account.institutionChoice) institutionChosen = account.institutionChoice

    const temp = await ContactCard.findOne({ 'ownerId':req.id, 'ownerType':req.type, 'targetId': accountId, 'targetType': accountType, 'institutionId': institutionChosen, 'status':'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue while checking the cards!',
            data: {}
        });
    });

    if(temp)
    return res.status(500).json({
        status: 'error',
        msg: 'Such card has been created!',
        data: {}
    });

    const newContact = new ContactCard({
        institutionId: institutionChosen,
        targetId: accountId,
        targetType: accountType,
        ownerId: req.id,
        ownerType: req.type,
        status: 'active'
    })
    
    newContact.save(newContact)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'A new card is added',
            data: { card: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.deleteContact = async function (req, res){
    const card = await ContactCard.findOne({ '_id': req.body.cardId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the card!',
            data: {}
        });
    });

    if(!card)
    return res.status(500).json({
        status: 'error',
        msg: 'Such card is not found!',
        data: {}
    });

    if(req.id != card.ownerId && req.type != card.ownerType)
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized to perform this action!',
        data: {}
    });

    card.status = "deleted"

    card.save(card)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'The card is successfully deleted',
            data: { card: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.contactList = async function (req, res){
    const cards = await ContactCard.find({ 'ownerId': req.id, 'ownerType':req.type, 'status':'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the card!',
            data: {}
        });
    });

    if(!cards)
    return res.status(500).json({
        status: 'error',
        msg: 'Such cards not found!',
        data: {}
    });

    var theList = [];

    for(var i = 0; i < cards.length; i++) {
        var cardEntity = {
            id:"",
            institutionId: "",
            targetId: "",
            targetType: "",
            ownerId: "",
            ownerType: "",
            status: "",
            institutionName:"",
            institutionAddress:"",
            institutionImg:"",
            institutionUsername:"",
            institutionEmail:"",
            accountName:"",
            accountUsername:"",
            accountEmail:"",
            accountImg:"",
            accountOccupation:"",
            accountEmail:"",
            accountWebsite:"",
            accountCountry:"",
            accountSDGs:[],
            accountAddress:"",
            createdAt:""    
        }

        cardEntity.id = cards[i].id
        cardEntity.institutionId = cards[i].institutionId
        cardEntity.targetId = cards[i].targetId
        cardEntity.targetType = cards[i].targetType
        cardEntity.ownerId = cards[i].ownerId
        cardEntity.ownerType = cards[i].ownerType
        cardEntity.status = cards[i].status
        cardEntity.createdAt = cards[i].createdAt
        
        await getAccountInfo(cardEntity)
        if(cardEntity.institutionId != "")
            await getInstitutionInfo(cardEntity)
        
        theList.push(cardEntity)
    }

    return res.status(200).json({
        status: 'success',
        msg: 'Your card list is successfully retrieved',
        data: { cards: theList }
    });
}

async function getAccountInfo(theItem) {
    var owner;

    if(theItem.targetType === "user") {
        owner = await User.findOne({ '_id': theItem.targetId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } else if (theItem.targetType === 'institution') {
        owner = await Institution.findOne({ '_id': theItem.targetId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    }

    if(!owner) {
        console.log("error [mobileController]: (getAccountInfo) Such account not found!")
        return
    }

    theItem.accountImg = owner.ionicImg
    theItem.accountUsername = owner.username
    theItem.accountName = owner.name
    theItem.accountEmail = owner.email 
    theItem.accountWebsite = owner.website 
    theItem.accountSDGs = owner.SDGs 
    theItem.accountCountry = owner.country

    if(theItem.targetType === "user") {
        theItem.accountOccupation = owner.occupation
    }else if(theItem.targetType === "institution") {
        theItem.accountAddress = owner.address
    }
}

async function getInstitutionInfo(theItem) {
    const institution = await Institution.findOne({ '_id': theItem.institutionId }, function (err) {
        if (err) {
            console.log("error: "+err.message)
            return
        }
    });
    
    if(!institution) {
        console.log("error [mobileController]: (getInstitutionInfo) Such account not found!")
        return
    }

    theItem.institutionImg = institution.ionicImg
    theItem.institutionUsername = institution.username
    theItem.institutionName = institution.name
    theItem.institutionEmail = institution.email 
    theItem.institutionAddress = institution.address
}