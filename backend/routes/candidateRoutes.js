const express = require('express');
const router = express.Router();
const Candidate = require('./../models/candidate');
const { jwtAuthMiddleware } = require('./../jwt');
const User = require('../models/user');
const VotingWindow = require('../models/votingWindow');

// Party logo must be a small PNG/JPEG/WEBP data URL (empty string = no logo).
const MAX_LOGO_LENGTH = 300000; // characters, roughly 220 KB of image
const isValidLogo = (value) =>
  value === '' ||
  (typeof value === 'string' &&
    value.length <= MAX_LOGO_LENGTH &&
    /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value));

const checkAdminRole = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user && user.role === 'admin';
  } catch (err) {
    return false;
  }
};


// ---- Voting time window --------------------------------------------------
// status: 'always' (no limit set) | 'upcoming' | 'open' | 'closed'
const getWindow = () => VotingWindow.findOne({ key: 'main' }).lean();

const windowStatus = (w, now = Date.now()) => {
  if (!w?.startTime || !w?.endTime) return 'always';
  if (now < new Date(w.startTime).getTime()) return 'upcoming';
  if (now >= new Date(w.endTime).getTime()) return 'closed';
  return 'open';
};

const windowPayload = (w) => ({
  startTime: w?.startTime || null,
  endTime: w?.endTime || null,
  status: windowStatus(w),
  serverTime: new Date().toISOString(), // lets the browser correct its own clock
});

// Everyone (logged in + face verified) can read the window.
router.get('/voting-window', jwtAuthMiddleware , async (req, res) => {
  try {
    res.status(200).json(windowPayload(await getWindow()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin sets { startTime, endTime } (ISO strings), or sends both as null to remove the limit.
router.put('/voting-window',  jwtAuthMiddleware ,async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) return res.status(403).json({ message: 'Admin role required' });

    const { startTime, endTime } = req.body;
    let update;

    if (startTime === null && endTime === null) {
      update = { startTime: null, endTime: null };
    } else {
      const start = new Date(startTime);
      const end = new Date(endTime);
      if (!startTime || !endTime || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return res.status(400).json({ error: 'Valid start time and end time are required' });
      }
      if (end <= start) {
        return res.status(400).json({ error: 'End time must be after start time' });
      }
      if (end.getTime() <= Date.now()) {
        return res.status(400).json({ error: 'End time must be in the future' });
      }
      update = { startTime: start, endTime: end };
    }

    const saved = await VotingWindow.findOneAndUpdate(
      { key: 'main' },
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    res.status(200).json(windowPayload(saved));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// add a candidate (admin only)
router.post('/', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ message: 'user does not have admin role' });
    const data = req.body;

    // NEW: logo is optional, but if sent it must be a valid small image
    if (data.partyLogo !== undefined && !isValidLogo(data.partyLogo)) {
      return res.status(400).json({ error: 'Party logo must be a PNG, JPG or WEBP image under 200 KB' });
    }

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
       
        if (typeof req.body.name === 'string') {
      if (!req.body.name.trim()) return res.status(400).json({ error: 'Name cannot be empty' });
      allowed.name = req.body.name.trim();
    }
    if (typeof req.body.party === 'string') {
      if (!req.body.party.trim()) return res.status(400).json({ error: 'Party cannot be empty' });
      allowed.party = req.body.party.trim();
    }
    if (req.body.age !== undefined) {
      if (!Number.isInteger(Number(req.body.age))) {
        return res.status(400).json({ error: 'Age must be a whole number' });
      }
      allowed.age = Number(req.body.age);
    }

     if (req.body.partyLogo !== undefined && !isValidLogo(req.body.partyLogo)) {
      return res.status(400).json({ error: 'Party logo must be a PNG, JPG or WEBP image under 200 KB' });
    }

    const response = await Candidate.findByIdAndUpdate(candidateId, updateCandidateData, {
      new: true,
      runValidators: true,
    });
    if (!response) return res.status(404).json({ error: 'Candidate not found' });
    res.status(200).json(response);
  } catch (err) {
        if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid candidate id' });
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
      partyLogo: data.partyLogo,
      count: data.voteCount,
    }));
    return res.status(200).json(voteRecord);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST is intentional: voting changes server state and must never be a GET.
// The user update is conditional on isVoted=false, which prevents concurrent
// requests from successfully casting two votes for the same account.
router.post('/vote/:candidateID', jwtAuthMiddleware , async (req, res) => {
  const userId = req.user.id;
  const candidateID = req.params.candidateID;

  try {

        // Time limit check - BEFORE the vote is reserved, so a blocked attempt never uses up the voter's single vote.
    const status = windowStatus(await getWindow());
    if (status === 'upcoming') {
      return res.status(403).json({ code: 'VOTING_NOT_STARTED', message: 'Voting has not started yet.' });
    }
    if (status === 'closed') {
      return res.status(403).json({ code: 'VOTING_CLOSED', message: 'Voting has ended.' });
    }
    const user = await User.findOneAndUpdate(
      { _id: userId, role: 'voter', isVoted: false },
      { $set: { isVoted: true } },
      { new: true }
    );

    if (!user) {
      const existing = await User.findById(userId).select('role isVoted');
      if (!existing) return res.status(404).json({ message: 'User not found' });
      if (existing.role === 'admin') return res.status(403).json({ message: 'Admin is not allowed to vote' });
      return res.status(400).json({ message: 'You have already voted' });
    }

    const candidate = await Candidate.findByIdAndUpdate(
      candidateID,
      {
        $inc: { voteCount: 1 },
        $push: { votes: { user: userId } },
      },
      { new: true }
    );

    if (!candidate) {
      // Roll back the reservation if the candidate disappeared between checks.
      await User.updateOne({ _id: userId, isVoted: true }, { $set: { isVoted: false } });
      return res.status(404).json({ message: 'Candidate not found' });
    }

    return res.status(200).json({ message: 'Vote recorded successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// get list of all candidates (id + name + party)
router.get('/', async (req, res) => {
  try {
   const candidates = await Candidate.find({}, 'name party age partyLogo');
    res.status(200).json(candidates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
