const router = require('express').Router();
router.post('/', (req, res)=>{
    res.send('hello sign in page')
})

module.exports = router;