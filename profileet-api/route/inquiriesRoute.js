const express = require('express')
const router = express.Router();
const VALID_STATUSES = ['New', 'Replied', 'Booked']

let inquiries = [
  {
    id: '1',
    client: 'Amara Obi',
    service: 'Bridal gown & 2 asoebi',
    date: 'Jun 10',
    status: 'New',
    message: 'Hi, I need a bridal gown and 2 asoebi dresses for my wedding in August. Can we discuss pricing?',
  },
  {
    id: '2',
    client: 'Funke Adeyemi',
    service: 'Corporate blazer set',
    date: 'Jun 9',
    status: 'Replied',
    message: 'I would like a corporate blazer set in navy blue. Size 12. What is your turnaround time?',
  },
  {
    id: '3',
    client: 'Chisom Eze',
    service: 'Ankara two-piece',
    date: 'Jun 8',
    status: 'Booked',
    message: 'Please I want an Ankara two-piece for a naming ceremony. I have the fabric already.',
  },
];

const findInquiry=(array, id) =>  array.find(obj=> obj.id === id );

router.get('/',(req, res)=>{
        res.json(inquiries)
});

router.get('/:id',(req, res)=>{
   const inquiry = findInquiry(inquiries, req.params.id);
       if(!inquiry) return res.status(404).json({error:'404 not found'})
        res.json(inquiry)
});

router.patch('/:id', (req, res)=>{
    const inquiry = findInquiry(inquiries, req.params.id);
    if(!inquiry) return res.status(404).json({error:'Not found'});

    const { status } = req.body;
    if(!status) return res.status(400).json({message:'Status is required'});

    if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` })
  }

    inquiry.status = status
    res.json(inquiry);

})

module.exports = router
