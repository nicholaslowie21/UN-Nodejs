const moment = require('moment-timezone')
const db = require('../models')
const Announcement = db.announcement
const User = db.users
const Institution = db.institution
const Chat = db.chat
const ChatRoom = db.chatroom
const AuditLog = db.auditlog
const Notification = db.notification
const Project = db.project
const DiscoverWeekly = db.discoverweekly
const Helper = require('../service/helper.service')
const CronJob = require('cron').CronJob

exports.createAnnouncement = async function (req, res){
    let account; 

    account = await User.findOne({ '_id': req.id }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!account)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    if(account.role === "user")
    return res.status(400).json({
        status: 'error',
        msg: 'Only admin is authorized to perform this!',
        data: {}
    });

    const announcement = new Announcement({
		title: req.body.title,
        desc: req.body.desc,
        isDeleted: false
    });
    
    announcement.save(announcement)
    .then(data => {
        
        var action = "Account created an Announcement: "+ announcement.title +";"+data.id
        Helper.createAuditLog(action,"admin",req.id)

        return res.status(200).json({
            status: 'success',
            msg: 'Announcement successfully created',
            data: { announcement: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });


}

exports.editAnnouncement = async function (req, res) {
    let account; 

    account = await User.findOne({ '_id': req.id }, function (err) {
        if (err)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!account)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    if(account.role === "user")
    return res.status(400).json({
        status: 'error',
        msg: 'Only admin is authorized to perform this!',
        data: {}
    });

    var announcement = await Announcement.findOne({ '_id': req.body.announcementId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such announcement!',
            data: {}
        });
    });

    if(!announcement)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such announcement!',
        data: {}
    });

    announcement.title = req.body.title
    announcement.desc = req.body.desc
    
    announcement.save(announcement)
    .then(data => {
        
        var action = "Account edited an Announcement: "+ announcement.title +";"+data.id
        Helper.createAuditLog(action,"admin",req.id)

        return res.status(200).json({
            status: 'success',
            msg: 'Announcement successfully updated',
            data: { announcement: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

}

exports.deleteAnnouncement = async function (req, res) {
    let account; 

    account = await User.findOne({ '_id': req.id }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!account)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    if(account.role === "user")
    return res.status(400).json({
        status: 'error',
        msg: 'Only admin is authorized to perform this!',
        data: {}
    });

    const announcement = await Announcement.findOne({ '_id': req.query.announcementId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the announcement!',
            data: {}
        });
    });

    if(!announcement) 
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such announcement!',
        data: {}
    });

    announcement.isDeleted = true;

    announcement.save(announcement)
    .then(data => {

        var action = "Account deleted an Announcement: "+ announcement.title +";"+data.id
        Helper.createAuditLog(action,"admin",req.id)

        return res.status(200).json({
            status: 'success',
            msg: 'Announcement successfully deleted',
            data: { announcement: data }
        });
     }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

}

exports.getAnnouncement = async function (req, res) {

    const announcements = await Announcement.find({ 'isDeleted': false }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving announcements!',
            data: {}
        });
    });

    if(!announcements) 
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such announcements!',
        data: {}
    });

    announcements.reverse();

    return res.status(200).json({
        status: 'success',
        msg: 'Announcements successfully retrieved',
        data: { announcements: announcements }
    });
}

exports.chatAccount = async function (req, res) {
    var targetAccount 
    
    if (req.body.targetType === 'user') {
        targetAccount = await User.findOne({ '_id': req.body.targetId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });
    } else if (req.body.targetType === 'institution') {
        targetAccount = await Institution.findOne({ '_id': req.body.targetId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });
    }

    if(!targetAccount)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    var myAccount 
    
    if(req.type === 'user') {
        myAccount = await User.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });
    } else if(req.type === 'institution') {
        myAccount = await Institution.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });
    }  

    if(!myAccount)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    var user1;
    var user2;
    var user1type;
    var user2type;

    if(myAccount.id < targetAccount.id) {
        user1 = myAccount
        user2 = targetAccount
        user1type = req.type
        user2type = req.body.targetType
    } else {
        user1 = targetAccount
        user2 = myAccount
        user1type = req.body.targetType
        user2type = req.type
    }

    var chatRoom = await ChatRoom.findOne({ 'status': 'open', 'user1id': user1.id, 'user2id': user2.id, 'chatType':req.body.chatType }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the chatroom!',
            data: {}
        });
    });

    if(!chatRoom) {
        const newChatRoom = new ChatRoom({
            chatType: req.body.chatType,
            status: 'open',
            user1username: user1.username,
            user2username: user2.username,
            user1type: user1type,
            user2type: user2type,
            user1id: user1.id,
            user2id: user2.id,
            user1read: true,
            user2read: true,
            lastMessage: ""
        });

        await newChatRoom.save(newChatRoom)
        .then(data => {
            chatRoom = data;
        }).catch(err => {
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! Error: ' + err.message,
                data: {}
            });
        });
    } 

    var theTargetAcc = {
        accountId: "",
        accountType:""
    }
    if(chatRoom.user1id === req.id) {
        theTargetAcc.accountId = chatRoom.user2id
        theTargetAcc.accountType = chatRoom.user2type
    } else if(chatRoom.user2id === req.id) {
        theTargetAcc.accountId = chatRoom.user1id
        theTargetAcc.accountType = chatRoom.user1type
    } 

    const theChatRoom = {
        id: chatRoom.id,
        chatType: chatRoom.chatType,
        status: chatRoom.status,
        user1username: chatRoom.user1username,
        user2username: chatRoom.user2username,
        user1type: chatRoom.user1type,
        user2type: chatRoom.user2type,
        user1id: chatRoom.user1id,
        user2id: chatRoom.user2id,
        user1read: chatRoom.user1read,
        user2read: chatRoom.user2read,
        lastMessage: chatRoom.lastMessage,
        createdAt: chatRoom.createdAt,
        updatedAt: chatRoom.updatedAt,
        targetImg: ""
    };

    theChatRoom.targetImg = await getTargetImg(theTargetAcc)

    var chats = await Chat.find({ 'roomId': chatRoom.id }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the chats!',
            data: {}
        });
    });
    
    
    var action = "Account opened a chat room with "+targetAccount.username
    
    Helper.createAuditLog(action,req.type,req.id)

    return res.status(200).json({
        status: 'success',
        msg: 'Chat room successfully entered',
        data: { chatRoom: theChatRoom, chats: chats }
    });
}

exports.sendChat = async function (req, res) {
    var chatRoom = await ChatRoom.findOne({ '_id': req.body.roomId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!chatRoom)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such chat room!',
        data: {}
    });

    var myAccount 
    
    if(req.type === 'user') {
        myAccount = await User.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });
    } else if(req.type === 'institution') {
        myAccount = await Institution.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });
    }  

    if(!myAccount)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    if(req.body.message.length === 0) {
        return res.status(200).json({
            status: 'success',
            msg: 'It was just an empty text, nothing changed!',
            data: {}
        }); 
    }

    const newChat = new Chat({
        roomId: req.body.roomId,
        message: req.body.message,
        accountId: req.id,
        accountType: req.type,
        accountUsername: myAccount.username
    });

    await newChat.save(newChat)
    .then(data => {
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    var chats = await Chat.find({ 'roomId': chatRoom.id }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the chats!',
            data: {}
        });
    });

    
    chatRoom.lastMessage = req.body.message
    var targetUsername = ''
    if(req.id === chatRoom.user1id) {
        chatRoom.user1read = true
        chatRoom.user2read = false
        targetUsername = chatRoom.user2username
    } else if(req.id === chatRoom.user2id) {
        chatRoom.user1read = false
        chatRoom.user2read = true
        targetUsername = chatRoom.user1username
    }

    await chatRoom.save(chatRoom)
    .then(data => {

        
        var action = "Account send a chat to "+targetUsername
        
        Helper.createAuditLog(action,req.type,req.id)
        
        return res.status(200).json({
            status: 'success',
            msg: 'Chat successfully sent',
            data: { chats: chats, chatRoom: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
    
}

exports.markRead = async function (req, res) {
    var chatRoom = await ChatRoom.findOne({ '_id': req.body.roomId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!chatRoom)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such chat room!',
        data: {}
    });

    var myAccount 
    
    if(req.type === 'user') {
        myAccount = await User.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });
    } else if(req.type === 'institution') {
        myAccount = await Institution.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });
    }  

    if(!myAccount)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });
    
    if(req.id === chatRoom.user1id) {
        chatRoom.user1read = true
    } else if(req.id === chatRoom.user2id) {
        chatRoom.user2read = true
    }

    await chatRoom.save(chatRoom)
    .then(data => {
        
        return res.status(200).json({
            status: 'success',
            msg: 'Chats successfully mark as read',
            data: { chatRoom: chatRoom }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
    
}

exports.getRoomListFiltered = async function (req, res) {
    var chatRooms = await ChatRoom.find({ 'status':'open','chatType':req.query.chatType, $or: [{user1id: req.id}, {user2id: req.id}]  }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!chatRooms)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such chat room!',
        data: {}
    });

    var myAccount 
    
    if(req.type === 'user') {
        myAccount = await User.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });
    } else if(req.type === 'institution') {
        myAccount = await Institution.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });
    }  

    if(!myAccount)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    var theList = [];

    for(var i = 0 ; i < chatRooms.length; i ++) {
        const theChatRoom = {
            id: chatRooms[i].id,
            chatType: chatRooms[i].chatType,
            status: chatRooms[i].status,
            user1username: chatRooms[i].user1username,
            user2username: chatRooms[i].user2username,
            user1type: chatRooms[i].user1type,
            user2type: chatRooms[i].user2type,
            user1id: chatRooms[i].user1id,
            user2id: chatRooms[i].user2id,
            user1read: chatRooms[i].user1read,
            user2read: chatRooms[i].user2read,
            lastMessage: chatRooms[i].lastMessage,
            createdAt: chatRooms[i].createdAt,
            updatedAt: chatRooms[i].updatedAt,
            targetImg: ""
        };

        var theTargetAcc = {
            accountId: "",
            accountType:""
        }
        if(theChatRoom.user1id === req.id) {
            theTargetAcc.accountId = theChatRoom.user2id
            theTargetAcc.accountType = theChatRoom.user2type
        } else if(theChatRoom.user2id === req.id) {
            theTargetAcc.accountId = theChatRoom.user1id
            theTargetAcc.accountType = theChatRoom.user1type
        } 

        theChatRoom.targetImg = await getTargetImg(theTargetAcc)

        theList.push(theChatRoom)

    }

    theList.sort(function(a, b){
        var aTime = a.updatedAt
        var bTime = b.updatedAt
        if(moment(aTime).isBefore(moment(bTime)) ) 
            return 1
        else
            return -1      
    })
    
    return res.status(200).json({
        status: 'success',
        msg: 'Filtered chat rooms successfully retrieved',
        data: { chatRooms: theList }
    });
}

exports.getNotifications = async function (req, res) {
    var notifications = await Notification.find({ 'accountId':req.id,'accountType':req.type }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+err.message,
            data: {}
        });
    });

    if(!notifications) {
        return res.status(400).json({
            status: 'error',
            msg: 'There was an issue while retrieving notifications!',
            data: {}
        });
    } else {
        notifications.reverse()

        
        
        res.status(200).json({
            status: 'success',
            msg: 'Notifications successfully retrieved',
            data: { notifications: notifications }
        });

        await Notification.updateMany({ 'accountId':req.id,'accountType':req.type } , { isRead: true } );
        return
    }
    
}

exports.gotNewNotif = async function (req, res) {
    var notifications = await Notification.find({ 'accountId':req.id,'accountType':req.type }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+err.message,
            data: {}
        });
    });

    if(!notifications) {
        return res.status(400).json({
            status: 'error',
            msg: 'There was an issue while retrieving notifications!',
            data: {}
        });
    } else if (notifications.length > 0) {
        notifications.reverse()

        var gotNew = false;

        if(notifications[0].isRead === false) gotNew = true
        
        return res.status(200).json({
            status: 'success',
            msg: 'New notifications successfully checked',
            data: { gotNew: gotNew }
        });
    } else {
        return res.status(200).json({
            status: 'success',
            msg: 'New notifications successfully checked',
            data: { gotNew: false }
        });
    }
    
}

exports.getRoomList = async function (req, res) {
    var chatRooms = await ChatRoom.find({ 'status':'open', $or: [{user1id: req.id}, {user2id: req.id}]  }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!chatRooms)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such chat room!',
        data: {}
    });

    var myAccount 
    
    if(req.type === 'user') {
        myAccount = await User.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });
    } else if(req.type === 'institution') {
        myAccount = await Institution.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });
    }  

    if(!myAccount)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    var theList = [];

    for(var i = 0 ; i < chatRooms.length; i ++) {
        const theChatRoom = {
            id: chatRooms[i].id,
            chatType: chatRooms[i].chatType,
            status: chatRooms[i].status,
            user1username: chatRooms[i].user1username,
            user2username: chatRooms[i].user2username,
            user1type: chatRooms[i].user1type,
            user2type: chatRooms[i].user2type,
            user1id: chatRooms[i].user1id,
            user2id: chatRooms[i].user2id,
            user1read: chatRooms[i].user1read,
            user2read: chatRooms[i].user2read,
            lastMessage: chatRooms[i].lastMessage,
            createdAt: chatRooms[i].createdAt,
            updatedAt: chatRooms[i].updatedAt,
            targetImg: ""
        };

        var theTargetAcc = {
            accountId: "",
            accountType:""
        }
        if(theChatRoom.user1id === req.id) {
            theTargetAcc.accountId = theChatRoom.user2id
            theTargetAcc.accountType = theChatRoom.user2type
        } else if(theChatRoom.user2id === req.id) {
            theTargetAcc.accountId = theChatRoom.user1id
            theTargetAcc.accountType = theChatRoom.user1type
        } 

        theChatRoom.targetImg = await getTargetImg(theTargetAcc)

        theList.push(theChatRoom)

    }

    theList.sort(function(a, b){
        var aTime = a.updatedAt
        var bTime = b.updatedAt
        if(moment(aTime).isBefore(moment(bTime)) ) 
            return 1
        else
            return -1      
    })

    return res.status(200).json({
        status: 'success',
        msg: 'Chat rooms successfully retrieved',
        data: { chatRooms: theList }
    });
}

exports.getChats = async function (req, res) {
    var chatRoom = await ChatRoom.findOne({ '_id': req.query.roomId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!chatRoom)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such chat room!',
        data: {}
    });

    var myAccount 
    
    if(req.type === 'user') {
        myAccount = await User.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });
    } else if(req.type === 'institution') {
        myAccount = await Institution.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });
    }  

    if(!myAccount)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });
    
    if(req.id === chatRoom.user1id) {
        chatRoom.user1read = true
    } else if(req.id === chatRoom.user2id) {
        chatRoom.user2read = true
    }

    var theTargetAcc = {
        accountId: "",
        accountType:""
    }
    if(chatRoom.user1id === req.id) {
        theTargetAcc.accountId = chatRoom.user2id
        theTargetAcc.accountType = chatRoom.user2type
    } else if(chatRoom.user2id === req.id) {
        theTargetAcc.accountId = chatRoom.user1id
        theTargetAcc.accountType = chatRoom.user1type
    } 

    var targetImg = ""
    targetImg = await getTargetImg(theTargetAcc)

    var chats = await Chat.find({ 'roomId': req.query.roomId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    await chatRoom.save(chatRoom)
    .then(data => {
        
        return res.status(200).json({
            status: 'success',
            msg: 'Chats successfully retrieved',
            data: { targetImg: targetImg, chatRoom: chatRoom, chats: chats }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
    
}

async function getTargetImg(theItem) {
    var owner;

    if(theItem.accountType === "user") {
        owner = await User.findOne({ '_id': theItem.accountId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } else if (theItem.accountType === 'institution') {
        owner = await Institution.findOne({ '_id': theItem.accountId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    }

    if(!owner) {
        console.log("error: (getTargetImg) Such account not found!")
        return
    }

    return owner.ionicImg 
}

async function runInactiveEmailReminder () {
    const users = await User.find({ 'status': 'active' }, function (err) {
        if (err) console.log(err)
    });

    for(var i = 0; i < users.length; i++) {
        checkAndSendEmail(users[i].id,"user",users[i].email)
    }

    const institutions = await Institution.find({ 'status': 'active' }, function (err) {
        if (err) console.log(err)
    });

    for(var i = 0; i < institutions.length; i++) {
        checkAndSendEmail(institutions[i].id,"institution",institutions[i].email)
    }
}

async function checkAndSendEmail(targetId, targetType, targetEmail) {
    const logs = await AuditLog.find({ 'targetId': targetId, 'targetType': targetType }, function (err) {
        if (err) console.log(err)
    });
    
    if(!logs) return
    if(logs.length === 0) return

    logs.reverse()

    var lastActiveDate = moment(logs[0].createdAt).tz('Asia/Singapore')
    var dateNow = moment.tz('Asia/Singapore')

    if(dateNow.diff(lastActiveDate, 'days') >= 30) {

        var projectIds = [];
        discoverWeekly = await DiscoverWeekly.findOne({ 'accountId': targetId, 'accountType': targetType }, function (err) {
            if (err) console.log("Error (checkAndSendEmail): [iactiveEmail] "+err)
        });
    
        if(discoverWeekly) 
        projectIds = discoverWeekly.projectIds;

        var theProjects = ""
        var count = 0;
        for(var i = 0; i < projectIds.length; i++) {
            var temp = await getProject(projectIds[i])

            if(temp){
                if(count > 0) theProjects = theProjects+", "+temp.title
                else theProjects += temp.title

                count++;
            }
        }
        
        theProjects += ".";
            
        let subject = 'KoCoSD Platform'
        let theMessage = `
            <h1>We missed you!</h1>
            <p>It's been a while since you last log in. Come back and check out what's new!</p>
            <br>
        `

        if(count>0) {
            theMessage = `
            <h1>We missed you!</h1>
            <p>It's been a while since you last log in. Come back and check out what's new!</p>
            <p>Here are some of the projects that might interest you: <b>${theProjects}</b></p>
            <br>
        `
        }

        Helper.sendEmail(targetEmail, subject, theMessage, function (info) {
            if (!info) {
                console.log('Something went wrong while trying to send email!')
            } 
        })    
    } else return
}

async function getProject(theId) {
    const project = await Project.findOne({ '_id': theId }, function (err) {
        if (err) {
            console.log("error: "+err.message)
            return
        }
    });

    if(!project) return
    if(project.status != 'ongoing') return

    return project
}

exports.triggerInactiveEmail = async function (req, res) {    
    runInactiveEmailReminder()

    return res.status(200).json({
        status: 'success',
        msg: 'Email reminder to inactive user successfully manually triggered',
        data: { }
    });
}

new CronJob('59 23 * * 0', async function () {
    runInactiveEmailReminder()
    console.log('Email reminder to inactive user triggered')
}, null, true, 'Asia/Singapore');