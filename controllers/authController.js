const User = require('../models/User');
const jwt = require('jsonwebtoken');

const maxAge = 3 * 24 * 60 * 60;

// handle errors
const handleError = (err) => {
    let errors = { email: '', password: ''}


    // incorrect email
    if(err.message === 'incorrect email') {
        errors.email = 'Email Address is not registered';
        return errors;
    }

    // incorrect password
    if(err.message === 'incorrect password') {
        errors.password = 'Password is not correct';
        return errors;
    }

    // validation errors
    if(err.message.includes('user validation failed')){
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
        return errors;
    }

    // duplicate error code
    if(err.code === 11000) {
        errors.email = 'Email is already registered';
        return errors;
    }

}

const createToken = (id) => {
    return jwt.sign({ id }, 'nazycodes secret', {
        expiresIn: maxAge
    });
}

module.exports.signup_get = (req, res) => {
    res.render('signup');
}

module.exports.login_get = (req, res) => {
    res.render('login');
}

module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1, httpOnly: true });
    res.redirect('/');
}

module.exports.signup_post = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.create({ email, password });
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(201).json({ user: user._id });
    } catch (err) {
        const errors = handleError(err);
        res.status(400).json({ errors });
    }
}

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.login(email, password); 
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(200).json({ user: user._id});
    } catch (err) {
        const errors = handleError(err);
        res.status(400).json({ errors });
    }
}