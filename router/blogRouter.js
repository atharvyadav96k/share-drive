const express = require('express');
const blog = express.Router();

blog.get('/', (req, res)=>{
    res.render('blogs/blog');
})
// blog.get('/:place', (req, res)=>{
//     res.render('blogs/blog-single');
// })
blog.get('/The-Gateway-of-India', (req, res)=>{
    res.render('blogs/The-Gateway-of-India');
})
blog.get('/Ajanta-and-Ellora-Caves-Tourism', (req, res)=>{
    res.render('blogs/Ajanta-and-Ellora-Caves-Tourism')
})
blog.get('/Tadoba-Andhari-Tiger-Reserve', (req, res)=>{
    res.render('blogs/Tadoba-Andhari-Tiger-Reserve')
})
blog.get('/Shirdi-The-Spiritual-Abode-of-Sai-Baba', (req, res)=>{
    res.render('blogs/Shirdi-The-Spiritual-Abode-of-Sai-Baba')
})
blog.get('/Mahabaleshwar-The-Queen-of-Hill-Stations-in-Maharashtra', (req, res)=>{
    res.render('blogs/Mahabaleshwar-The-Queen-of-Hill-Stations-in-Maharashtra')
})
blog.get('/Lonavala-and-Khandala-Twin-Hill-Stations-of-Tranquility', (req, res)=>{
    res.render('blogs/Lonavala-and-Khandala-Twin-Hill-Stations-of-Tranquility')
})
blog.get('/Sindhudurg-Fort-A-Majestic-Sea-Fort-in-Malvan', (req, res)=>{
    res.render('blogs/Sindhudurg-Fort-A-Majestic-Sea-Fort-in-Malvan')
})
blog.get('/Elephanta-Caves-A-UNESCO-World-Heritage-Site-in-Mumbai', (req, res)=>{
    res.render('blogs/Elephanta-Caves-A-UNESCO-World-Heritage-Site-in-Mumbai')
})
blog.get('/Raigad-Fort-The-Capital-of-the-Maratha-Empire', (req, res)=>{
    res.render('blogs/Raigad-Fort-The-Capital-of-the-Maratha-Empire')
})
module.exports = blog;