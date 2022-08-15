const express = require('express');
const app = express();
const morgan = require('morgan');


app.listen(3000, () => {
    console.log('Connected on port 3000')
});

app.use(morgan('dev'));
app.use((req,res,next) => { // Middleware qui imite "Morgan"
    req.requestTime = Date.now();
    console.log(req.method, req.path)
    next()
});
const verifyPassword = ((req,res,next) => {
    const {password} = req.query;
    if(password === 'chicken'){
        console.log('Yes')
        next()
    } res.send('Need a password')
});

app.get('/bots', verifyPassword, (req, res) => {
    res.send('<h1>Beep boop</h1>')
});
app.get('/botsie', (req, res) => {
    res.send('<h1>Boop boop</h1>')
});
app.use((req,res) => {
    res.status(404).send('Not found');
});



