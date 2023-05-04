import {
  ApolloClient,
  ApolloLink,
  concat,
  createHttpLink,
  gql,
  InMemoryCache,
} from "@apollo/client";
import { getAccessToken } from "../auth";

const httpLink = createHttpLink({ uri: "http://localhost:9000/graphql" });
const authLink = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  const accessToken = getAccessToken();

  operation.setContext({
    headers: {
      authorization: accessToken ? `Bearer ${accessToken}` : "",
    },
  });
  return forward(operation);
});

export const apolloClient = new ApolloClient({
  link: concat(authLink, httpLink),
  cache: new InMemoryCache(),
});

const jobDetailFragment = gql`
  fragment JobDatail on Job {
    id
    title
    company {
      id
      name
    }
    date
    description
  }
`;

export const jobsQuery = gql`
  query Jobs($limit: Int, $offset: Int) {
    jobs(limit: $limit, offset: $offset) {
      items {
        id
        date
        title
        company {
          id
          name
        }
        description
      }
      totalCount
    }
  }
`;
export const jobByIdQuery = gql`
  query JobById($id: ID!) {
    job(id: $id) {
      ...JobDatail
    }
  }

  ${jobDetailFragment}
`;

export const companyByIdQuery = gql`
  query CompanyById($id: ID!) {
    company(id: $id) {
      id
      name
      description
      jobs {
        id
        date
        title
        description
      }
    }
  }
`;

export const createJobMutation = gql`
  mutation CreateJob($input: CreateInputJob!) {
    job: createJob(input: $input) {
      ...JobDatail
    }
  }
  ${jobDetailFragment}
`;
