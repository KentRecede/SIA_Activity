import { createClient } from "graphql-ws";
import { ApolloProvider, ApolloClient, InMemoryCache, split, HttpLink } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import PostTable from "./App";

const httpLink = new HttpLink({
  uri: "http://localhost:4002/", 
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://localhost:4002/", 
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === "OperationDefinition" && definition.operation === "subscription";
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default function App() {
  return (
    <ApolloProvider client={client}>
      <PostTable />
    </ApolloProvider>
  );
}
