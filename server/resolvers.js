import { GraphQLError } from "graphql";
import { getCompany } from "./db/companies.js";
import {
  countJobs,
  createJob,
  deleteJob,
  getJob,
  getJobs,
  getJobsByCompany,
  updateJob,
} from "./db/jobs.js";

export const resolvers = {
  Query: {
    company: async (_root, { id }) => {
      const company = await getCompany(id);

      if (!company) {
        return notFoundError(`Company not found by the provided id: ${id}`);
      }
      return company;
    },
    job: async (_root, { id }) => {
      const job = await getJob(id);
      if (!job) {
        return notFoundError(`Job not found by the provided id: ${id}`);
      }
      return job;
    },
    jobs: async (_root, { limit, offset }) => {
      const items = await getJobs(limit, offset);
      const totalCount = await countJobs();
      return { items, totalCount };
    },
  },

  Mutation: {
    createJob: async (_root, { input: { title, description } }, { user }) => {
      console.log("user", user);
      if (!user) {
        return unauthorized(`Unauthorized token`);
      }
      return createJob({ companyId: user.companyId, title, description });
    },

    updateJob: async (
      _root,
      { input: { id, title, description } },
      { user }
    ) => {
      if (!user) {
        return unauthorized(`Unauthorized token`);
      }

      const job = await updateJob({
        id,
        title,
        description,
        companyId: user.companyId,
      });
      if (!job) {
        return notFoundError(`Job not found by the provided id: ${id}`);
      }
      return job;
    },

    deleteJob: async (_root, { id }, { user }) => {
      if (!user) {
        return unauthorized(`Unauthorized token`);
      }
      const job = await deleteJob(id, user.companyId);
      if (!job) {
        return notFoundError(`Job not found by the provided id: ${id}`);
      }
      return job;
    },
  },

  Company: {
    jobs: async (company) => getJobsByCompany(company.id),
  },

  Job: {
    date: (job) => toIsoDate(job.createdAt),
    company: (job, _args, { companyLoader }) => {
      return companyLoader.load(job.companyId);
    },
  },
};

function toIsoDate(date) {
  return date.slice(0, "yyyy-mm-dd".length);
}

function notFoundError(message) {
  return new GraphQLError(message, { extensions: { code: "NOT_FOUND" } });
}

function unauthorized(message) {
  return new GraphQLError(message, { extensions: { code: "UNAUTHORIZED" } });
}
