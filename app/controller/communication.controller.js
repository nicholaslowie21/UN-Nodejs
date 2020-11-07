const moment = require('moment-timezone')
const db = require('../models')
const Announcement = db.announcement
const User = db.users
const Institution = db.institution
const Chat = db.chat
const ChatRoom = db.chatroom
const Helper = require('../service/helper.service')

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
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    if(account.role === "user")
    return res.status(500).json({
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
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!account)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    if(account.role === "user")
    return res.status(500).json({
        status: 'error',
        msg: 'Only admin is authorized to perform this!',
        data: {}
    });

    var announcement = await Announcement.findOne({ '_id': req.body.announcementId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!announcement)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such announcement!',
        data: {}
    });

    announcement.title = req.body.title
    announcement.desc = req.body.desc
    
    announcement.save(announcement)
    .then(data => {
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
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    if(account.role === "user")
    return res.status(500).json({
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
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such announcement!',
        data: {}
    });

    announcement.isDeleted = true;

    announcement.save(announcement)
    .then(data => {
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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

    var chatRoom = await ChatRoom.findOne({ 'status': 'open', 'user1id': user1.id, 'user2id': user2.id }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the announcement!',
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

    var chats = await Chat.find({ 'roomId': chatRoom.id }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the announcement!',
            data: {}
        });
    });
    
    
    var action = "Account opened a chat room with "+targetAccount.username
    
    Helper.createAuditLog(action,req.type,req.id)

    return res.status(200).json({
        status: 'success',
        msg: 'Chat room successfully entered',
        data: { chatRoom: chatRoom, chats: chats }
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
    return res.status(500).json({
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
    return res.status(500).json({
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
            msg: 'There was an issue retrieving the announcement!',
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
    return res.status(500).json({
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
    return res.status(500).json({
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

exports.getRoomList = async function (req, res) {
    var chatRooms = await ChatRoom.find({ 'status':'open','chatType':req.query.chatType, $or: [{user1id: req.id}, {user2id: req.id}]  }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!chatRooms)
    return res.status(500).json({
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
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    chatRooms.reverse();

    return res.status(200).json({
        status: 'success',
        msg: 'Chat rooms successfully retrieved',
        data: { chatRooms: chatRooms }
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
    return res.status(500).json({
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
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });
    
    if(req.id === chatRoom.user1id) {
        chatRoom.user1read = true
    } else if(req.id === chatRoom.user2id) {
        chatRoom.user2read = true
    }

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
            data: { chatRoom: chatRoom, chats: chats }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
    
}
