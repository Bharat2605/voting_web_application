const express = require('express');
const router = express.Router();
const Candidate = require('./../models/candidate');
const { jwtAuthMiddleware } = require('./../jwt');
const User = require('../models/user');

const checkAdminRole = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user && user.role === 'admin';
  } catch (err) {
    return false;
  }
};

// add a candidate (admin only)
router.post('/', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ message: 'user does not have admin role' });
    const data = req.body;
    const newCandidate = new Candidate(data);
    const response = await newCandidate.save();
    res.status(200).json({ response });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// update candidate details (admin only)
router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ message: 'user does not have admin role' });
    const candidateId = req.params.candidateID;
    const updateCandidateData = req.body;
    const response = await Candidate.findByIdAndUpdate(candidateId, updateCandidateData, {
      new: true,
      runValidators: true,
    });
    if (!response) return res.status(404).json({ error: 'Candidate not found' });
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// delete candidate (admin only)
router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ message: 'user does not have admin role' });
    const candidateId = req.params.candidateID;
    const response = await Candidate.findByIdAndDelete(candidateId);
    if (!response) return res.status(404).json({ error: 'Candidate not found' });
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// vote counts (sorted) — MUST be declared before '/vote/:candidateID'
router.get('/vote/count', async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ voteCount: 'desc' });
    const voteRecord = candidates.map((data) => ({
      name: data.name,
      party: data.party,
      count: data.voteCount,
    }));
    return res.status(200).json(voteRecord);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// vote for a candidate
router.get('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
  const candidateID = req.params.candidateID;
  const userId = req.user.id;
  try {
    const candidate = await Candidate.findById(candidateID);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'user not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'admin is not allowed' });
    if (user.isVoted) return res.status(400).json({ message: 'You have already voted' });

    candidate.votes.push({ user: userId });
    candidate.voteCount++;
    await candidate.save();

    user.isVoted = true;
    await user.save();
    return res.status(200).json({ message: 'Vote recorded successfully' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// get list of all candidates (id + name + party)
router.get('/', async (req, res) => {
  try {
    const candidates = await Candidate.find({}, 'name party');
    res.status(200).json(candidates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
