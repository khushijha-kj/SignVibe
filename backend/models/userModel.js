const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'parent', 'admin'],
        required: true
    },
    studentClass: {
        type: Number
    },
    studentParent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    teacherSubjects: [{
        type: String,
        trim: true
    }],
    parentChild: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);