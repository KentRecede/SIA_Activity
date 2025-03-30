const { ApolloServer, gql } = require("apollo-server");
const { PrismaClient } = require("@prisma/client");
const { PubSub } = require("graphql-subscriptions");

const prisma = new PrismaClient();
const pubsub = new PubSub();

const POST_ADDED = "POST_ADDED";

const typeDefs = gql`
  type Post {
    id: ID!
    title: String!
    content: String!
  }

  type Query {
    posts: [Post]
  }

  type Mutation {
    createPost(title: String!, content: String!): Post
  }

  type Subscription {
    postAdded: Post
  }
`;

const resolvers = {
  Query: {
    posts: () => prisma.post.findMany(),
  },
  Mutation: {
    createPost: async (_, args) => {
      const post = await prisma.post.create({ data: args });
      pubsub.publish(POST_ADDED, { postAdded: post });
      return post;
    },
  },
  Subscription: {
    postAdded: {
      subscribe: () => pubsub.asyncIterator([POST_ADDED]),
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen({ port: 4002 }).then(({ url }) => {
  console.log(`Posts service running at ${url}`);
});
