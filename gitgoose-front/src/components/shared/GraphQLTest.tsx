"use client";

import { gql, useQuery } from "@apollo/client";
import { useEffect } from "react";

const TEST_QUERY = gql`
  query TestQuery {
    __typename
  }
`;

export default function GraphQLTest() {
  const { loading, error, data } = useQuery(TEST_QUERY);

  useEffect(() => {
    console.log("GraphQL Test:", { loading, error, data });
  }, [loading, error, data]);

  return null;
}
