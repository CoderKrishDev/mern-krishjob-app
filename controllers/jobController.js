// CRUD without mongodb, only locally
// import { nanoid } from 'nanoid';

// let jobs = [
//   { id: nanoid(10), company: 'apple', position: 'front-end' },
//   { id: nanoid(10), company: 'google', position: 'back-end' },
// ];

// export const getAllJobs = async (req, res) => {
//   res.status(StatusCodes.OK).json({ jobs });
// };

// export const createJob = async (req, res) => {
//   const { company, position } = req.body;
//   if (!company || !position) {
//     return res.status(400).json({ msg: 'please provide company and position' });
//   }
//   const id = nanoid(10);
//   // console.log(id);
//   const job = { id, company, position };
//   jobs.push(job);
//   res.status(StatusCodes.CREATED).json({ job });
// };

// export const getSingleJob = async (req, res) => {
//   const { id } = req.params;
//   const job = jobs.find((job) => job.id === id);
//   if (!job) {
//     throw new Error('no job with that id');
//     return res.status(404).json({ msg: `no job with id ${id}` });
//   }
//   res.status(StatusCodes.OK).json({ job });
// };

// export const updateJob = async (req, res) => {
//   const { company, position } = req.body;
//   if (!company || !position) {
//     return res.status(400).json({ msg: 'please provide company and position' });
//   }
//   const { id } = req.params;
//   const job = jobs.find((job) => job.id === id);
//   if (!job) {
//     return res.status(404).json({ msg: `no job with id ${id}` });
//   }

//   job.company = company;
//   job.position = position;
//   res.status(StatusCodes.OK).json({ msg: 'job modified', job });
// };

// export const deleteJob = async (req, res) => {
//   const { id } = req.params;
//   const job = jobs.find((job) => job.id === id);
//   if (!job) {
//     return res.status(404).json({ msg: `no job with id ${id}` });
//   }
//   const newJobs = jobs.filter((job) => job.id !== id);
//   jobs = newJobs;

//   res.status(StatusCodes.OK).json({ msg: 'job deleted' });
// };

import Job from '../models/JobModel.js';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import day from 'dayjs';

export const getAllJobs = async (req, res) => {
  const { search, jobStatus, jobType, sort } = req.query;

  const queryObject = {
    createdBy: req.user.userId,
  };

  if (search) {
    queryObject.$or = [
      { position: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
  }
  if (jobStatus && jobStatus !== 'all') {
    queryObject.jobStatus = jobStatus;
  }
  if (jobType && jobType !== 'all') {
    queryObject.jobType = jobType;
  }

  const sortOptions = {
    newest: '-createdAt',
    oldest: 'createdAt',
    'a-z': 'position',
    'z-a': '-position',
  };

  const sortKey = sortOptions[sort] || sortOptions.newest;

  // setup pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const jobs = await Job.find(queryObject)
    .sort(sortKey)
    .skip(skip)
    .limit(limit);

  const totalJobs = await Job.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalJobs / limit);

  res
    .status(StatusCodes.OK)
    .json({ totalJobs, numOfPages, currentPage: page, jobs });
};

export const createJob = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

// Async error handling with try catch

// export const createJob = async (req, res) => {
//   const { company, position } = req.body;
//   try {
//     const job = await Job.create('something');
//     res.status(StatusCodes.CREATED).json({ job });
//   } catch (error) {
//     res.status(500).json({ msg: 'server error' });
//   }
// };

// Async error handling without try catch, handled by express-async-errors library

// export const createJob = async (req, res) => {
//   const { company, position } = req.body;

//   const job = await Job.create('something');
//   res.status(StatusCodes.CREATED).json({ job });
// };

export const getSingleJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  res.status(StatusCodes.OK).json({ job });
};

export const updateJob = async (req, res) => {
  console.log('update');
  const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(StatusCodes.OK).json({ job: updatedJob });
};

export const deleteJob = async (req, res) => {
  const removedJob = await Job.findByIdAndDelete(req.params.id);

  res.status(StatusCodes.OK).json({ job: removedJob });
};

export const showStats = async (req, res) => {
  let stats = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    { $group: { _id: '$jobStatus', count: { $sum: 1 } } },
  ]);
  stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});

  const defaultStats = {
    pending: stats.pending || 0,
    interview: stats.interview || 0,
    declined: stats.declined || 0,
  };

  let monthlyApplications = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 },
  ]);
  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;

      const date = day()
        .month(month - 1)
        .year(year)
        .format('MMM YY');
      return { date, count };
    })
    .reverse();
  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};
