const express = require('express');

const router = express.Router();
const { requireAuth,requireDesigner }= require('../middleware/auth')

const VALID_STATUSES = ['open', 'busy', 'off']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

router.use(requireAuth, requireDesigner);

router.get('/weekdays', (req,res)=>{
    res.status(200).json({weekdays:WEEKDAYS})
})