const router = require('express').Router();
router.post('/', (req, res)=>{
    res.send('hello register page')
})

module.exports = router;