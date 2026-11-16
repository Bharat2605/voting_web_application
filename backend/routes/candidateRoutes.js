const express = require('express');
const router = express.Router();
const Candidate = require('./../models/candidate');
const { jwtAuthMiddleware } = require('./../jwt');
const User = require('../models/user');
const Settings = require('../models/settings');


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


// ---------- VOTING DATE & TIME (set by admin) ----------
const getVotingTime = async () =>
  (await Settings.findOne({ key: 'voting' })) ||
  (await Settings.create({ key: 'voting' }));

const toISTInput = (d) =>
  d ? d.toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' }).slice(0, 16).replace(' ', 'T') : '';

const toISTText = (d) =>
  d ? d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) : '';

const isVotingOpen = async () => {
  const { start, end } = await getVotingTime();
  const now = new Date();
  return { open: !!(start && end && now >= start && now < end), start, end };
};

router.get('/voting-time', jwtAuthMiddleware, async (req, res) => {
  try {
    const { start, end } = await getVotingTime();
    res.json({ start: toISTInput(start), end: toISTInput(end) });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/voting-time', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ message: 'user does not have admin role' });

    const start = new Date(`${req.body.start}:00+05:30`);
    const end   = new Date(`${req.body.end}:00+05:30`);
    if (isNaN(start) || isNaN(end) || start >= end)
      return res.status(400).json({ error: 'Enter valid start and end date-time; start must be before end' });

    const s = await Settings.findOneAndUpdate(
      { key: 'voting' }, { start, end }, { new: true, upsert: true }
    );
    res.json({ start: toISTInput(s.start), end: toISTInput(s.end) });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// ONLY ADMIN can clear the voting date & time
   router.delete('/voting-time', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ message: 'user does not have admin role' });

    await Settings.findOneAndUpdate(
      { key: 'voting' }, { start: null, end: null }, { upsert: true }
    );
    res.json({ start: '', end: '' });
  } catch (err) {
    console.log(err);
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
// update candidate details (admin only)
router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ message: 'user does not have admin role' });
    const candidateId = req.params.candidateID;

    const allowed = {};   // ✅ FIX 1: this line was missing

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
    if (req.body.partyLogo !== undefined) {
      if (!isValidLogo(req.body.partyLogo)) {
        return res.status(400).json({ error: 'Party logo must be a PNG, JPG or WEBP image under 200 KB' });
      }
      allowed.partyLogo = req.body.partyLogo;   // ✅ FIX 2: this line was missing
    }

    // ✅ FIX 3: pass 'allowed' instead of the raw req.body
    const response = await Candidate.findByIdAndUpdate(candidateId, allowed, {
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

   // if no candidates are left, start a fresh election: let everyone vote again
    const remaining = await Candidate.countDocuments();
    if (remaining === 0) {
    await User.updateMany({}, { $set: { isVoted: false } });
}

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
  const { open, start, end } = await isVotingOpen();
  if (!open) {
    return res.status(403).json({
      message: start && end
        ? `Voting is open only from ${toISTText(start)} to ${toISTText(end)} (IST)`
        : 'Voting has not started yet'
    });
  }

  const userId = req.user.id;
  const candidateID = req.params.candidateID;

  try {
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
